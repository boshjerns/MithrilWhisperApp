// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  const auth = req.headers.get("Authorization");
  if (!auth) return new Response("Unauthorized", { status: 401 });

  // Rate limiting by IP
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  // Validate Supabase JWT and implement rate limiting
  let userId: string;
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return new Response("Unauthorized", { status: 401 });
    userId = data.user.id;

    // Comprehensive rate limiting using database functions
    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc("check_request_allowed", {
        user_uuid: userId,
        client_ip: clientIP,
        action_type: "assistant"
      });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
      return new Response("Rate limiting error", { status: 500 });
    }

    const limitCheck = rateLimitResult as { allowed: boolean; reason?: string; limits?: any };
    if (!limitCheck.allowed) {
      return new Response(limitCheck.reason || "Rate limit exceeded", { 
        status: 429,
        headers: {
          "X-RateLimit-Limits": JSON.stringify(limitCheck.limits || {}),
          "Retry-After": "60" // Suggest retry after 60 seconds
        }
      });
    }

  } catch (_) {
    return new Response("Unauthorized", { status: 401 });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) return new Response("Server misconfigured", { status: 500 });

  try {
    const body = await req.json();
    const payload = {
      model: body.model ?? "o4-mini",
      stream: body.stream ?? true,
      max_output_tokens: body.max_output_tokens ?? 4000,
      input: body.input,
      text: body.text ?? { format: { type: "text" } },
      reasoning: body.reasoning ?? { effort: "medium", summary: "auto" },
      tools: body.tools ?? [],
      store: true,
    };

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(String(e?.message || e), { status: 500 });
  }
});


