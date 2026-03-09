function isCJK(code: number): boolean {
  return (
    (code >= 0xAC00 && code <= 0xD7AF) ||  // Hangul Syllables
    (code >= 0x3131 && code <= 0x318E) ||  // Hangul Compatibility Jamo
    (code >= 0x1100 && code <= 0x11FF) ||  // Hangul Jamo
    (code >= 0x4E00 && code <= 0x9FFF) ||  // CJK Unified Ideographs
    (code >= 0x3000 && code <= 0x303F) ||  // CJK Symbols and Punctuation
    (code >= 0xFF00 && code <= 0xFFEF)     // Fullwidth Forms
  );
}

function estimateStringWidth(text: string, fontSize: number): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    width += isCJK(code) ? fontSize * 1.0 : fontSize * 0.55;
  }
  return width;
}

/**
 * Estimates if text will fit within an area.
 * CJK-aware: Korean/Chinese characters are treated as ~1.0x fontSize width,
 * Latin characters as ~0.55x fontSize width.
 */
export function estimateTextFit(
  text: string,
  fontSize: number,
  areaWidth: number,
  maxLines: number
): { fits: boolean; truncated: string; estimatedLines: number } {
  const totalWidth = estimateStringWidth(text, fontSize);
  const estimatedLines = Math.ceil(totalWidth / areaWidth);

  if (estimatedLines <= maxLines) {
    return { fits: true, truncated: text, estimatedLines };
  }

  let cutText = text;
  while (cutText.length > 0) {
    cutText = cutText.slice(0, -1);
    const candidateWidth = estimateStringWidth(cutText + "...", fontSize);
    const candidateLines = Math.ceil(candidateWidth / areaWidth);
    if (candidateLines <= maxLines) {
      return { fits: false, truncated: cutText.trimEnd() + "...", estimatedLines: candidateLines };
    }
  }

  return { fits: false, truncated: "...", estimatedLines: 1 };
}

/**
 * Calculates an adjusted font size to make text fit within constraints.
 * Reduces font size by 2px per step until it fits or hits minimum.
 */
export function adjustFontSize(
  text: string,
  baseFontSize: number,
  areaWidth: number,
  maxLines: number,
  minFontSize: number = 14
): { fontSize: number; fits: boolean } {
  let fontSize = baseFontSize;
  while (fontSize > minFontSize) {
    const { fits } = estimateTextFit(text, fontSize, areaWidth, maxLines);
    if (fits) return { fontSize, fits: true };
    fontSize -= 2;
  }
  return { fontSize: minFontSize, fits: false };
}
