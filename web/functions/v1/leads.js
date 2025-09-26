// Cloudflare Pages Function for leads (D1-backed).
export const onRequestPost = async ({ request, env }) => {
  try {
    const data = await request.json();
    const { name, email, message } = data || {};
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "name, email, message required" }), { status: 400, headers: { "content-type": "application/json" } });
    }
    const created_at = new Date().toISOString();
    const ip = request.headers.get("CF-Connecting-IP") || null;
    await env.DB.prepare(`
      INSERT INTO leads (name, email, message, created_at, ip)
      VALUES (?1, ?2, ?3, ?4, ?5)
    `).bind(name, email, message, created_at, ip).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
};

const isServiceToken = (req, env) => {
  const token = req.headers.get("x-service-token");
  return env.SERVICE_TOKEN && token && token === env.SERVICE_TOKEN;
};

export const onRequestGet = async ({ request, env }) => {
  if (!isServiceToken(request, env)) {
    // Access should gate browser traffic; uncomment to hard-require token.
    // return new Response(JSON.stringify({ error: "service token required" }), { status: 401, headers: { "content-type": "application/json" } });
  }
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const maybeId = parts.length > 2 ? parts[2] : null;
  try {
    if (maybeId) {
      const row = await env.DB.prepare("SELECT * FROM leads WHERE id = ?1").bind(Number(maybeId)).first();
      if (!row) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify(row), { headers: { "content-type": "application/json" } });
    } else {
      const rows = await env.DB.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 200").all();
      return new Response(JSON.stringify(rows.results || []), { headers: { "content-type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
};

export const onRequestDelete = async ({ request, env }) => {
  if (!isServiceToken(request, env)) {
    return new Response(JSON.stringify({ error: "service token required" }), { status: 401, headers: { "content-type": "application/json" } });
  }
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  try {
    await env.DB.prepare("DELETE FROM leads WHERE id = ?1").bind(Number(id)).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
};
