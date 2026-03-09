import React from "react";
import type { LayoutRules } from "@/lib/engine/platform-resolver";
import { estimateTextFit, adjustFontSize } from "@/lib/utils/text-overflow";
import type { ReactNode } from "react";

export interface AdTemplateProps {
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
}

export interface TemplateStyle {
  overlayColor: string;
  overlayOpacity: number;
  fallbackBgColor: string;
  headlineColor: string;
  headlineFontSize: number;
  headlineFontWeight: number;
  headlineAlign: string;
  subcopyColor: string;
  subcopyFontSize: number;
  subcopyFontWeight: number;
  subcopyAlign: string;
  ctaBgColor: string;
  ctaTextColor: string;
  ctaFontSize: number;
  ctaFontWeight: number;
  ctaBorderRadius: number;
  badgeBgColor: string;
  badgeTextColor: string;
  badgeBorderRadius: number;
  badgeFontSize: number;
}

/**
 * Main ad template component rendered by Satori.
 * Uses absolute positioning based on layout rules from platform presets.
 * All styles are inline — Satori does not support className/CSS.
 */
export function AdTemplate(props: AdTemplateProps): ReactNode {
  const {
    width,
    height,
    fontScale,
    layout,
    headline,
    subcopy,
    cta,
    badgeText,
    backgroundImageUrl,
    brand,
    templateStyle: ts,
  } = props;

  const s = (size: number) => Math.round(size * fontScale);

  const headlineArea = layout.headline_area;
  const subcopyArea = layout.subcopy_area;
  const ctaArea = layout.cta_area;
  const logoArea = layout.logo_area;
  const badgeArea = layout.badge_area;

  const headlineMaxWidth = headlineArea.maxWidth || width * 0.8;
  const headlineMaxLines = headlineArea.maxLines || 2;
  const headlineBase = s(ts.headlineFontSize);
  const headlineAdj = adjustFontSize(headline, headlineBase, headlineMaxWidth, headlineMaxLines, Math.round(headlineBase * 0.6));
  const headlineFontSize = headlineAdj.fontSize;
  const headlineFit = estimateTextFit(headline, headlineFontSize, headlineMaxWidth, headlineMaxLines);

  const subcopyMaxWidth = subcopyArea.maxWidth || width * 0.8;
  const subcopyMaxLines = subcopyArea.maxLines || 2;
  const subcopyBase = s(ts.subcopyFontSize);
  const subcopyAdj = adjustFontSize(subcopy, subcopyBase, subcopyMaxWidth, subcopyMaxLines, Math.round(subcopyBase * 0.6));
  const subcopyFontSize = subcopyAdj.fontSize;
  const subcopyFit = estimateTextFit(subcopy, subcopyFontSize, subcopyMaxWidth, subcopyMaxLines);

  const ctaMaxWidth = (ctaArea.width || 320) - s(64);
  const ctaAdj = adjustFontSize(cta, s(ts.ctaFontSize), ctaMaxWidth, 1, 14);
  const ctaFontSize = ctaAdj.fontSize;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: ts.fallbackBgColor,
      }}
    >
      {/* Background Image */}
      {backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: ts.overlayColor,
          opacity: ts.overlayOpacity,
        }}
      />

      {/* Logo */}
      {brand.logoUrl && logoArea && (
        <img
          src={brand.logoUrl}
          style={{
            position: "absolute",
            top: logoArea.y,
            left: logoArea.x,
            maxWidth: logoArea.maxWidth || 200,
            maxHeight: logoArea.maxHeight || 60,
            objectFit: "contain",
          }}
        />
      )}

      {/* Badge */}
      {badgeText && badgeArea && (
        <div
          style={{
            position: "absolute",
            top: badgeArea.y,
            left: badgeArea.x,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ts.badgeBgColor === "brand.accentColor" ? brand.accentColor : ts.badgeBgColor,
            color: ts.badgeTextColor,
            fontSize: s(ts.badgeFontSize),
            fontWeight: 700,
            borderRadius: ts.badgeBorderRadius,
            padding: "6px 16px",
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: headlineArea.y,
          left: headlineArea.x,
          width: headlineMaxWidth,
          display: "flex",
          fontFamily: `${brand.headingFont}, Noto Sans KR`,
          fontSize: headlineFontSize,
          fontWeight: ts.headlineFontWeight,
          color: ts.headlineColor,
          lineHeight: 1.15,
          textAlign: ts.headlineAlign as "left" | "center" | "right",
        }}
      >
        {headlineFit.truncated}
      </div>

      {/* Subcopy */}
      <div
        style={{
          position: "absolute",
          top: subcopyArea.y,
          left: subcopyArea.x,
          width: subcopyMaxWidth,
          display: "flex",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: subcopyFontSize,
          fontWeight: ts.subcopyFontWeight,
          color: ts.subcopyColor,
          lineHeight: 1.4,
          textAlign: ts.subcopyAlign as "left" | "center" | "right",
        }}
      >
        {subcopyFit.truncated}
      </div>

      {/* CTA Button */}
      <div
        style={{
          position: "absolute",
          top: ctaArea.y,
          left: ctaArea.x,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            ts.ctaBgColor === "brand.primaryColor" ? brand.primaryColor : ts.ctaBgColor,
          color: ts.ctaTextColor,
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: ctaFontSize,
          fontWeight: ts.ctaFontWeight,
          borderRadius: ts.ctaBorderRadius,
          padding: `${s(16)}px ${s(32)}px`,
          minWidth: ctaArea.width ? ctaArea.width * 0.6 : 200,
        }}
      >
        {cta}
      </div>
    </div>
  );
}
