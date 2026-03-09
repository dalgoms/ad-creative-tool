# Operations Manual

## 1. Who This Tool Is For

This tool is designed for:

- **Marketing operators** who need to produce ad creatives quickly across multiple platforms
- **Brand managers** who need to maintain visual and tonal consistency
- **Growth teams** who want to test multiple copy variants per campaign
- **Automation engineers** who want to trigger creative generation from Make.com or other systems

It is NOT a design tool. It does not replace Figma or Photoshop. It automates the repetitive part of ad creation: generating copy, applying brand rules, and rendering platform-specific sizes.

---

## 2. Daily Usage Flow

A typical daily workflow:

1. **Create a campaign** with product details and target platforms
2. **Review generated assets** -- check copy quality and visual fit
3. **Regenerate copy** if the tone or messaging isn't right
4. **Re-render assets** if template/brand changes were made
5. **Approve** assets that pass QA
6. **Publish** approved assets (marks them as production-ready)
7. **Download** or share asset URLs for ad platform upload

---

## 3. How to Create a Campaign

### From the UI

1. Navigate to **Campaigns → New Campaign**
2. **Step 1 -- Select Brand:** Choose the brand (colors, fonts, logo will apply)
3. **Step 2 -- Product Details:** Enter product name, description, target audience, optional badge text
4. **Step 3 -- Select Platforms:** Choose which platform sizes to render (Meta, LinkedIn)
5. **Step 4 -- Generate:** Click the Generate button

The system will:
- Select the category rule based on your choice
- Generate 3 copy variants (headline + subcopy + CTA each)
- Render each copy variant × each platform size = typically 15 assets
- Upload all assets to cloud storage
- Redirect you to the campaign detail page

**Typical generation time:** 30-60 seconds for 15 assets.

### From the API

```bash
curl -X POST https://your-app.vercel.app/api/v1/creatives/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaign": {
      "name": "Q2 SaaS Push",
      "brandId": "brand_timbel",
      "categoryId": "cat_b2b_saas",
      "productName": "DataFlow Pro",
      "productDescription": "Enterprise data pipeline automation",
      "targetAudience": "CTOs and data engineers",
      "badgeText": "NEW"
    },
    "platforms": ["preset_meta_square", "preset_linkedin_landscape"],
    "copyVariants": 3
  }'
```

### From Make.com

Send a POST to `/api/v1/webhooks/make`:

```json
{
  "action": "create_campaign",
  "data": {
    "name": "Make-triggered Campaign",
    "brandId": "brand_timbel",
    "categoryId": "cat_beauty",
    "productName": "Glow Serum",
    "platforms": ["preset_meta_square"],
    "copyVariants": 2
  }
}
```

---

## 4. How to Review Generated Assets

1. Go to **Campaigns → [Campaign Name]**
2. The page shows:
   - **Copy variants** at the top (headline, subcopy, CTA for each variant)
   - **Asset grid** below, filterable by status and platform
3. Click any asset thumbnail to open the **lightbox** (full-size preview)
4. Check:
   - Is the text readable and properly sized?
   - Does the Korean text render correctly?
   - Are brand colors applied?
   - Does the layout work at each platform size?

---

## 5. How to Approve / Reject / Publish

Each asset has a status badge and action buttons:

| Current Status | Available Actions |
|---------------|-------------------|
| `generated` | Approve, Reject |
| `approved` | Publish, Reject |
| `rejected` | Reset (back to generated) |
| `published` | No further actions |

**Approve:** Marks the asset as QA-passed and ready for publishing.

**Reject:** Marks the asset as not suitable. Can be reset later.

**Publish:** Final state. Sets `publishedAt` timestamp. Indicates the asset has been used or is ready for ad platform upload.

**Reset:** Moves a rejected asset back to `generated` for re-evaluation.

---

## 6. How to Regenerate Copy

Use this when the generated headlines, subcopy, or CTAs don't meet quality standards.

