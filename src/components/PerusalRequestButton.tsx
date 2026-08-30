'use client';

import { useState } from 'react';
import styles from './PerusalRequestButton.module.css';
import PerusalRequestModal from './PerusalRequestModal';

type PerusalRequestButtonProps = {
  playTitle: string;
  /**
   * Fires whenever the perusal dialog opens or closes. Lets a parent dialog
   * (Modal.tsx) stand down its own Escape / focus-trap handling while this
   * nested dialog is on top.
   */
  onOpenChange?: (open: boolean) => void;
};

export default function PerusalRequestButton({
  playTitle,
  onOpenChange,
}: PerusalRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <>
      <button
        type="button"
        className={styles.perusalButton}
        onClick={() => setOpen(true)}
      >
        Request Perusal
      </button>
      <PerusalRequestModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        playTitle={playTitle}
      />
    </>
  );
}
