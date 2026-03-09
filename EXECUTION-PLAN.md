# Ad Creative Automation Tool -- Execution Plan

> Refined from the system design plan. Reflects actual project state as of 2026-03-09.
> Target audience: solo operator or 2-person team building this for production use.

---

## Current State Summary

The codebase scaffold is complete. 58 source files exist across 27 routes.
The project builds with zero TypeScript errors.

| Layer | Status | What Exists |
|-------|--------|-------------|
| Prisma schema | Done | 9 models (Brand, CategoryRule, PlatformPreset, TemplateDefinition, Campaign, CopyVariant, CreativeAsset, WebhookConfig, WebhookDelivery) |
| Seed data | Done | 1 brand, 3 category rules, 5 platform presets, 3 template definitions |
| Copy generator | Done (needs API key) | OpenAI GPT-4o integration + fallback generator |
| Template renderer | Done (needs font validation) | Satori + Sharp pipeline with AdTemplate component |
| API routes | Done | 15 endpoints including generate, CRUD, webhooks |
| UI pages | Done | 12 pages: dashboard, campaigns, brands, categories, templates, assets, platforms, webhooks |
| Database | NOT set up | No PostgreSQL instance connected yet |
| Storage | Local only | Files save to filesystem, not cloud storage |
| Deployment | Not done | No Vercel/hosting configured |

**What this means:** The code is written, but the system has never actually run end-to-end.
The remaining work is integration, validation, hardening, and deployment.

---

## 1. Week-by-Week Build Plan

### Week 1: Database + First End-to-End Run

**Goal:** See the app running locally with real data flowing through the pipeline.

| Day | Task | Output |
|-----|------|--------|
| Mon | Set up PostgreSQL (Supabase free tier or local Docker). Update `.env.local` with `DATABASE_URL`. Run `npx prisma db push` and `npm run db:seed`. | Database tables created, seed data loaded |
| Tue | Run `npm run dev`. Navigate every page. Fix any runtime errors from DB queries. Verify dashboard shows stats, brands/categories/templates load from DB. | UI fully functional with seed data |
| Wed | Add OpenAI API key to `.env.local`. Test `/api/v1/creatives/generate` via curl or Postman with the sample payload from the plan. Debug any copy generation issues. | Copy generation returns 3 variants as JSON |
| Thu | Test template rendering: submit a campaign through the UI form. Verify Satori renders PNGs. Check rendered images exist in `public/generated-assets/`. Fix font loading if Google Fonts fetch fails (download Inter .ttf files to `public/fonts/`). | First real PNG ad assets generated |
| Fri | Test all 5 platform sizes render correctly. Check text truncation, CTA button sizing, badge placement. Screenshot each size and review visually. Fix any layout issues in `AdTemplate.tsx`. | All 5 platform variants render with acceptable quality |

**Week 1 deliverable:** A locally running app that generates real ad creatives.

---

### Week 2: Quality + Missing Functionality

**Goal:** Close gaps between "it runs" and "it's usable."

| Day | Task | Output |
|-----|------|--------|
| Mon | Add local font files (`Inter-400.ttf`, `Inter-700.ttf`, `Inter-800.ttf`) to `public/fonts/` so rendering works offline. Test with each category (B2B SaaS, Beauty, Education) and verify tone/visual differences. | Reliable offline font loading |
| Tue | Build restricted phrase validation: before saving copy variants, check against category `restricted` keywords. Return error if copy contains forbidden terms. Add retry logic in copy-generator (retry once with lower temperature on failure). | Copy validation + retry |
| Wed | Implement bulk ZIP download on campaign detail page: API route that zips all assets for a campaign and returns the file. Add download button to asset grid. | `/api/v1/campaigns/[id]/download` returns ZIP |
| Thu | Add copy editing: allow user to edit headline/subcopy/cta text on campaign detail page before re-rendering. Add "Re-render with edits" button. | Manual copy override + re-render |
| Fri | Stress test: create 5 campaigns across different categories. Review all generated assets. Document any visual bugs. Tune template styles (overlay opacity, font sizes, CTA padding). | Quality review pass complete |

