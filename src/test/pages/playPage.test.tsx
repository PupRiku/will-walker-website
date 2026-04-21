import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { worksData } from '@/data/works';

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

async function renderPlayPage(slug: string) {
  const { default: PlayPage } = await import('@/app/works/[slug]/page');
  const params = Promise.resolve({ slug });
  const jsx = await PlayPage({ params });
  return render(jsx as React.ReactElement);
}

const publishedWork = worksData.find((w) => w.published === true && w.purchase);
const unpublishedWork = worksData.find((w) => !w.published);
const workWithPdf = worksData.find((w) => w.pdfSrc && w.pdfSrc.length > 0);

describe('PlayPage (/works/[slug])', () => {
  it('renders the play title as an h1', async () => {
    const work = worksData[0];
    await renderPlayPage(work.slug);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(work.title);
  });

  it('renders the synopsis', async () => {
    const work = worksData[0];
    await renderPlayPage(work.slug);
    expect(screen.getByText(work.synopsis)).toBeInTheDocument();
  });

  it('shows "Published" ribbon for published works', async () => {
    if (!publishedWork) return;
    await renderPlayPage(publishedWork.slug);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('does not show "Published" ribbon for unpublished works', async () => {
    if (!unpublishedWork) return;
    await renderPlayPage(unpublishedWork.slug);
    expect(screen.queryByText('Published')).toBeNull();
  });

  it('shows "Read Sample" link when pdfSrc is set', async () => {
    if (!workWithPdf) return;
    await renderPlayPage(workWithPdf.slug);
    expect(screen.getByText('Read Sample')).toBeInTheDocument();
  });

  it('shows "Purchase Rights" for published works with purchase URL', async () => {
    if (!publishedWork) return;
    await renderPlayPage(publishedWork.slug);
    expect(screen.getByText('Purchase Rights')).toBeInTheDocument();
    expect(screen.queryByText('Apply for Performance Rights')).toBeNull();
  });

  it('shows "Apply for Performance Rights" for unpublished works', async () => {
    if (!unpublishedWork) return;
    await renderPlayPage(unpublishedWork.slug);
    expect(screen.getByText('Apply for Performance Rights')).toBeInTheDocument();
    expect(screen.queryByText('Purchase Rights')).toBeNull();
  });

  it('throws NEXT_NOT_FOUND for an unknown slug', async () => {
    await expect(renderPlayPage('this-slug-does-not-exist')).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
