Dynamic Add-On for ControlStackAI

- functions/v1/leads.js  (Pages Functions API)
- schema/d1.sql          (D1 schema)
- admin/index.html       (Access-protected dashboard)
- worker/*               (optional standalone Worker skeleton)

Cloudflare:
1) Create D1 and bind as DB to Pages.
2) Initialize with schema/d1.sql.
3) Protect /admin/* with Access.
4) (Optional) Add SERVICE_TOKEN env var for programmatic access.
