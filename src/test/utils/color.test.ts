import { describe, it, expect } from 'vitest';
import {
  getContrastTextColor,
  normalizeHexColor,
  validateOptionalHexColor,
} from '@/utils/color';

describe('getContrastTextColor', () => {
  it('returns black for a light background', () => {
    expect(getContrastTextColor('#f9f6f1')).toBe('#000');
  });

  it('returns white for a dark background', () => {
    expect(getContrastTextColor('#1a1a1a')).toBe('#fff');
  });

  it('returns black for a mid-luminance color where black contrasts better', () => {
    // Luminance ~0.45 — a flat >0.5 cutoff would wrongly pick white (~2.1:1)
    // over black (~10:1) here.
    expect(getContrastTextColor('#00d000')).toBe('#000');
  });

  it('meets AA contrast (>= 4.5:1) on a mid-gray background where near-black used to fall short', () => {
    // #1a1a1a against #7b7b7b lands at ~4.2:1 (below AA); pure black clears ~4.96:1.
    expect(getContrastTextColor('#7b7b7b')).toBe('#000');
  });

  it('falls back to black for an unparsable value', () => {
    expect(getContrastTextColor('not-a-color')).toBe('#000');
  });

  it('accepts a hex value without a leading #', () => {
    expect(getContrastTextColor('795548')).toBe('#fff');
  });
});

describe('normalizeHexColor', () => {
  it('lowercases and preserves a 6-digit hex color', () => {
    expect(normalizeHexColor('#4B5320')).toBe('#4b5320');
  });

  it('adds a leading # when missing', () => {
    expect(normalizeHexColor('795548')).toBe('#795548');
  });

  it('expands 3-digit shorthand to 6 digits', () => {
    expect(normalizeHexColor('#abc')).toBe('#aabbcc');
  });

  it('returns an empty string for blank input', () => {
    expect(normalizeHexColor('   ')).toBe('');
  });

  it('returns null for an invalid value', () => {
    expect(normalizeHexColor('not-a-color')).toBeNull();
    expect(normalizeHexColor('#00d0')).toBeNull();
  });
});

describe('validateOptionalHexColor', () => {
  it('allows a blank value', () => {
    expect(validateOptionalHexColor('', 'Banner Color')).toBeNull();
    expect(validateOptionalHexColor(undefined, 'Banner Color')).toBeNull();
  });

  it('allows a valid hex color', () => {
    expect(validateOptionalHexColor('#795548', 'Banner Color')).toBeNull();
  });

  it('rejects an invalid value', () => {
    expect(validateOptionalHexColor('not-a-color', 'Banner Color')).toMatch(/Banner Color/);
  });
});
