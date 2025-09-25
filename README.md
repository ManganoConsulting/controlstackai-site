# ControlStackAI Website (Cloudflare Pages + Functions + optional D1)

**Stack**: Static HTML + Tailwind via CDN (no build), Cloudflare Pages Functions (`/functions`) for the contact form, optional D1 for storing leads.

## Quickstart

1. **Create GitHub repo**
   ```bash
   git init
   git remote add origin <your-empty-github-repo-url>
   git add .
   git commit -m "init: ControlStackAI site"
   git branch -M main
   git push -u origin main
   ```

2. **Deploy with Cloudflare Pages**
   - Go to **Cloudflare Dashboard → Pages → Create project → Connect to Git** and select your repo.
   - **Framework preset**: *None*
   - **Build command**: *None*
   - **Build output directory**: `/` (root)
   - Pages will auto-detect **Functions** in `/functions` (route `/contact`).

3. **(Optional) Add D1 database for contact leads**
   - **Create** D1: Dashboard → Workers AI & D1 → D1 → *Create database* (e.g., `controlstackai_db`).
   - In **Pages → Settings → Functions → D1 Bindings**, add a binding named **`DB`** pointing to your D1 DB.
   - Initialize schema: Dashboard SQL console → run [`schema/schema.sql`](schema/schema.sql).

4. **Custom domain**
   - In **Pages → Custom domains**, add e.g. `controlstackai.com` or `controlstack.ai` and update DNS.
   - If you use Cloudflare Registrar, you’ll pay **at-cost** for the domain.

5. **Local dev (optional)**
   - Install Wrangler: `npm i -g wrangler`
   - Run: `wrangler pages dev .`
   - With D1: `wrangler d1 create controlstackai_db` then `wrangler pages dev . --d1 DB=controlstackai_db`

## Endpoints

- `POST /contact` — Stores a lead in D1 if configured. Body:
  ```json
  {
    "name": "Ada Lovelace",
    "email": "ada@analytical.engine",
    "company": "Analytical",
    "message": "Let's ship an assistant."
  }
  ```

## Customize

- Edit copy in `index.html`, `services.html`, `about.html`, `contact.html`.
- Replace `/assets/logo.svg` and banners as desired.
- Add a blog at `/blog/` later; Pages will happily serve more content.

---

© 2025-09-25 ControlStackAI. 
