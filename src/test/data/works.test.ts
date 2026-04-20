import { describe, it, expect } from 'vitest';
import { worksData, Work } from '@/data/works';

describe('worksData integrity', () => {
  it('has at least one play', () => {
    expect(worksData.length).toBeGreaterThan(0);
  });

  it('every work has required string fields', () => {
    worksData.forEach((work: Work) => {
      expect(typeof work.title, `title missing on "${work.title}"`).toBe('string');
      expect(work.title.length, `empty title`).toBeGreaterThan(0);
      expect(typeof work.category, `category missing on "${work.title}"`).toBe('string');
      expect(work.category.length, `empty category on "${work.title}"`).toBeGreaterThan(0);
      expect(typeof work.imageSrc, `imageSrc missing on "${work.title}"`).toBe('string');
      expect(work.imageSrc.length, `empty imageSrc on "${work.title}"`).toBeGreaterThan(0);
      expect(typeof work.synopsis, `synopsis missing on "${work.title}"`).toBe('string');
      expect(work.synopsis.length, `empty synopsis on "${work.title}"`).toBeGreaterThan(0);
    });
  });

  it('imageSrc paths start with /images/', () => {
    worksData.forEach((work) => {
      expect(
        work.imageSrc.startsWith('/images/'),
        `"${work.title}" imageSrc: "${work.imageSrc}"`
      ).toBe(true);
    });
  });

  it('published works have a purchase URL', () => {
    worksData
      .filter((w) => w.published === true)
      .forEach((work) => {
        expect(
          work.purchase,
          `"${work.title}" is published but missing purchase URL`
        ).toBeTruthy();
      });
  });

  it('cast strings do not use bare "W" for female roles', () => {
    worksData.forEach((work) => {
      expect(
        /\d+W/.test(work.cast),
        `"${work.title}" cast uses "W" instead of "F": "${work.cast}"`
      ).toBe(false);
    });
  });

  it('cast strings do not use comma-separated format', () => {
    worksData.forEach((work) => {
      expect(
        /\d+[MF],\s*\d+[MF]/.test(work.cast),
        `"${work.title}" cast uses comma format: "${work.cast}"`
      ).toBe(false);
    });
  });

  it('titles are unique', () => {
    const titles = worksData.map((w) => w.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it('featured works exist', () => {
    const featured = worksData.filter((w) => w.featured === true);
    expect(featured.length).toBeGreaterThan(0);
  });
});
