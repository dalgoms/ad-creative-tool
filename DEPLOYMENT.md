# Deployment Guide

## 1. Deployment Overview

The Ad Creative Tool runs as a serverless Next.js application on Vercel, backed by Supabase (PostgreSQL + Storage) and OpenAI. The deployment model is:

- **Vercel** -- hosts the app, runs serverless API functions
- **Supabase PostgreSQL** -- stores all application data
- **Supabase Storage** -- stores generated PNG assets
- **OpenAI API** -- generates ad copy (optional, fallback available)
- **GitHub** -- source of truth, triggers Vercel deployments

```mermaid
flowchart LR
  Dev["Developer"] -->|push| GitHub
  GitHub -->|auto-deploy| Vercel
  Vercel -->|queries| SupaDB["Supabase DB"]
  Vercel -->|uploads| SupaStorage["Supabase Storage"]
  Vercel -->|calls| OpenAI
```

---

## 2. Required Services

| Service | Required | Free Tier | Purpose |
|---------|----------|-----------|---------|
| GitHub | Yes | Yes | Source control, deployment trigger |
| Vercel | Yes | Yes (Hobby) | Hosting, serverless functions |
| Supabase | Yes | Yes | PostgreSQL database + Storage bucket |
| OpenAI | Optional | No | GPT-4o copy generation |
| Make.com | Optional | Yes | Workflow automation |

---

## 3. Required Environment Variables

| Variable | Required | Where Used | Description |
|----------|----------|------------|-------------|
| `DATABASE_URL` | Yes | Prisma | Supabase PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase client | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (prod) | Asset uploader | Service role key (bypasses RLS) |
| `OPENAI_API_KEY` | Optional | Copy generator | Enables GPT-4o copy; fallback if missing |
| `MAKE_WEBHOOK_SECRET` | Optional | Webhook routes | Shared secret for Make.com inbound auth |

---

## 4. Example .env.local Template

```bash
# =============================================================================
# DATABASE
# =============================================================================
# Use Transaction Pooler (port 6543) for Vercel serverless
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DATABASE_URL="postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# =============================================================================
# SUPABASE
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# =============================================================================
# OPENAI (optional — deterministic fallback if missing)
# =============================================================================
OPENAI_API_KEY="sk-proj-..."

# =============================================================================
# MAKE.COM WEBHOOKS (optional)
# =============================================================================
MAKE_WEBHOOK_SECRET="your-shared-secret"
```

> **CRITICAL:** Never commit `.env`, `.env.local`, or any file containing real keys to git.

---

## 5. Supabase Setup Steps

### 5.1 Create Project

1. Go to https://supabase.com/dashboard
2. Create a new project (choose your region)
3. Note the **Project URL** and **Project Reference ID**

### 5.2 Get Connection String

1. Go to **Settings → Database → Connection string**
2. Choose **Transaction** mode (port 6543) -- required for Vercel serverless
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. Append `?pgbouncer=true&connection_limit=1`

**Why Transaction Pooler?** Vercel spins up many concurrent serverless functions. The Session Pooler (port 5432) holds connections per session, which quickly exhausts the free-tier limit (15 connections). The Transaction Pooler (port 6543) reuses connections between transactions, supporting far more concurrent requests.

### 5.3 Get Service Role Key

1. Go to **Settings → API**
2. Find the `service_role` key (starts with `eyJ...` or `sb_secret_...`)
3. This key bypasses Row Level Security -- use server-side only

---

## 6. Bucket Creation Steps

1. Go to **Supabase Dashboard → Storage**
2. Click **New bucket**
3. Name: `creative-assets`
4. Toggle **Public bucket** to ON
5. Click **Create bucket**
6. Verify: any file uploaded to this bucket should be accessible via its public URL

**Why public?** Generated ad assets need direct URL access for preview in UI and for publishing to ad platforms.

---

## 7. Database Connection Notes

### Local Development

For local development, the project includes `embedded-postgres` (dev dependency). Start it with:

```bash
node scripts/start-db.mjs
```

