import React from "react";
import type { AdTemplateProps } from "./AdTemplate";
import { adjustFontSize, estimateTextFit } from "@/lib/utils/text-overflow";
import type { ReactNode } from "react";

type Ratio = "square" | "portrait" | "story" | "landscape";

function detectRatio(w: number, h: number): Ratio {
  const r = w / h;
  if (r > 1.4) return "landscape";
  if (r > 0.9) return "square";
  if (r > 0.65) return "portrait";
  return "story";
}

/**
 * BOLD SPLIT
 *
 * Composition: Two-tone split layout with a strong geometric divide.
 * One zone is a solid brand-colored block with text; the other is a
 * dark gradient for visual contrast. Completely different structure
 * from the editorial style.
 *
 * Ratio adaptations:
 * - Square:     Vertical split — left 48% brand block (text), right 52% dark gradient
 * - Portrait:   Horizontal split — top 55% dark gradient, bottom 45% brand block (text)
 * - Story:      Top 45% dark, accent bar, bottom 55% brand block
 * - Landscape:  Left 42% brand block, right 58% dark gradient, text on left
 */
export function BoldSplit(props: AdTemplateProps): ReactNode {
  const { width, height, fontScale, headline, subcopy, cta, badgeText, backgroundImageUrl, brand } = props;

  const s = (v: number) => Math.round(v * fontScale);
  const ratio = detectRatio(width, height);
  const brandPrimary = brand.primaryColor || "#2563EB";
  const brandSecondary = brand.secondaryColor || "#1E40AF";
  const brandAccent = brand.accentColor || "#F59E0B";

  const cfg = {
    square: {
      splitDir: "vertical" as const, splitPos: 0.48,
      textPad: 0.05, hlW: 0.38, hlY: 0.28, scW: 0.38, scY: 0.55, ctaY: 0.76,
      hlSize: 42, scSize: 18, hlLines: 3,
    },
    portrait: {
      splitDir: "horizontal" as const, splitPos: 0.55,
      textPad: 0.06, hlW: 0.8, hlY: 0.6, scW: 0.75, scY: 0.78, ctaY: 0.9,
      hlSize: 44, scSize: 19, hlLines: 2,
    },
    story: {
      splitDir: "horizontal" as const, splitPos: 0.45,
      textPad: 0.07, hlW: 0.78, hlY: 0.52, scW: 0.72, scY: 0.7, ctaY: 0.82,
      hlSize: 50, scSize: 20, hlLines: 3,
    },
    landscape: {
      splitDir: "vertical" as const, splitPos: 0.42,
      textPad: 0.04, hlW: 0.34, hlY: 0.2, scW: 0.34, scY: 0.52, ctaY: 0.76,
      hlSize: 36, scSize: 16, hlLines: 2,
    },
  }[ratio];

  const hlMaxW = Math.round(width * cfg.hlW);
  const scMaxW = Math.round(width * cfg.scW);
  const pad = Math.round(width * cfg.textPad);

  const hlBase = s(cfg.hlSize);
  const hlAdj = adjustFontSize(headline, hlBase, hlMaxW, cfg.hlLines, Math.round(hlBase * 0.5));
  const hlFit = estimateTextFit(headline, hlAdj.fontSize, hlMaxW, cfg.hlLines);
  const scBase = s(cfg.scSize);
  const scAdj = adjustFontSize(subcopy, scBase, scMaxW, 2, Math.round(scBase * 0.6));
  const scFit = estimateTextFit(subcopy, scAdj.fontSize, scMaxW, 2);

  const isVert = cfg.splitDir === "vertical";
  const splitPx = isVert ? Math.round(width * cfg.splitPos) : Math.round(height * cfg.splitPos);

  return (
    <div style={{ width, height, display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#0A0A14" }}>
      {/* Dark zone */}
      <div style={{
        position: "absolute",
        top: isVert ? 0 : 0,
        left: isVert ? splitPx : 0,
        width: isVert ? width - splitPx : width,
        height: isVert ? height : splitPx,
        background: `linear-gradient(${isVert ? "160deg" : "180deg"}, #0F0F23 0%, #1a1040 60%, ${brandSecondary}44 100%)`,
      }}>
        {backgroundImageUrl && (
          <img src={backgroundImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2 }} />
        )}
        {/* Decorative circle inside dark zone */}
        <div style={{ position: "absolute", top: "20%", left: "30%", width: Math.round(Math.min(width, height) * 0.4), height: Math.round(Math.min(width, height) * 0.4), borderRadius: "50%", background: `linear-gradient(135deg, ${brandPrimary}22 0%, ${brandPrimary}00 100%)` }} />
      </div>

      {/* Brand color zone */}
      <div style={{
        position: "absolute",
        top: isVert ? 0 : splitPx,
        left: 0,
        width: isVert ? splitPx : width,
        height: isVert ? height : height - splitPx,
        background: `linear-gradient(${isVert ? "180deg" : "135deg"}, ${brandPrimary} 0%, ${brandSecondary} 100%)`,
      }} />

      {/* Accent stripe at the split edge */}
      {isVert ? (
        <div style={{ position: "absolute", top: 0, left: splitPx - s(3), width: s(6), height: height, background: `linear-gradient(180deg, ${brandAccent} 0%, ${brandAccent}44 50%, ${brandAccent} 100%)` }} />
      ) : (
        <div style={{ position: "absolute", top: splitPx - s(3), left: 0, width: width, height: s(6), background: `linear-gradient(90deg, ${brandAccent} 0%, ${brandAccent}44 50%, ${brandAccent} 100%)` }} />
      )}

      {/* Logo — placed on brand zone */}
      {brand.logoUrl && (
        <img src={brand.logoUrl} style={{ position: "absolute", top: (isVert ? pad * 1.5 : splitPx + pad), left: pad, maxWidth: s(140), maxHeight: s(40), objectFit: "contain" }} />
      )}

      {/* Badge — top-right of brand zone */}
      {badgeText && (
        <div style={{
          position: "absolute",
          top: isVert ? pad * 1.5 : splitPx + pad,
          right: isVert ? width - splitPx + pad : pad,
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: brandAccent, color: "#FFF",
          fontSize: s(13), fontWeight: 700, borderRadius: s(4),
          padding: `${s(5)}px ${s(12)}px`, letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
        }}>
          {badgeText}
        </div>
      )}

      {/* Headline — on brand zone */}
      <div style={{
        position: "absolute",
        top: Math.round(height * cfg.hlY),
        left: pad,
        width: hlMaxW,
        display: "flex",
        fontFamily: `${brand.headingFont}, Noto Sans KR`,
        fontSize: hlAdj.fontSize, fontWeight: 800,
        color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.02em",
      }}>
        {hlFit.truncated}
      </div>

      {/* Subcopy */}
      <div style={{
        position: "absolute",
        top: Math.round(height * cfg.scY),
        left: pad, width: scMaxW, display: "flex",
        fontFamily: `${brand.bodyFont}, Noto Sans KR`,
        fontSize: scAdj.fontSize, fontWeight: 400,
        color: "rgba(255,255,255,0.85)", lineHeight: 1.45,
      }}>
        {scFit.truncated}
      </div>

      {/* CTA */}
      <div style={{
        position: "absolute",
        top: Math.round(height * cfg.ctaY),
        left: pad, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#FFFFFF", color: brandPrimary,
        fontFamily: `${brand.bodyFont}, Noto Sans KR`,
        fontSize: s(ratio === "landscape" ? 14 : 16), fontWeight: 700,
        borderRadius: s(8), padding: `${s(12)}px ${s(30)}px`,
      }}>
        {cta}
      </div>
    </div>
  );
}