1. Go to the campaign detail page
2. Click **Regenerate Copy** button in the header
3. Confirm the action

**What happens:**
- All existing copy variants are deleted
- All linked assets are deleted (they reference the old copy)
- New copy variants are generated using OpenAI (or fallback)
- Campaign status resets to `draft`

**Important:** After regenerating copy, you must also click **Re-render Assets** to generate new PNG files with the updated text.

---

## 7. How to Regenerate Assets

Use this when you've changed brand settings, template styles, or just want fresh renders.

1. Go to the campaign detail page
2. Click **Re-render Assets** button
3. Confirm the action

**What happens:**
- All existing assets (PNG files) are deleted
- Copy variants are preserved (same text)
- New PNGs are rendered for each variant × preset combination
- New files are uploaded to Supabase Storage
- Campaign status updates to `completed`

---

## 8. How to Use Category/Platform Presets Effectively

### Category Selection Tips

| If your product is... | Use category | Why |
|----------------------|-------------|-----|
| B2B software, tools, APIs | B2B SaaS | Professional tone, ROI-focused keywords |
| Cosmetics, skincare, wellness | Beauty | Aspirational tone, sensory keywords |
| Courses, learning platforms | Education | Encouraging tone, achievement keywords |

Each category controls:
- **Keywords** used in copy generation prompts
- **Tone** (voice, formality, emotion)
- **Copy rules** (max character limits, style)
- **Visual direction** (template selection, color mood)

### Platform Selection Tips

| Platform | Best for | Sizes |
|----------|----------|-------|
| Meta Feed Square | Standard feed posts | 1080×1080 |
| Meta Feed Portrait | Taller feed posts, more visual space | 1080×1350 |
| Meta Story/Reel | Full-screen vertical | 1080×1920 |
| LinkedIn Feed Square | Professional feed | 1200×1200 |
| LinkedIn Landscape | Blog shares, article promotion | 1200×627 |

**Recommendation:** For maximum reach, select all 5 presets. The system handles layout adjustments automatically per size.

---

## 9. How to Use Output for Meta / LinkedIn Workflows

Generated assets are stored in Supabase Storage with permanent public URLs. To use them:

### Manual Upload
1. Go to campaign detail → asset grid
2. Click on an asset to view full size
3. Right-click → Save Image (or use the Download button)
4. Upload to Meta Ads Manager or LinkedIn Campaign Manager

### Automated via Make.com
1. Register an outbound webhook for `creative.completed` events
2. When assets are generated, the webhook payload includes all asset URLs
3. Use Make.com modules to:
   - Download images from URLs
   - Upload to Meta/LinkedIn via their APIs
   - Create ad creatives programmatically

---

## 10. How to Use the Make Webhook Integration

### Setting Up Inbound (Make → Tool)

1. In your Make.com scenario, add an **HTTP Request** module
2. Set URL to: `https://your-app.vercel.app/api/v1/webhooks/make`
3. Method: POST
4. Content-Type: `application/json`
5. Add header `x-webhook-secret` with your shared secret (if configured)
6. Body: see the `create_campaign` payload example in Section 3

### Setting Up Outbound (Tool → Make)

1. In Make.com, create a **Custom Webhook** trigger
2. Copy the webhook URL
3. In the tool, go to **Settings → Webhooks**
4. Click **Add Webhook**
5. Paste the URL, set events to `creative.completed`
6. Optionally add a shared secret
7. Click **Test** to verify connectivity

### Webhook Events

| Event | When | Payload includes |
|-------|------|-----------------|
| `creative.completed` | Campaign generation finishes | Campaign ID, asset URLs, copy variants |
| `creative.failed` | Generation fails | Campaign ID, error message |

---

## 11. Recommended QA Checklist Before Publishing

Before approving assets for publishing, verify:

