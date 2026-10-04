import { describe, it, expect } from 'vitest';
import {
  sortHistory,
  formatHistoryDate,
  formatHistoryEntry,
  validateHistory,
} from '@/utils/history';

const h = (month: number, year: number, type = 'Reading') => ({
  type,
  month,
  year,
  location: 'Paris, TX',
});

describe('sortHistory', () => {
  it('sorts oldest first by year, then month', () => {
    const sorted = sortHistory([h(3, 2022), h(11, 2020), h(1, 2022), h(12, 2020)]);
    expect(sorted.map((x) => [x.year, x.month])).toEqual([
      [2020, 11],
      [2020, 12],
      [2022, 1],
      [2022, 3],
    ]);
  });

  it('does not mutate the input and tolerates undefined', () => {
    const input = [h(1, 2021), h(1, 2020)];
    sortHistory(input);
    expect(input[0].year).toBe(2021);
    expect(sortHistory(undefined)).toEqual([]);
  });
});

describe('formatting', () => {
  it('formats the date', () => {
    expect(formatHistoryDate({ month: 6, year: 2024 })).toBe('June 2024');
  });

  it('formats as "type - date - location"', () => {
    expect(formatHistoryEntry(h(6, 2024, 'Staged Reading'))).toBe(
      'Staged Reading - June 2024 - Paris, TX'
    );
  });
});

describe('validateHistory', () => {
  it('accepts undefined and valid arrays', () => {
    expect(validateHistory(undefined)).toBeNull();
    expect(validateHistory([])).toBeNull();
    expect(validateHistory([h(6, 2024)])).toBeNull();
  });

  it('rejects bad input', () => {
    expect(validateHistory('x')).not.toBeNull();
    expect(validateHistory([{ ...h(6, 2024), type: ' ' }])).not.toBeNull();
    expect(validateHistory([{ ...h(6, 2024), location: '' }])).not.toBeNull();
    expect(validateHistory([h(13, 2024)])).not.toBeNull();
    expect(validateHistory([h(6, 1800)])).not.toBeNull();
    expect(validateHistory(Array.from({ length: 51 }, () => h(1, 2020)))).not.toBeNull();
  });
});
