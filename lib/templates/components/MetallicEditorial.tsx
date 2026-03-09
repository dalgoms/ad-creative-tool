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
 * METALLIC EDITORIAL
 *
 * Composition: Deep blue-indigo gradient base with large abstract circular
 * light shapes. Text left-aligned in editorial column with accent divider.
 * Inspired by Spacekayak metallic backgrounds.
 *
 * Ratio adaptations:
 * - Square:     Headline upper-left, subcopy center-left, CTA bottom-left
 * - Portrait:   More vertical space; headline sits at ~30%, generous gap to subcopy
 * - Story:      Full-bleed; headline centered vertically, text block mid-screen
 * - Landscape:  Compact left column (~50%), abstract shapes fill right side
 */
export function MetallicEditorial(props: AdTemplateProps): ReactNode {
  const { width, height, fontScale, headline, subcopy, cta, badgeText, backgroundImageUrl, brand } = props;

  const s = (v: number) => Math.round(v * fontScale);
  const ratio = detectRatio(width, height);
  const pad = Math.round(width * 0.065);
  const brandPrimary = brand.primaryColor || "#2563EB";
  const brandAccent = brand.accentColor || "#F59E0B";

  const layout = {
    square: { hlW: 0.82, hlY: 0.18, scW: 0.72, scY: 0.56, ctaY: 0.78, hlSize: 52, scSize: 21, hlLines: 3 },
    portrait: { hlW: 0.82, hlY: 0.2, scW: 0.72, scY: 0.58, ctaY: 0.78, hlSize: 52, scSize: 22, hlLines: 3 },
    story: { hlW: 0.8, hlY: 0.28, scW: 0.75, scY: 0.58, ctaY: 0.74, hlSize: 56, scSize: 22, hlLines: 4 },
    landscape: { hlW: 0.5, hlY: 0.16, scW: 0.45, scY: 0.55, ctaY: 0.78, hlSize: 40, scSize: 17, hlLines: 2 },
  }[ratio];

  const hlMaxW = Math.round(width * layout.hlW);
  const scMaxW = Math.round(width * layout.scW);
  const hlBase = s(layout.hlSize);
  const hlAdj = adjustFontSize(headline, hlBase, hlMaxW, layout.hlLines, Math.round(hlBase * 0.5));
  const hlFit = estimateTextFit(headline, hlAdj.fontSize, hlMaxW, layout.hlLines);
  const scBase = s(layout.scSize);
  const scAdj = adjustFontSize(subcopy, scBase, scMaxW, 2, Math.round(scBase * 0.6));
  const scFit = estimateTextFit(subcopy, scAdj.fontSize, scMaxW, 2);

  return (
    <div style={{ width, height, display: "flex", position: "relative", overflow: "hidden", background: `linear-gradient(140deg, #060B27 0%, #12104A 35%, ${brandPrimary}CC 100%)` }}>
      {backgroundImageUrl && (
        <img src={backgroundImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2 }} />
      )}

      {/* Abstract orb — top-right */}
      <div style={{ position: "absolute", top: Math.round(-height * 0.25), right: Math.round(-width * 0.12), width: Math.round(width * 0.85), height: Math.round(width * 0.85), borderRadius: "50%", background: `linear-gradient(160deg, ${brandPrimary}55 0%, ${brandPrimary}00 70%)` }} />

      {/* Abstract orb — bottom-left, subtle */}
      <div style={{ position: "absolute", bottom: Math.round(-height * 0.2), left: Math.round(-width * 0.18), width: Math.round(width * 0.65), height: Math.round(width * 0.65), borderRadius: "50%", background: `linear-gradient(20deg, #6C2BD944 0%, #6C2BD900 100%)` }} />

      {/* Small warm accent orb */}
      <div style={{ position: "absolute", top: Math.round(height * 0.12), right: Math.round(width * 0.06), width: Math.round(width * 0.28), height: Math.round(width * 0.28), borderRadius: "50%", background: `linear-gradient(180deg, ${brandAccent}18 0%, ${brandAccent}00 100%)` }} />

      {/* Top-to-bottom veil */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.18) 100%)" }} />

      {/* Logo */}
      {brand.logoUrl && (
        <img src={brand.logoUrl} style={{ position: "absolute", top: pad, left: pad, maxWidth: s(150), maxHeight: s(44), objectFit: "contain" }} />
      )}

      {/* Badge */}
      {badgeText && (
        <div style={{ position: "absolute", top: pad, right: pad, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${brandAccent} 0%, ${brandAccent}DD 100%)`, color: "#FFF", fontSize: s(13), fontWeight: 700, borderRadius: s(6), padding: `${s(5)}px ${s(14)}px`, letterSpacing: "0.04em" }}>
          {badgeText}
        </div>
      )}

      {/* Headline */}
      <div style={{ position: "absolute", top: Math.round(height * layout.hlY), left: pad, width: hlMaxW, display: "flex", fontFamily: `${brand.headingFont}, Noto Sans KR`, fontSize: hlAdj.fontSize, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
        {hlFit.truncated}
      </div>

      {/* Accent line */}
      <div style={{ position: "absolute", top: Math.round(height * layout.scY) - s(24), left: pad, width: s(48), height: s(3), borderRadius: s(2), background: `linear-gradient(90deg, ${brandAccent} 0%, ${brandAccent}00 100%)` }} />

      {/* Subcopy */}
      <div style={{ position: "absolute", top: Math.round(height * layout.scY), left: pad, width: scMaxW, display: "flex", fontFamily: `${brand.bodyFont}, Noto Sans KR`, fontSize: scAdj.fontSize, fontWeight: 400, color: "rgba(255,255,255,0.7)", lineHeight: 1.45, letterSpacing: "-0.01em" }}>
        {scFit.truncated}
      </div>

      {/* CTA */}
      <div style={{ position: "absolute", top: Math.round(height * layout.ctaY), left: pad, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandPrimary}DD 100%)`, color: "#FFF", fontFamily: `${brand.bodyFont}, Noto Sans KR`, fontSize: s(ratio === "landscape" ? 15 : 17), fontWeight: 600, borderRadius: s(10), padding: `${s(13)}px ${s(34)}px`, border: "1px solid rgba(255,255,255,0.15)", letterSpacing: "0.02em" }}>
        {cta}
      </div>
    </div>
  );
}
