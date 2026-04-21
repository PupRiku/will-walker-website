import { describe, it, expect } from 'vitest';
import {
  classifyRuntime,
  parseCastSize,
  parseRuntimeForSort,
  parseCastForSort,
  filterWorks,
  sortWorks,
} from '@/utils/filterSort';
import { Work } from '@/data/works';

const makeWork = (overrides: Partial<Work>): Work => ({
  slug: 'test-play',
  title: 'Test Play',
  category: 'Drama',
  imageSrc: '/images/test.png',
  pdfSrc: '',
  cast: '2M/2F',
  synopsis: 'A test synopsis.',
  ...overrides,
});

describe('classifyRuntime', () => {
  it('returns null for undefined', () => expect(classifyRuntime(undefined)).toBeNull());
  it('returns full for "Full Length"', () => expect(classifyRuntime('Full Length')).toBe('full'));
  it('returns short for under 30 min', () => expect(classifyRuntime('20 minutes')).toBe('short'));
  it('returns medium for 30–59 min range', () => expect(classifyRuntime('35-45 minutes')).toBe('medium'));
  it('returns long for 60+ min range', () => expect(classifyRuntime('90-120 minutes')).toBe('long'));
  it('returns null for non-numeric string', () => expect(classifyRuntime('TBD')).toBeNull());
});

describe('parseCastSize', () => {
  it('returns null for empty string', () => expect(parseCastSize('')).toBeNull());
  it('returns null for flexible cast', () => expect(parseCastSize('Flexible Ensemble')).toBeNull());
  it('returns null for "various"', () => expect(parseCastSize('Various')).toBeNull());
  it('sums numeric cast breakdown', () => expect(parseCastSize('3M/2F')).toBe(5));
  it('handles single number', () => expect(parseCastSize('5M')).toBe(5));
  it('handles large cast', () => expect(parseCastSize('10M/8F')).toBe(18));
});

describe('parseRuntimeForSort', () => {
  it('returns Infinity for undefined', () => expect(parseRuntimeForSort(undefined)).toBe(Infinity));
  it('returns Infinity for TBD', () => expect(parseRuntimeForSort('TBD')).toBe(Infinity));
  it('returns Infinity for Collection', () => expect(parseRuntimeForSort('Collection')).toBe(Infinity));
  it('extracts first number from range', () => expect(parseRuntimeForSort('90-120 minutes')).toBe(90));
  it('extracts number from simple string', () => expect(parseRuntimeForSort('45 minutes')).toBe(45));
});

describe('parseCastForSort', () => {
  it('returns Infinity for empty string', () => expect(parseCastForSort('')).toBe(Infinity));
  it('returns Infinity for TBD', () => expect(parseCastForSort('TBD')).toBe(Infinity));
  it('sums M and F counts', () => expect(parseCastForSort('3M/2F')).toBe(5));
  it('ignores "Flexible" label numbers', () => expect(parseCastForSort('2M/2F/Flexible Ensemble')).toBe(4));
  it('handles NB', () => expect(parseCastForSort('1M/1F/1NB')).toBe(3));
  it('handles VO counts', () => expect(parseCastForSort('2M/1V.O.')).toBe(3));
});

