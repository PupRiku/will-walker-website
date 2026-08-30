'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import styles from './PerusalRequestModal.module.css';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
  loading: () => (
    <div className={styles.captchaPlaceholder} aria-hidden="true">
      Loading verification…
    </div>
  ),
});

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const recipientEmail = process.env.NEXT_PUBLIC_RECIPIENT_EMAIL;
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://willwalkermontgomeriewrites.com'
  ).replace(/\/$/, '');

  const [captchaVerified, setCaptchaVerified] = useState(false);

  // The widget unmounts with the dialog, so a reopened dialog gets a fresh
  // gate rather than inheriting a solved captcha from the last time.
  useEffect(() => {
    if (!isOpen) setCaptchaVerified(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    // Same treatment Modal.tsx gives the page behind it: mark every sibling
    // subtree from this overlay up to <body> as inert so screen reader virtual
    // cursors and Tab cannot reach what is underneath. Because this dialog
    // portals to <body>, that covers the play modal when it opened us — only
    // one dialog is ever exposed to assistive tech. Elements that are already
    // inert are skipped so we do not clear state the play modal owns.
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
      // Clear inert before restoring focus so the trigger is focusable again.
      for (const el of inertedElements) el.removeAttribute('inert');
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Portalled to <body> so that, when the play modal opens this one, the two
  // dialogs are DOM siblings rather than nested — that is what lets the play
  // modal be inerted above. React still routes events through the component
  // tree, so Modal's stopPropagation on its content keeps a click on this
  // backdrop from closing the play modal too.
  return createPortal(
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="perusal-modal-title"
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
            value={`${baseUrl}/thank-you`}
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

          <div className={styles.captchaGroup}>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token: string | null) =>
                setCaptchaVerified(Boolean(token))
              }
            />
          </div>

          <div className={styles.submitGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!captchaVerified}
              aria-describedby="perusal-submit-help"
            >
              Send Request
            </button>
            <p
              id="perusal-submit-help"
              className={styles.helperText}
              aria-live="polite"
            >
              {captchaVerified
                ? 'Ready to send.'
                : 'Complete the verification above to enable sending.'}
            </p>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
