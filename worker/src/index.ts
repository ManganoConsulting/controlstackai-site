export interface Env {
  DB?: D1Database;
  API_KEY?: string;
  CORS_ALLOW_ORIGIN?: string;
  // Turnstile
  TURNSTILE_SECRET?: string; // set via wrangler secret put
  TURNSTILE_SITE_KEY?: string; // optional (public)
  // Email (MailChannels)
  MAIL_FROM?: string; // e.g. no-reply@controlstackai.com
  MAIL_TO?: string;   // where notifications go
  // Optional Cloudflare Access validation metadata
  CF_ACCESS_AUD?: string; // Access Audience tag (optional)
  CF_ACCESS_TEAM_DOMAIN?: string; // your-team.cloudflareaccess.com (optional)
}

function json(data: unknown, status = 200, corsOrigin?: string): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (corsOrigin) { headers["Access-Control-Allow-Origin"] = corsOrigin; headers["Vary"] = "Origin"; }
  return new Response(JSON.stringify(data), { status, headers });
}

function html(content: string, status = 200, headers: Record<string,string> = {}): Response {
  return new Response(content, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
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

function getClientIP(request: Request): string | undefined {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || undefined;
}

function hasValidApiKey(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization") || "";
  const token = (auth.startsWith("Bearer ") ? auth.slice(7) : "").trim();
  if (!env.API_KEY) return false;
  return Boolean(token) && token === env.API_KEY;
}

function isAuthorized(request: Request, env: Env): boolean {
  // Accept either a matching API key or the presence of a Cloudflare Access JWT header.
  if (hasValidApiKey(request, env)) return true;
  const accessJwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (accessJwt) return true; // If Access is configured on the route, this header will be present.
  return false;
}

async function verifyTurnstile(token: string | undefined, env: Env, request: Request): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true; // if not configured, allow (useful for local dev)
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.set("secret", env.TURNSTILE_SECRET);
    form.set("response", token);
    const ip = getClientIP(request);
    if (ip) form.set("remoteip", ip);
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    const data = await resp.json<any>();
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

async function sendLeadEmail(env: Env, { name, email, company, message }: { name: string; email: string; company?: string; message: string; }): Promise<void> {
  if (!env.MAIL_FROM || !env.MAIL_TO) return;
  const subject = `New Lead: ${name} <${email}>`;
  const plain = `New lead received\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\n\nMessage:\n${message}`;
  const htmlBody = `<!doctype html><html><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">\n  <h2>New lead received</h2>\n  <p><strong>Name:</strong> ${escapeHtml(name)}</p>\n  <p><strong>Email:</strong> ${escapeHtml(email)}</p>\n  <p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>\n  <pre style="white-space: pre-wrap; font: inherit; border:1px solid #eee; padding:12px; background:#fafafa;">${escapeHtml(message)}</pre>\n</body></html>`;
  const payload = {
    personalizations: [{ to: [{ email: env.MAIL_TO }] }],
    from: { email: env.MAIL_FROM, name: "ControlStackAI" },
    subject,
    content: [
      { type: "text/plain", value: plain },
      { type: "text/html", value: htmlBody },
    ],
  };
  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function adminPage(): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Leads Admin</title>
  <style>
    body{font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px;}
    table{border-collapse: collapse; width: 100%;}
    th,td{border:1px solid #ddd; padding:8px; vertical-align: top;}
    th{background:#f3f4f6; text-align:left;}
    tr:nth-child(even){background:#fafafa;}
    .controls{margin-bottom:12px;}
    textarea{width:100%; height:120px;}
    .muted{color:#6b7280; font-size:12px;}
  </style>
</head>
<body>
  <h1>Leads</h1>
  <div class="controls">
    <button id="refresh">Refresh</button>
    <span id="status" class="muted"></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Created</th><th>Name</th><th>Email</th><th>Company</th><th>Message</th>
      </tr>
    </thead>
    <tbody id="rows"></tbody>
  </table>
  <script>
    const params = new URLSearchParams(location.search);
    const key = params.get('key');
    async function load() {
      const status = document.getElementById('status');
      status.textContent = 'Loading...';
      try {
        const headers = key ? { 'Authorization': 'Bearer ' + key } : {};
        const res = await fetch('/v1/leads', { headers });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const rows = document.getElementById('rows');
        rows.innerHTML = '';
        for (const r of (data.leads || [])) {
          const tr = document.createElement('tr');
          tr.innerHTML = '<td>' +
            (r.createdAt?.replace('T',' ').replace('Z','')) + '<div class="muted">' + r.id + '</div>' +
          '</td>' +
          '<td>' + escape(r.name) + '</td>' +
          '<td><a href="mailto:' + escape(r.email) + '">' + escape(r.email) + '</a></td>' +
          '<td>' + escape(r.company || '') + '</td>' +
          '<td><div style="max-width:600px; white-space:pre-wrap;">' + escape(r.message || '') + '</div></td>';
          rows.appendChild(tr);
        }
        status.textContent = 'Loaded ' + (data.leads?.length || 0) + ' lead(s).';
      } catch (e) {
        status.textContent = 'Error: ' + e.message;
      }
    }
    function escape(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
    document.getElementById('refresh').addEventListener('click', load);
    load();
  </script>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowOrigin = env.CORS_ALLOW_ORIGIN || origin || "*";

    if (request.method === "OPTIONS") return handleOptions(request, env);

    if (url.pathname === "/" || url.pathname === "/healthz") {
      return json({ ok: true, service: "controlstackai-api" }, 200, allowOrigin);
    }

    if (url.pathname === "/admin" && request.method === "GET") {
      if (!isAuthorized(request, env)) {
        return html("<h1>Unauthorized</h1><p>Access denied.</p>", 401);
      }
      return html(adminPage(), 200);
    }

    if (url.pathname === "/v1/leads" && request.method === "POST") {
      try {
        const body = await request.json();
        const name = String(body?.name || "").slice(0, 200);
        const email = String(body?.email || "").slice(0, 200);
        const company = String(body?.company || "").slice(0, 200);
        const message = String(body?.message || "").slice(0, 4000);
        const tsToken = String(body?.turnstileToken || body?.turnstile_token || body?.["cf-turnstile-response"] || "");
        if (!name || !email || !message) return json({ error: "Missing fields" }, 400, allowOrigin);

        const passed = await verifyTurnstile(tsToken, env, request);
        if (!passed) return json({ error: "Turnstile verification failed" }, 400, allowOrigin);

        if (env.DB) {
          await env.DB.exec(`CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY, createdAt TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, message TEXT NOT NULL
          );`);
          const id = crypto.randomUUID(); const createdAt = new Date().toISOString();
          await env.DB.prepare("INSERT INTO leads (id, createdAt, name, email, company, message) VALUES (?, ?, ?, ?, ?, ?)" )
            .bind(id, createdAt, name, email, company, message).run();

          // Fire-and-forget email notification
          ctx.waitUntil(sendLeadEmail(env, { name, email, company, message }));
        }
        return json({ ok: true }, 200, allowOrigin);
      } catch {
        return json({ error: "Bad Request" }, 400, allowOrigin);
      }
    }

    if (url.pathname === "/v1/leads" && request.method === "GET") {
      if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, 401, allowOrigin);
      if (!env.DB) return json({ leads: [] }, 200, allowOrigin);
      const rs = await env.DB.prepare("SELECT id, createdAt, name, email, company, message FROM leads ORDER BY datetime(createdAt) DESC LIMIT 200").all();
      return json({ leads: rs.results || [] }, 200, allowOrigin);
    }

    return json({ error: "Not Found" }, 404, allowOrigin);
  }
} satisfies ExportedHandler<Env>;
