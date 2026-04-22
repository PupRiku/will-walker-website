import { describe, it, expect, vi } from 'vitest';
import { worksData, Work } from '@/data/works';
import { generateStaticParams } from '@/app/works/[slug]/page';

vi.mock('@/lib/api', () => ({
  fetchPlays: async () => worksData,
  fetchPlay: async (slug: string) => worksData.find((w) => w.slug === slug) ?? null,
}));

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

  it('every work has a slug', () => {
    worksData.forEach((work) => {
      expect(
        work.slug,
        `"${work.title}" is missing a slug`
      ).toBeTruthy();
    });
  });

  it('no two works share the same slug', () => {
    const slugs = worksData.map((w) => w.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('all slugs match /^[a-z0-9-]+$/', () => {
    worksData.forEach((work) => {
      expect(
        /^[a-z0-9-]+$/.test(work.slug),
        `"${work.title}" slug "${work.slug}" contains invalid characters`
      ).toBe(true);
    });
  });

  it('generateStaticParams returns one entry per work with correct slug', async () => {
    const params = await generateStaticParams();
    expect(params.length).toBe(worksData.length);
    const paramSlugs = params.map((p) => p.slug).sort();
    const dataSlugs = worksData.map((w) => w.slug).sort();
    expect(paramSlugs).toEqual(dataSlugs);
  });
});
