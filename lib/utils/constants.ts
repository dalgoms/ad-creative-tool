export const APP_NAME = "Ad Creative Tool";

export const COPY_DEFAULTS = {
  headlineMaxChars: 40,
  subcopyMaxChars: 90,
  ctaMaxChars: 20,
  variants: 3,
} as const;

export const ASSET_FORMATS = ["png", "jpg", "webp"] as const;
export type AssetFormat = (typeof ASSET_FORMATS)[number];

export const CAMPAIGN_STATUSES = [
  "draft",
  "generating",
  "completed",
  "failed",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ASSET_STATUSES = [
  "generated",
  "approved",
  "rejected",
  "published",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
