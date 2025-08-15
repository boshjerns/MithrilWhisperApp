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

  // Validate Supabase JWT by calling auth.getUser()
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return new Response("Unauthorized", { status: 401 });
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
      max_output_tokens: body.max_output_tokens ?? 800,
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


