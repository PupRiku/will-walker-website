'use client';

import { useState } from 'react';
import styles from './PerusalRequestButton.module.css';
import PerusalRequestModal from './PerusalRequestModal';

type PerusalRequestButtonProps = {
  playTitle: string;
};

export default function PerusalRequestButton({
  playTitle,
}: PerusalRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.perusalButton}
        onClick={() => setIsOpen(true)}
      >
        Request Perusal
      </button>
      <PerusalRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        playTitle={playTitle}
      />
    </>
  );
}
