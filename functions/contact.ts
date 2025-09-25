export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { request, env } = context;
    const data = await request.json();
    const name = (data?.name || "").toString().slice(0, 200);
    const email = (data?.email || "").toString().slice(0, 200);
    const company = (data?.company || "").toString().slice(0, 200);
    const message = (data?.message || "").toString().slice(0, 4000);
    if (!name || !email || !message) {
      return new Response("Missing fields", { status: 400 });
    }
    if (env.DB && env.DB.exec) {
      await env.DB.exec(`CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        createdAt TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        message TEXT NOT NULL
      );`);
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      await env.DB.prepare("INSERT INTO leads (id, createdAt, name, email, company, message) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, createdAt, name, email, company, message)
        .run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
};
