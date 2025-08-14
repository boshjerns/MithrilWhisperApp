// Minimal Supabase client for renderer process
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if we're in local mode (no Supabase credentials)
export const isLocalMode = !supabaseUrl || !supabaseAnonKey;

if (isLocalMode) {
  // eslint-disable-next-line no-console
  console.log('🏠 Running in local mode - Supabase features disabled');
}

// Create a mock supabase client for local mode
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Local mode - authentication disabled') }),
    signUp: async () => ({ data: null, error: new Error('Local mode - authentication disabled') }),
    signOut: async () => ({ error: null }),
  }
};

export const supabase = isLocalMode 
  ? mockSupabase 
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });


