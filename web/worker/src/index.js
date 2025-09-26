export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/health") return new Response("ok");
    return new Response("Not found", { status: 404 });
  }
};
