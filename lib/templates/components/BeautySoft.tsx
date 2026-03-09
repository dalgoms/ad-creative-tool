import React from "react";
import type { AdTemplateProps } from "./AdTemplate";
import { adjustFontSize, estimateTextFit } from "@/lib/utils/text-overflow";
import type { ReactNode } from "react";

/**
 * Beauty-focused template with warm pastel gradients, soft shapes,
 * centered typography, and a refined feminine aesthetic.
 *
 * Light background with rose/cream tones. Dark text for readability.
 * Decorative soft circles as abstract floral/organic shapes.
 */
export function BeautySoft(props: AdTemplateProps): ReactNode {
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

  const pad = Math.round(width * 0.07);
  const centerX = Math.round(width * 0.5);
  const headlineMaxWidth = Math.round(width * (isLandscape ? 0.5 : 0.78));
  const subcopyMaxWidth = Math.round(width * (isLandscape ? 0.45 : 0.7));

  const headlineBase = s(isLandscape ? 40 : isStory ? 50 : 46);
  const headlineAdj = adjustFontSize(headline, headlineBase, headlineMaxWidth, isLandscape ? 2 : 3, Math.round(headlineBase * 0.55));
  const headlineFit = estimateTextFit(headline, headlineAdj.fontSize, headlineMaxWidth, isLandscape ? 2 : 3);

  const subcopyBase = s(isLandscape ? 17 : 20);
  const subcopyAdj = adjustFontSize(subcopy, subcopyBase, subcopyMaxWidth, 2, Math.round(subcopyBase * 0.6));
  const subcopyFit = estimateTextFit(subcopy, subcopyAdj.fontSize, subcopyMaxWidth, 2);

  const ctaFontSize = s(isLandscape ? 15 : 17);

  const roseAccent = "#E11D7D";
  const roseSoft = "#FBB6CE";
  const cream = "#FFF5F7";

  const headlineY = isStory ? Math.round(height * 0.3) : isLandscape ? Math.round(height * 0.18) : Math.round(height * 0.24);
  const subcopyY = isStory ? Math.round(height * 0.58) : isLandscape ? Math.round(height * 0.55) : Math.round(height * 0.58);
  const ctaY = isStory ? Math.round(height * 0.72) : isLandscape ? Math.round(height * 0.76) : Math.round(height * 0.76);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(155deg, ${cream} 0%, #FDE8EF 35%, #F5E6FF 70%, #EDE9FE 100%)`,
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

      {/* Decorative circle: large, top-right */}
      <div
        style={{
          position: "absolute",
          top: Math.round(-height * 0.15),
          right: Math.round(-width * 0.15),
          width: Math.round(width * 0.7),
          height: Math.round(width * 0.7),
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${roseSoft}66 0%, ${roseSoft}00 100%)`,
        }}
      />

      {/* Decorative circle: small, bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(-height * 0.1),
          left: Math.round(-width * 0.1),
          width: Math.round(width * 0.5),
          height: Math.round(width * 0.5),
          borderRadius: "50%",
          background: `linear-gradient(0deg, #C084FC33 0%, #C084FC00 100%)`,
        }}
      />

      {/* Decorative circle: medium, center-right */}
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.45),
          right: Math.round(width * 0.02),
          width: Math.round(width * 0.3),
          height: Math.round(width * 0.3),
          borderRadius: "50%",
          background: `linear-gradient(135deg, #FBCFE833 0%, #FBCFE800 100%)`,
        }}
      />

      {/* Subtle top gradient veil */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.3) 100%)",
        }}
      />

      {/* Logo */}
      {brand.logoUrl && (
        <img
          src={brand.logoUrl}
          style={{
            position: "absolute",
            top: pad,
            left: isLandscape ? pad : centerX - s(80),
            maxWidth: s(160),
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
            background: roseAccent,
            color: "#FFFFFF",
            fontSize: s(13),
            fontWeight: 600,
            borderRadius: s(20),
            padding: `${s(5)}px ${s(16)}px`,
            letterSpacing: "0.04em",
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Headline -- centered */}
      <div
        style={{
          position: "absolute",
          top: headlineY,
          left: isLandscape ? pad : centerX - Math.round(headlineMaxWidth / 2),
          width: headlineMaxWidth,
          display: "flex",
          justifyContent: isLandscape ? "flex-start" : "center",
          textAlign: isLandscape ? "left" : "center",
          fontFamily: `${brand.headingFont}, Noto Sans KR`,
          fontSize: headlineAdj.fontSize,
          fontWeight: 700,
          color: "#1F1033",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        {headlineFit.truncated}
      </div>

      {/* Thin decorative divider */}
      <div
        style={{
          position: "absolute",
          top: subcopyY - s(24),
          left: isLandscape ? pad : centerX - s(24),
          width: s(48),
          height: s(2),
          borderRadius: s(1),
          background: `linear-gradient(90deg, ${roseAccent} 0%, ${roseAccent}00 100%)`,
        }}
      />

      {/* Subcopy */}
      <div
        style={{
          position: "absolute",
          top: subcopyY,
          left: isLandscape ? pad : centerX - Math.round(subcopyMaxWidth / 2),
          width: subcopyMaxWidth,
          display: "flex",
          justifyContent: isLandscape ? "flex-start" : "center",
          textAlign: isLandscape ? "left" : "center",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: subcopyAdj.fontSize,
          fontWeight: 400,
          color: "#6B5A7B",
          lineHeight: 1.5,
          letterSpacing: "-0.005em",
        }}
      >
        {subcopyFit.truncated}
      </div>

      {/* CTA Button */}
      <div
        style={{
          position: "absolute",
          top: ctaY,
          left: isLandscape ? pad : centerX - s(90),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${roseAccent} 0%, #9333EA 100%)`,
          color: "#FFFFFF",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: ctaFontSize,
          fontWeight: 600,
          borderRadius: s(24),
          padding: `${s(13)}px ${s(34)}px`,
          letterSpacing: "0.02em",
        }}
      >
        {cta}
      </div>
    </div>
  );
}
