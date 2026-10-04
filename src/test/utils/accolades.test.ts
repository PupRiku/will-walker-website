import { describe, it, expect } from 'vitest';
import { sortAccolades, formatAccoladeDate, validateAccolades } from '@/utils/accolades';

const a = (month: number, year: number, name = 'x') => ({ name, organization: 'Org', month, year });

describe('sortAccolades', () => {
  it('sorts newest first by year, then month', () => {
    const sorted = sortAccolades([a(3, 2020), a(11, 2022), a(1, 2022), a(12, 2020)]);
    expect(sorted.map((x) => [x.year, x.month])).toEqual([
      [2022, 11],
      [2022, 1],
      [2020, 12],
      [2020, 3],
    ]);
  });

  it('does not mutate the input and tolerates undefined', () => {
    const input = [a(1, 2020), a(1, 2021)];
    sortAccolades(input);
    expect(input[0].year).toBe(2020);
    expect(sortAccolades(undefined)).toEqual([]);
  });
});

describe('formatAccoladeDate', () => {
  it('formats month and year', () => {
    expect(formatAccoladeDate({ month: 6, year: 2024 })).toBe('June 2024');
    expect(formatAccoladeDate({ month: 12, year: 1999 })).toBe('December 1999');
  });
});

describe('validateAccolades', () => {
  it('allows undefined and valid arrays', () => {
    expect(validateAccolades(undefined)).toBeNull();
    expect(validateAccolades([])).toBeNull();
    expect(validateAccolades([a(5, 2020)])).toBeNull();
  });

  it('rejects non-arrays, bad rows, and too many entries', () => {
    expect(validateAccolades('nope')).not.toBeNull();
    expect(validateAccolades([null])).not.toBeNull();
    expect(validateAccolades([a(13, 2020)])).not.toBeNull();
    expect(validateAccolades(Array.from({ length: 51 }, () => a(1, 2020)))).not.toBeNull();
  });
});
