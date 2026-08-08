# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a static HTML website for ControlStackAI built to deploy on Cloudflare Pages with optional Cloudflare Functions and D1 database integration. The site uses Tailwind CSS via CDN with no build process required.

## Architecture

### Positioning
The site sells services — AI application development, agent harness integration, and
workflow implementation — not a product. Copy should stay concrete and public-safe: no
client names, no NDA material, no screenshots of client work.

### Static Website Structure
- **Frontend**: Static HTML pages with Tailwind CSS via CDN
- **Styling**: Custom Tailwind configuration in `styles/tailwind-cdn.js` with brand colors (ink, accent, etc.)
- **Backend**: Cloudflare Pages Functions for contact form handling
- **Database**: Optional Cloudflare D1 for storing contact leads
- **Security**: HTTP security headers configured in `_headers`

### Key Files
- `index.html` - Homepage: hero, product film, services, method, engagements, contact
- `about.html`, `contact.html` - Additional pages
- `assets/video/agentic-os-demo.mp4` - the Agentic OS film, public cut, re-encoded for web
  delivery from `~/projects/Personal/agentic-os-demo/out/agentic-os-demo-public-master.mp4`.
  Only the public cut may ever ship; the client cut names a real session.
- `functions/contact.ts` - Cloudflare Pages Function handling POST /contact endpoint
- `schema/schema.sql` - D1 database schema for contact leads
- `styles/tailwind-cdn.js` - Tailwind CSS configuration with custom colors
- `_headers` - Security headers for all routes

### Design System
Dark theme. The palette is lifted from the Agentic OS Center Island
(`controlstackai-nixos/modules/quickshell/alina-bar/shell.qml`) by way of the product
film's `src/theme.ts`, so the site and the system shown in the homepage film read as one
brand. Tokens live in `styles/tailwind-cdn.js`:

- `ink` (#07111f) - page background
- `surface` (#0d1b2e) - panels
- `edge` (#24466f) - borders
- `dim` (#6b82a3) - de-emphasised text (lifted from the island's #4a6285, which fails WCAG AA as body copy)
- `muted` (#a3b8d4) - body copy
- `fg` (#dce7f7) - headings
- `accent` (#6cb0ff) - links and primary actions; use `text-ink` on accent backgrounds, not white
- `voice` (#a67df3) - the realtime voice affordance, used for eyebrow labels
- Type: Inter + JetBrains Mono, loaded from Google Fonts
- Glass panels via `.panel` / `.panel-solid` with backdrop-blur

## Common Development Commands

### Local Development
```bash
# Install Wrangler CLI (required for local development)
npm install -g wrangler

# Run local development server
wrangler pages dev .

# Run with D1 database (after creating D1 instance)
wrangler pages dev . --d1 DB=controlstackai_db
```

### Database Management
```bash
# Create D1 database
wrangler d1 create controlstackai_db

# Execute schema
wrangler d1 execute controlstackai_db --file=schema/schema.sql

# Query leads table
wrangler d1 execute controlstackai_db --command="SELECT * FROM leads ORDER BY createdAt DESC LIMIT 10"
```

### Deployment
- Deployment is automatic via Cloudflare Pages when pushing to main branch
- No build process required - serves files directly from root
- Functions are auto-detected from `/functions` directory

## Contact Form Integration

The `/contact` endpoint accepts POST requests with JSON payload:
```json
{
  "name": "string (max 200 chars)",
  "email": "string (max 200 chars)", 
  "company": "string (max 200 chars)",
  "message": "string (max 4000 chars)"
}
```

The function gracefully handles missing D1 binding - form will work without database configuration.

## Content Updates

- Edit HTML files directly for copy changes
- Replace assets in `/assets/` for logos and banners
- Modify `styles/tailwind-cdn.js` for theme customizations
- Update security headers in `_headers` as needed

## Cloudflare Configuration

### Required Bindings for Full Functionality
- **D1 Database**: Bind as `DB` in Pages settings for contact form persistence
- **Custom Domain**: Configure in Pages custom domains section

### Environment Variables
No environment variables required - all configuration is handled through Cloudflare bindings.