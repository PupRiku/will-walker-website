'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { Play } from '@/types/play';
import styles from './page.module.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const GENRES = [
  'Drama',
  'Comedy',
  'Historical Drama',
  "Children's Play",
  'Political Satire',
  'Thriller',
  'SciFi/Fantasy',
  'Radio Play',
  'One Act Play',
  'Screenplay',
  'Comedy/Drama',
  'Theater for Youth',
  'Collection',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getAuthHeader(): string {
  const user = process.env.NEXT_PUBLIC_ADMIN_USER ?? '';
  const pass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';
  return 'Basic ' + btoa(`${user}:${pass}`);
}

// ── Form state type ────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  slug: string;
  category: string;
  runtime: string;
  cast: string;
  synopsis: string;
  pdfSrc: string;
  purchase: string;
  imageSrc: string;
  published: boolean;
  featured: boolean;
};

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  category: GENRES[0],
  runtime: '',
  cast: '',
  synopsis: '',
  pdfSrc: '',
  purchase: '',
  imageSrc: '',
  published: false,
  featured: false,
};

function playToForm(play: Play): FormState {
  return {
    title: play.title,
    slug: play.slug,
    category: play.category,
    runtime: play.runtime,
    cast: play.cast,
    synopsis: play.synopsis,
    pdfSrc: play.pdfSrc,
    purchase: play.purchase,
    imageSrc: play.imageSrc,
    published: play.published,
    featured: play.featured,
  };
}

// ── Upload zone component ──────────────────────────────────────────────────────

function UploadZone({
  onUpload,
  uploading,
  error,
}: {
  onUpload: (url: string) => void;
  uploading: boolean;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Upload failed');
    }
    const { url } = await res.json();
    onUpload(url);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]).catch(() => {});
  }

  return (
    <div
      className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ''} ${uploading ? styles.uploadZoneUploading : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !uploading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
      aria-label="Upload cover image"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.uploadInput}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploading ? (
        <p className={styles.uploadText}>Uploading…</p>
      ) : (
        <>
          <p className={styles.uploadText}>
            Drop a new cover here
            <br />
            <span className={styles.uploadSub}>or browse your computer</span>
          </p>
          <p className={styles.uploadHint}>
            JPG · PNG · WEBP · Up to 4MB · 3:4 ratio recommended
          </p>
        </>
      )}
      {error && <p className={styles.uploadError}>{error}</p>}
    </div>
  );
}

// ── Toggle card ────────────────────────────────────────────────────────────────

function ToggleCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`${styles.toggleCard} ${checked ? styles.toggleCardOn : ''}`}>
      <div className={styles.toggleCardText}>
        <span className={styles.toggleCardLabel}>{label}</span>
        <span className={styles.toggleCardDesc}>{description}</span>
      </div>
      <div className={`${styles.toggleSwitch} ${checked ? styles.toggleSwitchOn : ''}`}>
        <div className={styles.toggleThumb} />
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.toggleInput}
      />
    </label>
  );
}

// ── Play modal ─────────────────────────────────────────────────────────────────

