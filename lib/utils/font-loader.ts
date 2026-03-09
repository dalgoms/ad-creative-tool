import { readFile } from "fs/promises";
import { join } from "path";

const fontCache = new Map<string, ArrayBuffer>();

/**
 * Loads a font file as ArrayBuffer for Satori rendering.
 * Falls back to fetching Inter from Google Fonts if local file not found.
 */
export async function loadFont(
  fontName: string,
  weight: number = 400
): Promise<ArrayBuffer> {
  const cacheKey = `${fontName}-${weight}`;
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }

  // Try local font first
  const localPath = join(process.cwd(), "public", "fonts", `${fontName}-${weight}.ttf`);
  try {
    const buffer = await readFile(localPath);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    fontCache.set(cacheKey, arrayBuffer);
    return arrayBuffer;
  } catch {
    // Fall back to Google Fonts
  }

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${weight}&display=swap`;

  try {
    const cssResponse = await fetch(googleFontsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    const css = await cssResponse.text();

    const urlMatch = css.match(/url\(([^)]+)\)/);
    if (!urlMatch) throw new Error("No font URL found in CSS");

    const fontResponse = await fetch(urlMatch[1]);
    const arrayBuffer = await fontResponse.arrayBuffer();
    fontCache.set(cacheKey, arrayBuffer);
    return arrayBuffer;
  } catch {
    throw new Error(
      `Failed to load font: ${fontName} weight ${weight}. Place ${fontName}-${weight}.ttf in public/fonts/ or ensure network access.`
    );
  }
}

/**
 * Loads Inter + Noto Sans KR for Latin and Korean rendering.
 * Satori uses fonts in declaration order: Inter first (Latin), Noto Sans KR as fallback (Korean/CJK).
 */
export async function loadDefaultFonts() {
  const [regular, bold, extraBold, krRegular, krBold, krExtraBold] = await Promise.all([
    loadFont("Inter", 400),
    loadFont("Inter", 700),
    loadFont("Inter", 800),
    loadFont("NotoSansKR", 400).catch(() => null),
    loadFont("NotoSansKR", 700).catch(() => null),
    loadFont("NotoSansKR", 800).catch(() => null),
  ]);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: "normal" | "italic" }> = [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
    { name: "Inter", data: extraBold, weight: 800, style: "normal" },
  ];

  if (krRegular) fonts.push({ name: "Noto Sans KR", data: krRegular, weight: 400, style: "normal" });
  if (krBold) fonts.push({ name: "Noto Sans KR", data: krBold, weight: 700, style: "normal" });
  if (krExtraBold) fonts.push({ name: "Noto Sans KR", data: krExtraBold, weight: 800, style: "normal" });

  return fonts;
}