describe('filterWorks', () => {
  const works = [
    makeWork({ title: 'Alpha', category: 'Drama', synopsis: 'A dramatic piece.' }),
    makeWork({ title: 'Beta', category: 'Comedy', synopsis: 'A funny story.', published: true, purchase: 'https://example.com' }),
    makeWork({ title: 'Gamma', category: 'Drama', synopsis: 'Another drama.', runtime: '20 minutes', cast: '2M/1F' }),
    makeWork({ title: 'Delta', category: 'Drama', synopsis: 'A long play.', runtime: '90-120 minutes', cast: '10M/8F' }),
  ];

  it('returns all works with empty filters', () => {
    const result = filterWorks(works, { searchQuery: '', selectedGenre: '', publishedOnly: false, runtimeBucket: '', castBucket: '' });
    expect(result).toHaveLength(4);
  });

  it('filters by title search', () => {
    const result = filterWorks(works, { searchQuery: 'alpha', selectedGenre: '', publishedOnly: false, runtimeBucket: '', castBucket: '' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Alpha');
  });

  it('filters by synopsis search', () => {
    const result = filterWorks(works, { searchQuery: 'funny', selectedGenre: '', publishedOnly: false, runtimeBucket: '', castBucket: '' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Beta');
  });

  it('filters by genre', () => {
    const result = filterWorks(works, { searchQuery: '', selectedGenre: 'Comedy', publishedOnly: false, runtimeBucket: '', castBucket: '' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Beta');
  });

  it('filters published only', () => {
    const result = filterWorks(works, { searchQuery: '', selectedGenre: '', publishedOnly: true, runtimeBucket: '', castBucket: '' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Beta');
  });

  it('filters by runtime bucket: short', () => {
    const result = filterWorks(works, { searchQuery: '', selectedGenre: '', publishedOnly: false, runtimeBucket: 'short', castBucket: '' });
    expect(result.every((w) => !w.runtime || (w.runtime === '20 minutes'))).toBe(true);
  });

  it('filters by cast bucket: small (1–5)', () => {
    const result = filterWorks(works, { searchQuery: '', selectedGenre: '', publishedOnly: false, runtimeBucket: '', castBucket: 'small' });
    const titles = result.map((w) => w.title);
    expect(titles).toContain('Alpha');
    expect(titles).toContain('Gamma');
    expect(titles).not.toContain('Delta');
  });

  it('filters by cast bucket: large (13+)', () => {
    const result = filterWorks(works, { searchQuery: '', selectedGenre: '', publishedOnly: false, runtimeBucket: '', castBucket: 'large' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Delta');
  });
});

describe('sortWorks', () => {
  const works = [
    makeWork({ title: 'Charlie', runtime: '60 minutes', cast: '5M/3F' }),
    makeWork({ title: 'Alpha', runtime: '20 minutes', cast: '1M/1F' }),
    makeWork({ title: 'Beta', runtime: '90 minutes', cast: '10M/8F' }),
  ];

  it('returns same order for empty sort', () => {
    const result = sortWorks(works, '');
    expect(result.map((w) => w.title)).toEqual(['Charlie', 'Alpha', 'Beta']);
  });

  it('sorts title-asc', () => {
    const result = sortWorks(works, 'title-asc');
    expect(result.map((w) => w.title)).toEqual(['Alpha', 'Beta', 'Charlie']);
  });

  it('sorts title-desc', () => {
    const result = sortWorks(works, 'title-desc');
    expect(result.map((w) => w.title)).toEqual(['Charlie', 'Beta', 'Alpha']);
  });

  it('sorts runtime-asc (shortest first)', () => {
    const result = sortWorks(works, 'runtime-asc');
    expect(result.map((w) => w.title)).toEqual(['Alpha', 'Charlie', 'Beta']);
  });

  it('sorts runtime-desc (longest first)', () => {
    const result = sortWorks(works, 'runtime-desc');
    expect(result.map((w) => w.title)).toEqual(['Beta', 'Charlie', 'Alpha']);
  });

  it('sorts cast-asc (smallest first)', () => {
    const result = sortWorks(works, 'cast-asc');
    expect(result.map((w) => w.title)).toEqual(['Alpha', 'Charlie', 'Beta']);
  });

  it('sorts cast-desc (largest first)', () => {
    const result = sortWorks(works, 'cast-desc');
    expect(result.map((w) => w.title)).toEqual(['Beta', 'Charlie', 'Alpha']);
  });

  it('does not mutate the input array', () => {
    const original = [...works];
    sortWorks(works, 'title-asc');
    expect(works.map((w) => w.title)).toEqual(original.map((w) => w.title));
  });
});
