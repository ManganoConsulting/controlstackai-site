export interface Env {
  DB?: D1Database;
  API_KEY?: string;
  CORS_ALLOW_ORIGIN?: string;
}
function json(data: unknown, status = 200, corsOrigin?: string): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (corsOrigin) { headers["Access-Control-Allow-Origin"] = corsOrigin; headers["Vary"] = "Origin"; }
  return new Response(JSON.stringify(data), { status, headers });
}
async function handleOptions(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");
  const allowed = env.CORS_ALLOW_ORIGIN || origin || "*";
  const headers: Record<string,string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Origin": allowed
  };
  return new Response(null, { status: 204, headers });
}
function requireApiKey(request: Request, env: Env): Response | null {
  const auth = request.headers.get("Authorization") || "";
  const token = (auth.startsWith("Bearer ") ? auth.slice(7) : "").trim();
  if (!env.API_KEY) return null;
  if (token && token === env.API_KEY) return null;
  return json({ error: "Unauthorized" }, 401, env.CORS_ALLOW_ORIGIN);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowOrigin = env.CORS_ALLOW_ORIGIN || origin || "*";
    if (request.method === "OPTIONS") return handleOptions(request, env);
    if (url.pathname === "/" || url.pathname === "/healthz") return json({ ok: true, service: "controlstackai-api" }, 200, allowOrigin);
    if (url.pathname === "/v1/leads" && request.method === "POST") {
      try {
        const body = await request.json();
        const name = String(body?.name || "").slice(0, 200);
        const email = String(body?.email || "").slice(0, 200);
        const company = String(body?.company || "").slice(0, 200);
        const message = String(body?.message || "").slice(0, 4000);
        if (!name || !email || !message) return json({ error: "Missing fields" }, 400, allowOrigin);
        if (env.DB) {
          await env.DB.exec(`CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY, createdAt TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, message TEXT NOT NULL
          );`);
          const id = crypto.randomUUID(); const createdAt = new Date().toISOString();
          await env.DB.prepare("INSERT INTO leads (id, createdAt, name, email, company, message) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(id, createdAt, name, email, company, message).run();
        }
        return json({ ok: true }, 200, allowOrigin);
      } catch { return json({ error: "Bad Request" }, 400, allowOrigin); }
    }
    if (url.pathname === "/v1/leads" && request.method === "GET") {
      const unauth = requireApiKey(request, env); if (unauth) return unauth;
      if (!env.DB) return json({ leads: [] }, 200, allowOrigin);
      const rs = await env.DB.prepare("SELECT id, createdAt, name, email, company, message FROM leads ORDER BY createdAt DESC LIMIT 50").all();
      return json({ leads: rs.results || [] }, 200, allowOrigin);
    }
    return json({ error: "Not Found" }, 404, allowOrigin);
  }
} satisfies ExportedHandler<Env>;
