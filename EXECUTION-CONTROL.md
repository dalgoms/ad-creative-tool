# Ad Creative Automation Tool -- Execution Control Document

> This is not a project plan. This is a verification and control specification.
> Every section has binary pass/fail criteria derived from the actual codebase.
> Last updated: 2026-03-09. Codebase: 58 source files, 27 routes, 0 build errors.

---

## 1. First End-to-End Run: Success Criteria

### Exact Input

POST to `/api/v1/creatives/generate` with this payload:

```json
{
  "campaign": {
    "name": "E2E Validation Run",
    "brandId": "brand_timbel",
    "categoryId": "cat_b2b_saas",
    "productName": "Timbel AI Meeting Notes",
    "productDescription": "AI-powered meeting transcription and summary tool for enterprise teams",
    "targetAudience": "VP of Operations at mid-size companies",
    "badgeText": "Free Trial"
  },
  "platforms": [
    "preset_meta_square",
    "preset_meta_portrait",
    "preset_meta_story",
    "preset_linkedin_square",
    "preset_linkedin_landscape"
  ],
  "copyVariants": 3,
  "options": {
    "generateBackgroundPrompt": true
  }
}
```

### Required Output

The response must satisfy ALL of the following:

| Check | Condition | How to Verify |
|-------|-----------|---------------|
| HTTP status | `200` | Response status code |
| `status` field | `"completed"` | `response.status === "completed"` |
| `copyVariants` array | Length exactly 3 | `response.copyVariants.length === 3` |
| Each headline | Under 40 characters | `variant.headline.length <= 40` for all |
| Each subcopy | Under 90 characters | `variant.subcopy.length <= 90` for all |
| Each CTA | Under 20 characters | `variant.cta.length <= 20` for all |
| No restricted words | None of: "cheap", "discount", "limited time", "buy now", "guaranteed" | String check on all copy fields |
| `backgroundPrompt` | Non-empty string, contains "gradient" or "abstract" | Prompt reflects B2B SaaS visual direction |
| `assets` array | Length exactly 15 (3 variants x 5 presets) | `response.assets.length === 15` |
| Each asset `fileUrl` | Non-empty, starts with `/generated-assets/` | URL pattern check |
| Each asset `fileSizeKb` | Greater than 0 | File actually rendered |
| `processingTimeMs` | Under 60000 (60 seconds) | Timeout guard |
| Campaign in DB | Status = `"completed"` | Query `prisma.campaign.findUnique` |

### File Verification

After successful response, the following must exist on disk:

```
public/generated-assets/{campaignId}/
  meta_feed_1080x1080_v0.png    -> 1080x1080 pixels
  meta_feed_1080x1080_v1.png    -> 1080x1080 pixels
  meta_feed_1080x1080_v2.png    -> 1080x1080 pixels
  meta_feed_1080x1350_v0.png    -> 1080x1350 pixels
  meta_feed_1080x1350_v1.png    -> 1080x1350 pixels
  meta_feed_1080x1350_v2.png    -> 1080x1350 pixels
  meta_story_1080x1920_v0.png   -> 1080x1920 pixels
  meta_story_1080x1920_v1.png   -> 1080x1920 pixels
  meta_story_1080x1920_v2.png   -> 1080x1920 pixels
  meta_feed_1200x1200_v0.png    -> 1200x1200 pixels  (linkedin)
  meta_feed_1200x1200_v1.png    -> 1200x1200 pixels
  meta_feed_1200x1200_v2.png    -> 1200x1200 pixels
  meta_feed_1200x627_v0.png     -> 1200x627 pixels   (linkedin)
  meta_feed_1200x627_v1.png     -> 1200x627 pixels
  meta_feed_1200x627_v2.png     -> 1200x627 pixels
```

Verify dimensions with: `npx sharp-cli info public/generated-assets/{id}/*.png`
Or open each file and check image properties.

### Visual QA Checklist (per asset)

Open each PNG and confirm:

