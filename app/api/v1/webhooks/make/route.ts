import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const makePayloadSchema = z.object({
  action: z.enum(["create_campaign", "get_status"]),
  campaign: z
    .object({
      name: z.string(),
      brandId: z.string(),
      categorySlug: z.string(),
      productName: z.string(),
      productDescription: z.string().optional(),
      targetAudience: z.string().optional(),
      badgeText: z.string().optional(),
      backgroundImageUrl: z.string().url().nullish(),
      platforms: z.array(z.string()).min(1),
      copyVariants: z.number().min(1).max(5).default(3),
    })
    .optional(),
  campaignId: z.string().optional(),
});

/**
 * Incoming webhook for Make.com.
 * Supports two actions:
 *  - create_campaign: triggers creative generation
 *  - get_status: returns status + asset URLs for a campaign
 */
export async function POST(request: NextRequest) {
  const secret = process.env.MAKE_WEBHOOK_SECRET;
  if (secret) {
    const provided = request.headers.get("x-webhook-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const input = makePayloadSchema.parse(body);

    if (input.action === "create_campaign") {
      if (!input.campaign) {
        return NextResponse.json({ error: "campaign data required for create_campaign" }, { status: 400 });
      }

      const { prisma } = await import("@/lib/db/prisma");
      const { getCategoryRule } = await import("@/lib/engine/category-resolver");

      const category = await prisma.categoryRule.findUnique({
        where: { slug: input.campaign.categorySlug },
      });
      if (!category) {
        return NextResponse.json({ error: `Category "${input.campaign.categorySlug}" not found` }, { status: 404 });
      }

      const internalUrl = new URL("/api/v1/creatives/generate", request.url);
      const generatePayload = {
        campaign: {
          name: input.campaign.name,
          brandId: input.campaign.brandId,
          categoryId: category.id,
          productName: input.campaign.productName,
          productDescription: input.campaign.productDescription || null,
          targetAudience: input.campaign.targetAudience || null,
          badgeText: input.campaign.badgeText || null,
          backgroundImageUrl: input.campaign.backgroundImageUrl || null,
        },
        platforms: input.campaign.platforms,
        copyVariants: input.campaign.copyVariants,
        options: { generateBackgroundPrompt: true },
      };

      const res = await fetch(internalUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatePayload),
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (input.action === "get_status") {
      if (!input.campaignId) {
        return NextResponse.json({ error: "campaignId required for get_status" }, { status: 400 });
      }

      const { prisma } = await import("@/lib/db/prisma");
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.campaignId },
        include: {
          assets: { select: { id: true, fileUrl: true, status: true, preset: { select: { label: true } } } },
          copyVariants: { select: { headline: true, subcopy: true, cta: true } },
        },
      });

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        assets: campaign.assets,
        copyVariants: campaign.copyVariants,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