- [ ] **Headline readability** -- text is not truncated or overflowing
- [ ] **Subcopy clarity** -- message is clear and on-brand
- [ ] **CTA visibility** -- button text is legible against background
- [ ] **Korean text** -- no missing characters or rendering artifacts
- [ ] **Brand colors** -- primary, secondary, accent applied correctly
- [ ] **Logo** -- displayed correctly if brand has a logo URL
- [ ] **Badge** -- positioned properly if badge text was set
- [ ] **Platform fit** -- layout works at each specific size (especially tall/wide ratios)
- [ ] **No restricted phrases** -- check if any category-restricted words slipped through
- [ ] **Image quality** -- PNG is sharp at intended display size

---

## 12. Common Operator Mistakes

| Mistake | Impact | Prevention |
|---------|--------|------------|
| Wrong category for product type | Off-tone copy, wrong keywords | Match product to category carefully |
| Forgetting to re-render after copy regeneration | Campaign shows no assets | Always re-render after copy regeneration |
| Using direct DB URL instead of pooler | Connection failures in production | Always use Transaction Pooler URL |
| Committing .env file | Secret exposure | Check `.gitignore` before pushing |
| Very long product name or description | Text overflow in small sizes | Keep product names under 30 chars |
| Skipping QA for all platform sizes | Bad layout on certain sizes (e.g., 1200×627 is very wide) | Review every size before approving |
| Publishing rejected assets | Sends wrong status to Make | Reset rejected assets before re-approving |

---

## 13. Monitoring / Logging Guidance

### Vercel Logs

1. Go to **Vercel Dashboard → Deployments → [latest] → Functions**
2. View real-time logs for API function invocations
3. Filter by route (e.g., `/api/v1/creatives/generate`)

### Key Metrics to Watch

| Metric | Where | Expected |
|--------|-------|----------|
| Generation time | API response `processingTimeMs` | 30-60s for 15 assets |
| Copy source | API response `copySource` | `"openai"` in production |
| Webhook deliveries | Settings → Webhooks page | Success status codes |
| Error rate | Vercel function logs | Should be near zero |

### Database Monitoring

Supabase Dashboard → Database → Query Performance shows slow queries. Current queries are all simple lookups by ID, so performance should be good.

---

## 14. Incident Handling Basics

### Generation Fails (500 Error)

1. Check Vercel function logs for the error stack trace
2. Common causes:
   - Supabase DB paused → unpause in dashboard
   - Storage key invalid → verify `SUPABASE_SERVICE_ROLE_KEY`
   - Font files missing → redeploy from GitHub

### Assets Not Loading

1. Check if the Supabase Storage bucket `creative-assets` exists
2. Verify the bucket is set to Public
3. Try accessing the asset URL directly in a browser
4. If 404: the upload may have failed; check Vercel logs

### OpenAI Fallback Activated Unexpectedly

1. Check `copySource` in the API response -- if it says `"fallback"`, OpenAI failed
2. Verify `OPENAI_API_KEY` in Vercel environment variables
3. Check OpenAI API status: https://status.openai.com
4. Check if your API key has billing issues or rate limits

### Webhook Delivery Failures

1. Go to **Settings → Webhooks → [webhook] → Deliveries**
2. Check status codes and error messages
3. Common issues:
   - Target URL unreachable → verify the URL
   - Timeout → the receiving service is too slow
   - 401/403 → shared secret mismatch

---

## 15. Operational Limitations

| Limitation | Detail | Workaround |
|-----------|--------|------------|
| No bulk creation | One campaign at a time via UI | Use API or Make.com for batch |
| No real-time preview | Must generate to see results | Regenerate quickly if needed |
| No manual text editing | Can't edit text on generated assets | Regenerate copy |
| No background images yet | Only solid/gradient backgrounds | Future DALL-E integration |
| 15 assets max typical | 3 variants × 5 presets | Increase `copyVariants` or presets |
| Supabase free tier limits | 1GB storage, 500MB DB | Upgrade plan for production scale |
| Vercel function timeout | 60s on Hobby plan | Large campaigns may need Pro plan |

