'use client';

import { useState, useEffect, useCallback, useRef, useId, KeyboardEvent } from 'react';
import type { Production, ProductionPhoto } from '@/types/production';
import type { Play } from '@/types/play';
import styles from './page.module.css';

// ── Auth helper ───────────────────────────────────────────────────────────────

function getAuthHeader(): string {
  const user = process.env.NEXT_PUBLIC_ADMIN_USER ?? '';
  const pass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';
  return 'Basic ' + btoa(`${user}:${pass}`);
}

// ── Upload zone ───────────────────────────────────────────────────────────────

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
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => !uploading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
      aria-label="Upload production photo"
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
            Drop a photo here
            <br />
            <span className={styles.uploadSub}>or browse your computer</span>
          </p>
          <p className={styles.uploadHint}>JPG · PNG · WEBP · Up to 4MB</p>
        </>
      )}
      {error && <p className={styles.uploadError}>{error}</p>}
    </div>
  );
}

// ── Play title searchable dropdown ────────────────────────────────────────────

function PlayTitleDropdown({
  value,
  onChange,
  plays,
}: {
  value: string;
  onChange: (title: string) => void;
  plays: Play[];
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const filtered = query.trim() === ''
    ? plays
    : plays.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));

  function select(title: string) {
    setQuery(title);
    onChange(title);
    setOpen(false);
    setFocusedIdx(-1);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
    setFocusedIdx(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        setFocusedIdx(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setFocusedIdx(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusedIdx >= 0 && filtered[focusedIdx]) {
      e.preventDefault();
      select(filtered[focusedIdx].title);
    }
  }

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setOpen(false);
    // If the query doesn't match any play title exactly, keep it as custom text
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIdx >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIdx] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIdx]);

  return (
    <div ref={containerRef} className={styles.dropdownWrap} onBlur={handleBlur}>
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Type to search plays…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={listId}
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          className={styles.dropdownList}
          role="listbox"
          aria-label="Play titles"
        >
          {filtered.map((play, idx) => (
            <li
              key={play.slug}
              className={`${styles.dropdownItem} ${idx === focusedIdx ? styles.dropdownItemFocused : ''}`}
              role="option"
              aria-selected={idx === focusedIdx}
              onMouseDown={(e) => { e.preventDefault(); select(play.title); }}
              onMouseEnter={() => setFocusedIdx(idx)}
            >
              {play.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────────────────────

type PhotoFormState = {
  playTitle: string;
  productionYear: string;
  venue: string;
  alt: string;
  caption: string;
  src: string;
  productionId: string | null;
};

const EMPTY_FORM: PhotoFormState = {
  playTitle: '',
  productionYear: String(new Date().getFullYear()),
  venue: '',
  alt: '',
  caption: '',
  src: '',
  productionId: null,
};

function photoToForm(photo: ProductionPhoto): PhotoFormState {
  return {
    playTitle: photo.playTitle,
    productionYear: String(photo.productionYear),
    venue: photo.venue,
    alt: photo.alt,
    caption: photo.caption ?? '',
    src: photo.src,
    productionId: photo.productionId,
  };
}

// ── Photo card ────────────────────────────────────────────────────────────────

function PhotoCard({
  photo,
  isFirst,
  isLast,
  onEdit,
  onDeleted,
  onMoveUp,
  onMoveDown,
}: {
  photo: ProductionPhoto;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDeleted: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/productions/${photo.id}`, {
        method: 'DELETE',
        headers: { Authorization: getAuthHeader() },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onDeleted();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.photoCard}>
      <div className={styles.photoThumbWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.alt} className={styles.photoThumb} />
      </div>

      {photo.caption && (
        <p className={styles.photoCaption}>{photo.caption}</p>
      )}

      <p className={styles.photoAltMeta}>ALT · {photo.alt.length} CHARS</p>

      {/* Order arrows */}
      <div className={styles.photoArrows}>
        <button
          className={styles.arrowBtn}
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move photo up"
        >▲</button>
        <button
          className={styles.arrowBtn}
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move photo down"
        >▼</button>
      </div>

      {confirming ? (
        <div className={styles.inlineConfirm}>
          <span className={styles.inlineConfirmText}>Are you sure?</span>
          {deleteError && <span className={styles.inlineError}>{deleteError}</span>}
          <div className={styles.inlineConfirmBtns}>
            <button className={styles.btnConfirmDelete} onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? '…' : 'Yes'}
            </button>
            <button className={styles.btnCancelDelete} onClick={() => { setConfirming(false); setDeleteError(null); }} disabled={deleting}>
              No
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.photoCardActions}>
          <button className={styles.btnIconEdit} onClick={onEdit} aria-label="Edit photo">✎</button>
          <button className={styles.btnIconDelete} onClick={() => setConfirming(true)} aria-label="Delete photo">✕</button>
        </div>
      )}
    </div>
  );
}

// ── Photo modal ───────────────────────────────────────────────────────────────

function PhotoModal({
  editingPhoto,
  initialForm,
  plays,
  onClose,
  onSaved,
  groupPhotoCount,
}: {
  editingPhoto: ProductionPhoto | null;
  initialForm?: Partial<PhotoFormState>;
  plays: Play[];
  onClose: () => void;
  onSaved: () => void;
  groupPhotoCount: number;
}) {
  const isNew = editingPhoto === null;
  const [form, setForm] = useState<PhotoFormState>(
    isNew ? { ...EMPTY_FORM, ...initialForm } : photoToForm(editingPhoto)
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function setField<K extends keyof PhotoFormState>(key: K, value: PhotoFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const year = parseInt(form.productionYear, 10);
    if (isNaN(year)) {
      setSaveError('Production year must be a number');
      setSaving(false);
      return;
    }
    const payload: Record<string, unknown> = {
      src: form.src.trim(),
      alt: form.alt.trim(),
      caption: form.caption.trim() || null,
      playTitle: form.playTitle.trim(),
      productionYear: year,
      venue: form.venue.trim(),
      displayOrder: isNew ? groupPhotoCount : editingPhoto!.displayOrder,
    };
    if (isNew && form.productionId) {
      payload.productionId = form.productionId;
    }
    try {
      const url = isNew ? '/api/productions' : `/api/productions/${editingPhoto!.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify(payload),
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
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">&times;</button>

        <div className={styles.modalHeader}>
          <p className={styles.modalEyebrow}>{isNew ? 'NEW PHOTO' : 'EDITING PHOTO'}</p>
          <h2 className={styles.modalTitle}>
            {isNew ? 'Add Production Photo' : editingPhoto!.playTitle}
          </h2>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Play Title</label>
            <PlayTitleDropdown
              value={form.playTitle}
              onChange={(title) => setField('playTitle', title)}
              plays={plays}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Production Year</label>
            <input
              type="number"
              className={styles.input}
              value={form.productionYear}
              onChange={(e) => setField('productionYear', e.target.value)}
              min={1900}
              max={2100}
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Venue</label>
            <input
              type="text"
              className={styles.input}
              value={form.venue}
              onChange={(e) => setField('venue', e.target.value)}
              placeholder="e.g. Paris Community Theatre, Paris, TX"
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Alt Text</label>
            <input
              type="text"
              className={styles.input}
              value={form.alt}
              onChange={(e) => setField('alt', e.target.value)}
              placeholder="Describe the photo for screen readers"
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>
              Caption <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={form.caption}
              onChange={(e) => setField('caption', e.target.value)}
              placeholder="Short caption shown below the photo"
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Photo</label>
            <div className={styles.photoUploadRow}>
              {form.src && (
                <div className={styles.currentPhoto}>
                  <p className={styles.currentPhotoLabel}>CURRENT</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.src} alt="Current photo" className={styles.currentPhotoImg} />
                </div>
              )}
              <UploadZone
                onUpload={(url) => {
                  setUploading(false);
                  setUploadError(null);
                  setField('src', url);
                }}
                uploading={uploading}
                error={uploadError}
              />
            </div>
          </div>
        </div>

        {saveError && <p className={styles.saveError}>{saveError}</p>}

        <div className={styles.modalFooter}>
          <div className={styles.modalActions}>
            <button className={styles.btnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
            <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Saving…' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal state type ───────────────────────────────────────────────────────────

type PhotoModalState =
  | { mode: 'new'; context: Partial<PhotoFormState>; groupPhotoCount: number }
  | { mode: 'edit'; photo: ProductionPhoto; groupPhotoCount: number }
  | null;

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [photoModal, setPhotoModal] = useState<PhotoModalState>(null);

  const fetchProductions = useCallback(async () => {
    setFetchError(false);
    try {
      const res = await fetch('/api/productions');
      if (!res.ok) throw new Error('fetch failed');
      setProductions(await res.json());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductions();
    // Fetch plays for the searchable dropdown
    fetch('/api/plays')
      .then((r) => r.ok ? r.json() : [])
      .then((data: Play[]) => setPlays(data))
      .catch(() => {});
  }, [fetchProductions]);

  // ── Group ordering ──────────────────────────────────────────────────────────

  async function handleGroupOrder(production: Production, direction: 'up' | 'down') {
    const idx = productions.findIndex((p) => p.id === production.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= productions.length) return;

    // Optimistic update
    const swapProd = productions[swapIdx];
    setProductions((prev) =>
      prev.map((p) => {
        if (p.id === production.id) return { ...p, displayOrder: swapProd.displayOrder };
        if (p.id === swapProd.id) return { ...p, displayOrder: production.displayOrder };
        return p;
      }).sort((a, b) => a.displayOrder - b.displayOrder)
    );

    try {
      await fetch(`/api/productions/groups/${production.id}/display-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({ direction }),
      });
    } catch {
      // ignore — refetch will correct divergence
    }
    await fetchProductions();
  }

  // ── Photo ordering ──────────────────────────────────────────────────────────

  async function handlePhotoOrder(
    production: Production,
    photo: ProductionPhoto,
    direction: 'up' | 'down'
  ) {
    const photos = production.photos;
    const idx = photos.findIndex((p) => p.id === photo.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= photos.length) return;

    // Optimistic update
    const swapPhoto = photos[swapIdx];
    setProductions((prev) =>
      prev.map((prod) => {
        if (prod.id !== production.id) return prod;
        return {
          ...prod,
          photos: prod.photos
            .map((ph) => {
              if (ph.id === photo.id) return { ...ph, displayOrder: swapPhoto.displayOrder };
              if (ph.id === swapPhoto.id) return { ...ph, displayOrder: photo.displayOrder };
              return ph;
            })
            .sort((a, b) => a.displayOrder - b.displayOrder),
        };
      })
    );

    try {
      await fetch(`/api/productions/${photo.id}/display-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({ direction }),
      });
    } catch {
      // ignore — refetch will correct divergence
    }
    await fetchProductions();
  }

  function openNewPhoto(context: Partial<PhotoFormState>, groupPhotoCount: number) {
    setPhotoModal({ mode: 'new', context, groupPhotoCount });
  }

  function openEditPhoto(photo: ProductionPhoto, groupPhotoCount: number) {
    setPhotoModal({ mode: 'edit', photo, groupPhotoCount });
  }

  function handleModalSaved() {
    setPhotoModal(null);
    fetchProductions();
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.breadcrumb}>/ADMIN</p>
          <h1 className={styles.pageTitle}>Productions</h1>
        </div>
        <button className={styles.btnPrimary} onClick={() => openNewPhoto({}, 0)}>
          + Add New Production Photo
        </button>
      </div>

      <p className={styles.helperText}>
        Production photos are grouped by staging. Add new images to an existing
        production, or create a new group from the button above.
      </p>

      {loading ? (
        <p className={styles.stateMsg}>Loading…</p>
      ) : fetchError ? (
        <p className={styles.stateMsg}>
          Failed to load productions.{' '}
          <button className={styles.retryLink} onClick={fetchProductions}>Retry</button>
        </p>
      ) : productions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No production photos yet.</p>
          <button className={styles.btnPrimary} onClick={() => openNewPhoto({}, 0)}>
            Add the first one
          </button>
        </div>
      ) : (
        <>
          {/* Production Order section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Production Order</h2>
              <span className={styles.sectionCount}>{productions.length} GROUPS</span>
            </div>
            <div className={styles.orderCard}>
              <ol className={styles.orderList}>
                {productions.map((production, idx) => (
                  <li key={production.id} className={styles.orderRow}>
                    <span className={styles.orderNum}>{idx + 1}</span>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderTitle}>{production.playTitle}</span>
                      <span className={styles.orderSub}>
                        {production.venue} · {production.productionYear}
                      </span>
                    </div>
                    <div className={styles.orderArrows}>
                      <button
                        className={styles.arrowBtn}
                        onClick={() => handleGroupOrder(production, 'up')}
                        disabled={idx === 0}
                        aria-label="Move production group up"
                      >▲</button>
                      <button
                        className={styles.arrowBtn}
                        onClick={() => handleGroupOrder(production, 'down')}
                        disabled={idx === productions.length - 1}
                        aria-label="Move production group down"
                      >▼</button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Productions list */}
          <div className={styles.productionsList}>
            {productions.map((production) => {
              const groupKey = `${production.playTitle}::${production.productionYear}::${production.venue}`;
              const groupContext: Partial<PhotoFormState> = {
                playTitle: production.playTitle,
                productionYear: String(production.productionYear),
                venue: production.venue,
                productionId: production.id,
              };

              return (
                <section key={groupKey} className={styles.productionGroup}>
                  <div className={styles.groupHeader}>
                    <div className={styles.groupMeta}>
                      <h2 className={styles.groupTitle}>{production.playTitle}</h2>
                      <p className={styles.groupSub}>
                        {production.venue} · {production.productionYear}
                      </p>
                    </div>
                    <div className={styles.groupActions}>
                      <span className={styles.photoCount}>
                        {production.photos.length}{' '}
                        {production.photos.length === 1 ? 'photo' : 'photos'}
                      </span>
                      <button
                        className={styles.btnEditGroup}
                        onClick={() => openNewPhoto(groupContext, production.photos.length)}
                      >
                        + Add photo
                      </button>
                    </div>
                  </div>

                  <div className={styles.photoStrip}>
                    {production.photos.map((photo, photoIdx) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        isFirst={photoIdx === 0}
                        isLast={photoIdx === production.photos.length - 1}
                        onEdit={() => openEditPhoto(photo, production.photos.length)}
                        onDeleted={fetchProductions}
                        onMoveUp={() => handlePhotoOrder(production, photo, 'up')}
                        onMoveDown={() => handlePhotoOrder(production, photo, 'down')}
                      />
                    ))}

                    <button
                      className={styles.addPhotoTile}
                      onClick={() => openNewPhoto(groupContext, production.photos.length)}
                      aria-label={`Add photo to ${production.playTitle}`}
                    >
                      <span className={styles.addPhotoIcon}>+</span>
                      <span className={styles.addPhotoLabel}>ADD PHOTO</span>
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {/* Photo modal */}
      {photoModal !== null && (
        <PhotoModal
          editingPhoto={photoModal.mode === 'edit' ? photoModal.photo : null}
          initialForm={photoModal.mode === 'new' ? photoModal.context : undefined}
          plays={plays}
          onClose={() => setPhotoModal(null)}
          onSaved={handleModalSaved}
          groupPhotoCount={photoModal.groupPhotoCount}
        />
      )}
    </div>
  );
}
