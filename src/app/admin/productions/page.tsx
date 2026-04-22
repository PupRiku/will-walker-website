'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Production, ProductionPhoto } from '@/types/production';
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

// ── Form state ────────────────────────────────────────────────────────────────

type PhotoFormState = {
  playTitle: string;
  productionYear: string;
  venue: string;
  alt: string;
  caption: string;
  src: string;
};

const EMPTY_FORM: PhotoFormState = {
  playTitle: '',
  productionYear: String(new Date().getFullYear()),
  venue: '',
  alt: '',
  caption: '',
  src: '',
};

function photoToForm(photo: ProductionPhoto): PhotoFormState {
  return {
    playTitle: photo.playTitle,
    productionYear: String(photo.productionYear),
    venue: photo.venue,
    alt: photo.alt,
    caption: photo.caption ?? '',
    src: photo.src,
  };
}

// ── Photo card ────────────────────────────────────────────────────────────────

function PhotoCard({
  photo,
  onEdit,
  onDeleted,
}: {
  photo: ProductionPhoto;
  onEdit: () => void;
  onDeleted: () => void;
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
        <img
          src={photo.src}
          alt={photo.alt}
          className={styles.photoThumb}
        />
      </div>

      {photo.caption && (
        <p className={styles.photoCaption}>{photo.caption}</p>
      )}

      <p className={styles.photoAltMeta}>
        ALT · {photo.alt.length} CHARS
      </p>

      {confirming ? (
        <div className={styles.inlineConfirm}>
          <span className={styles.inlineConfirmText}>Are you sure?</span>
          {deleteError && <span className={styles.inlineError}>{deleteError}</span>}
          <div className={styles.inlineConfirmBtns}>
            <button
              className={styles.btnConfirmDelete}
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? '…' : 'Yes'}
            </button>
            <button
              className={styles.btnCancelDelete}
              onClick={() => { setConfirming(false); setDeleteError(null); }}
              disabled={deleting}
            >
              No
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.photoCardActions}>
          <button className={styles.btnIconEdit} onClick={onEdit} aria-label="Edit photo">
            ✎
          </button>
          <button
            className={styles.btnIconDelete}
            onClick={() => setConfirming(true)}
            aria-label="Delete photo"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ── Photo modal ───────────────────────────────────────────────────────────────

function PhotoModal({
  editingPhoto,
  initialForm,
  onClose,
  onSaved,
  groupPhotoCount,
}: {
  editingPhoto: ProductionPhoto | null;
  initialForm?: Partial<PhotoFormState>;
  onClose: () => void;
  onSaved: () => void;
  groupPhotoCount: number;
}) {
  const isNew = editingPhoto === null;
  const [form, setForm] = useState<PhotoFormState>(
    isNew
      ? { ...EMPTY_FORM, ...initialForm }
      : photoToForm(editingPhoto)
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function setField<K extends keyof PhotoFormState>(key: K, value: string) {
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
    const payload = {
      playTitle: form.playTitle.trim(),
      productionYear: year,
      venue: form.venue.trim(),
      alt: form.alt.trim(),
      caption: form.caption.trim() || null,
      src: form.src.trim(),
      displayOrder: isNew ? groupPhotoCount : editingPhoto!.displayOrder,
    };
    try {
      const url = isNew ? '/api/productions' : `/api/productions/${editingPhoto!.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
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
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className={styles.modalHeader}>
          <p className={styles.modalEyebrow}>
            {isNew ? 'NEW PHOTO' : 'EDITING PHOTO'}
          </p>
          <h2 className={styles.modalTitle}>
            {isNew ? 'Add Production Photo' : editingPhoto!.playTitle}
          </h2>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Play Title</label>
            <input
              type="text"
              className={styles.input}
              value={form.playTitle}
              onChange={(e) => setField('playTitle', e.target.value)}
              placeholder="e.g. Echoes of Valor"
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
            <label className={styles.label}>Caption <span className={styles.optional}>(optional)</span></label>
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
                  <img
                    src={form.src}
                    alt="Current photo"
                    className={styles.currentPhotoImg}
                  />
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
            <button className={styles.btnSecondary} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving ? 'Saving…' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type PhotoModalState =
  | { mode: 'new'; context: Partial<PhotoFormState>; groupPhotoCount: number }
  | { mode: 'edit'; photo: ProductionPhoto; groupPhotoCount: number }
  | null;

export default function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([]);
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
  }, [fetchProductions]);

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
        <button
          className={styles.btnPrimary}
          onClick={() => openNewPhoto({}, 0)}
        >
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
          <button className={styles.retryLink} onClick={fetchProductions}>
            Retry
          </button>
        </p>
      ) : productions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No production photos yet.</p>
          <button
            className={styles.btnPrimary}
            onClick={() => openNewPhoto({}, 0)}
          >
            Add the first one
          </button>
        </div>
      ) : (
        <div className={styles.productionsList}>
          {productions.map((production) => {
            const groupKey = `${production.playTitle}::${production.productionYear}::${production.venue}`;
            const groupContext: Partial<PhotoFormState> = {
              playTitle: production.playTitle,
              productionYear: String(production.productionYear),
              venue: production.venue,
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
                      onClick={() =>
                        openNewPhoto(groupContext, production.photos.length)
                      }
                    >
                      + Add photo
                    </button>
                  </div>
                </div>

                <div className={styles.photoStrip}>
                  {production.photos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onEdit={() => openEditPhoto(photo, production.photos.length)}
                      onDeleted={fetchProductions}
                    />
                  ))}

                  {/* Add photo tile */}
                  <button
                    className={styles.addPhotoTile}
                    onClick={() =>
                      openNewPhoto(groupContext, production.photos.length)
                    }
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
      )}

      {/* Photo modal */}
      {photoModal !== null && (
        <PhotoModal
          editingPhoto={photoModal.mode === 'edit' ? photoModal.photo : null}
          initialForm={photoModal.mode === 'new' ? photoModal.context : undefined}
          onClose={() => setPhotoModal(null)}
          onSaved={handleModalSaved}
          groupPhotoCount={photoModal.groupPhotoCount}
        />
      )}
    </div>
  );
}
