'use client';

import { useEffect, useRef } from 'react';
import styles from './PerusalRequestModal.module.css';

type PerusalRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  playTitle: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

export default function PerusalRequestModal({
  isOpen,
  onClose,
  playTitle,
}: PerusalRequestModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const recipientEmail = process.env.NEXT_PUBLIC_RECIPIENT_EMAIL;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

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
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
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
      aria-labelledby="perusal-modal-title"
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

        <h2 id="perusal-modal-title" className={styles.modalTitle}>
          Request Perusal Copy
        </h2>
        <p className={styles.modalSubtitle}>{playTitle}</p>

        <form
          action={`https://formsubmit.co/${recipientEmail}`}
          method="POST"
          className={styles.form}
        >
          <input
            type="hidden"
            name="_subject"
            value={`Perusal Request — ${playTitle}`}
          />
          <input
            type="hidden"
            name="_next"
            value="https://willwalkermontgomeriewrites.com/thank-you"
          />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="play" value={playTitle} />

          <div className={styles.formGroup} suppressHydrationWarning>
            <label htmlFor="perusal-name" className={styles.label}>
              Name
            </label>
            <input
              id="perusal-name"
              type="text"
              name="name"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup} suppressHydrationWarning>
            <label htmlFor="perusal-email" className={styles.label}>
              Email
            </label>
            <input
              id="perusal-email"
              type="email"
              name="email"
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}
