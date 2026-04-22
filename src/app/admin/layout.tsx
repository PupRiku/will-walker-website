'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const NAV_LINKS = [
  { href: '/admin/plays', label: 'Plays' },
  { href: '/admin/productions', label: 'Productions' },
  { href: '/admin/settings', label: 'Settings' },
];

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const adminUser = process.env.NEXT_PUBLIC_ADMIN_USER ?? 'admin';

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore network errors
    }
    window.location.href = '/admin';
  }

  return (
    <>
      <div className={styles.brand}>
        <span className={styles.brandName}>WLW Admin</span>
        <span className={styles.brandSub}>Will L. Walker · Playwright</span>
      </div>

      <hr className={styles.divider} />

      <nav className={styles.nav}>
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              onClick={onClose}
            >
              {label}
              {label === 'Settings' && (
                <span className={styles.soonBadge}>SOON</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.bottomSection}>
        <p className={styles.signedIn}>Signed in as {adminUser}</p>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile hamburger button */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`${styles.mobileSidebar} ${mobileOpen ? styles.mobileSidebarOpen : ''}`}
      >
        <button
          className={styles.mobileClose}
          onClick={closeMobile}
          aria-label="Close navigation menu"
        >
          &times;
        </button>
        <SidebarContent pathname={pathname} onClose={closeMobile} />
      </aside>

      {/* Main content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
