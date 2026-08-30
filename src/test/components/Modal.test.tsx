import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/Modal';
import { Work } from '@/types/play';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock('next/link', () => ({
  // Spread the rest so data-* attributes (e.g. Umami event tags) survive the mock.
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const mockPlay: Work = {
  slug: 'test-play',
  title: 'Test Play',
  category: 'Drama',
  imageSrc: '/images/test.jpg',
  pdfSrc: 'https://example.com/sample.pdf',
  cast: '3M/2F',
  synopsis: 'A gripping drama about something important.',
  runtime: '90 minutes',
  published: false,
};

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} play={mockPlay} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when play is null', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} play={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders play title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.getByText('Test Play')).toBeInTheDocument();
  });

  it('renders play synopsis', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.getByText(mockPlay.synopsis)).toBeInTheDocument();
  });

  it('renders cast breakdown', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.getByText('3M/2F')).toBeInTheDocument();
  });

  it('renders runtime', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.getByText('90 minutes')).toBeInTheDocument();
  });

  it('shows "Read Sample" button when pdfSrc is set', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.getByText('Read Sample')).toBeInTheDocument();
  });

  it('does not show "Read Sample" button when pdfSrc is empty', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} play={{ ...mockPlay, pdfSrc: '' }} />
    );
    expect(screen.queryByText('Read Sample')).toBeNull();
  });

  it('shows "Purchase Rights" button when published with purchase URL', () => {
    const publishedPlay: Work = {
      ...mockPlay,
      published: true,
      purchase: 'https://example.com/buy',
    };
    render(<Modal isOpen={true} onClose={vi.fn()} play={publishedPlay} />);
    expect(screen.getByText('Purchase Rights')).toBeInTheDocument();
    expect(screen.queryByText('Apply for Rights')).toBeNull();
  });

  it('shows "Apply for Rights" button when not published', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.getByText('Apply for Rights')).toBeInTheDocument();
    expect(screen.queryByText('Purchase Rights')).toBeNull();
  });

  it('shows "Published" ribbon for published plays', () => {
    const publishedPlay: Work = {
      ...mockPlay,
      published: true,
      purchase: 'https://example.com/buy',
    };
    render(<Modal isOpen={true} onClose={vi.fn()} play={publishedPlay} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('does not show ribbon for unpublished plays', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(screen.queryByText('Published')).toBeNull();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} play={mockPlay} />);
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} play={mockPlay} />);
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has role="dialog" and aria-modal="true"', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders "View Full Page" link pointing to the play slug', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    const link = screen.getByText('View Full Page →');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/works/test-play');
  });
});

describe('Modal analytics events', () => {
  const publishedPlay: Work = {
    ...mockPlay,
    published: true,
    purchase: 'https://example.com/buy',
  };

  it('tags "Read Sample" with the read-sample event', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    const link = screen.getByText('Read Sample').closest('a');
    expect(link).toHaveAttribute('data-umami-event', 'read-sample');
    expect(link).toHaveAttribute('data-umami-event-play', 'test-play');
    expect(link).toHaveAttribute('data-umami-event-placement', 'modal');
  });

  it('tags "Purchase Rights" with the purchase-rights event', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={publishedPlay} />);
    const link = screen.getByText('Purchase Rights').closest('a');
    expect(link).toHaveAttribute('data-umami-event', 'purchase-rights');
    expect(link).toHaveAttribute('data-umami-event-play', 'test-play');
    expect(link).toHaveAttribute('data-umami-event-placement', 'modal');
  });

  it('tags "Apply for Rights" with the apply-for-rights event', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    const link = screen.getByText('Apply for Rights').closest('a');
    expect(link).toHaveAttribute('data-umami-event', 'apply-for-rights');
    expect(link).toHaveAttribute('data-umami-event-play', 'test-play');
    expect(link).toHaveAttribute('data-umami-event-placement', 'modal');
  });

  it('tags "View Full Page" with the modal-view-full-page event', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    const link = screen.getByText('View Full Page →').closest('a');
    expect(link).toHaveAttribute('data-umami-event', 'modal-view-full-page');
    expect(link).toHaveAttribute('data-umami-event-play', 'test-play');
  });

  it('renders a "Request Perusal" button', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />);
    expect(
      screen.getByRole('button', { name: 'Request Perusal' })
    ).toBeInTheDocument();
  });

  it('opens the perusal dialog with the play title without closing itself', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} play={mockPlay} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request Perusal' }));

    expect(
      screen.getByRole('heading', { name: 'Request Perusal Copy' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    // The play modal stays open behind the nested dialog.
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(mockPlay.synopsis)).toBeInTheDocument();
  });

  it('inerts the play modal while the perusal dialog is open', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} play={mockPlay} />
    );
    expect(container).not.toHaveAttribute('inert');

    fireEvent.click(screen.getByRole('button', { name: 'Request Perusal' }));
    // The perusal dialog portals to <body>, so the subtree holding the play
    // modal becomes a sibling it can inert.
    expect(container).toHaveAttribute('inert');

    const closeButtons = screen.getAllByRole('button', { name: 'Close dialog' });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(container).not.toHaveAttribute('inert');
  });

  it('closes only the perusal dialog when its backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} play={mockPlay} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request Perusal' }));
    // Last child of <body> is the portalled perusal overlay.
    fireEvent.click(document.body.lastElementChild as HTMLElement);

    expect(
      screen.queryByRole('heading', { name: 'Request Perusal Copy' })
    ).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('lets Escape close only the perusal dialog while it is open', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} play={mockPlay} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request Perusal' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(
      screen.queryByRole('heading', { name: 'Request Perusal Copy' })
    ).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    // With the nested dialog gone, Escape closes the play modal again.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