---

## 16. Recommended Best Practices

1. **Start with fewer platforms** -- select 2-3 sizes for initial review, then generate remaining sizes
2. **Use descriptive campaign names** -- include date and product for easy finding later
3. **Review all sizes** -- what looks good at 1080×1080 may overflow at 1200×627
4. **Keep product names concise** -- under 30 characters for best text fitting
5. **Set up webhooks early** -- even if you're not using Make.com yet, webhook delivery logs help debug
6. **Regenerate copy first, then assets** -- if both need updating, regenerate copy first (it deletes assets anyway), then re-render
7. **Use the category that best matches** -- the category drives all copy and visual decisions
8. **Monitor `copySource`** -- ensure OpenAI is active in production, not just fallback
9. **Approve systematically** -- review all 5 sizes for a variant before approving
10. **Archive old campaigns** -- use the delete function for campaigns you no longer need

---

## Glossary

| Term | Definition |
|------|-----------|
| **Campaign** | A single ad generation run for one product, producing multiple copy variants and platform-sized assets |
| **Brand** | A configurable identity with colors, fonts, and optional logo applied to all campaign assets |
| **Category Rule** | A set of rules (keywords, tone, copy constraints, visual direction) that control how copy and visuals are generated for a product category |
| **Platform Preset** | A target ad platform's size, aspect ratio, and layout rules (e.g., Meta Feed Square 1080×1080) |
| **Template Definition** | A visual layout specification (layers, colors, typography) used by the rendering engine |
| **Copy Variant** | One version of generated ad text: headline + subcopy + CTA |
| **Creative Asset** | A single rendered PNG file for one copy variant at one platform size |
| **Webhook Config** | An outbound webhook endpoint registered to receive generation events |
| **Webhook Delivery** | A single delivery attempt to a webhook endpoint, logged with status and response |
| **Fallback** | The deterministic copy generation mode used when OpenAI is unavailable |
| **Satori** | The library that converts React JSX into SVG for server-side rendering |
| **Sharp** | The library that converts SVG to PNG/JPG at specified dimensions |
| **Transaction Pooler** | Supabase's connection pooling mode (port 6543) suitable for serverless environments |

---

## How This Project Evolved

### Phase 1: Local MVP
Set up Next.js 15 project with TypeScript and Tailwind. Created the core Satori rendering pipeline. Discovered that Satori requires static font files (not variable fonts) and WOFF format (not WOFF2). Validated Korean text rendering with Noto Sans KR.

### Phase 2: Rendering Validation
Built the `adjustFontSize()` text fitting algorithm with CJK-aware character width estimation. Connected fonts (Inter + Noto Sans KR at 3 weights each). Verified multi-platform rendering across all 5 preset sizes. Total font payload: ~9.4MB.

### Phase 3: Database Integration
Added embedded-postgres for local development. Created Prisma schema with 9 models. Seeded initial data for 3 categories (B2B SaaS, Beauty, Education), 5 platform presets, and 3 template definitions.

### Phase 4: Pipeline Completion
Wired the full E2E pipeline: campaign creation → copy generation → rendering → storage → database. First validated through test harness scripts, then through the actual API route. Added Zod validation for all inputs.

### Phase 5: Production Features
Integrated OpenAI GPT-4o with automatic fallback. Added asset status workflow (generated/approved/rejected/published). Built copy regeneration and asset re-rendering endpoints. Added Make.com webhook integration (inbound + outbound). Built the full UI with campaign forms, asset grids, and status management.

### Phase 6: Deployment
Migrated from embedded-postgres to Supabase PostgreSQL. Migrated from local filesystem to Supabase Storage. Configured Vercel deployment with font bundling, Prisma generation, and all environment variables. Resolved production issues: connection pooling, read-only filesystem, font tracing, API key formatting. Final production validation: 9/9 tests passed.
