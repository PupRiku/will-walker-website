'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Modal.module.css';
import { Work } from '@/types/play';
import { APPLY_FOR_RIGHTS_URL } from '@/lib/constants';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  play: Work | null;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

export default function Modal({ isOpen, onClose, play }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    // Mark every sibling subtree from the overlay up to <body> as inert so
    // screen reader virtual cursors and Tab can't reach background content.
    // Skip elements that are already inert so we don't clobber state owned
    // elsewhere (e.g. the header's mobile menu).
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
      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusables = Array.from(
        contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
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
      // Clear inert before restoring focus so the trigger element is
      // focusable when we hand focus back to it.
      for (const el of inertedElements) el.removeAttribute('inert');
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !play) {
    return null;
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={overlayRef}
    >
      <div
        className={styles.modalContent}
        onClick={handleContentClick}
        ref={contentRef}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
          ref={closeButtonRef}
        >
          &times;
        </button>

        <div className={styles.modalBody}>
          <div className={styles.modalImage}>
            {play.published && <div className={styles.ribbon}>Published</div>}
            <Image
              src={play.imageSrc}
              alt={`Cover for ${play.title}`}
              width={400}
              height={600}
            />
          </div>
          <div className={styles.modalText}>
            <h2 id="modal-title" className={styles.modalTitle}>
              {play.title}
            </h2>
            <p className={styles.modalGenre}>{play.category}</p>

            <h3 className={styles.modalHeading}>Synopsis</h3>
            <p>{play.synopsis}</p>

            {play.cast && (
              <>
                <h3 className={styles.modalHeading}>Cast Breakdown</h3>
                <p>{play.cast}</p>
              </>
            )}

            {play.runtime && (
              <>
                <h3 className={styles.modalHeading}>Runtime</h3>
                <p>{play.runtime}</p>
              </>
            )}

            <div className={styles.buttonGroup}>
              {play.pdfSrc && (
                <a
                  href={play.pdfSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalButton}
                >
                  Read Sample
                </a>
              )}
              {play.published && play.purchase ? (
                <a
                  href={play.purchase}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalButton}
                >
                  Purchase Rights
                </a>
              ) : (
                <a
                  href={APPLY_FOR_RIGHTS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.modalButton} ${styles.applyButton}`}
                >
                  Apply for Rights
                </a>
              )}
            </div>
            <Link href={`/works/${play.slug}`} className={styles.viewPageLink}>
              View Full Page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
