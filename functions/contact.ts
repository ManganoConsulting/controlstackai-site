interface Env {
  DB?: D1Database;
}

const CREATE_LEADS = `CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, createdAt TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, message TEXT NOT NULL)`;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const str = (v: unknown, max: number) => (v ?? "").toString().trim().slice(0, max);
  const name = str(data?.name, 200);
  const email = str(data?.email, 200);
  const company = str(data?.company, 200);
  const message = str(data?.message, 4000);

  if (!name || !email || !message) {
    return json({ ok: false, error: "Missing required fields" }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Invalid email address" }, 400);
  }

  // No database binding means the submission has nowhere to go. Fail loudly so
  // the client shows its mailto fallback, rather than reporting success and
  // dropping the lead.
  if (!env.DB) {
    console.error("contact: D1 binding DB is missing; submission not stored");
    return json({ ok: false, error: "Contact storage unavailable" }, 503);
  }

  try {
    // D1's exec() splits its input on newlines and treats each line as its own
    // statement, so a pretty-printed CREATE TABLE throws. prepare().run() takes
    // the whole statement as one unit.
    await env.DB.prepare(CREATE_LEADS).run();
    await env.DB.prepare(
      "INSERT INTO leads (id, createdAt, name, email, company, message) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(crypto.randomUUID(), new Date().toISOString(), name, email, company, message)
      .run();
  } catch (err) {
    console.error("contact: failed to store lead:", err);
    return json({ ok: false, error: "Could not store your message" }, 500);
  }

  return json({ ok: true }, 200);
};
