'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SocialLinks from './SocialLinks';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const firstLink = mobileMenuRef.current?.querySelector<HTMLElement>('a');
    firstLink?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <Link href="/#home">
            <Image
              className={styles.logoImage}
              src="/images/assets/logo.png"
              alt="William L. Walker Montgomerie's circular logo"
              width={500}
              height={500}
              priority
            />
          </Link>
        </div>
        <ul className={styles.links}>
          <li>
            <Link href="/#home">Home</Link>
          </li>
          <li>
            <Link href="/#about">About</Link>
          </li>
          <li>
            <Link href="/#plays">Selected Works</Link>
          </li>
          <li>
            <Link href="/productions">Productions</Link>
          </li>
          <li>
            <Link href="/cv">CV</Link>
          </li>
        </ul>
        <div className={styles.actions}>
          <div className={styles.desktopSocials}>
            <SocialLinks />
          </div>
          <a
            href="https://walker-montgomerie-designs-shop.fourthwall.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.merchButton}
            data-umami-event="merch-store"
            data-umami-event-placement="header"
          >
            Merch Store
          </a>
          <Link href="/#contact" className={styles.ctaButton}>
            Contact Me
          </Link>
        </div>
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMenu}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </nav>
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ''}`}
        inert={!isMenuOpen}
      >
        <Link href="/#home" onClick={closeMenu}>
          Home
        </Link>
        <Link href="/#about" onClick={closeMenu}>
          About
        </Link>
        <Link href="/#plays" onClick={closeMenu}>
          Selected Works
        </Link>
        <Link href="/productions" onClick={closeMenu}>
          Productions
        </Link>
        <Link href="/cv" onClick={closeMenu}>
          CV
        </Link>
        <Link href="/#contact" onClick={closeMenu}>
          Contact Me
        </Link>
        <a
          href="https://walker-montgomerie-designs-shop.fourthwall.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mobileMerchLink}
          data-umami-event="merch-store"
          data-umami-event-placement="mobile-menu"
          onClick={closeMenu}
        >
          Merch Store
        </a>
        <a
          href="https://www.ko-fi.com/williamlwalkermontgomerie"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mobileKofiLink}
          onClick={closeMenu}
        >
          Support Me on Ko-fi
        </a>
        <div className={styles.mobileSocials}>
          <SocialLinks />
        </div>
      </div>
    </header>
  );
}