Local `DATABASE_URL`:
```
postgresql://postgres:password@localhost:5433/ad_creative_tool
```

### Production (Supabase)

Use the **Transaction Pooler** connection string:
```
postgresql://postgres.{ref}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Important:** If your password contains special characters (`@`, `!`, `#`, etc.), they must be URL-encoded in the connection string. For example, `!` becomes `%21`, `@` becomes `%40`.

---

## 8. Prisma Push / Seed Steps

### Push Schema to Production

```bash
# Set DATABASE_URL to your Supabase connection string
export DATABASE_URL="postgresql://..."

# Generate Prisma client
npx prisma generate

# Push schema (creates tables if they don't exist)
npx prisma db push
```

### Seed Initial Data

```bash
# Run seed script (creates brands, categories, presets, templates)
npx tsx prisma/seed.ts
```

The seed creates:
- 1 brand (Timbel)
- 3 categories (B2B SaaS, Beauty, Education)
- 5 platform presets (Meta 3 sizes, LinkedIn 2 sizes)
- 3 template definitions (Corporate Minimal, Beauty Elegant, Education Bold)

### Verify

```bash
npx prisma studio
```

This opens a browser-based database explorer to confirm all records were created.

---

## 9. Vercel Deployment Steps

### 9.1 Connect Repository

1. Go to https://vercel.com/dashboard
2. Click **Add New → Project**
3. Import your GitHub repository
4. Set the **Root Directory** to the project folder if it's in a monorepo

### 9.2 Add Environment Variables

In Vercel project settings → Environment Variables, add:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | Transaction pooler connection string | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` JWT token | Production |
| `OPENAI_API_KEY` | `sk-proj-...` | Production |

**Warning about trailing newlines:** When adding env vars via CLI (`vercel env add`), PowerShell's `echo`/pipe can append a trailing newline that corrupts the value. Either:
- Add variables via the **Vercel Dashboard web UI** (recommended)
- Or use this PowerShell workaround:
  ```powershell
  [System.IO.File]::WriteAllText("tmp.txt", "your-value-here")
  cmd /c "type tmp.txt" | vercel env add VARIABLE_NAME production
  ```

### 9.3 Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Or push to the `main` branch -- Vercel auto-deploys on push.

### 9.4 Post-Deploy: Push Schema

After first deploy, push the Prisma schema to your production database:

```bash
DATABASE_URL="your-production-url" npx prisma db push
DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
```

---

## 10. Production Validation Checklist

Run these checks after deploying:

| # | Test | Command / Action | Expected |
|---|------|-----------------|----------|
| 1 | App loads | Visit production URL | Dashboard renders |
| 2 | DB connected | `GET /api/v1/brands` | Returns brand list |
| 3 | Categories loaded | `GET /api/v1/categories` | Returns 3 categories |
| 4 | Presets loaded | `GET /api/v1/presets` | Returns 5 presets |
| 5 | Create campaign | Use UI campaign form | Campaign created |
| 6 | Generate assets | Click Generate | 15 assets generated |
| 7 | Assets accessible | Click asset thumbnail | Image loads from Supabase |
| 8 | Korean rendering | Check Korean text in assets | NotoSansKR renders correctly |
| 9 | Copy source | Check API response | `copySource: "openai"` |
| 10 | Status transitions | Approve → Publish asset | Status updates correctly |
| 11 | Regenerate copy | Click Regenerate Copy | New copy variants created |
| 12 | Regenerate assets | Click Re-render Assets | New PNGs generated |
| 13 | Make webhook | POST to `/api/v1/webhooks/make` | Campaign created |

---

## 11. Font Deployment Notes

Fonts are critical for the rendering engine. The project bundles 6 font files in `public/fonts/`:

| File | Font | Weight | Size | Purpose |
|------|------|--------|------|---------|
| `Inter-400.ttf` | Inter | Regular | ~155KB | Body text |
| `Inter-700.ttf` | Inter | Bold | ~155KB | Subcopy emphasis |
| `Inter-800.ttf` | Inter | Extra Bold | ~155KB | Headlines |
| `NotoSansKR-400.woff` | Noto Sans KR | Regular | ~3MB | Korean body |
| `NotoSansKR-700.woff` | Noto Sans KR | Bold | ~3MB | Korean headings |
| `NotoSansKR-800.woff` | Noto Sans KR | Extra Bold | ~3MB | Korean emphasis |

**Total: ~9.4MB** -- these must be committed to git. Do not add `public/fonts/` to `.gitignore`.

**Why WOFF, not WOFF2?** Satori cannot parse WOFF2 format. The WOFF files were obtained by requesting Google Fonts with an IE11 User-Agent string, which returns WOFF instead of WOFF2.

**Vercel bundling:** `next.config.ts` includes `outputFileTracingIncludes` to ensure fonts are bundled with serverless functions:

```typescript
outputFileTracingIncludes: {
  "/api/v1/creatives/generate": ["./public/fonts/**/*"],
  "/api/v1/campaigns/[id]/regenerate-assets": ["./public/fonts/**/*"],
},
```

---

## 12. Troubleshooting Deployment Issues

### Database Connection Failures (P1001)

**Symptom:** `Can't reach database server at... P1001`

