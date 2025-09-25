export const onRequest: PagesFunction = async (ctx) => {
  const apiOrigin = ctx.env.API_ORIGIN || "http://127.0.0.1:8787";
  const url = new URL(ctx.request.url);
  const target = new URL(url.pathname.replace(/^\/api\/?/, ""), apiOrigin);
  target.search = url.search;
  const req = new Request(target.toString(), {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ["GET","HEAD"].includes(ctx.request.method) ? undefined : await ctx.request.text(),
  });
  return fetch(req);
};
