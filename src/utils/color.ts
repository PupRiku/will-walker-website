/**
 * Picks readable banner text color (near-black or white) for an arbitrary
 * admin-chosen background, using the standard relative-luminance formula.
 * The banner color picker has no palette restriction, so a light pick (e.g.
 * white or pale yellow) must not be paired with hard-coded white text.
 */
export function getContrastTextColor(hexColor: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hexColor.trim());
  if (!match) return '#fff';

  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

  return luminance > 0.5 ? '#1a1a1a' : '#fff';
}
