export const onRequest: PagesFunction = async (ctx) => {
  const apiOrigin = ctx.env.API_ORIGIN || "http://127.0.0.1:8787";
  const url = new URL(ctx.request.url);
  const target = new URL(url.pathname.replace(/^\/api\/?/, ""), apiOrigin);
  target.search = url.search;

  // Clone headers and attach Access Service Token if present
  const h = new Headers(ctx.request.headers);
  const cid = (ctx.env as any).CF_ACCESS_CLIENT_ID as string | undefined;
  const csec = (ctx.env as any).CF_ACCESS_CLIENT_SECRET as string | undefined;
  if (cid && csec) {
    h.set("CF-Access-Client-Id", cid);
    h.set("CF-Access-Client-Secret", csec);
  }

  const req = new Request(target.toString(), {
    method: ctx.request.method,
    headers: h,
    body: ["GET","HEAD"].includes(ctx.request.method) ? undefined : await ctx.request.text(),
  });
  return fetch(req);
};
