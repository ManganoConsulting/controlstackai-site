ControlStack AI — Patch: Agentic-first site refresh
===================================================

What’s included
---------------
- New **index.html** with an Agentic AI hero, capability cards, and an agent loop diagram.
- **services.html** reorganized into Agentic → ML → DL (+ MLOps).
- **contact.html** wired to POST to `/v1/leads` (Cloudflare Worker).
- Modern dark theme in **styles/modern.css** with Inter + Space Grotesk.
- Security and cache rules in **_headers** for Cloudflare Pages.
- **assets/logo.svg** and **assets/hero-mesh.svg** placeholder artwork.

How to apply
------------
1) Create a feature branch in your repo, e.g.
   git checkout -b feat/agentic-ai-refresh

2) Copy the files into your repo root (they will overwrite the same-named files):
   - index.html
   - services.html
   - contact.html
   - _headers
   - styles/modern.css
   - assets/logo.svg
   - assets/hero-mesh.svg

3) Commit & push:
   git add -A
   git commit -m "Agentic-first redesign: hero, services IA, contact form, modern theme"
   git push -u origin feat/agentic-ai-refresh

4) Open a Pull Request on GitHub.

Notes
-----
- If your existing pages include different header/footer partials, you can transplant just the `<main>` sections.
- Replace **assets/hero-mesh.svg** with your production image (AVIF/WebP preferred) and optimize with `squoosh` or `sharp`.
- Ensure your Worker is reachable at `/v1/leads` (or update contact.html’s `API` const accordingly).