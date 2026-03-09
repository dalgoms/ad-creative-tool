import { z } from "zod";

export const generateCreativesSchema = z.object({
  campaign: z.object({
    name: z.string().min(1).max(200),
    brandId: z.string().min(1),
    categoryId: z.string().min(1),
    productName: z.string().min(1).max(100),
    productDescription: z.string().max(500).optional(),
    targetAudience: z.string().max(300).optional(),
    badgeText: z.string().max(30).optional(),
    backgroundImageUrl: z.string().url().nullish(),
  }),
  platforms: z.array(z.string().min(1)).min(1),
  copyVariants: z.number().int().min(1).max(5).default(3),
  options: z
    .object({
      generateBackgroundPrompt: z.boolean().default(true),
    })
    .default({}),
});

export type GenerateCreativesInput = z.infer<typeof generateCreativesSchema>;

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  productName: z.string().min(1).max(100),
  productDescription: z.string().max(500).optional(),
  targetAudience: z.string().max(300).optional(),
  badgeText: z.string().max(30).optional(),
  backgroundImageUrl: z.string().url().optional(),
  selectedPresets: z.array(z.string().min(1)).min(1),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
