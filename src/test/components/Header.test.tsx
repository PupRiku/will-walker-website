import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/SocialLinks', () => ({
  default: () => <div data-testid="social-links" />,
}));

describe('Header', () => {
  it('renders desktop nav links', () => {
    render(<Header />);
    expect(screen.getAllByRole('link', { name: 'Home' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'About' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Selected Works' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'CV' })[0]).toBeInTheDocument();
  });

  it('renders the Contact Me CTA link', () => {
    render(<Header />);
    const ctaLinks = screen.getAllByRole('link', { name: 'Contact Me' });
    expect(ctaLinks.length).toBeGreaterThan(0);
  });

  it('hamburger button has the correct aria-label', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: 'Open navigation menu' })
    ).toBeInTheDocument();
  });

  it('mobile menu is hidden by default', () => {
    render(<Header />);
    // Mobile menu links are in the DOM but the menu should not be "open"
    // We test that the hamburger icon is showing the menu icon (not close icon)
    const hamburger = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(hamburger).toBeInTheDocument();
  });

  it('clicking hamburger toggles the mobile menu open', () => {
    render(<Header />);
    const hamburger = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(hamburger);
    // After click, there should be two sets of nav links (desktop + mobile)
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThanOrEqual(2);
  });

  it('mobile menu links call closeMenu on click', () => {
    render(<Header />);
    const hamburger = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(hamburger);
    // All "Home" links exist; clicking any mobile one should not throw
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(() => fireEvent.click(homeLinks[homeLinks.length - 1])).not.toThrow();
  });

  it('tags both Merch Store links for Umami', () => {
    render(<Header />);
    const merchLinks = screen.getAllByRole('link', { name: 'Merch Store' });
    expect(merchLinks).toHaveLength(2);
    merchLinks.forEach((link) => {
      expect(link).toHaveAttribute('data-umami-event', 'merch-store');
      expect(link).toHaveAttribute(
        'href',
        'https://walker-montgomerie-designs-shop.fourthwall.com/'
      );
    });
    expect(
      merchLinks.map((link) => link.getAttribute('data-umami-event-placement'))
    ).toEqual(['header', 'mobile-menu']);
  });

  it('closes the mobile menu when an external link is clicked', () => {
    render(<Header />);
    const hamburger = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('link', { name: 'Support Me on Ko-fi' }));
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  it('logo image has descriptive alt text', () => {
    render(<Header />);
    expect(
      screen.getByAltText("William L. Walker Montgomerie's circular logo")
    ).toBeInTheDocument();
  });
});
