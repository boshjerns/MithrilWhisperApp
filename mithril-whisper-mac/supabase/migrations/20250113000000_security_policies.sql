-- Security Policies and Rate Limiting for Mithril Whisper
-- This migration sets up rock-solid RLS policies and account creation limits

-- Create usage_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.usage_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at timestamptz DEFAULT now(),
    ended_at timestamptz,
    duration_ms integer DEFAULT 0,
    transcript_chars_original integer DEFAULT 0,
    transcript_chars_cleaned integer DEFAULT 0,
    model text DEFAULT '',
    platform text DEFAULT '',
    app_version text DEFAULT '',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Create app_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    value jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert default config if it doesn't exist
INSERT INTO public.app_config (key, value) 
VALUES ('assistant', '{"model": "o4-mini", "max_output_tokens": 4000, "hudTheme": "violet", "features": {}}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Create rate limiting table for IP-based throttling
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier text NOT NULL, -- Can be IP, user_id, or combination
    action text NOT NULL, -- 'signup', 'login', 'api_call', etc.
    count integer DEFAULT 1,
    window_start timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '1 hour'),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON public.rate_limits (identifier, action, expires_at);

-- Clean up expired rate limit entries
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limits WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- 1. Usage Events: Users can only see their own data
CREATE POLICY "Users can view own usage events" 
ON public.usage_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage events" 
ON public.usage_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage events" 
ON public.usage_events FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. App Config: Only authenticated users can read config
CREATE POLICY "Authenticated users can read app config" 
ON public.app_config FOR SELECT 
TO authenticated 
USING (true);

-- Prevent any modifications to app_config from client side
CREATE POLICY "Prevent app config modifications" 
ON public.app_config FOR ALL 
USING (false);

-- 3. Rate Limits: System-managed, no direct user access
CREATE POLICY "No direct access to rate limits" 
ON public.rate_limits FOR ALL 
USING (false);

-- Function to check and enforce account creation rate limits
CREATE OR REPLACE FUNCTION check_signup_rate_limit(client_ip text)
RETURNS boolean AS $$
DECLARE
    recent_signups integer;
    max_signups_per_hour integer := 3; -- Max 3 signups per IP per hour
    window_hours integer := 1;
BEGIN
    -- Clean up expired entries first
    PERFORM cleanup_expired_rate_limits();
    
    -- Count recent signups from this IP
    SELECT COALESCE(SUM(count), 0) INTO recent_signups
    FROM public.rate_limits
    WHERE identifier = client_ip
      AND action = 'signup'
      AND expires_at > now();
    
    -- If under limit, record this attempt and allow
    IF recent_signups < max_signups_per_hour THEN
        INSERT INTO public.rate_limits (identifier, action, expires_at)
        VALUES (client_ip, 'signup', now() + (window_hours || ' hours')::interval)
        ON CONFLICT (id) DO NOTHING;
        RETURN true;
    END IF;
    
    -- Over limit, deny
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check API rate limits
CREATE OR REPLACE FUNCTION check_api_rate_limit(user_uuid uuid, api_action text, max_requests integer, window_minutes integer)
RETURNS boolean AS $$
DECLARE
    recent_requests integer;
    identifier_key text;
