import { prisma } from "@/lib/db/prisma";
import type { TemplateStyle } from "@/lib/templates/components/AdTemplate";

interface TemplateLayer {
  type: string;
  color?: string;
  opacity?: number;
  fallback_color?: string;
  font_size?: number;
  font_weight?: number;
  text_color?: string;
  background_color?: string;
  border_radius?: number;
  padding_x?: number;
  padding_y?: number;
  text_align?: string;
  overflow?: string;
  [key: string]: unknown;
}

interface TemplateMapping {
  default_template_group: string;
  platform_overrides: Record<string, string>;
}

export async function resolveTemplate(
  templateMapping: TemplateMapping,
  presetId: string
) {
  const override = templateMapping.platform_overrides[presetId];
  const group = override || templateMapping.default_template_group;

  const template = await prisma.templateDefinition.findFirst({
    where: {
      templateGroup: group,
      isActive: true,
      compatiblePresets: { has: presetId },
    },
  });

  if (!template) {
    const fallback = await prisma.templateDefinition.findFirst({
      where: { templateGroup: group, isActive: true },
    });
    if (!fallback) {
      throw new Error(`No template found for group: ${group}`);
    }
    return fallback;
  }

  return template;
}

export function extractTemplateStyle(layers: TemplateLayer[]): TemplateStyle {
  const overlay = layers.find((l) => l.type === "background_overlay");
  const bg = layers.find((l) => l.type === "background_image");
  const headline = layers.find((l) => l.type === "headline");
  const sub = layers.find((l) => l.type === "subcopy");
  const ctaBtn = layers.find((l) => l.type === "cta_button");
  const badge = layers.find((l) => l.type === "badge");

  return {
    overlayColor: overlay?.color || "#000000",
    overlayOpacity: overlay?.opacity ?? 0.5,
    fallbackBgColor: bg?.fallback_color || "#1a1a2e",
    headlineColor: (headline?.color as string) || "#FFFFFF",
    headlineFontSize: headline?.font_size || 48,
    headlineFontWeight: headline?.font_weight || 800,
    headlineAlign: headline?.text_align || "left",
    subcopyColor: (sub?.color as string) || "#E0E0E0",
    subcopyFontSize: sub?.font_size || 24,
    subcopyFontWeight: sub?.font_weight || 400,
    subcopyAlign: sub?.text_align || "left",
    ctaBgColor: ctaBtn?.background_color || "brand.primaryColor",
    ctaTextColor: ctaBtn?.text_color || "#FFFFFF",
    ctaFontSize: ctaBtn?.font_size || 20,
    ctaFontWeight: ctaBtn?.font_weight || 700,
    ctaBorderRadius: ctaBtn?.border_radius || 12,
    badgeBgColor: badge?.background_color || "brand.accentColor",
    badgeTextColor: badge?.text_color || "#FFFFFF",
    badgeBorderRadius: badge?.border_radius || 8,
    badgeFontSize: badge?.font_size || 16,
  };
}
