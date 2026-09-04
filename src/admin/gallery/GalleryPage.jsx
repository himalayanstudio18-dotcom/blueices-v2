import React, { useEffect, useState } from 'react';
import {
  listGalleryImages, uploadGalleryImages, updateGalleryImage,
  deleteGalleryImage, setGalleryOrder, galleryImagePublicUrl,
  saveImageDraft, publishImageDraft, revertImageDraft,
} from './galleryApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { can } from '../permissions';
import { validateImageSize } from '../imageValidation';

const GALLERY_IMAGE_MAX_MB = 3;

const GALLERY_CATEGORIES = ['exterior', 'interior', 'nature', 'room'];
const DINING_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'local_cuisine', 'tea_snacks'];
const CATEGORY_LABELS = {
  exterior: 'Exterior', interior: 'Interior', nature: 'Nature', room: 'Room',
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
  local_cuisine: 'Local Cuisine', tea_snacks: 'Tea & Snacks',
};
const categoryLabel = (cat) => CATEGORY_LABELS[cat] ?? cat;

export default function GalleryPage() {
  const { staff, role } = useAdminAuth();
  const canEdit = can(role, 'gallery', 'edit');
  const canUpload = can(role, 'gallery', 'upload');
  const canDelete = can(role, 'gallery', 'delete');
  const canReorder = can(role, 'gallery', 'reorder');
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [images, setImages] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [section, setSection] = useState('gallery');
  const categories = section === 'dining' ? DINING_CATEGORIES : GALLERY_CATEGORIES;

  async function load() {
    try {
      setImages(await listGalleryImages());
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load the gallery'));
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    for (const file of files) {
      const sizeError = validateImageSize(file, GALLERY_IMAGE_MAX_MB);
      if (sizeError) {
        showToast({ type: 'error', title: 'Image too large', message: sizeError });
        e.target.value = '';
        return;
      }
    }
    setUploading(true);
    setError('');
    try {
      await uploadGalleryImages(files, section);
      logActivity(staff, { action: 'upload', entity: 'gallery_image', detail: `${files.length} photo${files.length > 1 ? 's' : ''} uploaded` });
      showToast({
        type: 'success',
        title: files.length > 1 ? 'Images uploaded' : 'Image uploaded',
        message: `${files.length} photo${files.length > 1 ? 's' : ''} added to the gallery.`,
      });
      await load();
    } catch (err) {
      const friendly = friendlyError(err, 'upload photos');
      setError(friendly);
      showToast({ type: 'error', title: 'Upload failed', message: friendly });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleField(img, field, value, toastConfig) {
    setBusyId(img.id);
    try {
      const previous = img[field];
      await updateGalleryImage(img.id, { [field]: value });
      if (field === 'is_published') {
        logActivity(staff, { action: value ? 'publish' : 'unpublish', entity: 'gallery_image', entityId: img.id, detail: img.caption_en, oldValue: previous, newValue: value });
      }
      if (toastConfig) showToast({ type: 'success', ...toastConfig });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: friendlyError(err, 'update this photo') });
    } finally {
      setBusyId(null);
    }
  }

  /* Caption/alt-text/category go through a draft — an already-live
     photo's public caption doesn't change until Publish is clicked. */
  async function handleDraftField(img, field, value) {
    setBusyId(img.id);
    try {
      await saveImageDraft(img.id, { ...(img.draft_data ?? {}), [field]: value });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Save failed', message: friendlyError(err, 'save this change') });
    } finally {
      setBusyId(null);
    }
  }

  async function handlePublishDraft(img) {
    setBusyId(img.id);
    try {
      await publishImageDraft(img.id, img.draft_data);
      logActivity(staff, { action: 'publish', entity: 'gallery_image', entityId: img.id, detail: 'draft published' });
      showToast({ type: 'success', title: 'Changes published', message: 'Changes published successfully.' });
      await load();
    } catch {
      showToast({ type: 'error', title: 'Publish failed', message: 'Unable to publish changes. Please try again.' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDiscardDraft(img) {
    setBusyId(img.id);
    try {
      await revertImageDraft(img.id);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Pending changes were removed.' });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(img) {
    const confirmed = await confirm({
      title: 'Delete Photo?',
      message: `Are you sure you want to delete this photo${img.caption_en ? ` ("${img.caption_en}")` : ''}? This action cannot be undone.`,
      confirmLabel: 'Delete Photo',
    });
    if (!confirmed) return;

    setBusyId(img.id);
    try {
      await deleteGalleryImage(img.id, img.storage_path);
      logActivity(staff, { action: 'delete', entity: 'gallery_image', entityId: img.id, detail: img.caption_en });
      showToast({ type: 'success', title: 'Image deleted', message: 'The photo was removed from the gallery.' });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Delete failed', message: friendlyError(err, 'delete this photo') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(img, dir) {
    const visIndex = visible.findIndex((i) => i.id === img.id);
    const swapVisIndex = visIndex + dir;
    if (swapVisIndex < 0 || swapVisIndex >= visible.length) return;
    const neighbor = visible[swapVisIndex];

    const index = images.findIndex((i) => i.id === img.id);
    const swapWith = images.findIndex((i) => i.id === neighbor.id);
    const next = [...images];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setImages(next);
    await setGalleryOrder(next);
  }

  const inSection = images?.filter((img) => img.section === section) ?? [];
  const visible = inSection.filter((img) => filter === 'all' || img.category === filter);

  function switchSection(next) {
    setSection(next);
    setFilter('all');
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow">{section === 'dining' ? 'Dining' : 'Gallery'}</p>
          <h1>Manage {section === 'dining' ? 'Dining Photos' : 'Gallery'}</h1>
        </div>
        {canUpload && (
          <label className="admin-btn-primary admin-btn-link admin-upload-btn">
            {uploading ? 'Uploading…' : '+ Upload Photos'}
            <input type="file" accept="image/*" multiple hidden onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </header>

      {canUpload && (
        <p className="admin-upload-hint">Recommended: 4:3 · 1600×1200 px · Maximum {GALLERY_IMAGE_MAX_MB} MB · JPG, PNG or WebP</p>
      )}

      {error && <p className="admin-auth-error">{error}</p>}

      <div className="admin-filter-tabs">
        <button
          type="button"
          className={`admin-filter-tab${section === 'gallery' ? ' is-active' : ''}`}
          onClick={() => switchSection('gallery')}
        >
          Gallery ({images?.filter((i) => i.section === 'gallery').length ?? 0})
        </button>
        <button
          type="button"
          className={`admin-filter-tab${section === 'dining' ? ' is-active' : ''}`}
          onClick={() => switchSection('dining')}
        >
          Dining ({images?.filter((i) => i.section === 'dining').length ?? 0})
        </button>
      </div>

      <div className="admin-filter-tabs">
        <button
          type="button"
          className={`admin-filter-tab${filter === 'all' ? ' is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({inSection.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`admin-filter-tab${filter === cat ? ' is-active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {categoryLabel(cat)} ({inSection.filter((i) => i.category === cat).length})
          </button>
        ))}
      </div>

      {images === null && !error && <p>Loading…</p>}
      {images !== null && inSection.length === 0 && <p>No {section === 'dining' ? 'dining ' : ''}photos yet — upload your first one.</p>}
      {inSection.length > 0 && visible.length === 0 && <p>No photos in this category.</p>}

      <div className="admin-gallery-grid">
        {visible.map((img) => {
          const busy = busyId === img.id;
          const draft = img.draft_data ?? {};
          const hasDraft = img.draft_data != null;
          const shownCaptionEn = hasDraft && 'caption_en' in draft ? draft.caption_en : img.caption_en;
          const shownCaptionBn = hasDraft && 'caption_bn' in draft ? draft.caption_bn : img.caption_bn;
          const shownAltEn = hasDraft && 'alt_text_en' in draft ? draft.alt_text_en : img.alt_text_en;
          const shownCategory = hasDraft && 'category' in draft ? draft.category : (img.category ?? categories[0]);
          return (
            <div key={img.id} className="admin-gallery-card">
              <div className="admin-gallery-card-img">
                <img src={galleryImagePublicUrl(img.storage_path)} alt={img.alt_text_en ?? ''} />
                {img.is_featured && <span className="admin-badge is-featured admin-gallery-card-badge">Featured</span>}
                {!img.is_published && <span className="admin-badge is-draft admin-gallery-card-badge admin-gallery-card-badge--2">Unpublished</span>}
                {hasDraft && <span className="admin-badge is-featured admin-gallery-card-badge admin-gallery-card-badge--2">Pending edit</span>}
              </div>

              <div className="admin-gallery-card-fields">
                <label className="admin-field">
                  <span>Caption (English)</span>
                  <input
                    defaultValue={shownCaptionEn ?? ''}
                    key={`caption_en-${shownCaptionEn}`}
                    disabled={!canEdit}
                    onBlur={(e) => e.target.value !== (shownCaptionEn ?? '') && handleDraftField(img, 'caption_en', e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Caption (Bengali)</span>
                  <input
                    defaultValue={shownCaptionBn ?? ''}
                    key={`caption_bn-${shownCaptionBn}`}
                    disabled={!canEdit}
                    onBlur={(e) => e.target.value !== (shownCaptionBn ?? '') && handleDraftField(img, 'caption_bn', e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Alt Text (English)</span>
                  <input
                    defaultValue={shownAltEn ?? ''}
                    key={`alt_text_en-${shownAltEn}`}
                    placeholder="Describes the photo for screen readers"
                    disabled={!canEdit}
                    onBlur={(e) => e.target.value !== (shownAltEn ?? '') && handleDraftField(img, 'alt_text_en', e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Category</span>
                  <select value={shownCategory} onChange={(e) => handleDraftField(img, 'category', e.target.value)} disabled={!canEdit}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-gallery-card-actions">
                {canReorder && (
                  <div className="admin-room-row-reorder admin-gallery-reorder">
                    <button type="button" onClick={() => handleMove(img, -1)} aria-label="Move earlier">↑</button>
                    <button type="button" onClick={() => handleMove(img, 1)} aria-label="Move later">↓</button>
                  </div>
                )}
                {canEdit && (
                  <button
                    className="admin-btn-ghost admin-btn-ghost--dark"
                    onClick={() => handleField(img, 'is_featured', !img.is_featured)}
                    disabled={busy}
                  >
                    {img.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                )}
                {canEdit && (
                  <button
                    className="admin-btn-ghost admin-btn-ghost--dark"
                    onClick={() => handleField(img, 'is_published', !img.is_published, {
                      title: img.is_published ? 'Image unpublished' : 'Image published',
                      message: img.is_published ? 'This photo is no longer visible on the live site.' : 'This photo is now visible on the live site.',
                    })}
                    disabled={busy}
                  >
                    {img.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {canDelete && (
                  <button className="admin-btn-ghost admin-btn-ghost--danger" onClick={() => handleDelete(img)} disabled={busy}>
                    {busy ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>

              {hasDraft && canEdit && (
                <div className="admin-gallery-card-actions admin-gallery-card-draft-actions">
                  <span className="admin-preview-note">You have unpublished edits to this photo&rsquo;s details.</span>
                  <button className="admin-btn-ghost admin-btn-ghost--danger" onClick={() => handleDiscardDraft(img)} disabled={busy}>
                    Discard Draft
                  </button>
                  <button className="admin-btn-primary" onClick={() => handlePublishDraft(img)} disabled={busy}>
                    Publish Changes
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
