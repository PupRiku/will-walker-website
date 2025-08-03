'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <Link href="/#home">
            <Image
              className={styles.logoImage}
              src="/images/logo.png"
              alt="William L. Walker Montgomerie's circular logo"
              width={500}
              height={500}
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
            <Link href="/cv">CV</Link>
          </li>
        </ul>
        <div className={styles.actions}>
          <Link href="/#contact" className={styles.ctaButton}>
            Contact Me
          </Link>
        </div>
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMenu}
          aria-label="Open navigation menu"
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
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ''}`}
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
        <Link href="/cv" onClick={closeMenu}>
          CV
        </Link>
        <Link href="/#contact" onClick={closeMenu}>
          Contact Me
        </Link>
      </div>
    </header>
  );
}
