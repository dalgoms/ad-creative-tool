import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCategoryRule } from "@/lib/engine/category-resolver";
import { generateCopyWithFallback } from "@/lib/engine/copy-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { brand: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const category = await getCategoryRule(campaign.categoryId);

    // Delete old copy variants (cascade deletes linked assets)
    await prisma.copyVariant.deleteMany({ where: { campaignId: id } });
    await prisma.creativeAsset.deleteMany({ where: { campaignId: id } });

    const copyResult = await generateCopyWithFallback(
      category,
      {
        productName: campaign.productName,
        productDescription: campaign.productDescription || undefined,
        targetAudience: campaign.targetAudience || undefined,
      },
      campaign.selectedPresets.length > 0 ? 3 : 1
    );

    const savedVariants = await Promise.all(
      copyResult.variants.map((cv, idx) =>
        prisma.copyVariant.create({
          data: {
            campaignId: id,
            variantIndex: idx,
            headline: cv.headline,
            subcopy: cv.subcopy,
            cta: cv.cta,
            keywordsUsed: cv.keywords_used,
          },
        })
      )
    );

    await prisma.campaign.update({
      where: { id },
      data: { status: "draft" },
    });

    return NextResponse.json({
      copyVariants: savedVariants,
      source: copyResult.source,
      model: copyResult.model,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Regeneration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
