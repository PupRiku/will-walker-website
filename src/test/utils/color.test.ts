import { describe, it, expect } from 'vitest';
import { getContrastTextColor } from '@/utils/color';

describe('getContrastTextColor', () => {
  it('returns near-black for a light background', () => {
    expect(getContrastTextColor('#f9f6f1')).toBe('#1a1a1a');
  });

  it('returns white for a dark background', () => {
    expect(getContrastTextColor('#1a1a1a')).toBe('#fff');
  });

  it('returns near-black for a mid-luminance color where black contrasts better', () => {
    // Luminance ~0.45 — a flat >0.5 cutoff would wrongly pick white (~2.1:1)
    // over near-black (~8.3:1) here.
    expect(getContrastTextColor('#00d000')).toBe('#1a1a1a');
  });

  it('falls back to near-black for an unparsable value', () => {
    expect(getContrastTextColor('not-a-color')).toBe('#1a1a1a');
  });

  it('accepts a hex value without a leading #', () => {
    expect(getContrastTextColor('795548')).toBe('#fff');
  });
});