**Week 2 deliverable:** Reliable generation with copy validation and download capability.

---

### Week 3: Storage + Deployment

**Goal:** Move from local-only to deployed and accessible.

| Day | Task | Output |
|-----|------|--------|
| Mon | Set up Supabase Storage bucket for assets. Replace `asset-uploader.ts` to upload PNGs to Supabase Storage instead of local filesystem. Update asset URLs to use Supabase CDN. | Cloud-hosted asset storage |
| Tue | Deploy to Vercel. Configure environment variables (DATABASE_URL, OPENAI_API_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Verify build passes. | App live on Vercel |
| Wed | Test full flow on deployed URL: create campaign, generate creatives, view assets, download ZIP. Fix any serverless-specific issues (Sharp on Vercel, font loading, timeouts). | End-to-end works in production |
| Thu | Add error handling UI: loading states for slow generation, error toasts, empty states. Add confirmation dialogs for destructive actions (delete campaign, delete brand). | Polished error handling |
| Fri | Set up Vercel cron or manual trigger to clean up orphaned assets older than 30 days. Add basic request logging for API routes. | Operational hygiene |

**Week 3 deliverable:** Deployed, accessible production app with cloud storage.

---

### Week 4: Make.com Integration + Real Workflow

**Goal:** Connect Make.com for automated triggering.

| Day | Task | Output |
|-----|------|--------|
| Mon | Test webhook system: create a webhook config pointing to a RequestBin/webhook.site URL. Generate a campaign and verify the `creative.completed` event is delivered. Check delivery logs in the UI. | Outbound webhooks verified |
| Tue | Build Make scenario #1: Google Sheet row (with product name, category, brand columns) triggers HTTP POST to `/api/v1/webhooks/incoming`. Map spreadsheet columns to API payload. | Make can trigger generation from a spreadsheet |
| Wed | Build Make scenario #2: On `creative.completed` webhook, upload assets to Google Drive folder + send Slack notification with campaign summary and asset count. | Automated output routing |
| Thu | Document both Make scenarios with screenshots. Create a sample Google Sheet template with correct column headers. Write setup instructions. | Make integration documentation |
| Fri | End-to-end automation test: add a row to the Google Sheet, watch Make trigger generation, assets appear in Drive, Slack notification arrives. Fix any timing/timeout issues. | Fully automated pipeline working |

**Week 4 deliverable:** Make.com automation working end-to-end.

---

### Week 5: Templates + Categories Expansion

**Goal:** Expand content coverage for real-world use.

| Day | Task | Output |
|-----|------|--------|
| Mon-Tue | Add 2 new category rules: "Ecommerce" and "AI Solution". Create keyword sets, tone rules, visual direction, prompt templates for each. Add to seed data. | 5 total categories |
| Wed | Create 2 new template definitions: `ecommerce-vibrant` (bright colors, product-focused) and `ai-solution-dark` (dark mode, tech aesthetic). Build corresponding layer configs. | 5 total template groups |
| Thu | Test all category + template + platform combinations (5 categories x 5 sizes = 25 variants). Screenshot and review. Fix any visual issues. | Full matrix validated |
| Fri | Add template selection UI: on campaign creation step, show available templates for the selected category. Allow override from default. | User can choose template |

**Week 5 deliverable:** Broader category and template coverage.

---

### Weeks 6-8: Hardening + Advanced Features (as needed)

| Week | Focus | Key Tasks |
|------|-------|-----------|
| 6 | Approval workflow | Add status flow: generated -> pending_review -> approved -> rejected. Review UI with approve/reject buttons. Filter asset library by status. |
| 7 | Background image integration | DALL-E 3 API integration. Generate 3 background options per campaign. Selection UI. Fallback to solid color. |
| 8 | Analytics + feedback | Dashboard charts: assets generated per week, by category, by platform. Track which assets get published (manual status update). Performance data fields on CreativeAsset. |

---

## 2. Prioritized Task Checklist

### Must Do (Blocks Everything Else)

- [ ] **P0** Connect PostgreSQL database and run migrations + seed
- [ ] **P0** Add OpenAI API key and test copy generation
- [ ] **P0** Download Inter font files to `public/fonts/` for reliable rendering
- [ ] **P0** Run full end-to-end: form submission -> copy gen -> render -> PNG output
- [ ] **P0** Fix any Satori rendering issues (test all 5 platform sizes)

### Must Do Before Sharing With Others

- [ ] **P1** Deploy to Vercel with environment variables
- [ ] **P1** Switch asset storage from local filesystem to Supabase Storage
- [ ] **P1** Add loading/error states to campaign generation flow
- [ ] **P1** Implement bulk ZIP download for campaign assets
- [ ] **P1** Validate copy against restricted phrases before saving
- [ ] **P1** Add copy retry logic (retry once on OpenAI failure)

### Should Do for Production Quality

- [ ] **P2** Add copy editing + re-render on campaign detail page
- [ ] **P2** Template selection UI during campaign creation
- [ ] **P2** Add 2 more categories (Ecommerce, AI Solution)
- [ ] **P2** Add 2 more template groups
- [ ] **P2** Error toasts / confirmation dialogs on destructive actions
- [ ] **P2** Test and verify Make.com webhook integration
- [ ] **P2** Build Make scenario: Google Sheet -> generate -> Drive + Slack

### Nice to Have (Phase 2+)

- [ ] **P3** DALL-E 3 background image generation
- [ ] **P3** Approval workflow (generated -> review -> approved)
- [ ] **P3** A/B copy variant comparison UI
- [ ] **P3** Multi-language copy generation
- [ ] **P3** Analytics dashboard with charts
- [ ] **P3** Template visual editor (drag-and-drop)
- [ ] **P3** Publishing to Meta/LinkedIn via Make

---

## 3. Frontend vs Backend Ownership

### Backend-Only (server-side, no UI needed)

| Component | Files | Description |
|-----------|-------|-------------|
| Copy generator engine | `lib/engine/copy-generator.ts`, `prompt-builder.ts` | OpenAI API calls, prompt construction, response parsing |
| Template renderer | `lib/engine/template-renderer.ts`, `AdTemplate.tsx` | Satori SVG generation, Sharp PNG conversion |
| Asset uploader | `lib/engine/asset-uploader.ts` | File storage (local or Supabase) |
| Webhook dispatcher | `lib/automation/make-webhook.ts` | Outbound HTTP calls to Make.com |
| Category/platform resolvers | `lib/engine/category-resolver.ts`, `platform-resolver.ts` | Database lookups with typed returns |
| Zod validators | `lib/validators/*.ts` | Request validation schemas |
| All API routes | `app/api/v1/**/*.ts` | REST endpoints |

### Frontend-Only (client components, no server logic)

| Component | Files | Description |
|-----------|-------|-------------|
| Campaign form | `components/campaigns/CampaignForm.tsx` | Multi-step wizard, form state, API calls |
| Asset grid + lightbox | `components/campaigns/AssetGrid.tsx` | Image grid, platform filtering, preview modal |
| Brand form | `components/brands/BrandForm.tsx` | Color pickers, font inputs, live preview |
| Category rule editor | `components/categories/CategoryRuleEditor.tsx` | JSON editor, quick-view cards |
| Webhook manager | `components/webhooks/WebhookManager.tsx` | CRUD, test button, delivery logs |
| Sidebar navigation | `components/layout/Sidebar.tsx` | Active state routing |

### Full-Stack (server component page + client interactivity)

| Page | Server Part | Client Part |
|------|-------------|-------------|
| Dashboard (`app/page.tsx`) | DB queries for stats + recent campaigns | Static display, no interactivity |
| Campaign detail (`app/campaigns/[id]/page.tsx`) | Load campaign + assets + variants from DB | AssetGrid component, download actions |
| Campaign list (`app/campaigns/page.tsx`) | DB query with includes | Static list, links |
| All other list pages | DB queries | Minimal interactivity |

### Key Principle

> If you're a solo dev: work **backend-first**. Get the API + engine working via curl/Postman.
> Then build UI on top of working endpoints. Never build UI for an endpoint that doesn't exist yet.

---

## 4. What Can Be Mocked in MVP

| Component | Mock Strategy | When to Replace |
|-----------|---------------|-----------------|
| **OpenAI copy generation** | Already built: `generateFallbackCopy()` in `copy-generator.ts` produces deterministic copy from category keywords. The generate endpoint already falls back to this when OpenAI fails. | Replace when you have an API key. Fallback remains as safety net. |
| **Background images** | Use solid color fallback (already built into template layer: `fallback_color`). No API call needed. User can optionally paste a URL. | Replace in Phase 2 with DALL-E 3 integration. |
| **Cloud storage** | Assets save to `public/generated-assets/` locally (already built). Works fine for development and local testing. | Replace before deployment with Supabase Storage upload. |
| **Make.com webhooks** | Webhook dispatch already fires but goes nowhere if no WebhookConfig rows exist. Test with webhook.site or RequestBin. | Replace with real Make.com webhook URLs when building scenarios. |
| **Logo rendering** | Template hides logo layer when `logoUrl` is null (already built: `fallback: "hide"`). Renders fine without a logo. | Upload a real logo PNG/SVG when configuring a brand. |
| **Custom fonts** | Falls back to Google Fonts fetch for Inter. If that fails, you get an error. | Download `.ttf` files to `public/fonts/` for production reliability. |
| **Approval workflow** | All assets start as `status: "generated"`. No review gate exists. | Build approval UI in Phase 2 when you need quality control. |
| **Multi-brand** | Seed includes 1 brand. System supports multiple but hasn't been tested with more. | Create additional brands through the UI when needed. |

### What You Can Skip Entirely in MVP

- Analytics dashboard (just count assets in the DB directly)
- Template visual editor (edit JSON directly in category rule editor)
- Multi-language support
- Asset performance tracking
- Automated publishing to ad platforms

---

## 5. What Needs Real API Integration Later

| Integration | Current State | What's Needed | Priority | Estimated Effort |
|-------------|---------------|---------------|----------|------------------|
| **OpenAI GPT-4o** | Code written, needs API key in `.env.local` | Sign up at platform.openai.com, create key, add to env | P0 (Week 1) | 15 min |
| **PostgreSQL** | Prisma schema ready, no DB connected | Create Supabase project (free) or run `docker run postgres`. Set `DATABASE_URL`. | P0 (Week 1) | 30 min |
| **Supabase Storage** | Local filesystem uploader exists | Create storage bucket. Replace `asset-uploader.ts` with `@supabase/supabase-js` upload. ~30 lines of code. | P1 (Week 3) | 2 hours |
| **Vercel deployment** | `next.config.ts` ready | `vercel deploy` + set env vars in dashboard | P1 (Week 3) | 1 hour |
| **Make.com incoming** | Endpoint exists at `/api/v1/webhooks/incoming` | Build Make scenario with HTTP module pointing to your deployed URL | P2 (Week 4) | 2 hours |
| **Make.com outgoing** | Webhook dispatcher + config UI built | Create Make "Custom Webhook" trigger, paste URL into webhook config page | P2 (Week 4) | 1 hour |
| **DALL-E 3** | Only prompt generation exists (text output) | Add OpenAI `images.generate()` call. New API route + UI for selecting from options. ~100 lines. | P3 (Week 7) | 4 hours |
| **Meta Ads Manager API** | Nothing built | Requires Facebook Business app, access tokens, campaign creation API. Significant scope. | P3 (Week 11+) | 2-3 days |
| **LinkedIn Campaign Manager** | Nothing built | Requires LinkedIn Marketing API approval. Similar to Meta. | P3 (Week 11+) | 2-3 days |

---

## 6. Exact Recommended Starting Order

This is the precise sequence of commands and actions to go from current state to working product.

### Step 1: Database (30 minutes)

```bash
# Option A: Supabase (recommended - free, hosted)
# 1. Go to supabase.com, create project
# 2. Copy connection string from Settings > Database
# 3. Update .env.local:
#    DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# Option B: Local Docker
docker run --name ad-creative-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ad_creative_tool -p 5432:5432 -d postgres:16

# Then push schema and seed
cd "D:\cursor test\projects\ad-creative-tool"
npx prisma db push
npm run db:seed
```

### Step 2: Fonts (10 minutes)

Download Inter font files for reliable Satori rendering:

```bash
mkdir -p public/fonts
# Download from: https://fonts.google.com/specimen/Inter
# Place these files:
#   public/fonts/Inter-400.ttf
#   public/fonts/Inter-700.ttf
#   public/fonts/Inter-800.ttf
```

### Step 3: OpenAI Key (5 minutes)

```bash
# Add to .env.local:
# OPENAI_API_KEY="sk-..."
# Get key from: https://platform.openai.com/api-keys
```

### Step 4: First Run (5 minutes)

```bash
npm run dev
# Open http://localhost:3000
# Verify: dashboard loads, shows 0 campaigns, 1 brand, 3 categories
```

### Step 5: First Campaign (15 minutes)

1. Navigate to /campaigns/new
2. Select brand "Timbel", category "B2B SaaS"
3. Enter campaign name: "Test Campaign 1"
4. Enter product: "Timbel AI Meeting Notes"
5. Enter description: "AI-powered meeting transcription and summary"
6. Select all 5 platform sizes
7. Click Generate
8. Wait for generation (5-15 seconds)
9. View results on campaign detail page
10. Check `public/generated-assets/` for PNG files

### Step 6: Visual QA (30 minutes)

Open each generated PNG. Check:
- Headline is readable and not overflowing
- Subcopy fits within its area
- CTA button is visible with readable text
- Badge (if set) appears in correct position
- Background color looks correct (solid fallback)
- Font rendering is clean (no garbled characters)
- Each of the 5 platform sizes has correct dimensions

### Step 7: Fix Issues

Common issues and fixes:
- **Font not found:** Download Inter TTF files to `public/fonts/`
- **Sharp error on Windows:** Run `npm rebuild sharp`
- **Copy generation timeout:** Check OpenAI API key, try fallback copy
- **Text overflow:** Adjust `headline_max_chars` in category rules
- **Layout wrong on story (9:16):** Adjust `layout_rules` in platform preset seed

### Step 8: Deploy (Week 3)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL, OPENAI_API_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### Step 9: Make.com (Week 4)

1. Create a Make.com account (free tier)
2. New scenario: "Ad Creative Generator"
3. Trigger: Google Sheets - Watch Rows
4. Action: HTTP - Make a Request
   - URL: `https://your-app.vercel.app/api/v1/webhooks/incoming`
   - Method: POST
   - Body: Map spreadsheet columns to the API schema
5. Test with a single row

---

## Summary: What to Do This Week

| Priority | Action | Time |
|----------|--------|------|
| 1 | Set up PostgreSQL + run seed | 30 min |
| 2 | Add OpenAI API key | 5 min |
| 3 | Download Inter font files | 10 min |
| 4 | `npm run dev` and create first campaign | 15 min |
| 5 | Visual QA on all 5 platform sizes | 30 min |
| 6 | Fix any rendering/layout issues | 1-2 hours |
| 7 | Test with all 3 categories | 30 min |
| **Total** | **First working session** | **3-4 hours** |

After this session you will have a working ad creative automation tool generating real PNG assets with AI-powered copy, category-aware rules, and multi-platform rendering.
