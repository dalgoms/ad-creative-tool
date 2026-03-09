import { z } from "zod";

const hexColorRegex = /^#([0-9A-Fa-f]{6})$/;

export const brandSchema = z.object({
  name: z.string().min(1).max(100),
  primaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color (#RRGGBB)"),
  secondaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color (#RRGGBB)"),
  accentColor: z.string().regex(hexColorRegex, "Must be a valid hex color (#RRGGBB)"),
  headingFont: z.string().min(1).default("Inter"),
  bodyFont: z.string().min(1).default("Inter"),
  logoUrl: z.string().url().nullable().optional(),
});

export type BrandInput = z.infer<typeof brandSchema>;
