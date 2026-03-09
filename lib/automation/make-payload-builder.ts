interface CopyVariantPayload {
  variantId: string;
  headline: string;
  subcopy: string;
  cta: string;
  keywordsUsed: string[];
}

interface AssetPayload {
  assetId: string;
  copyVariantId: string;
  presetId: string;
  presetLabel: string;
  dimensions: { width: number; height: number };
  fileUrl: string;
  fileSizeKb: number;
}

interface CampaignPayload {
  campaignId: string;
  campaignName: string;
  brandId: string;
  categoryId: string;
  productName: string;
}

export interface WebhookEventPayload {
  event: string;
  timestamp: string;
  campaign: CampaignPayload;
  copyVariants: CopyVariantPayload[];
  backgroundPrompt?: string;
  assets: AssetPayload[];
  metadata: {
    totalAssetsGenerated: number;
    totalCopyVariants: number;
    platformsRendered: string[];
    processingTimeMs: number;
  };
}

export function buildCreativeCompletedPayload(data: {
  campaignId: string;
  campaignName: string;
  brandId: string;
  categoryId: string;
  productName: string;
  copyVariants: CopyVariantPayload[];
  backgroundPrompt?: string;
  assets: AssetPayload[];
  processingTimeMs: number;
  platformsRendered: string[];
}): WebhookEventPayload {
  return {
    event: "creative.completed",
    timestamp: new Date().toISOString(),
    campaign: {
      campaignId: data.campaignId,
      campaignName: data.campaignName,
      brandId: data.brandId,
      categoryId: data.categoryId,
      productName: data.productName,
    },
    copyVariants: data.copyVariants,
    backgroundPrompt: data.backgroundPrompt,
    assets: data.assets,
    metadata: {
      totalAssetsGenerated: data.assets.length,
      totalCopyVariants: data.copyVariants.length,
      platformsRendered: data.platformsRendered,
      processingTimeMs: data.processingTimeMs,
    },
  };
}

export function buildCreativeFailedPayload(data: {
  campaignId: string;
  campaignName: string;
  brandId: string;
  categoryId: string;
  productName: string;
  error: string;
}): Pick<WebhookEventPayload, "event" | "timestamp" | "campaign"> & {
  error: string;
} {
  return {
    event: "creative.failed",
    timestamp: new Date().toISOString(),
    campaign: {
      campaignId: data.campaignId,
      campaignName: data.campaignName,
      brandId: data.brandId,
      categoryId: data.categoryId,
      productName: data.productName,
    },
    error: data.error,
  };
}
