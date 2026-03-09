import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateCreativesSchema } from "@/lib/validators/campaign-schema";
import { getCategoryRule } from "@/lib/engine/category-resolver";
import { getPlatformPresets } from "@/lib/engine/platform-resolver";
import { generateCopyWithFallback } from "@/lib/engine/copy-generator";
import { generateBackgroundPrompt } from "@/lib/engine/image-prompt-generator";
import { resolveTemplate, extractTemplateStyle } from "@/lib/engine/template-resolver";
import { renderAdAsset } from "@/lib/engine/template-renderer";
import { saveAssetLocally } from "@/lib/engine/asset-uploader";
import { dispatchWebhookEvent } from "@/lib/automation/make-webhook";
import { buildCreativeCompletedPayload, buildCreativeFailedPayload } from "@/lib/automation/make-payload-builder";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let parsedInput: ReturnType<typeof generateCreativesSchema.parse> | null = null;

  try {
    const body = await request.json();
    const input = generateCreativesSchema.parse(body);
    parsedInput = input;

    // 1. Load brand
    const brand = await prisma.brand.findUnique({
      where: { id: input.campaign.brandId },
    });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // 2. Load category rules
    const category = await getCategoryRule(input.campaign.categoryId);

    // 3. Load platform presets
    const presets = await getPlatformPresets(input.platforms);
    if (presets.length === 0) {
      return NextResponse.json(
        { error: "No valid platform presets found" },
        { status: 400 }
      );
    }

    // 4. Create campaign record
    const campaign = await prisma.campaign.create({
      data: {
        name: input.campaign.name,
        brandId: brand.id,
        categoryId: category.id,
        productName: input.campaign.productName,
        productDescription: input.campaign.productDescription,
        targetAudience: input.campaign.targetAudience,
        badgeText: input.campaign.badgeText,
        backgroundImageUrl: input.campaign.backgroundImageUrl,
        selectedPresets: input.platforms,
        selectedFamilyId: input.campaign.selectedFamilyId || null,
        status: "generating",
      },
    });

    // 4a. If a style family is selected, load the default template from it
    let familyTemplate: Awaited<ReturnType<typeof resolveTemplate>> | null = null;
    if (input.campaign.selectedFamilyId) {
      const familyDef = await prisma.templateDefinition.findFirst({
        where: {
          familyId: input.campaign.selectedFamilyId,
          isDefault: true,
          isActive: true,
        },
      });
      if (familyDef) familyTemplate = familyDef;
    }

    // 5. Generate copy variants (OpenAI with automatic fallback)
    const copyResult = await generateCopyWithFallback(
      category,
      {
        productName: input.campaign.productName,
        productDescription: input.campaign.productDescription || undefined,
        targetAudience: input.campaign.targetAudience || undefined,
      },
      input.copyVariants
    );
    const copyVariants = copyResult.variants;

    // 6. Generate background prompt
    let backgroundPrompt: string | undefined;
    if (input.options.generateBackgroundPrompt) {
      backgroundPrompt = generateBackgroundPrompt(category.visualDirection, {
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
      });
    }

    // 7. Save copy variants to DB
    const savedVariants = await Promise.all(
      copyVariants.map((cv, idx) =>
        prisma.copyVariant.create({
          data: {
            campaignId: campaign.id,
            variantIndex: idx,
            headline: cv.headline,
            subcopy: cv.subcopy,
            cta: cv.cta,
            keywordsUsed: cv.keywords_used,
            backgroundPrompt: idx === 0 ? backgroundPrompt : undefined,
          },
        })
      )
    );

    // 8. Render assets for each variant x preset combination
    const assets: Array<{
      assetId: string;
      copyVariantId: string;
      presetId: string;
      presetLabel: string;
      dimensions: { width: number; height: number };
      fileUrl: string;
      fileSizeKb: number;
    }> = [];

    for (const variant of savedVariants) {
      for (const preset of presets) {
        const template = familyTemplate || await resolveTemplate(
          category.templateMapping,
          preset.id
        );
        const templateStyle = extractTemplateStyle(
          template.layers as Array<{
            type: string;
            [key: string]: unknown;
          }>
        );

        const rendered = await renderAdAsset({
          width: preset.width,
          height: preset.height,
          fontScale: preset.fontScale,
          layout: preset.layoutRules,
          headline: variant.headline,
          subcopy: variant.subcopy,
          cta: variant.cta,
          badgeText: input.campaign.badgeText || undefined,
          backgroundImageUrl:
            input.campaign.backgroundImageUrl || undefined,
          brand: {
            primaryColor: brand.primaryColor,
            secondaryColor: brand.secondaryColor,
            accentColor: brand.accentColor,
            headingFont: brand.headingFont,
            bodyFont: brand.bodyFont,
            logoUrl: brand.logoUrl,
          },
          templateStyle,
          templateGroup: template.templateGroup,
        });

        const fileName = `${preset.platform}_${preset.placement}_${preset.width}x${preset.height}_v${variant.variantIndex}.png`;
        const fileUrl = await saveAssetLocally(
          rendered.png,
          campaign.id,
          fileName
        );

        const asset = await prisma.creativeAsset.create({
          data: {
            campaignId: campaign.id,
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
          copyVariantId: variant.id,
          presetId: preset.id,
          presetLabel: preset.label,
          dimensions: { width: rendered.width, height: rendered.height },
          fileUrl,
          fileSizeKb: rendered.fileSizeKb,
        });
      }
    }

    // 9. Update campaign status
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "completed" },
    });

    const processingTime = Date.now() - startTime;

    const responseBody = {
      id: campaign.id,
      status: "completed",
      createdAt: campaign.createdAt,
      processingTimeMs: processingTime,
      copyVariants: savedVariants.map((v) => ({
        variantId: v.id,
        headline: v.headline,
        subcopy: v.subcopy,
        cta: v.cta,
        keywordsUsed: v.keywordsUsed,
      })),
      backgroundPrompt,
      assets,
      copySource: copyResult.source,
      copyModel: copyResult.model,
      metadata: {
        brandId: brand.id,
        categoryId: category.id,
        selectedFamilyId: input.campaign.selectedFamilyId || null,
        templateUsed: familyTemplate?.templateGroup || "category-default",
        totalAssetsGenerated: assets.length,
        totalCopyVariants: savedVariants.length,
        platformsRendered: presets.map((p) => p.label),
      },
    };

    // 10. Dispatch outbound webhook to Make.com
    const webhookPayload = buildCreativeCompletedPayload({
      campaignId: campaign.id,
      campaignName: campaign.name,
      brandId: brand.id,
      categoryId: category.id,
      productName: campaign.productName,
      copyVariants: responseBody.copyVariants,
      backgroundPrompt,
      assets,
      processingTimeMs: processingTime,
      platformsRendered: presets.map((p) => p.label),
    });
    dispatchWebhookEvent("creative.completed", webhookPayload).catch(() => {});

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Creative generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Generation failed";

    if (parsedInput) {
      const failPayload = buildCreativeFailedPayload({
        campaignId: "unknown",
        campaignName: parsedInput.campaign.name,
        brandId: parsedInput.campaign.brandId,
        categoryId: parsedInput.campaign.categoryId,
        productName: parsedInput.campaign.productName,
        error: message,
      });
      dispatchWebhookEvent("creative.failed", failPayload).catch(() => {});
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
