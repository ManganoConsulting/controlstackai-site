# ControlStackAI Website (Pages + Worker API)

- **Pages** serves static site + a `/contact` function (fallback).
- **Worker** (in `/worker`) provides `/v1/leads` and `/healthz`, with CORS+API key support.

## Deploy Pages
- Connect this repo to **Cloudflare Pages** (Framework: None · Build: None · Output: `/`).
- (Optional) Bind D1 with name `DB` and run `schema/schema.sql` in D1 console.
- Set **environment variable** `API_ORIGIN=https://api.controlstackai.com` (after Worker custom domain).

## Deploy Worker
```bash
cd worker
# Optional admin key:
wrangler secret put API_KEY
# Add your D1 binding in wrangler.toml (see file), then:
wrangler deploy
```
Set the custom domain in dashboard: `api.controlstackai.com`.

## Local dev
```bash
# Terminal 1: Worker
cd worker && wrangler dev
# Terminal 2: Pages, proxying /api to local Worker
wrangler pages dev . --env API_ORIGIN=http://127.0.0.1:8787
```
