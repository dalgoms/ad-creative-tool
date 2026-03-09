import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCategoryRule } from "@/lib/engine/category-resolver";
import { getPlatformPresets } from "@/lib/engine/platform-resolver";
import { resolveTemplate, extractTemplateStyle } from "@/lib/engine/template-resolver";
import { renderAdAsset } from "@/lib/engine/template-renderer";
import { saveAsset } from "@/lib/engine/asset-uploader";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const startTime = Date.now();

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: true,
        copyVariants: { orderBy: { variantIndex: "asc" } },
      },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.copyVariants.length === 0) {
      return NextResponse.json({ error: "No copy variants. Regenerate copy first." }, { status: 400 });
    }

    const category = await getCategoryRule(campaign.categoryId);
    const presets = await getPlatformPresets(campaign.selectedPresets);

    // Delete old assets
    await prisma.creativeAsset.deleteMany({ where: { campaignId: id } });

    await prisma.campaign.update({
      where: { id },
      data: { status: "generating" },
    });

    const assets: Array<{
      assetId: string;
      presetLabel: string;
      dimensions: { width: number; height: number };
      fileUrl: string;
      fileSizeKb: number;
    }> = [];

    for (const variant of campaign.copyVariants) {
      for (const preset of presets) {
        const template = await resolveTemplate(category.templateMapping, preset.id);
        const templateStyle = extractTemplateStyle(
          template.layers as Array<{ type: string; [key: string]: unknown }>
        );

        const rendered = await renderAdAsset({
          width: preset.width,
          height: preset.height,
          fontScale: preset.fontScale,
          layout: preset.layoutRules,
          headline: variant.headline,
          subcopy: variant.subcopy,
          cta: variant.cta,
          badgeText: campaign.badgeText || undefined,
          backgroundImageUrl: campaign.backgroundImageUrl || undefined,
          brand: {
            primaryColor: campaign.brand.primaryColor,
            secondaryColor: campaign.brand.secondaryColor,
            accentColor: campaign.brand.accentColor,
            headingFont: campaign.brand.headingFont,
            bodyFont: campaign.brand.bodyFont,
            logoUrl: campaign.brand.logoUrl,
          },
          templateStyle,
          templateGroup: template.templateGroup,
        });

        const fileName = `${preset.platform}_${preset.placement}_${preset.width}x${preset.height}_v${variant.variantIndex}.png`;
        const fileUrl = await saveAsset(rendered.png, id, fileName);

        const asset = await prisma.creativeAsset.create({
          data: {
            campaignId: id,
            copyVariantId: variant.id,
            presetId: preset.id,
            templateId: template.id,
            fileUrl,
            fileSizeKb: rendered.fileSizeKb,
            format: "png",
            status: "generated",
          },
        });

        assets.push({
          assetId: asset.id,
          presetLabel: preset.label,
          dimensions: { width: rendered.width, height: rendered.height },
          fileUrl,
          fileSizeKb: rendered.fileSizeKb,
        });
      }
    }

    await prisma.campaign.update({
      where: { id },
      data: { status: "completed" },
    });

    return NextResponse.json({
      status: "completed",
      assets,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    await prisma.campaign.update({ where: { id }, data: { status: "failed" } }).catch(() => {});
    const msg = error instanceof Error ? error.message : "Re-render failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
