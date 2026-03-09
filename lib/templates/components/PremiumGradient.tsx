import React from "react";
import type { AdTemplateProps } from "./AdTemplate";
import { adjustFontSize, estimateTextFit } from "@/lib/utils/text-overflow";
import type { ReactNode } from "react";

/**
 * Premium gradient template inspired by Spacekayak's abstract metallic style.
 * Deep blue-to-indigo gradient with abstract decorative shapes, bold left-aligned
 * typography with tight letter-spacing, and generous whitespace.
 *
 * Satori constraints respected: no blur(), no box-shadow, no mix-blend-mode.
 * Visual depth achieved through layered semi-transparent gradient divs.
 */
export function PremiumGradient(props: AdTemplateProps): ReactNode {
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
  const isLandscape = width / height > 1.5;
  const isStory = height / width > 1.5;

  const pad = Math.round(width * 0.065);
  const headlineMaxWidth = Math.round(width * (isLandscape ? 0.55 : 0.82));
  const subcopyMaxWidth = Math.round(width * (isLandscape ? 0.5 : 0.75));

  const headlineBase = s(isLandscape ? 44 : isStory ? 56 : 52);
  const headlineAdj = adjustFontSize(headline, headlineBase, headlineMaxWidth, isLandscape ? 2 : 3, Math.round(headlineBase * 0.55));
  const headlineFit = estimateTextFit(headline, headlineAdj.fontSize, headlineMaxWidth, isLandscape ? 2 : 3);

  const subcopyBase = s(isLandscape ? 18 : 22);
  const subcopyAdj = adjustFontSize(subcopy, subcopyBase, subcopyMaxWidth, 2, Math.round(subcopyBase * 0.6));
  const subcopyFit = estimateTextFit(subcopy, subcopyAdj.fontSize, subcopyMaxWidth, 2);

  const ctaFontSize = s(isLandscape ? 16 : 18);

  const brandPrimary = brand.primaryColor || "#2563EB";
  const brandAccent = brand.accentColor || "#F59E0B";

  const bgGradient = `linear-gradient(135deg, #0B0F2E 0%, #1a1066 40%, ${brandPrimary} 100%)`;
  const accentGradient = `linear-gradient(160deg, ${brandPrimary}88 0%, #6C2BD900 70%)`;

  const headlineY = isStory
    ? Math.round(height * 0.3)
    : isLandscape
      ? Math.round(height * 0.2)
      : Math.round(height * 0.22);

  const subcopyY = isStory
    ? Math.round(height * 0.6)
    : isLandscape
      ? Math.round(height * 0.6)
      : Math.round(height * 0.62);

  const ctaY = isStory
    ? Math.round(height * 0.75)
    : isLandscape
      ? Math.round(height * 0.78)
      : Math.round(height * 0.8);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: bgGradient,
      }}
    >
      {/* Background image if provided */}
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
            opacity: 0.3,
          }}
        />
      )}

      {/* Abstract shape 1: large circle top-right */}
      <div
        style={{
          position: "absolute",
          top: Math.round(-height * 0.3),
          right: Math.round(-width * 0.15),
          width: Math.round(width * 0.9),
          height: Math.round(width * 0.9),
          borderRadius: "50%",
          background: accentGradient,
          opacity: 0.6,
        }}
      />

      {/* Abstract shape 2: medium circle bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(-height * 0.2),
          left: Math.round(-width * 0.2),
          width: Math.round(width * 0.7),
          height: Math.round(width * 0.7),
          borderRadius: "50%",
          background: `linear-gradient(200deg, ${brandPrimary}44 0%, #6C2BD933 100%)`,
          opacity: 0.5,
        }}
      />

      {/* Abstract shape 3: small accent ellipse */}
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.15),
          right: Math.round(width * 0.05),
          width: Math.round(width * 0.35),
          height: Math.round(width * 0.35),
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${brandAccent}22 0%, ${brandAccent}08 100%)`,
        }}
      />

      {/* Subtle noise-like overlay via gradient strips */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Logo */}
      {brand.logoUrl && (
        <img
          src={brand.logoUrl}
          style={{
            position: "absolute",
            top: pad,
            left: pad,
            maxWidth: s(160),
            maxHeight: s(48),
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
            background: `linear-gradient(135deg, ${brandAccent} 0%, ${brandAccent}CC 100%)`,
            color: "#FFFFFF",
            fontSize: s(14),
            fontWeight: 700,
            borderRadius: s(6),
            padding: `${s(6)}px ${s(16)}px`,
            letterSpacing: "0.5px",
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
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
        }}
      >
        {headlineFit.truncated}
      </div>

      {/* Thin accent line between headline and subcopy */}
      <div
        style={{
          position: "absolute",
          top: subcopyY - s(28),
          left: pad,
          width: s(48),
          height: s(3),
          borderRadius: s(2),
          background: `linear-gradient(90deg, ${brandAccent} 0%, ${brandAccent}00 100%)`,
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
          color: "rgba(255,255,255,0.72)",
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
          background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandPrimary}DD 100%)`,
          color: "#FFFFFF",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: ctaFontSize,
          fontWeight: 600,
          borderRadius: s(10),
          padding: `${s(14)}px ${s(36)}px`,
          letterSpacing: "0.02em",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {cta}
      </div>
    </div>
  );
}
