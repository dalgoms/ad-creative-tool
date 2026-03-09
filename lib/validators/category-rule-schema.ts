import { z } from "zod";

export const categoryRuleSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  keywords: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    cta_keywords: z.array(z.string()),
    restricted: z.array(z.string()),
    required: z.array(z.string()),
  }),
  tone: z.object({
    voice: z.string(),
    formality: z.enum(["low", "medium", "high"]),
    emotion: z.string(),
    description: z.string(),
  }),
  copyRules: z.object({
    headline_max_chars: z.number().int().min(10).max(100),
    subcopy_max_chars: z.number().int().min(20).max(200),
    cta_max_chars: z.number().int().min(5).max(40),
    headline_style: z.string(),
    avoid_patterns: z.array(z.string()),
    prompt_template: z.string(),
  }),
  visualDirection: z.object({
    style: z.string(),
    color_mood: z.string(),
    background_prompt_template: z.string(),
    avoid_visuals: z.array(z.string()),
    preferred_visuals: z.array(z.string()),
  }),
  templateMapping: z.object({
    default_template_group: z.string(),
    platform_overrides: z.record(z.string()).default({}),
  }),
});

export type CategoryRuleInput = z.infer<typeof categoryRuleSchema>;
