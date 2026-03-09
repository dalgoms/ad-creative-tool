import React from "react";
import type { AdTemplateProps } from "./AdTemplate";
import { adjustFontSize, estimateTextFit } from "@/lib/utils/text-overflow";
import type { ReactNode } from "react";

/**
 * Education-focused template with bold, energetic gradients.
 * Dark base with vibrant orange/amber accents suggesting progress and energy.
 * Strong typographic hierarchy with a colored accent stripe element.
 */
export function EducationVibrant(props: AdTemplateProps): ReactNode {
  const {
    width,
    height,
    fontScale,
    headline,
    subcopy,
    cta,
    badgeText,
    backgroundImageUrl,
    brand,
  } = props;

  const s = (size: number) => Math.round(size * fontScale);
  const isLandscape = width / height > 1.5;
  const isStory = height / width > 1.5;

  const pad = Math.round(width * 0.065);
  const headlineMaxWidth = Math.round(width * (isLandscape ? 0.55 : 0.82));
  const subcopyMaxWidth = Math.round(width * (isLandscape ? 0.5 : 0.75));

  const headlineBase = s(isLandscape ? 42 : isStory ? 54 : 50);
  const headlineAdj = adjustFontSize(headline, headlineBase, headlineMaxWidth, isLandscape ? 2 : 3, Math.round(headlineBase * 0.55));
  const headlineFit = estimateTextFit(headline, headlineAdj.fontSize, headlineMaxWidth, isLandscape ? 2 : 3);

  const subcopyBase = s(isLandscape ? 18 : 21);
  const subcopyAdj = adjustFontSize(subcopy, subcopyBase, subcopyMaxWidth, 2, Math.round(subcopyBase * 0.6));
  const subcopyFit = estimateTextFit(subcopy, subcopyAdj.fontSize, subcopyMaxWidth, 2);

  const ctaFontSize = s(isLandscape ? 16 : 18);
  const orange = "#F97316";
  const amber = "#FBBF24";

  const headlineY = isStory ? Math.round(height * 0.28) : isLandscape ? Math.round(height * 0.2) : Math.round(height * 0.2);
  const subcopyY = isStory ? Math.round(height * 0.58) : isLandscape ? Math.round(height * 0.56) : Math.round(height * 0.58);
  const ctaY = isStory ? Math.round(height * 0.73) : isLandscape ? Math.round(height * 0.76) : Math.round(height * 0.77);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(145deg, #0C0A1A 0%, #1E1044 45%, #2D1B69 100%)`,
      }}
    >
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
            opacity: 0.25,
          }}
        />
      )}

      {/* Diagonal accent stripe -- top-left to center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: Math.round(width * 0.6),
          height: Math.round(height * 0.08),
          background: `linear-gradient(90deg, ${orange} 0%, ${amber}88 60%, ${amber}00 100%)`,
          borderRadius: `0 0 ${s(100)}px 0`,
        }}
      />

      {/* Large decorative circle: top-right, warm glow */}
      <div
        style={{
          position: "absolute",
          top: Math.round(-height * 0.25),
          right: Math.round(-width * 0.15),
          width: Math.round(width * 0.8),
          height: Math.round(width * 0.8),
          borderRadius: "50%",
          background: `linear-gradient(200deg, ${orange}30 0%, ${orange}00 70%)`,
        }}
      />

      {/* Small decorative circle: bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(-height * 0.15),
          left: Math.round(-width * 0.1),
          width: Math.round(width * 0.5),
          height: Math.round(width * 0.5),
          borderRadius: "50%",
          background: `linear-gradient(45deg, #7C3AED33 0%, #7C3AED00 100%)`,
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Logo */}
      {brand.logoUrl && (
        <img
          src={brand.logoUrl}
          style={{
            position: "absolute",
            top: pad + s(12),
            left: pad,
            maxWidth: s(150),
            maxHeight: s(44),
            objectFit: "contain",
          }}
        />
      )}

      {/* Badge */}
      {badgeText && (
        <div
          style={{
            position: "absolute",
            top: pad,
            right: pad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: orange,
            color: "#FFFFFF",
            fontSize: s(14),
            fontWeight: 800,
            borderRadius: s(4),
            padding: `${s(6)}px ${s(14)}px`,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: headlineY,
          left: pad,
          width: headlineMaxWidth,
          display: "flex",
          fontFamily: `${brand.headingFont}, Noto Sans KR`,
          fontSize: headlineAdj.fontSize,
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
        }}
      >
        {headlineFit.truncated}
      </div>

      {/* Accent bar under headline */}
      <div
        style={{
          position: "absolute",
          top: subcopyY - s(28),
          left: pad,
          width: s(56),
          height: s(4),
          borderRadius: s(2),
          background: `linear-gradient(90deg, ${orange} 0%, ${amber} 100%)`,
        }}
      />

      {/* Subcopy */}
      <div
        style={{
          position: "absolute",
          top: subcopyY,
          left: pad,
          width: subcopyMaxWidth,
          display: "flex",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: subcopyAdj.fontSize,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.45,
          letterSpacing: "-0.01em",
        }}
      >
        {subcopyFit.truncated}
      </div>

      {/* CTA Button */}
      <div
        style={{
          position: "absolute",
          top: ctaY,
          left: pad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${orange} 0%, ${amber} 100%)`,
          color: "#1a0a00",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: ctaFontSize,
          fontWeight: 700,
          borderRadius: s(8),
          padding: `${s(14)}px ${s(36)}px`,
          letterSpacing: "0.02em",
        }}
      >
        {cta}
      </div>
    </div>
  );
}
