'use client';

import { useEffect, useRef } from 'react';
import styles from './AdminModal.module.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

type AdminModalProps = {
  onClose: () => void;
  titleId: string;
  eyebrow: string;
  title: string;
  width?: 'default' | 'compact';
  children: React.ReactNode;
};

export default function AdminModal({
  onClose,
  titleId,
  eyebrow,
  title,
  width = 'default',
  children,
}: AdminModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const inertedElements: Element[] = [];
    let node: Element | null = overlayRef.current;
    while (node && node.parentElement && node !== document.body) {
      const parent = node.parentElement;
      for (const sibling of Array.from(parent.children)) {
        if (sibling !== node && !sibling.hasAttribute('inert')) {
          sibling.setAttribute('inert', '');
          inertedElements.push(sibling);
        }
      }
      node = parent;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      for (const el of inertedElements) el.removeAttribute('inert');
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const panelClass =
    width === 'compact'
      ? `${styles.panel} ${styles.panelCompact}`
      : `${styles.panel} ${styles.panelDefault}`;

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeButtonRef}
          className={styles.close}
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className={styles.header}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        </div>

        {children}
      </div>
    </div>
  );
}
