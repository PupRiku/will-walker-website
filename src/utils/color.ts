const WHITE = '#fff';
const NEAR_BLACK = '#1a1a1a';

function relativeLuminance(hexColor: string): number {
  const match = /^#?([0-9a-f]{6})$/i.exec(hexColor.trim());
  if (!match) return 1; // treat unparsable input as light, matching the '#fff' fallback below

  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

// WCAG contrast ratio between two relative luminances: (lighter + 0.05) / (darker + 0.05).
function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Picks readable banner text color (near-black or white) for an arbitrary
 * admin-chosen background, by comparing each candidate's actual WCAG
 * contrast ratio against the background rather than a fixed luminance
 * cutoff — a flat >0.5 threshold picks white for some mid-luminance colors
 * (e.g. #00d000) even though near-black contrasts far better there. The
 * banner color picker has no palette restriction, so this must hold for any
 * admin-chosen color, not just light or dark extremes.
 */
export function getContrastTextColor(hexColor: string): string {
  const backgroundLuminance = relativeLuminance(hexColor);
  const whiteContrast = contrastRatio(backgroundLuminance, relativeLuminance(WHITE));
  const blackContrast = contrastRatio(backgroundLuminance, relativeLuminance(NEAR_BLACK));

  return whiteContrast >= blackContrast ? WHITE : NEAR_BLACK;
}
