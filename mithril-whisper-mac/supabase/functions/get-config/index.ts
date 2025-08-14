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

  // Require authentication for get-config
  const auth = req.headers.get("Authorization");
  if (!auth) return new Response("Unauthorized", { status: 401 });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: auth } },
    });

    // Validate the JWT token first
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return new Response("Unauthorized", { status: 401 });

    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "assistant")
      .single();

    if (error) return new Response(error.message, { status: 400 });

    const cfg = (data?.value as any) ?? {};
    const safe = {
      model: cfg.model ?? "o4-mini",
      max_output_tokens: cfg.max_output_tokens ?? 4000,
      hudTheme: cfg.hudTheme ?? "violet",
      features: cfg.features ?? {},
    };

    return new Response(JSON.stringify(safe), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(String(e?.message || e), { status: 500 });
  }
});


