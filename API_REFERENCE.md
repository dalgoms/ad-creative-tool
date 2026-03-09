# API Reference

All endpoints are under the base path `/api/v1/`. Requests and responses use JSON.

---

## Table of Contents

- [Creative Generation](#creative-generation)
- [Campaigns](#campaigns)
- [Assets](#assets)
- [Brands](#brands)
- [Categories](#categories)
- [Presets](#presets)
- [Templates](#templates)
- [Webhooks](#webhooks)
- [Make.com Integration](#makecom-integration)
- [Common Patterns](#common-patterns)

---

## Creative Generation

### POST /api/v1/creatives/generate

**Purpose:** Execute the full creative generation pipeline -- generates copy, renders assets across platforms, uploads to storage, saves all records, dispatches webhooks.

**Input:**

```json
{
  "campaign": {
    "name": "Summer Beauty Launch",
    "brandId": "brand_timbel",
    "categoryId": "cat_beauty",
    "productName": "Glow Serum Pro",
    "productDescription": "Advanced hydrating serum with vitamin C and hyaluronic acid",
    "targetAudience": "Women 25-40 interested in skincare",
    "badgeText": "NEW",
    "backgroundImageUrl": null
  },
  "platforms": [
    "preset_meta_square",
    "preset_meta_portrait",
    "preset_meta_story",
    "preset_linkedin_square",
    "preset_linkedin_landscape"
  ],
  "copyVariants": 3
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `campaign.name` | string | Yes | Campaign display name |
| `campaign.brandId` | string | Yes | Must match existing brand ID |
| `campaign.categoryId` | string | Yes | Must match existing category ID |
| `campaign.productName` | string | Yes | Product name used in copy |
| `campaign.productDescription` | string | No | Extra context for copy generation |
| `campaign.targetAudience` | string | No | Audience context for copy |
| `campaign.badgeText` | string | No | Badge overlay text (e.g., "NEW", "SALE") |
| `campaign.backgroundImageUrl` | string/null | No | URL for background image |
| `platforms` | string[] | Yes | Array of platform preset IDs |
| `copyVariants` | number | No | Number of copy variants (default: 3) |

**Output (200):**

```json
{
  "id": "cm4abc123def456",
  "status": "completed",
  "createdAt": "2026-03-09T10:30:00.000Z",
  "processingTimeMs": 38500,
  "copyVariants": [
    {
      "variantId": "cm4var001",
      "headline": "Embrace Radiant Skin",
      "subcopy": "Advanced vitamin C formula for luminous, hydrated results every day",
      "cta": "Discover More",
      "keywordsUsed": ["radiant", "glow", "natural"]
    },
    {
      "variantId": "cm4var002",
      "headline": "Your Glow Starts Here",
      "subcopy": "Hyaluronic acid meets vitamin C in our bestselling serum",
      "cta": "Shop Now",
      "keywordsUsed": ["glow", "rejuvenate", "premium"]
    },
    {
      "variantId": "cm4var003",
      "headline": "Illuminate Your Beauty",
      "subcopy": "Clinically proven ingredients for visibly brighter, smoother skin",
      "cta": "Try It Free",
      "keywordsUsed": ["illuminate", "beauty", "dermatologist"]
    }
  ],
  "backgroundPrompt": "Soft gradient background with warm pink and gold tones, elegant beauty product photography style, clean minimal composition",
  "copySource": "openai",
  "copyModel": "gpt-4o",
  "metadata": {
    "brandId": "brand_timbel",
    "categoryId": "cat_beauty",
    "totalAssetsGenerated": 15,
    "totalCopyVariants": 3,
    "platformsRendered": [
      "Meta Feed Square (1080×1080)",
      "Meta Feed Portrait (1080×1350)",
      "Meta Story/Reel (1080×1920)",
      "LinkedIn Feed Square (1200×1200)",
      "LinkedIn Landscape (1200×627)"
    ]
  }
}
```

**Status codes:**
- `200`: Generation completed successfully
- `400`: Invalid input (Zod validation failure)
- `404`: Brand, category, or preset not found
- `500`: Rendering or storage failure

---

## Campaigns

### GET /api/v1/campaigns

**Purpose:** List all campaigns with related brand, category, and counts.

**Output (200):**

```json
[
  {
    "id": "cm4abc123",
    "name": "Summer Beauty Launch",
    "status": "completed",
    "brandId": "brand_timbel",
    "brand": { "id": "brand_timbel", "name": "Timbel" },
    "categoryId": "cat_beauty",
    "category": { "id": "cat_beauty", "name": "Beauty" },
    "productName": "Glow Serum Pro",
    "_count": { "assets": 15, "copyVariants": 3 },
    "createdAt": "2026-03-09T10:30:00.000Z"
  }
]
```

### POST /api/v1/campaigns

**Purpose:** Create a campaign record without triggering generation.

**Input:**

```json
{
  "name": "My Campaign",
  "brandId": "brand_timbel",
  "categoryId": "cat_beauty",
  "productName": "Product Name",
  "selectedPresets": ["preset_meta_square"]
}
```

### GET /api/v1/campaigns/[id]

**Purpose:** Get campaign detail with all copy variants and assets.

**Output (200):**

```json
{
  "id": "cm4abc123",
  "name": "Summer Beauty Launch",
  "status": "completed",
  "brand": { "id": "brand_timbel", "name": "Timbel", "primaryColor": "#2563EB" },
  "category": { "id": "cat_beauty", "name": "Beauty" },
  "productName": "Glow Serum Pro",
  "copyVariants": [
    {
      "id": "cm4var001",
      "variantIndex": 0,
      "headline": "Embrace Radiant Skin",
      "subcopy": "Advanced vitamin C formula...",
      "cta": "Discover More",
      "keywordsUsed": ["radiant", "glow"],
      "assets": [
        {
          "id": "cm4asset001",
          "fileUrl": "https://xxx.supabase.co/storage/v1/object/public/creative-assets/cm4abc123/variant-0_meta-feed-square-1080x1080.png",
          "format": "png",
          "status": "generated",
          "preset": { "label": "Meta Feed Square (1080×1080)", "width": 1080, "height": 1080 }
        }
      ]
    }
  ],
  "createdAt": "2026-03-09T10:30:00.000Z"
}
```

### DELETE /api/v1/campaigns/[id]

**Purpose:** Delete a campaign and all related records (cascading).

---

## Assets

### PATCH /api/v1/assets/[id]/status

**Purpose:** Transition an asset's status.

**Input:**

```json
{
  "status": "approved"
}
```

**Allowed transitions:**

| From | To |
|------|----|
| `generated` | `approved`, `rejected` |
| `approved` | `published`, `rejected` |
| `rejected` | `generated` |
| `published` | (none -- final state) |

**Output (200):**

```json
{
  "id": "cm4asset001",
  "status": "approved",
  "publishedAt": null
}
```

**Error (400):**

```json
{
  "error": "Cannot transition from 'generated' to 'published'. Allowed: approved, rejected"
}
```

### PATCH /api/v1/assets/[id]

**Purpose:** Update arbitrary fields on an asset.

**Input:**

```json
{
  "status": "approved",
  "fileUrl": "https://new-url.com/asset.png"
}
```

---

## Regeneration

### POST /api/v1/campaigns/[id]/regenerate-copy

**Purpose:** Delete existing copy variants and assets, generate fresh copy.

**Input:** None (uses campaign's existing brand + category)

**Output (200):**

```json
{
  "campaignId": "cm4abc123",
  "copyVariants": [
    { "id": "cm4newvar001", "headline": "New Headline", "subcopy": "...", "cta": "..." }
  ],
  "copySource": "openai",
  "copyModel": "gpt-4o",
  "message": "Copy regenerated. Use regenerate-assets to re-render."
}
```

### POST /api/v1/campaigns/[id]/regenerate-assets

**Purpose:** Delete existing assets, re-render using current copy variants.

**Input:** None

**Output (200):**

```json
{
  "campaignId": "cm4abc123",
  "assetsGenerated": 15,
  "platforms": ["Meta Feed Square (1080×1080)", "..."],
  "message": "Assets re-rendered successfully"
}
```

---

## Brands

### GET /api/v1/brands

**Purpose:** List all brands.

**Output (200):**

```json
[
  {
    "id": "brand_timbel",
    "name": "Timbel",
    "primaryColor": "#2563EB",
    "secondaryColor": "#1E40AF",
    "accentColor": "#F59E0B",
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "logoUrl": null,
    "createdAt": "2026-03-09T00:00:00.000Z"
  }
]
```

### POST /api/v1/brands

**Purpose:** Create a brand.

**Input:**

```json
{
  "name": "Acme Corp",
  "primaryColor": "#FF6600",
  "secondaryColor": "#CC5500",
  "accentColor": "#FFCC00",
  "headingFont": "Inter",
  "bodyFont": "Inter",
  "logoUrl": "https://example.com/logo.png"
}
```

### GET /api/v1/brands/[id]

**Purpose:** Get a brand by ID.

### PUT /api/v1/brands/[id]

**Purpose:** Update a brand.

---

## Categories

### GET /api/v1/categories

**Purpose:** List active category rules.

**Output (200):**

```json
[
  {
    "id": "cat_b2b_saas",
    "name": "B2B SaaS",
    "slug": "b2b-saas",
    "keywords": { "primary": ["ROI", "efficiency"], "secondary": ["workflow"], "cta_keywords": ["Start Free Trial"] },
    "tone": { "voice": "professional", "formality": "high", "emotion": "confident" },
    "isActive": true
  }
]
```

### GET /api/v1/categories/[id]

**Purpose:** Get a category rule by ID.

### PUT /api/v1/categories/[id]

**Purpose:** Update a category rule (keywords, tone, copy rules, visual direction, template mapping).

---

## Presets

### GET /api/v1/presets

**Purpose:** List active platform presets.

**Output (200):**

```json
[
  {
    "id": "preset_meta_square",
    "platform": "meta",
    "placement": "feed",
    "label": "Meta Feed Square (1080×1080)",
    "width": 1080,
    "height": 1080,
    "aspectRatio": "1:1",
    "fontScale": 1.0,
    "isActive": true
  }
]
```

---

## Templates

### GET /api/v1/templates

**Purpose:** List active template definitions.

**Output (200):**

```json
[
  {
    "id": "tpl_corporate_minimal",
    "name": "Corporate Minimal",
    "templateGroup": "corporate",
    "compatiblePresets": ["preset_meta_square", "preset_linkedin_square"],
    "layers": [...],
    "isActive": true,
    "_count": { "assets": 45 }
  }
]
```

---

## Webhooks

### GET /api/v1/webhooks

**Purpose:** List all webhook configurations.

### POST /api/v1/webhooks

**Purpose:** Create a new outbound webhook.

**Input:**

```json
{
  "name": "Make.com Production",
  "url": "https://hook.us2.make.com/abc123",
  "secret": "my-shared-secret",
  "events": ["creative.completed", "creative.failed"]
}
```

### GET /api/v1/webhooks/[id]

**Purpose:** Get webhook with recent delivery history.

### PUT /api/v1/webhooks/[id]

**Purpose:** Update a webhook configuration.

### DELETE /api/v1/webhooks/[id]

**Purpose:** Delete a webhook.

### POST /api/v1/webhooks/[id]/test

**Purpose:** Send a test event to verify webhook connectivity.

---

## Make.com Integration

### POST /api/v1/webhooks/make

**Purpose:** Inbound webhook endpoint for Make.com scenarios.

**Authentication:** Optional `x-webhook-secret` header. If `MAKE_WEBHOOK_SECRET` is set, the header must match.

#### Action: create_campaign

**Input:**

```json
{
  "action": "create_campaign",
  "data": {
    "name": "Make Campaign",
    "brandId": "brand_timbel",
    "categoryId": "cat_beauty",
    "productName": "Glow Serum",
    "productDescription": "Hydrating serum",
    "targetAudience": "Women 25-40",
    "platforms": ["preset_meta_square", "preset_meta_portrait"],
    "copyVariants": 3
  }
}
```

**Output (200):**

```json
{
  "success": true,
  "campaignId": "cm4abc123",
  "status": "completed",
  "assetsGenerated": 6,
  "message": "Campaign created and assets generated"
}
```

#### Action: get_status

**Input:**

```json
{
  "action": "get_status",
  "data": {
    "campaignId": "cm4abc123"
  }
}
```

**Output (200):**

```json
{
  "success": true,
  "campaign": {
    "id": "cm4abc123",
    "name": "Make Campaign",
    "status": "completed",
    "assets": [
      {
        "id": "cm4asset001",
        "fileUrl": "https://xxx.supabase.co/...",
        "status": "generated",
        "preset": { "label": "Meta Feed Square (1080×1080)" }
      }
    ]
  }
}
```

### POST /api/v1/webhooks/incoming

**Purpose:** Generic incoming webhook (not Make-specific). Accepts campaign creation payloads.

**Input:**

```json
{
  "name": "API Campaign",
  "brandId": "brand_timbel",
  "categoryId": "cat_beauty",
  "productName": "Product",
  "platforms": ["preset_meta_square"],
  "copyVariants": 2
}
```

---

## Common Patterns

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Validation error or invalid state transition |
| `404` | Resource not found |
| `500` | Internal server error (rendering, storage, database) |

### Fallback Behavior

The `/creatives/generate` endpoint has built-in fallbacks:

| Component | When it falls back | Indicator |
|-----------|-------------------|-----------|
| Copy generation | `OPENAI_API_KEY` missing or API error | `copySource: "fallback"` in response |
| Storage | `SUPABASE_SERVICE_ROLE_KEY` missing (dev only) | Asset URLs are local paths |

### Pagination

List endpoints currently return all records without pagination. For large datasets, consider adding `?limit=N&offset=N` query parameters.

### Rate Limiting

No rate limiting is implemented. The OpenAI API has its own rate limits which may affect copy generation speed.