function PlayModal({
  editingPlay,
  onClose,
  onSaved,
}: {
  editingPlay: Play | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = editingPlay === null;
  const [form, setForm] = useState<FormState>(
    isNew ? EMPTY_FORM : playToForm(editingPlay)
  );
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugEdited) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const url = isNew
        ? '/api/plays'
        : `/api/plays/${editingPlay!.slug}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onSaved();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalPanel} role="dialog" aria-modal="true">
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className={styles.modalHeader}>
          <p className={styles.modalEyebrow}>
            {isNew ? 'NEW PLAY' : 'EDITING'}
          </p>
          <h2 className={styles.modalTitle}>
            {isNew ? 'New Play' : editingPlay!.title}
          </h2>
        </div>

        <div className={styles.formGrid}>
          {/* Title — full width */}
          <div className={styles.fieldFull}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Play title"
            />
          </div>

          {/* Slug */}
          <div className={styles.fieldFull}>
            <label className={styles.label}>Slug</label>
            <input
              type="text"
              className={styles.input}
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setField('slug', e.target.value);
              }}
              placeholder="url-safe-slug"
            />
            <p className={styles.fieldHint}>/works/{form.slug || '…'}</p>
          </div>

          {/* Genre */}
          <div className={styles.field}>
            <label className={styles.label}>Genre / Category</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Runtime */}
          <div className={styles.field}>
            <label className={styles.label}>Runtime</label>
            <input
              type="text"
              className={styles.input}
              value={form.runtime}
              onChange={(e) => setField('runtime', e.target.value)}
              placeholder="e.g. 90 minutes"
            />
          </div>

          {/* Cast — full width */}
          <div className={styles.fieldFull}>
            <label className={styles.label}>Cast</label>
            <input
              type="text"
              className={styles.input}
              value={form.cast}
              onChange={(e) => setField('cast', e.target.value)}
              placeholder="e.g. 3M/2F"
            />
          </div>

          {/* Synopsis — full width */}
          <div className={styles.fieldFull}>
            <label className={styles.label}>Synopsis</label>
            <textarea
              className={styles.textarea}
              rows={6}
              value={form.synopsis}
              onChange={(e) => setField('synopsis', e.target.value)}
              placeholder="2–4 sentence description"
            />
          </div>

          {/* PDF URL */}
          <div className={styles.field}>
            <label className={styles.label}>Sample PDF URL</label>
            <input
              type="text"
              className={styles.input}
              value={form.pdfSrc}
              onChange={(e) => setField('pdfSrc', e.target.value)}
              placeholder="https://…"
            />
          </div>

          {/* Purchase URL */}
          <div className={styles.field}>
            <label className={styles.label}>Purchase URL</label>
            <input
              type="text"
              className={styles.input}
              value={form.purchase}
              onChange={(e) => setField('purchase', e.target.value)}
              placeholder="https://…"
            />
          </div>

          {/* Cover Image — full width */}
          <div className={styles.fieldFull}>
            <label className={styles.label}>Cover Image</label>
            <div className={styles.coverRow}>
              {form.imageSrc && (
                <div className={styles.currentCover}>
                  <p className={styles.currentCoverLabel}>CURRENT</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageSrc}
                    alt="Current cover"
                    className={styles.currentCoverImg}
                  />
                </div>
              )}
              <UploadZone
                onUpload={(url) => {
                  setUploading(false);
                  setUploadError(null);
                  setField('imageSrc', url);
                }}
                uploading={uploading}
                error={uploadError}
              />
            </div>
          </div>

          {/* Visibility toggles — full width */}
          <div className={styles.fieldFull}>
            <label className={styles.label}>Visibility</label>
            <div className={styles.toggleRow}>
              <ToggleCard
                label="Published"
                description="Visible on the public site"
                checked={form.published}
                onChange={(v) => setField('published', v)}
              />
              <ToggleCard
                label="Featured"
                description="Eligible for the homepage carousel"
                checked={form.featured}
                onChange={(v) => setField('featured', v)}
              />
            </div>
          </div>
        </div>

        {saveError && <p className={styles.saveError}>{saveError}</p>}

        <div className={styles.modalFooter}>
          {!isNew && (
            <p className={styles.lastSaved}>
              LAST SAVED · {timeAgo(editingPlay!.updatedAt)}
            </p>
          )}
          <div className={styles.modalActions}>
            <button className={styles.btnSecondary} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Saving…' : 'Save Play'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete modal ───────────────────────────────────────────────────────────────

function DeleteModal({
  play,
  onClose,
  onDeleted,
}: {
  play: Play;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/plays/${play.slug}`, {
        method: 'DELETE',
        headers: { Authorization: getAuthHeader() },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.deletePanel} role="dialog" aria-modal="true">
        <p className={styles.deleteEyebrow}>CONFIRM DELETION</p>
        <h2 className={styles.deleteTitle}>Delete &ldquo;{play.title}&rdquo;?</h2>
        <p className={styles.deleteBody}>
          This will remove the play from your catalog along with its cover,
          synopsis, and any featured-carousel placement. This cannot be undone.
        </p>
        {error && <p className={styles.saveError}>{error}</p>}
        <div className={styles.deleteActions}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Play'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [playModal, setPlayModal] = useState<Play | null | 'new'>(null);
  const [deleteModal, setDeleteModal] = useState<Play | null>(null);

  const fetchPlays = useCallback(async () => {
    setFetchError(false);
    try {
      const res = await fetch('/api/plays');
      if (!res.ok) throw new Error('fetch failed');
      setPlays(await res.json());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  const featuredPlays = plays
    .filter((p) => p.featured && p.featuredOrder !== null)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

  async function handleFeatureOrder(play: Play, direction: 'up' | 'down') {
    // Optimistic update
    const idx = featuredPlays.findIndex((p) => p.slug === play.slug);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= featuredPlays.length) return;

    const swapPlay = featuredPlays[swapIdx];
    setPlays((prev) =>
      prev.map((p) => {
        if (p.slug === play.slug) return { ...p, featuredOrder: swapPlay.featuredOrder };
        if (p.slug === swapPlay.slug) return { ...p, featuredOrder: play.featuredOrder };
        return p;
      })
    );

    try {
      await fetch(`/api/plays/${play.slug}/feature-order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({ direction }),
      });
    } catch {
      // ignore — refetch will correct any divergence
    }
    await fetchPlays();
  }

  function handleModalSaved() {
    setPlayModal(null);
    fetchPlays();
  }

  function handleDeleted() {
    setDeleteModal(null);
    fetchPlays();
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.breadcrumb}>/ADMIN</p>
          <h1 className={styles.pageTitle}>Plays</h1>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => setPlayModal('new')}
        >
          + Add New Play
        </button>
      </div>

      {loading ? (
        <p className={styles.stateMsg}>Loading…</p>
      ) : fetchError ? (
        <p className={styles.stateMsg}>
          Failed to load plays.{' '}
          <button className={styles.retryLink} onClick={fetchPlays}>
            Retry
          </button>
        </p>
      ) : (
        <>
          {/* Featured Carousel Order */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Featured Carousel Order</h2>
              <span className={styles.sectionCount}>
                {featuredPlays.length} IN ROTATION
              </span>
            </div>
            <div className={styles.carouselCard}>
              {featuredPlays.length === 0 ? (
                <p className={styles.emptyMsg}>No plays are marked as featured.</p>
              ) : (
                <ol className={styles.featureList}>
                  {featuredPlays.map((play, idx) => (
                    <li key={play.slug} className={styles.featureRow}>
                      <span className={styles.featureNum}>{idx + 1}</span>
                      <div className={styles.featureThumb}>
                        <Image
                          src={play.imageSrc}
                          alt={`Cover for ${play.title}`}
                          width={40}
                          height={60}
                          className={styles.thumbImg}
                        />
                      </div>
                      <span className={styles.featureTitle}>{play.title}</span>
                      <div className={styles.featureArrows}>
                        <button
                          className={styles.arrowBtn}
                          onClick={() => handleFeatureOrder(play, 'up')}
                          disabled={idx === 0}
                          aria-label="Move up"
                        >
                          ▲
                        </button>
                        <button
                          className={styles.arrowBtn}
                          onClick={() => handleFeatureOrder(play, 'down')}
                          disabled={idx === featuredPlays.length - 1}
                          aria-label="Move down"
                        >
                          ▼
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          {/* All Plays table */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Plays</h2>
              <span className={styles.sectionCount}>{plays.length} TOTAL</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHead}>
                    <th className={styles.th}>Cover</th>
                    <th className={styles.th}>Title</th>
                    <th className={styles.th}>Genre</th>
                    <th className={styles.th}>Runtime</th>
                    <th className={styles.th}>Published</th>
                    <th className={styles.th}>Featured</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plays.map((play, idx) => (
                    <tr
                      key={play.slug}
                      className={idx % 2 === 1 ? styles.trAlt : styles.tr}
                    >
                      <td className={styles.td}>
                        <div className={styles.featureThumb}>
                          <Image
                            src={play.imageSrc}
                            alt={`Cover for ${play.title}`}
                            width={40}
                            height={60}
                            className={styles.thumbImg}
                          />
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.playTitle}>{play.title}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.metaText}>{play.category}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.metaText}>{play.runtime}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={play.published ? styles.badgeYes : styles.badgeNo}>
                          {play.published ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={play.featured ? styles.badgeYes : styles.badgeNo}>
                          {play.featured ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => setPlayModal(play)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => setDeleteModal(play)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Play modal */}
      {playModal !== null && (
        <PlayModal
          editingPlay={playModal === 'new' ? null : playModal}
          onClose={() => setPlayModal(null)}
          onSaved={handleModalSaved}
        />
      )}

      {/* Delete modal */}
      {deleteModal !== null && (
        <DeleteModal
          play={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