- [ ] Headline text is visible and readable
- [ ] Headline does not extend beyond the right edge of its area
- [ ] Subcopy text is visible (not overlapping headline or CTA)
- [ ] CTA button has visible text, solid background color (blue `#2563EB`)
- [ ] Badge "Free Trial" appears (on presets where badge_area is not null)
- [ ] Background is solid color `#1a1a2e` (no background image supplied)
- [ ] Dark overlay is visible (50% black over background)
- [ ] No garbled text, missing characters, or blank white rectangles
- [ ] Text is white (#FFFFFF for headline, #E0E0E0 for subcopy)

### Definition of "Working"

The first E2E run counts as **working** when:
1. All 15 PNG files exist with correct pixel dimensions
2. All 15 PNGs pass the visual QA checklist above
3. The API response JSON matches all table conditions above
4. The campaign appears on the dashboard with status "completed"
5. Clicking the campaign shows all 15 assets in the grid

If any of these fail, the system is not working. Do not proceed to Week 2 tasks.

---

## 2. Text-Fitting Rules

### Current Implementation

Text fitting is handled in `lib/utils/text-overflow.ts` using character-width estimation:

```
avgCharWidth = fontSize * 0.55
charsPerLine = floor(areaWidth / avgCharWidth)
maxChars = charsPerLine * maxLines
```

This is a Latin-character approximation. See Section 3 for Korean/CJK adjustments.

### Headline Constraints by Platform

| Preset | Area Width | Font Size (base) | Font Scale | Effective Size | Max Lines | Est. Chars/Line | Max Chars (est.) |
|--------|-----------|-------------------|------------|----------------|-----------|-----------------|------------------|
| Meta Square 1080x1080 | 960px | 48px | 1.0x | 48px | 2 | 36 | 72 |
| Meta Portrait 1080x1350 | 960px | 48px | 1.0x | 48px | 3 | 36 | 108 |
| Meta Story 1080x1920 | 920px | 48px | 1.1x | 53px | 3 | 31 | 93 |
| LinkedIn Square 1200x1200 | 1040px | 48px | 1.05x | 50px | 2 | 37 | 74 |
| LinkedIn Landscape 1200x627 | 700px | 48px | 0.9x | 43px | 2 | 29 | 58 |

Category char limits (headline): B2B SaaS = 40, Beauty = 35, Education = 40.
Since all category limits (35-40) are well under the smallest platform capacity (58 on landscape), **headline overflow from character count alone should not occur**. The risk is multi-word wrapping causing line-count overflow.

### Subcopy Constraints by Platform

| Preset | Area Width | Font Size (base) | Font Scale | Effective Size | Max Lines | Est. Chars/Line | Max Chars (est.) |
|--------|-----------|-------------------|------------|----------------|-----------|-----------------|------------------|
| Meta Square 1080x1080 | 960px | 24px | 1.0x | 24px | 2 | 72 | 144 |
| Meta Portrait 1080x1350 | 960px | 24px | 1.0x | 24px | 3 | 72 | 216 |
| Meta Story 1080x1920 | 920px | 24px | 1.1x | 26px | 2 | 63 | 126 |
| LinkedIn Square 1200x1200 | 1040px | 24px | 1.05x | 25px | 2 | 75 | 150 |
| LinkedIn Landscape 1200x627 | 700px | 24px | 0.9x | 22px | 2 | 57 | 114 |

Category char limits (subcopy): B2B SaaS = 90, Beauty = 80, Education = 90.
All under 114, so **subcopy overflow should not occur from char count**. Again, word-wrapping is the real risk.

### CTA Constraints

CTA text is rendered inside a button with padding `32px` horizontal (scaled by fontScale).
CTA area widths: 320px (meta square), 360px (portrait/linkedin), 400px (story), 300px (landscape).

| Preset | CTA Width | Padding (2x) | Usable Width | Font Size | Est. Max Chars |
|--------|-----------|-------------|--------------|-----------|----------------|
| Meta Square | 320px | 64px | 256px | 20px | 23 |
| Meta Portrait | 360px | 64px | 296px | 20px | 26 |
| Meta Story | 400px | 70px | 330px | 22px | 27 |
| LinkedIn Square | 360px | 67px | 293px | 21px | 25 |
| LinkedIn Landscape | 300px | 58px | 242px | 18px | 24 |

Category limits (CTA): B2B SaaS = 20, Beauty = 18, Education = 18.
**CTA will never overflow given current limits.**

### Overflow Fallback Strategy (current implementation)

```
Level 1: estimateTextFit() truncates with "..." if text exceeds maxChars estimate
Level 2: (NOT implemented) adjustFontSize() exists but is not called in AdTemplate
Level 3: (NOT implemented) hide subcopy and expand headline
```

**Gap identified:** `adjustFontSize` in `text-overflow.ts` is defined but never used. The current system only truncates. Font shrinking for CTA (described in plan as `overflow: "shrink_font"`) is not wired up.

### Recommended Action

For MVP, the current truncation-only approach is acceptable because:
- Category char limits are strict enough that overflow should not occur
- LLM is instructed to stay within limits
- `validateAndTrimVariants` in `copy-generator.ts` enforces limits post-generation

Wire up `adjustFontSize` for CTA in Phase 2 when variable-length CTA text becomes more common.

---

## 3. Korean Font and Rendering Checklist

### Current State

The font loader (`lib/utils/font-loader.ts`) loads **only Inter** at weights 400, 700, 800.
Inter does not contain Korean (Hangul) glyphs. If Korean text is passed to Satori:
- Satori will attempt to render with the available font
- Korean characters will appear as blank rectangles (tofu) or be invisible
- No error will be thrown; the PNG will generate but look broken

### Required Changes for Korean Support

| Item | Current | Required | File to Change |
|------|---------|----------|----------------|
| Korean font file | None | Download Noto Sans KR (Regular 400, Bold 700, ExtraBold 800) as `.ttf` | Place in `public/fonts/` |
| Font loader | Only loads Inter | Must also load Noto Sans KR as secondary font | `lib/utils/font-loader.ts` |
| Satori font config | Single font family | Must pass both Inter AND Noto Sans KR to Satori | `lib/engine/template-renderer.ts` |
| Character width estimate | `fontSize * 0.55` (Latin) | Korean chars are roughly `fontSize * 1.0` wide | `lib/utils/text-overflow.ts` |
| Category char limits | Based on Latin width | Korean needs ~50-60% of the Latin char limit | Category rule `copyRules` fields |

### Font File Checklist

```
public/fonts/
  Inter-400.ttf         # Latin body text
  Inter-700.ttf         # Latin bold
  Inter-800.ttf         # Latin extra-bold headings
  NotoSansKR-400.ttf    # Korean body text
  NotoSansKR-700.ttf    # Korean bold
  NotoSansKR-800.ttf    # Korean extra-bold headings
```

Download from: https://fonts.google.com/noto/specimen/Noto+Sans+KR

### Font Loader Changes Required

In `loadDefaultFonts()`, add Korean fonts:

```typescript
const [regular, bold, extraBold, krRegular, krBold, krExtraBold] = await Promise.all([
  loadFont("Inter", 400),
  loadFont("Inter", 700),
  loadFont("Inter", 800),
  loadFont("NotoSansKR", 400),
  loadFont("NotoSansKR", 700),
  loadFont("NotoSansKR", 800),
]);
```

Then pass all 6 entries to Satori. Satori uses fonts in order and falls back to the next font if a glyph is missing. Inter first (for Latin), Noto Sans KR second (for Korean).

### Character Width Correction for Korean

The current `estimateTextFit` uses `avgCharWidth = fontSize * 0.55`.
For Korean text (or mixed Korean+Latin), this underestimates width by ~2x.

A mixed-content estimator should be:

```typescript
function estimateCharWidth(char: string, fontSize: number): number {
  const code = char.charCodeAt(0);
  // CJK Unified Ideographs, Hangul Syllables, Hangul Jamo
  if ((code >= 0xAC00 && code <= 0xD7AF) ||  // Hangul syllables
      (code >= 0x3131 && code <= 0x318E) ||  // Hangul compatibility jamo
      (code >= 0x4E00 && code <= 0x9FFF)) {  // CJK
    return fontSize * 1.0;
  }
  return fontSize * 0.55;
}
```

### Korean-Specific Category Rule Adjustments

If creating Korean-language categories, use these limits:

| Field | Latin Limit (B2B SaaS) | Korean Limit (recommended) | Reason |
|-------|------------------------|---------------------------|--------|
| headline_max_chars | 40 | 20 | Korean chars are ~2x wider |
| subcopy_max_chars | 90 | 45 | Same ratio |
| cta_max_chars | 20 | 10 | CTA button width is tight |

### Line-Height Checks

- Current headline `lineHeight`: 1.15 (set in `AdTemplate.tsx` line 179)
- Current subcopy `lineHeight`: 1.4 (set in `AdTemplate.tsx` line 198)
- Korean text with Noto Sans KR renders well at `lineHeight: 1.3` for headings and `1.6` for body
- If Korean headlines look vertically cramped, increase to 1.3
- Test by rendering a 2-line Korean headline and checking if descenders/ascenders clip

### Rendering Validation Items for Korean

| Check | How to Test | Pass Criteria |
|-------|-------------|---------------|
| Korean headline renders | Create campaign with headline "AI로 회의를 혁신하세요" | All Hangul characters visible, no tofu |
| Korean subcopy renders | Create campaign with subcopy "팀벨의 AI 회의록 자동화로 업무 효율을 높이세요" | Full text rendered |
| Mixed Korean+English | Headline "Scale Your 비즈니스 with AI" | Both scripts render in same line |
| Korean CTA button | CTA "지금 시작하기" | Text fits inside button, readable |
| Korean line wrapping | 2-line Korean headline (20+ chars) | Wraps cleanly, no mid-syllable break |
| Font weight difference | Bold headline vs regular subcopy | Weight distinction visible in Korean |

### Priority

Korean font support is **not required for MVP** if all initial content is English.
Add Korean fonts **before** generating any Korean-language campaigns.
The code changes are isolated to 3 files and take ~2 hours.

---

## 4. Validation Matrix

### Category x Platform x Template Matrix

Each cell = one rendered asset. "Y" = must be tested in MVP. "N" = can defer.

| | Meta Square (1080x1080) | Meta Portrait (1080x1350) | Meta Story (1080x1920) | LinkedIn Square (1200x1200) | LinkedIn Landscape (1200x627) |
|---|---|---|---|---|---|
| **B2B SaaS** / corporate-minimal | Y | Y | Y | Y | Y |
| **Beauty** / beauty-elegant | Y | Y | Y | Y | Y |
| **Education** / education-bold | Y | Y | Y | Y | Y |

**Total MVP test cells: 15** (3 categories x 5 presets).
Each cell generates 3 copy variants = **45 total assets to QA**.

### Minimum Required Combinations for MVP Sign-off

You can validate the system with a reduced set. These 9 are the minimum:

| # | Category | Preset | Why This Combo |
|---|----------|--------|----------------|
| 1 | B2B SaaS | Meta Square | Most common format, default category |
| 2 | B2B SaaS | Meta Story | Tallest format, tests vertical layout |
| 3 | B2B SaaS | LinkedIn Landscape | Widest format, smallest font scale (0.9x) |
| 4 | Beauty | Meta Square | Different tone + centered text alignment |
| 5 | Beauty | Meta Portrait | Beauty with most vertical space |
| 6 | Education | Meta Square | Largest headline font (52px), boldest style |
| 7 | Education | Meta Story | Large font + tall format = edge case |
| 8 | B2B SaaS | LinkedIn Square | Slightly larger canvas (1200px) |
| 9 | Beauty | LinkedIn Landscape | Centered text in narrow landscape = hardest alignment |

### Per-Asset QA Protocol

For each of the 9 minimum test assets:

| # | Check | Pass/Fail |
|---|-------|-----------|
| 1 | PNG file exists and opens | |
| 2 | Dimensions match preset (exact pixel count) | |
| 3 | Headline is fully readable (no truncation unless over limit) | |
| 4 | Subcopy is fully readable | |
| 5 | CTA button text is readable, background color matches brand.primaryColor | |
| 6 | Badge "Free Trial" visible (where badge_area is not null) | |
| 7 | No text overlaps another text area | |
| 8 | Background color is solid (correct fallback_color) | |
| 9 | Overlay is visible (darkens background) | |
| 10 | Text alignment matches template (left for corporate/education, center for beauty) | |
| 11 | Font weight: headline visibly bolder than subcopy | |
| 12 | No rendering artifacts (white rectangles, missing glyphs, clipped text) | |

### Pre-Make Integration Gate

Before connecting Make.com, ALL of the following must be true:

- [ ] All 9 minimum test combinations pass the 12-point QA protocol
- [ ] The API can be called via curl/Postman without the UI (webhook will call API directly)
- [ ] Response JSON is stable (no field name changes planned)
- [ ] Asset URLs are accessible from outside localhost (either deployed or tunneled)
- [ ] Generation completes in under 30 seconds (Make HTTP module has a 40s default timeout)
- [ ] Error responses return proper HTTP status codes (400, 404, 500) not 200 with error body
- [ ] Fallback copy works when OpenAI is unavailable (disconnect API key and test)

---

## 5. Timeline Estimates

### Optimistic Timeline (best case, no blockers)

Assumes: Supabase account exists, OpenAI key available, no Satori rendering bugs, no Sharp issues on Windows.

| Milestone | Day | Cumulative |
|-----------|-----|------------|
| DB connected + seed loaded | Day 1 morning | 2 hours |
| First PNG rendered via API | Day 1 afternoon | 4 hours |
| All 5 presets validated | Day 1 end | 6 hours |
| All 3 categories validated | Day 2 morning | 8 hours |
| Full 15-combination QA pass | Day 2 afternoon | 10 hours |
| Deployed on Vercel | Day 3 | 12 hours |
| Make.com scenario working | Day 4 | 16 hours |
| **MVP complete** | **Day 4** | **16 hours** |

### Realistic Timeline (expected case, normal friction)

Assumes: Some Satori rendering issues, font loading needs debugging, 1-2 layout adjustments per template, Sharp rebuild needed on Windows, one OpenAI prompt iteration.

| Milestone | Day | Cumulative | Buffer Reason |
|-----------|-----|------------|---------------|
| DB connected + seed loaded | Day 1 | 3 hours | Supabase setup, connection string formatting |
| First PNG rendered via API | Day 2 | 8 hours | Font loading issues, Sharp rebuild, Satori CSS debugging |
| All 5 presets validated | Day 3 | 14 hours | Layout adjustments for story/landscape edge cases |
| All 3 categories validated | Day 4 | 18 hours | Beauty centered alignment needs tuning, education large font overflow |
| Full 15-combination QA pass | Day 5 | 22 hours | 2-3 assets need layout fixes, re-render, re-check |
| Cloud storage working | Day 6 | 26 hours | Supabase Storage bucket setup, CORS config, URL rewriting |
| Deployed on Vercel | Day 7 | 30 hours | Sharp serverless compatibility, env var debugging, timeout tuning |
| Make.com scenario working | Day 9 | 36 hours | Payload mapping, timeout handling, error response formatting |
| **MVP complete** | **Day 9** | **~36 hours** | |

Spread across standard work days (4-5 productive hours/day), this is **Week 1 through mid-Week 2** of actual calendar time.

### Pessimistic Timeline (things go wrong)

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Satori can't handle the template layout | +2-3 days | Simplify template (remove badge, reduce layers), or switch to Puppeteer |
| Sharp doesn't work on Vercel | +1 day | Use `@vercel/og` ImageResponse instead of Sharp, or use Vercel's Node.js runtime (not Edge) |
| OpenAI returns inconsistent JSON | +1 day | Increase validation strictness, add retry with lower temperature (0.3), use fallback copy for MVP |
| Font rendering is broken | +1 day | Commit to Inter-only with local TTF files, skip Google Fonts fetch entirely |
| Supabase connection issues | +0.5 day | Use local Docker PostgreSQL, defer cloud until deployment |

Worst case: **3 weeks** to reach MVP with Make integration.

---

## 6. Critical Path

### True Blockers

These are the tasks where, if they fail, nothing downstream works.
Listed in dependency order -- each blocks everything below it.

```
[1] PostgreSQL connected + schema pushed + seed loaded
     |
     +-- Without this: no API route works, no UI page loads data
     |
[2] Satori renders a valid PNG from AdTemplate component
     |
     +-- Without this: no ad assets can be produced at all
     +-- This is the #1 technical risk in the entire project
     +-- Test: render a 1080x1080 PNG with hardcoded text, verify output
     |
[3] Font loading works (Inter TTF files load into Satori)
     |
     +-- Without this: text renders as invisible or tofu
     +-- Test: rendered PNG has visible, correctly-weighted text
     |
[4] OpenAI returns valid JSON copy (or fallback copy works)
     |
     +-- Without this: no copy variants, no campaigns can complete
     +-- Test: call generateCopyVariants, verify 3 valid variants
     +-- Fallback: generateFallbackCopy works without API key
     |
[5] Full pipeline: generate endpoint creates campaign + copy + renders + saves
     |
     +-- Without this: the product does not exist
     +-- Test: POST to /api/v1/creatives/generate, verify 15 assets
     |
[6] Asset URLs are accessible (either locally or via cloud storage)
     |
     +-- Without this: users can see metadata but not the actual images
     +-- Test: open asset URL in browser, image displays
```

### What Is NOT on the Critical Path

These things can break without blocking the core product:

- Dashboard stats (cosmetic)
- Brand CRUD (seed data is enough for testing)
- Category rule editor UI (JSON can be edited in DB directly)
- Webhook integration (manual generation works without it)
- Bulk ZIP download (individual downloads work)
- Asset library page (campaign detail page shows assets)
- Template gallery page (templates work without browsing them)
- Platform presets admin page (seed data covers all 5 presets)

### Critical Path Decision Points

| After Step | Decision | If Fail |
|------------|----------|---------|
| Step 2 (Satori renders) | Is PNG quality acceptable? | If no: evaluate Puppeteer/Playwright as fallback renderer. Budget +3 days. |
| Step 3 (Fonts load) | Are fonts crisp at all sizes? | If no: download different font weights, test .otf instead of .ttf, try woff2. |
| Step 4 (Copy generation) | Is OpenAI output reliable? | If no: use fallback copy for MVP launch, add human copy editing as primary flow. |
| Step 5 (Full pipeline) | Does generation complete under 30s? | If no: reduce default to 1 copy variant instead of 3, or render async with status polling. |

### The One Thing to Test First

Before doing anything else -- before setting up the database, before getting an API key -- validate that Satori can render a simple PNG.

Create a test script:

```typescript
import satori from "satori";
import sharp from "sharp";
import { readFile, writeFile } from "fs/promises";

async function test() {
  const fontData = await readFile("public/fonts/Inter-700.ttf");
  const svg = await satori(
    {
      type: "div",
      props: {
        style: { width: 1080, height: 1080, backgroundColor: "#1a1a2e",
                 display: "flex", alignItems: "center", justifyContent: "center" },
        children: {
          type: "div",
          props: {
            style: { color: "#FFFFFF", fontSize: 48, fontWeight: 700, fontFamily: "Inter" },
            children: "Test Headline Renders"
          }
        }
      }
    },
    {
      width: 1080,
      height: 1080,
      fonts: [{ name: "Inter", data: fontData.buffer, weight: 700, style: "normal" }],
    }
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile("test-render.png", png);
  console.log(`Rendered: ${png.length} bytes`);
}

test();
```

If this script produces a readable PNG with "Test Headline Renders" in white text on dark background, the critical rendering path works. If it doesn't, fix it before touching anything else.

---

## Appendix: Quick Reference Card

### Character Limits by Category

| | Headline | Subcopy | CTA |
|---|---|---|---|
| B2B SaaS | 40 | 90 | 20 |
| Beauty | 35 | 80 | 18 |
| Education | 40 | 90 | 18 |

### Font Sizes by Template (base, before fontScale)

| | Headline | Subcopy | CTA | Badge |
|---|---|---|---|---|
| Corporate Minimal | 48px / 800w | 24px / 400w | 20px / 700w | 16px / 700w |
| Beauty Elegant | 44px / 700w | 22px / 400w | 18px / 600w | 14px / 600w |
| Education Bold | 52px / 900w | 24px / 400w | 22px / 800w | 16px / 800w |

### Font Scale by Preset

| Preset | Scale | Applied Font Sizes (corporate) |
|---|---|---|
| Meta Square 1080x1080 | 1.0x | H:48 S:24 CTA:20 |
| Meta Portrait 1080x1350 | 1.0x | H:48 S:24 CTA:20 |
| Meta Story 1080x1920 | 1.1x | H:53 S:26 CTA:22 |
| LinkedIn Square 1200x1200 | 1.05x | H:50 S:25 CTA:21 |
| LinkedIn Landscape 1200x627 | 0.9x | H:43 S:22 CTA:18 |

### Max Lines by Preset

| Preset | Headline Max Lines | Subcopy Max Lines |
|---|---|---|
| Meta Square | 2 | 2 |
| Meta Portrait | 3 | 3 |
| Meta Story | 3 | 2 |
| LinkedIn Square | 2 | 2 |
| LinkedIn Landscape | 2 | 2 |

### Seed Data IDs (for API calls)

```
Brand:     brand_timbel
Category:  cat_b2b_saas | cat_beauty | cat_education
Preset:    preset_meta_square | preset_meta_portrait | preset_meta_story
           preset_linkedin_square | preset_linkedin_landscape
Template:  tmpl_corporate_minimal | tmpl_beauty_elegant | tmpl_education_bold
```
