import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Play } from '@/types/play';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NEXT_NOT_FOUND'); },
}));

vi.mock('react-icons/bs', () => ({
  BsDownload: () => <span data-testid="download-icon" />,
}));

function makePlay(overrides: Partial<Play> = {}): Play {
  return {
    id: 'test-id',
    slug: 'test-play',
    title: 'Test Play',
    category: 'Drama',
    runtime: '90 minutes',
    cast: '2M/2F',
    synopsis: 'A test synopsis. Second sentence.',
    imageSrc: '/images/covers/test.jpg',
    pdfSrc: '',
    purchase: '',
    published: false,
    featured: false,
    featuredOrder: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const publishedPlay = makePlay({
  slug: 'published-play',
  title: 'Published Play',
  published: true,
  purchase: 'https://example.com/purchase',
});

const unpublishedPlay = makePlay({
  slug: 'unpublished-play',
  title: 'Unpublished Play',
  published: false,
});

const playWithPdf = makePlay({
  slug: 'play-with-pdf',
  title: 'Play With PDF',
  pdfSrc: 'https://example.com/sample.pdf',
});

const allPlays = [publishedPlay, unpublishedPlay, playWithPdf];

const mockFetchPlay = vi.fn(async (slug: string): Promise<Play | null> => {
  return allPlays.find((p) => p.slug === slug) ?? null;
});

vi.mock('@/lib/api', () => ({
  fetchPlay: (slug: string) => mockFetchPlay(slug),
  fetchPlays: async () => allPlays,
}));

async function renderPlayPage(slug: string) {
  const { default: PlayPage } = await import('@/app/works/[slug]/page');
  const params = Promise.resolve({ slug });
  const jsx = await PlayPage({ params });
  return render(jsx as React.ReactElement);
}

describe('PlayPage (/works/[slug])', () => {
  it('renders the play title as an h1', async () => {
    await renderPlayPage('unpublished-play');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unpublished Play');
  });

  it('renders the synopsis', async () => {
    await renderPlayPage('unpublished-play');
    expect(screen.getByText(unpublishedPlay.synopsis)).toBeInTheDocument();
  });

  it('shows "Published" ribbon for published works', async () => {
    await renderPlayPage('published-play');
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('does not show "Published" ribbon for unpublished works', async () => {
    await renderPlayPage('unpublished-play');
    expect(screen.queryByText('Published')).toBeNull();
  });

  it('shows "Read Sample" link when pdfSrc is set', async () => {
    await renderPlayPage('play-with-pdf');
    expect(screen.getByText('Read Sample')).toBeInTheDocument();
  });

  it('shows "Purchase Rights" for published works with purchase URL', async () => {
    await renderPlayPage('published-play');
    expect(screen.getByText('Purchase Rights')).toBeInTheDocument();
    expect(screen.queryByText('Apply for Performance Rights')).toBeNull();
  });

  it('shows "Apply for Performance Rights" for unpublished works', async () => {
    await renderPlayPage('unpublished-play');
    expect(screen.getByText('Apply for Performance Rights')).toBeInTheDocument();
    expect(screen.queryByText('Purchase Rights')).toBeNull();
  });

  it('throws NEXT_NOT_FOUND for an unknown slug', async () => {
    await expect(renderPlayPage('this-slug-does-not-exist')).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
