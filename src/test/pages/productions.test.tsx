import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Production } from '@/data/productions';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

// vi.hoisted ensures this variable is initialized before the vi.mock factory runs
const mockState = vi.hoisted((): { data: Production[] } => ({ data: [] }));

vi.mock('@/data/productions', () => ({
  get productionsData() {
    return mockState.data;
  },
}));

async function renderPage() {
  const { default: ProductionsPage } = await import('@/app/productions/page');
  return render(<ProductionsPage />);
}

describe('ProductionsPage (/productions)', () => {
  beforeEach(async () => {
    // Reset to real data before each test
    const { productionsData } = await vi.importActual<typeof import('@/data/productions')>(
      '@/data/productions'
    );
    mockState.data = productionsData;
  });

  it('renders the empty state message when productionsData is empty', async () => {
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
