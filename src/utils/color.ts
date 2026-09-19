const WHITE = '#fff';
// Pure black, not a softer near-black: for any background, the better of
// {white, black} always clears WCAG AA's 4.5:1 (the two candidates' worst
// crossover point works out to ~4.58:1). A softer dark candidate like
// #1a1a1a falls short of 4.5:1 against some mid-gray backgrounds (e.g.
// #7b7b7b lands at ~4.2:1), so it isn't safe for an unrestricted picker.
const BLACK = '#000';

const HEX3 = /^#?([0-9a-f]{3})$/i;
const HEX6 = /^#?([0-9a-f]{6})$/i;

/**
 * Normalizes a hex color string to `#rrggbb` (lowercase), expanding 3-digit
 * shorthand (`#abc` -> `#aabbcc`). Returns `''` for blank input (no banner
 * color set) or `null` if the value isn't a valid 3- or 6-digit hex color —
 * anything outside that shape isn't guaranteed parseable by
 * `getContrastTextColor`, which would silently mistreat it as unparsable.
 */
export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const hex6 = HEX6.exec(trimmed);
  if (hex6) return `#${hex6[1].toLowerCase()}`;

  const hex3 = HEX3.exec(trimmed);
  if (hex3) {
    const [r, g, b] = hex3[1].toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return null;
}

export function hexColorFieldError(label: string): string {
  return `${label} must be a hex color like #795548 (or leave it blank)`;
}

/**
 * Validates an optional hex color field (the admin banner color picker).
 * Blank is allowed; anything else must normalize to a valid 3- or 6-digit
 * hex color. Shared by the admin form and the play API routes so a direct
 * API call can't persist a value the renderer can't safely contrast against.
 */
export function validateOptionalHexColor(value: unknown, label: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return hexColorFieldError(label);
  const trimmed = value.trim();
  if (!trimmed) return null;
  return normalizeHexColor(trimmed) !== null ? null : hexColorFieldError(label);
}

function relativeLuminance(hexColor: string): number {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return 1; // treat unparsable input as light, matching the '#fff' fallback below

  const hex = normalized.slice(1);
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
 * Picks readable banner text color (black or white) for an arbitrary
 * admin-chosen background, by comparing each candidate's actual WCAG
 * contrast ratio against the background rather than a fixed luminance
 * cutoff — a flat >0.5 threshold picks white for some mid-luminance colors
 * (e.g. #00d000) even though black contrasts far better there. The banner
 * color picker has no palette restriction, so this must hold for any
 * admin-chosen color, not just light or dark extremes.
 */
export function getContrastTextColor(hexColor: string): string {
  const backgroundLuminance = relativeLuminance(hexColor);
  const whiteContrast = contrastRatio(backgroundLuminance, relativeLuminance(WHITE));
  const blackContrast = contrastRatio(backgroundLuminance, relativeLuminance(BLACK));

  return whiteContrast >= blackContrast ? WHITE : BLACK;
}