BEGIN
    -- Create identifier combining user and action
    identifier_key := user_uuid::text || ':' || api_action;
    
    -- Clean up expired entries
    PERFORM cleanup_expired_rate_limits();
    
    -- Count recent requests for this user/action
    SELECT COALESCE(SUM(count), 0) INTO recent_requests
    FROM public.rate_limits
    WHERE identifier = identifier_key
      AND action = api_action
      AND expires_at > now();
    
    -- If under limit, record this attempt and allow
    IF recent_requests < max_requests THEN
        INSERT INTO public.rate_limits (identifier, action, count, expires_at)
        VALUES (identifier_key, api_action, 1, now() + (window_minutes || ' minutes')::interval)
        ON CONFLICT (id) DO NOTHING;
        RETURN true;
    END IF;
    
    -- Over limit, deny
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce daily usage limits per user
CREATE OR REPLACE FUNCTION check_daily_usage_limit(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
    today_usage integer;
    max_daily_requests integer := 500; -- Max 500 assistant requests per day per user
BEGIN
    -- Count today's usage events
    SELECT COUNT(*) INTO today_usage
    FROM public.usage_events
    WHERE user_id = user_uuid
      AND created_at >= CURRENT_DATE
      AND (metadata->>'kind' = 'assistant' OR model = 'assistant');
    
    RETURN today_usage < max_daily_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log and check comprehensive rate limits
CREATE OR REPLACE FUNCTION enforce_rate_limits(
    user_uuid uuid,
    client_ip text,
    action_type text
)
RETURNS jsonb AS $$
DECLARE
    result jsonb := '{"allowed": true, "limits": {}}'::jsonb;
    daily_usage integer;
    ip_hourly integer;
    user_minutely integer;
BEGIN
    -- Clean expired entries
    PERFORM cleanup_expired_rate_limits();
    
    -- Check daily usage limit (500 per day per user)
    IF action_type = 'assistant' THEN
        SELECT COUNT(*) INTO daily_usage
        FROM public.usage_events
        WHERE user_id = user_uuid
          AND started_at >= CURRENT_DATE
          AND (metadata->>'kind' = 'assistant' OR model = 'assistant');
        
        result := jsonb_set(result, '{limits,daily_usage}', daily_usage::text::jsonb);
        
        IF daily_usage >= 500 THEN
            result := jsonb_set(result, '{allowed}', 'false'::jsonb);
            result := jsonb_set(result, '{reason}', '"Daily limit exceeded (500 requests)"'::jsonb);
            RETURN result;
        END IF;
    END IF;
    
    -- Check IP-based hourly limits (100 requests per hour per IP)
    SELECT COALESCE(SUM(count), 0) INTO ip_hourly
    FROM public.rate_limits
    WHERE identifier = client_ip || ':hourly'
      AND expires_at > now();
    
    result := jsonb_set(result, '{limits,ip_hourly}', ip_hourly::text::jsonb);
    
    IF ip_hourly >= 100 THEN
        result := jsonb_set(result, '{allowed}', 'false'::jsonb);
        result := jsonb_set(result, '{reason}', '"IP hourly limit exceeded (100 requests)"'::jsonb);
        RETURN result;
    END IF;
    
    -- Check user-based per-minute limits (30 requests per minute per user)
    SELECT COALESCE(SUM(count), 0) INTO user_minutely
    FROM public.rate_limits
    WHERE identifier = user_uuid::text || ':minutely'
      AND expires_at > now();
    
    result := jsonb_set(result, '{limits,user_minutely}', user_minutely::text::jsonb);
    
    IF user_minutely >= 30 THEN
        result := jsonb_set(result, '{allowed}', 'false'::jsonb);
        result := jsonb_set(result, '{reason}', '"Per-minute limit exceeded (30 requests)"'::jsonb);
        RETURN result;
    END IF;
    
    -- If all checks pass, record the usage
    INSERT INTO public.rate_limits (identifier, action, expires_at) VALUES
        (client_ip || ':hourly', action_type, now() + interval '1 hour'),
        (user_uuid::text || ':minutely', action_type, now() + interval '1 minute');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function that can be called from Edge Functions to check all limits at once
CREATE OR REPLACE FUNCTION check_request_allowed(
    user_uuid uuid,
    client_ip text,
    action_type text DEFAULT 'api'
)
RETURNS jsonb AS $$
BEGIN
    RETURN enforce_rate_limits(user_uuid, client_ip, action_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_signup_rate_limit(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_api_rate_limit(uuid, text, integer, integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_daily_usage_limit(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION enforce_rate_limits(uuid, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_request_allowed(uuid, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_rate_limits() TO authenticated, anon;

-- Create a cleanup job that runs every hour
-- (Note: This requires pg_cron extension, which may not be available in all Supabase plans)
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_expired_rate_limits();');

-- Comments for documentation
COMMENT ON TABLE public.rate_limits IS 'Rate limiting table for IP and user-based throttling';
COMMENT ON FUNCTION check_signup_rate_limit(text) IS 'Enforces signup rate limits by IP address';
COMMENT ON FUNCTION check_api_rate_limit(uuid, text, integer, integer) IS 'Generic API rate limiting function';
COMMENT ON FUNCTION check_daily_usage_limit(uuid) IS 'Enforces daily usage quotas per user';
COMMENT ON FUNCTION enforce_rate_limits(uuid, text, text) IS 'Comprehensive rate limiting with multiple tiers';
