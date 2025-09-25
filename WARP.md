# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a static HTML website for ControlStackAI built to deploy on Cloudflare Pages with optional Cloudflare Functions and D1 database integration. The site uses Tailwind CSS via CDN with no build process required.

## Architecture

### Static Website Structure
- **Frontend**: Static HTML pages with Tailwind CSS via CDN
- **Styling**: Custom Tailwind configuration in `styles/tailwind-cdn.js` with brand colors (ink, accent, etc.)
- **Backend**: Cloudflare Pages Functions for contact form handling
- **Database**: Optional Cloudflare D1 for storing contact leads
- **Security**: HTTP security headers configured in `_headers`

### Key Files
- `index.html` - Homepage with hero section and service overview
- `services.html`, `about.html`, `contact.html` - Additional pages
- `functions/contact.ts` - Cloudflare Pages Function handling POST /contact endpoint
- `schema/schema.sql` - D1 database schema for contact leads
- `styles/tailwind-cdn.js` - Tailwind CSS configuration with custom colors
- `_headers` - Security headers for all routes

### Design System
The site uses a dark theme with the following custom colors:
- `ink` (#0C0F14) - Primary background
- `accent` (#B4DCFF) - Primary accent/CTA color
- `slate-*` variants for text hierarchy
- Glass morphism effects using backdrop-blur

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