**Causes:**
1. Supabase project is paused (free tier pauses after 1 week of inactivity)
2. Using direct connection instead of pooler
3. IPv6 incompatibility

**Fix:**
- Unpause your Supabase project in the dashboard
- Use the Transaction Pooler URL (port 6543)
- Ensure `?pgbouncer=true&connection_limit=1` is appended

### Max Clients Error

**Symptom:** `MaxClientsInSessionMode: max clients reached`

**Cause:** Using Session Pooler (port 5432) which holds connections per session.

**Fix:** Switch to Transaction Pooler (port 6543). Update `DATABASE_URL` in Vercel env vars.

### Asset Upload Fails on Vercel

**Symptom:** `ENOENT: no such file or directory, mkdir '/var/task/public/generated-assets/...'`

**Cause:** Vercel serverless filesystem is read-only. Local storage fallback doesn't work.

**Fix:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is correctly set in Vercel. It must be the JWT token (starts with `eyJ...`), not the project ID or the anon/publishable key.

### Korean Text Renders as Boxes

**Symptom:** Korean characters appear as empty rectangles in generated assets.

**Cause:** Font files not bundled with serverless function.

**Fix:**
1. Verify `public/fonts/NotoSansKR-*.woff` files exist and are committed to git
2. Verify `outputFileTracingIncludes` in `next.config.ts` includes both generate and regenerate routes
3. Redeploy after changes

### OpenAI Returns 401

**Symptom:** Copy generation always falls back.

**Cause:** API key is invalid or has trailing whitespace/newline.

**Fix:** Remove and re-add the key via Vercel Dashboard (web UI, not CLI).

### Build Fails: Prisma Client Not Generated

**Symptom:** `PrismaClientInitializationError: Prisma has detected that this project was built on Vercel`

**Fix:** Ensure `package.json` has both:
```json
"postinstall": "prisma generate",
"build": "prisma generate && next build"
```

---

## 13. Rollback / Safe Update Notes

### Rolling Back a Deployment

Vercel maintains deployment history. To roll back:

1. Go to **Vercel Dashboard → Deployments**
2. Find the last known good deployment
3. Click the three-dot menu → **Promote to Production**

### Safe Update Process

1. Make changes on a feature branch
2. Push to GitHub -- Vercel creates a preview deployment
3. Test the preview URL thoroughly
4. Merge to `main` -- Vercel auto-deploys to production

### Database Migrations

Prisma `db push` is used for schema changes. This is additive and non-destructive for adding new fields/tables. For destructive changes (dropping columns, renaming):

1. Use `prisma migrate dev` locally to create a migration file
2. Review the SQL
3. Apply to production: `prisma migrate deploy`

### Environment Variable Changes

Environment variable changes take effect on the next deployment. After updating a variable in Vercel Dashboard:

```bash
vercel --prod
```

Or trigger a redeployment from the dashboard.
