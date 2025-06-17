import Image from 'next/image';
import styles from './Modal.module.css';

type Play = {
  title: string;
  category: string;
  imageSrc: string;
  pdfSrc: string;
  cast: string;
  synopsis: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  play: Play | null;
};

export default function Modal({ isOpen, onClose, play }: ModalProps) {
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
    >
      <div className={styles.modalContent} onClick={handleContentClick}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
        >
          &times;
        </button>

        <div className={styles.modalBody}>
          <div className={styles.modalImage}>
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

            <h3 className={styles.modalHeading}>Cast Breakdown</h3>
            <p>{play.cast}</p>

            <a
              href={play.pdfSrc}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.modalButton}
            >
              Read Sample
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
