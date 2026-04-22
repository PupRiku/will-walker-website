import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Production } from '@/types/production';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const mockState = vi.hoisted((): { data: Production[] } => ({ data: [] }));

vi.mock('@/lib/api', () => ({
  fetchProductions: async () => mockState.data,
}));

const realData: Production[] = [
  {
    playTitle: 'Echoes of Valor',
    productionYear: 2025,
    venue: 'Paris Community Theatre, Paris, TX',
    photos: [
      {
        id: 'eov-table-read-01',
        playTitle: 'Echoes of Valor',
        productionYear: 2025,
        venue: 'Paris Community Theatre, Paris, TX',
        src: '/images/photos/echoes-of-valor-table-read-01.jpg',
        alt: 'Cast members seated around a long table reading scripts',
        caption: 'First table read at Paris Community Theatre',
        displayOrder: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'eov-table-read-02',
        playTitle: 'Echoes of Valor',
        productionYear: 2025,
        venue: 'Paris Community Theatre, Paris, TX',
        src: '/images/photos/echoes-of-valor-table-read-02.jpg',
        alt: 'Wide shot of the full cast seated along a table',
        caption: null,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  },
];

async function renderPage() {
  vi.resetModules();
  const { default: ProductionsPage } = await import('@/app/productions/page');
  const jsx = await ProductionsPage();
  return render(jsx as React.ReactElement);
}

describe('ProductionsPage (/productions)', () => {
  beforeEach(() => {
    mockState.data = realData;
  });

  it('renders the empty state message when fetchProductions returns empty', async () => {
    mockState.data = [];
    await renderPage();
    expect(screen.getByText('Production photos coming soon.')).toBeInTheDocument();
  });

  it('renders a section heading for each production', async () => {
    await renderPage();
    for (const production of mockState.data) {
      expect(
        screen.getByRole('heading', { level: 2, name: new RegExp(production.playTitle) })
      ).toBeInTheDocument();
    }
  });

  it('renders each photo with correct src and alt text', async () => {
    await renderPage();
    for (const production of mockState.data) {
      for (const photo of production.photos) {
        const img = screen.getByAltText(photo.alt);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', photo.src);
      }
    }
  });

  it('renders caption when caption field is set', async () => {
    await renderPage();
    const photoWithCaption = mockState.data.flatMap((p) => p.photos).find((ph) => ph.caption);
    expect(photoWithCaption).toBeDefined();
    expect(screen.getByText(photoWithCaption!.caption!)).toBeInTheDocument();
  });

  it('does not render a figcaption when caption field is absent', async () => {
    await renderPage();
    const captionCount = mockState.data.flatMap((p) => p.photos).filter((ph) => ph.caption).length;
    expect(document.querySelectorAll('figcaption')).toHaveLength(captionCount);
  });
});
