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
 * GLASS CARD
 *
 * Composition: Vibrant mesh-gradient canvas with a translucent card overlay
 * containing all text content. The card has rounded corners and a subtle
 * white border giving a frosted-glass feel (without actual blur).
 *
 * Fundamentally different structure: text lives inside a bounded card,
 * not floating over the full canvas.
 *
 * Ratio adaptations:
 * - Square:     Card centered, 78% width × 60% height
 * - Portrait:   Card lower-center, 82% width × 50% height
 * - Story:      Card mid-center, 80% width × 40% height
 * - Landscape:  Card left-center, 52% width × 75% height
 */
export function GlassCard(props: AdTemplateProps): ReactNode {
  const { width, height, fontScale, headline, subcopy, cta, badgeText, backgroundImageUrl, brand } = props;

  const s = (v: number) => Math.round(v * fontScale);
  const ratio = detectRatio(width, height);
  const brandPrimary = brand.primaryColor || "#2563EB";
  const brandAccent = brand.accentColor || "#F59E0B";

  const card = {
    square:    { w: 0.78, h: 0.58, x: 0.11, y: 0.2, hlSize: 40, scSize: 18, hlLines: 2, cardPad: 0.05 },
    portrait:  { w: 0.82, h: 0.48, x: 0.09, y: 0.38, hlSize: 42, scSize: 19, hlLines: 2, cardPad: 0.05 },
    story:     { w: 0.8,  h: 0.38, x: 0.1,  y: 0.32, hlSize: 44, scSize: 19, hlLines: 3, cardPad: 0.06 },
    landscape: { w: 0.5,  h: 0.72, x: 0.06, y: 0.14, hlSize: 34, scSize: 15, hlLines: 2, cardPad: 0.035 },
  }[ratio];

  const cardW = Math.round(width * card.w);
  const cardH = Math.round(height * card.h);
  const cardX = Math.round(width * card.x);
  const cardY = Math.round(height * card.y);
  const cardPad = Math.round(width * card.cardPad);

  const textW = cardW - cardPad * 2;
  const hlBase = s(card.hlSize);
  const hlAdj = adjustFontSize(headline, hlBase, textW, card.hlLines, Math.round(hlBase * 0.5));
  const hlFit = estimateTextFit(headline, hlAdj.fontSize, textW, card.hlLines);
  const scBase = s(card.scSize);
  const scAdj = adjustFontSize(subcopy, scBase, textW, 2, Math.round(scBase * 0.6));
  const scFit = estimateTextFit(subcopy, scAdj.fontSize, textW, 2);

  const bgMesh = `linear-gradient(135deg, #0F172A 0%, ${brandPrimary}88 40%, #7C3AED66 70%, ${brandAccent}44 100%)`;

  return (
    <div style={{ width, height, display: "flex", position: "relative", overflow: "hidden", background: bgMesh }}>
      {backgroundImageUrl && (
        <img src={backgroundImageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
      )}

      {/* Decorative orb 1 — large, top-left */}
      <div style={{ position: "absolute", top: Math.round(-height * 0.15), left: Math.round(-width * 0.1), width: Math.round(width * 0.6), height: Math.round(width * 0.6), borderRadius: "50%", background: `linear-gradient(180deg, ${brandPrimary}33 0%, ${brandPrimary}00 100%)` }} />

      {/* Decorative orb 2 — medium, bottom-right */}
      <div style={{ position: "absolute", bottom: Math.round(-height * 0.1), right: Math.round(-width * 0.08), width: Math.round(width * 0.5), height: Math.round(width * 0.5), borderRadius: "50%", background: `linear-gradient(0deg, #7C3AED33 0%, #7C3AED00 100%)` }} />

      {/* Small warm orb */}
      <div style={{ position: "absolute", top: Math.round(height * 0.6), right: Math.round(width * 0.15), width: Math.round(width * 0.2), height: Math.round(width * 0.2), borderRadius: "50%", background: `linear-gradient(135deg, ${brandAccent}22 0%, ${brandAccent}00 100%)` }} />

      {/* Logo — above the card */}
      {brand.logoUrl && (
        <img src={brand.logoUrl} style={{ position: "absolute", top: Math.round(height * 0.05), left: cardX, maxWidth: s(140), maxHeight: s(40), objectFit: "contain" }} />
      )}

      {/* Badge — top-right */}
      {badgeText && (
        <div style={{ position: "absolute", top: Math.round(height * 0.05), right: cardX, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${brandAccent} 0%, ${brandAccent}CC 100%)`, color: "#FFF", fontSize: s(12), fontWeight: 700, borderRadius: s(20), padding: `${s(4)}px ${s(14)}px`, letterSpacing: "0.05em" }}>
          {badgeText}
        </div>
      )}

      {/* The glass card */}
      <div style={{
        position: "absolute",
        top: cardY, left: cardX,
        width: cardW, height: cardH,
        display: "flex", flexDirection: "column", justifyContent: "center",
        borderRadius: s(20),
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        padding: cardPad,
      }}>
        {/* Headline inside card */}
        <div style={{
          display: "flex",
          fontFamily: `${brand.headingFont}, Noto Sans KR`,
          fontSize: hlAdj.fontSize, fontWeight: 700,
          color: "#FFFFFF", lineHeight: 1.15,
          letterSpacing: "-0.02em",
          marginBottom: s(16),
        }}>
          {hlFit.truncated}
        </div>

        {/* Thin divider */}
        <div style={{
          width: s(40), height: s(2),
          borderRadius: s(1),
          background: `linear-gradient(90deg, ${brandAccent} 0%, ${brandAccent}00 100%)`,
          marginBottom: s(16),
        }} />

        {/* Subcopy inside card */}
        <div style={{
          display: "flex",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: scAdj.fontSize, fontWeight: 400,
          color: "rgba(255,255,255,0.68)", lineHeight: 1.5,
          marginBottom: s(24),
        }}>
          {scFit.truncated}
        </div>

        {/* CTA inside card */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          alignSelf: "flex-start",
          background: `linear-gradient(135deg, ${brandPrimary} 0%, #7C3AED 100%)`,
          color: "#FFF",
          fontFamily: `${brand.bodyFont}, Noto Sans KR`,
          fontSize: s(ratio === "landscape" ? 14 : 16), fontWeight: 600,
          borderRadius: s(10), padding: `${s(11)}px ${s(28)}px`,
          letterSpacing: "0.02em",
        }}>
          {cta}
        </div>
      </div>
    </div>
  );
}
