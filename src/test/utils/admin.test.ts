import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { slugify, timeAgo } from '@/utils/admin';

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces ampersands with "and"', () => {
    expect(slugify('Romeo & Juliet')).toBe('romeo-and-juliet');
  });

  it('strips apostrophes without leaving an extra hyphen', () => {
    expect(slugify("I'm Sorry")).toBe('im-sorry');
  });

  it('collapses runs of non-alphanumeric characters into a single hyphen', () => {
    expect(slugify('Hamlet: A Horatio Story')).toBe('hamlet-a-horatio-story');
    expect(slugify('Multiple   spaces')).toBe('multiple-spaces');
    expect(slugify('Special!@#chars')).toBe('special-chars');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  leading and trailing  ')).toBe('leading-and-trailing');
    expect(slugify('---weird---')).toBe('weird');
  });

  it('returns an empty string for input with no alphanumeric characters', () => {
    expect(slugify('')).toBe('');
    expect(slugify('!!!')).toBe('');
  });

  it('preserves digits', () => {
    expect(slugify('Echoes of Valor 2')).toBe('echoes-of-valor-2');
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-12T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a timestamp under a minute old', () => {
    expect(timeAgo(new Date('2026-05-12T11:59:30Z').toISOString())).toBe('just now');
  });

  it('returns minutes for under an hour', () => {
    expect(timeAgo(new Date('2026-05-12T11:55:00Z').toISOString())).toBe('5m ago');
    expect(timeAgo(new Date('2026-05-12T11:00:01Z').toISOString())).toBe('59m ago');
  });

  it('returns hours for under a day', () => {
    expect(timeAgo(new Date('2026-05-12T10:00:00Z').toISOString())).toBe('2h ago');
    expect(timeAgo(new Date('2026-05-11T13:00:00Z').toISOString())).toBe('23h ago');
  });

  it('returns days for anything older', () => {
    expect(timeAgo(new Date('2026-05-09T12:00:00Z').toISOString())).toBe('3d ago');
    expect(timeAgo(new Date('2026-04-12T12:00:00Z').toISOString())).toBe('30d ago');
  });
});
