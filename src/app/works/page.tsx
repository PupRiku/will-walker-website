'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { worksData } from '@/data/works';
import styles from './page.module.css';
import { BsDownload } from 'react-icons/bs';

const genres = Array.from(new Set(worksData.map((w) => w.category))).sort();

export default function WorksPage() {
  const [isCastingModalOpen, setIsCastingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [publishedOnly, setPublishedOnly] = useState(false);

  const openCastingModal = () => setIsCastingModalOpen(true);
  const closeCastingModal = () => setIsCastingModalOpen(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeCastingModal();
    }
  }, []);

  useEffect(() => {
    if (isCastingModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCastingModalOpen, handleKeyDown]);

  const filteredWorks = worksData.filter((work) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      work.title.toLowerCase().includes(q) ||
      work.synopsis.toLowerCase().includes(q);
    const matchesGenre = selectedGenre === '' || work.category === selectedGenre;
    const matchesPublished = !publishedOnly || work.published === true;
    return matchesSearch && matchesGenre && matchesPublished;
  });

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.heading}>All Works</h1>

      <button
        className={styles.castingNoteButton}
        onClick={openCastingModal}
        aria-label="Note on Casting Flexibility"
      >
        <Image
          src="/images/casting_note_icon.png"
          alt=""
          width={120}
          height={120}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </button>

      <div className={styles.linksContainer}>
        <a
          href="/pdfs/royalties_scale.pdf"
          className={styles.royaltiesLink}
          download
        >
          <BsDownload />
          Download Royalties Scale
        </a>

        <Link
          href="https://forms.gle/NJfNUHBLG73Wbjdz7"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.globalApplyButton}
        >
          Apply for Performance Rights
        </Link>
      </div>

      <div className={styles.filterBar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by title or synopsis…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search plays by title or synopsis"
        />
        <div className={styles.filterControls}>
          <select
            className={styles.filterSelect}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          <label className={styles.publishedLabel}>
            <input
              type="checkbox"
              className={styles.publishedCheckbox}
              checked={publishedOnly}
              onChange={(e) => setPublishedOnly(e.target.checked)}
            />
            Published works only
          </label>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredWorks.map((work) => (
          <div className={styles.card} key={work.title}>
            {work.published && <div className={styles.ribbon}>Published</div>}
            <Image
              src={work.imageSrc}
              alt={`Cover for ${work.title}`}
              width={500}
              height={250}
              className={styles.cardImage}
            />
            <div className={styles.cardContent}>
              <div className={styles.metaInfo}>
                <p className={styles.category}>{work.category}</p>
                {work.runtime && (
                  <p className={styles.runtime}>{work.runtime}</p>
                )}
              </div>
              <h2 className={styles.title}>{work.title}</h2>
              <p className={styles.synopsis}>{work.synopsis}</p>
              {work.cast && (
                <p className={styles.cast}>
                  <b>Cast:</b> {work.cast}
                </p>
              )}

              <div className={styles.buttonGroup}>
                {work.pdfSrc && (
                  <a
                    href={work.pdfSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.button}
                  >
                    Read Sample
                  </a>
                )}
                {work.published && work.purchase && (
                  <a
                    href={work.purchase}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.button} ${styles.purchaseButton}`}
                  >
                    Purchase Rights
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`${styles.modalOverlay} ${
          isCastingModalOpen ? styles.isOpen : ''
        }`}
        onClick={closeCastingModal}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeCastingModal}
            className={styles.modalCloseButton}
            aria-label="Close modal"
          >
            &times;
          </button>
          <h2 className={styles.modalTitle}>Note on Casting Flexibility</h2>
          <div className={styles.modalText}>
            <p>
              While the roles in these plays were originally written with
              specific genders in mind, they are not gender-restricted.
              Directors and producers are encouraged to cast the best performers
              for each role, regardless of gender identity or expression. The
              tone, humor, and relationships of the play can be fully maintained
              with any combination of casting choices. This flexibility allows
              programs of all sizes and compositions—whether predominantly
              female, male, or mixed—to stage any of the productions
              successfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
