import satori from "satori";
import sharp from "sharp";
import { createElement } from "react";
import { AdTemplate, type AdTemplateProps } from "@/lib/templates/components/AdTemplate";
import { getTemplateComponent } from "@/lib/templates/registry";
import { loadDefaultFonts } from "@/lib/utils/font-loader";
import type { LayoutRules } from "./platform-resolver";
import type { TemplateStyle } from "@/lib/templates/components/AdTemplate";

interface RenderInput {
  width: number;
  height: number;
  fontScale: number;
  layout: LayoutRules;
  headline: string;
  subcopy: string;
  cta: string;
  badgeText?: string;
  backgroundImageUrl?: string;
  brand: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    logoUrl?: string | null;
  };
  templateStyle: TemplateStyle;
  templateGroup?: string;
}

interface RenderOutput {
  png: Buffer;
  width: number;
  height: number;
  fileSizeKb: number;
}

let fontsPromise: ReturnType<typeof loadDefaultFonts> | null = null;

function getFonts() {
  if (!fontsPromise) {
    fontsPromise = loadDefaultFonts();
  }
  return fontsPromise;
}

export async function renderAdAsset(input: RenderInput): Promise<RenderOutput> {
  const fonts = await getFonts();

  const props: AdTemplateProps = {
    width: input.width,
    height: input.height,
    fontScale: input.fontScale,
    layout: input.layout,
    headline: input.headline,
    subcopy: input.subcopy,
    cta: input.cta,
    badgeText: input.badgeText,
    backgroundImageUrl: input.backgroundImageUrl,
    brand: input.brand,
    templateStyle: input.templateStyle,
  };

  const Component = input.templateGroup
    ? getTemplateComponent(input.templateGroup)
    : AdTemplate;

  const element = createElement(Component, props);

  const svg = await satori(element, {
    width: input.width,
    height: input.height,
    fonts: fonts.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight,
      style: f.style,
    })),
  });

  const png = await sharp(Buffer.from(svg))
    .png({ quality: 90, compressionLevel: 6 })
    .toBuffer();

  return {
    png,
    width: input.width,
    height: input.height,
    fileSizeKb: Math.round(png.length / 1024),
  };
}
