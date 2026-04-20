'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { worksData } from '@/data/works';
import styles from './page.module.css';
import { BsDownload } from 'react-icons/bs';

const genres = Array.from(new Set(worksData.map((w) => w.category))).sort();

function classifyRuntime(
  runtime: string | undefined
): 'short' | 'medium' | 'long' | 'full' | null {
  if (!runtime) return null;
  if (runtime === 'Full Length') return 'full';
  const match = runtime.match(/\d+/);
  if (!match) return null;
  const minutes = parseInt(match[0], 10);
  if (minutes < 30) return 'short';
  if (minutes < 60) return 'medium';
  return 'long';
}

function parseCastSize(cast: string): number | null {
  if (!cast) return null;
  if (/flexible|various|ensemble/i.test(cast)) return null;
  const numbers = cast.match(/\d+/g);
  if (!numbers) return null;
  return numbers.reduce((sum, n) => sum + parseInt(n, 10), 0);
}

function parseRuntimeForSort(runtime: string | undefined): number {
  if (!runtime || runtime === 'TBD' || runtime === 'Collection') return Infinity;
  const match = runtime.match(/\d+/);
  if (!match) return Infinity;
  return parseInt(match[0], 10);
}

function parseCastForSort(cast: string): number {
  if (!cast || cast === 'TBD') return Infinity;
  const matches = [...cast.matchAll(/(\d+)\s*(?:NB|V\.O\.|VO|[MF])(?![a-zA-Z])/g)];
  if (matches.length === 0) return Infinity;
  return matches.reduce((sum, m) => sum + parseInt(m[1], 10), 0);
}

export default function WorksPage() {
  const [isCastingModalOpen, setIsCastingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [publishedOnly, setPublishedOnly] = useState(false);
  const [runtimeBucket, setRuntimeBucket] = useState<
    '' | 'short' | 'medium' | 'long' | 'full'
  >('');
  const [castBucket, setCastBucket] = useState<
    '' | 'small' | 'medium' | 'large'
  >('');
  const [sortOrder, setSortOrder] = useState<
    | ''
    | 'title-asc'
    | 'title-desc'
    | 'runtime-asc'
    | 'runtime-desc'
    | 'cast-asc'
    | 'cast-desc'
  >('');

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setPublishedOnly(false);
    setRuntimeBucket('');
    setCastBucket('');
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedGenre !== '' ||
    publishedOnly ||
    runtimeBucket !== '' ||
    castBucket !== '';

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

    const matchesRuntime = (() => {
      if (runtimeBucket === '') return true;
      const bucket = classifyRuntime(work.runtime);
      return bucket === null || bucket === runtimeBucket;
    })();

    const matchesCast = (() => {
      if (castBucket === '') return true;
      const size = parseCastSize(work.cast);
      if (size === null) return true;
      if (castBucket === 'small') return size <= 5;
      if (castBucket === 'medium') return size >= 6 && size <= 12;
      return size >= 13;
    })();

    return matchesSearch && matchesGenre && matchesPublished && matchesRuntime && matchesCast;
  });

  const sortedWorks = (() => {
    if (sortOrder === '') return filteredWorks;
    const sorted = [...filteredWorks];
    if (sortOrder === 'title-asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'title-desc') {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOrder === 'runtime-asc') {
      sorted.sort((a, b) => parseRuntimeForSort(a.runtime) - parseRuntimeForSort(b.runtime));
    } else if (sortOrder === 'runtime-desc') {
      sorted.sort((a, b) => parseRuntimeForSort(b.runtime) - parseRuntimeForSort(a.runtime));
    } else if (sortOrder === 'cast-asc') {
      sorted.sort((a, b) => parseCastForSort(a.cast) - parseCastForSort(b.cast));
    } else if (sortOrder === 'cast-desc') {
      sorted.sort((a, b) => parseCastForSort(b.cast) - parseCastForSort(a.cast));
    }
    return sorted;
  })();

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

      <div className={styles.filterBarOuter}>
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
          <select
            className={styles.filterSelect}
            value={runtimeBucket}
            onChange={(e) =>
              setRuntimeBucket(
                e.target.value as '' | 'short' | 'medium' | 'long' | 'full'
              )
            }
            aria-label="Filter by runtime"
          >
            <option value="">All Runtimes</option>
            <option value="short">Short (under 30 min)</option>
            <option value="medium">Medium (30–60 min)</option>
            <option value="long">Long (60+ min)</option>
            <option value="full">Full Length</option>
          </select>
          <select
            className={styles.filterSelect}
            value={castBucket}
            onChange={(e) =>
              setCastBucket(e.target.value as '' | 'small' | 'medium' | 'large')
            }
            aria-label="Filter by cast size"
          >
            <option value="">All Cast Sizes</option>
            <option value="small">Small (1–5)</option>
            <option value="medium">Medium (6–12)</option>
            <option value="large">Large (13+)</option>
          </select>
          <label className={styles.sortLabel}>
            <span>Sort by</span>
            <select
              className={styles.filterSelect}
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value as
                    | ''
                    | 'title-asc'
                    | 'title-desc'
                    | 'runtime-asc'
                    | 'runtime-desc'
                    | 'cast-asc'
                    | 'cast-desc'
                )
              }
              aria-label="Sort by"
            >
              <option value="">Default Order</option>
              <option value="title-asc">Title: A → Z</option>
              <option value="title-desc">Title: Z → A</option>
              <option value="runtime-asc">Runtime: Shortest First</option>
              <option value="runtime-desc">Runtime: Longest First</option>
              <option value="cast-asc">Cast Size: Smallest First</option>
              <option value="cast-desc">Cast Size: Largest First</option>
            </select>
          </label>
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
      </div>

      <div className={styles.filterMeta}>
        <p className={styles.resultCount}>
          Showing {filteredWorks.length} of {worksData.length} plays
        </p>
        {isFiltered && (
          <button className={styles.clearFiltersButton} onClick={clearFilters}>
            Clear all filters
          </button>
        )}
      </div>

      {sortedWorks.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            No plays match your current filters.
          </p>
          <button className={styles.button} onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      ) : (
      <div className={styles.grid}>
        {sortedWorks.map((work) => (
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
      )}
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
