import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getRoom, createRoom, updateRoom,
  saveRoomDraft, revertRoomDraft,
  uploadRoomImage, deleteRoomImage, setRoomImageOrder, setRoomImageCover,
  roomImagePublicUrl,
} from './roomsApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { can } from '../permissions';

const emptyForm = {
  name_en: '', name_bn: '', slug: '', room_type: '',
  tag_en: '', tag_bn: '', tag_class: 'tag-gold',
  short_desc_en: '', short_desc_bn: '',
  max_guests: '', bathrooms: '', bed_configuration_en: '', bed_configuration_bn: '',
  size_en: '', size_bn: '',
  desc_en: '', desc_bn: '',
  features_en: '', features_bn: '',
  price: '', weekend_price: '', sort_order: 0,
  is_published: true, is_featured: false, is_available: true,
  seo_title: '', seo_description: '',
};

/* Common amenities shown as quick-toggle checkboxes; anything else
   goes in the free-text list below so the set never feels limiting. */
const COMMON_AMENITIES = [
  'Wi-Fi', 'Mountain View', 'Balcony', 'Heating', 'Hot Water',
  'Breakfast Included', 'Parking', 'Room Service', 'Attached Bathroom',
];

const featuresToText = (arr) => (arr ?? []).join('\n');
const featuresToTextExcludingCommon = (arr) => (arr ?? []).filter((f) => !COMMON_AMENITIES.includes(f)).join('\n');
const textToFeatures = (text, checked = []) => [
  ...checked,
  ...text.split('\n').map((s) => s.trim()).filter(Boolean),
];

const slugify = (text) => text
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

export default function RoomEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { staff, role } = useAdminAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const canEdit = can(role, 'rooms', 'edit');
  const canCreate = can(role, 'rooms', 'create');
  const canChangePrice = can(role, 'rooms', 'changePrice');
  const canChangeAvailability = can(role, 'rooms', 'changeAvailability');
  const canPublish = can(role, 'rooms', 'publish');
  const canManageImages = can(role, 'rooms', 'manageImages');
  const allowed = isNew ? canCreate : canEdit;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [checkedAmenities, setCheckedAmenities] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const baselineRef = useRef('');

  const dirty = JSON.stringify({ form, checkedAmenities }) !== baselineRef.current;

  function toggleAmenity(label) {
    setCheckedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  }

  useEffect(() => {
    if (isNew) return;
    getRoom(id).then((room) => {
      /* Editing resumes from the pending draft if one exists, not the
         live values — otherwise reopening the editor after "Save
         Draft" would show stale live data instead of your own
         unpublished edits. */
      const merged = { ...room, ...(room.draft_data ?? {}) };
      const nextForm = {
        name_en: merged.name_en ?? '', name_bn: merged.name_bn ?? '',
        slug: merged.slug ?? '', room_type: merged.room_type ?? '',
        tag_en: merged.tag_en ?? '', tag_bn: merged.tag_bn ?? '', tag_class: merged.tag_class ?? 'tag-gold',
        short_desc_en: merged.short_desc_en ?? '', short_desc_bn: merged.short_desc_bn ?? '',
        max_guests: merged.max_guests ?? '', bathrooms: merged.bathrooms ?? '',
        bed_configuration_en: merged.bed_configuration_en ?? '', bed_configuration_bn: merged.bed_configuration_bn ?? '',
        size_en: merged.size_en ?? '', size_bn: merged.size_bn ?? '',
        desc_en: merged.desc_en ?? '', desc_bn: merged.desc_bn ?? '',
        features_en: featuresToTextExcludingCommon(merged.features_en), features_bn: featuresToText(merged.features_bn),
        price: merged.price ?? '', weekend_price: merged.weekend_price ?? '',
        sort_order: merged.sort_order ?? 0,
        is_published: merged.is_published, is_featured: merged.is_featured ?? false, is_available: merged.is_available ?? true,
        seo_title: merged.seo_title ?? '', seo_description: merged.seo_description ?? '',
      };
      const nextChecked = (merged.features_en ?? []).filter((f) => COMMON_AMENITIES.includes(f));
      setForm(nextForm);
      setCheckedAmenities(nextChecked);
      const pendingImages = (room.room_images ?? []).some((img) => img.is_draft);
      setHasDraft(!!room.draft_data || pendingImages);
      baselineRef.current = JSON.stringify({ form: nextForm, checkedAmenities: nextChecked });
      setSlugTouched(!!merged.slug);
      setImages([...(room.room_images ?? [])].sort((a, b) => a.sort_order - b.sort_order));
      setLoading(false);
    }).catch((err) => { setError(friendlyError(err, 'load this room')); setLoading(false); });
  }, [id, isNew]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setName(value) {
    setForm((f) => ({ ...f, name_en: value, slug: slugTouched ? f.slug : slugify(value) }));
  }

  function setSlug(value) {
    setSlugTouched(true);
    set('slug', slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      slug: form.slug === '' ? null : form.slug,
      price: form.price === '' ? null : Number(form.price),
      weekend_price: form.weekend_price === '' ? null : Number(form.weekend_price),
      max_guests: form.max_guests === '' ? null : Number(form.max_guests),
      bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
      sort_order: Number(form.sort_order) || 0,
      features_en: textToFeatures(form.features_en, checkedAmenities),
      features_bn: textToFeatures(form.features_bn),
    };
    try {
      if (isNew) {
        const created = await createRoom(payload);
        logActivity(staff, { action: 'create', entity: 'room', entityId: created.id, detail: payload.name_en });
        showToast({ type: 'success', title: 'Room created', message: `"${payload.name_en}" was added successfully.` });
        navigate(`/admin/rooms/${created.id}`, { replace: true });
      } else {
        /* Existing rooms are never written straight to the live
           columns from here — that would change the public site the
           instant Save is clicked, even for an already-published
           room. Everything goes into draft_data; Publish (from the
           Preview screen) is the only thing that copies it live. */
        await saveRoomDraft(id, payload);
        logActivity(staff, { action: 'update', entity: 'room', entityId: id, detail: `${payload.name_en} — draft saved` });
        setHasDraft(true);
        baselineRef.current = JSON.stringify({ form, checkedAmenities });
        showToast({ type: 'success', title: 'Draft saved', message: 'Preview your changes before publishing them.' });
      }
    } catch (err) {
      const friendly = friendlyError(err, 'save this room');
      setError(friendly);
      showToast({ type: 'error', title: 'Save failed', message: friendly });
    } finally {
      setSaving(false);
    }
  }

  async function handleDiscardDraft() {
    const confirmed = await confirm({
      title: 'Discard Draft?',
      message: 'Are you sure you want to discard your unpublished changes? The live version will stay exactly as it is now.',
      confirmLabel: 'Discard Draft',
    });
    if (!confirmed) return;

    setDiscarding(true);
    try {
      await revertRoomDraft(id);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed.' });
      setLoading(true);
      const room = await getRoom(id);
      const nextForm = {
        name_en: room.name_en ?? '', name_bn: room.name_bn ?? '',
        slug: room.slug ?? '', room_type: room.room_type ?? '',
        tag_en: room.tag_en ?? '', tag_bn: room.tag_bn ?? '', tag_class: room.tag_class ?? 'tag-gold',
        short_desc_en: room.short_desc_en ?? '', short_desc_bn: room.short_desc_bn ?? '',
        max_guests: room.max_guests ?? '', bathrooms: room.bathrooms ?? '',
        bed_configuration_en: room.bed_configuration_en ?? '', bed_configuration_bn: room.bed_configuration_bn ?? '',
        size_en: room.size_en ?? '', size_bn: room.size_bn ?? '',
        desc_en: room.desc_en ?? '', desc_bn: room.desc_bn ?? '',
        features_en: featuresToTextExcludingCommon(room.features_en), features_bn: featuresToText(room.features_bn),
        price: room.price ?? '', weekend_price: room.weekend_price ?? '',
        sort_order: room.sort_order ?? 0,
        is_published: room.is_published, is_featured: room.is_featured ?? false, is_available: room.is_available ?? true,
        seo_title: room.seo_title ?? '', seo_description: room.seo_description ?? '',
      };
      const nextChecked = (room.features_en ?? []).filter((f) => COMMON_AMENITIES.includes(f));
      setForm(nextForm);
      setCheckedAmenities(nextChecked);
      setHasDraft(false);
      baselineRef.current = JSON.stringify({ form: nextForm, checkedAmenities: nextChecked });
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    } finally {
      setDiscarding(false);
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) await uploadRoomImage(id, file);
      setImages((await getRoom(id)).room_images.sort((a, b) => a.sort_order - b.sort_order));
      setHasDraft(true);
      showToast({
        type: 'success',
        title: files.length > 1 ? 'Photos uploaded' : 'Photo uploaded',
        message: `${files.length} photo${files.length > 1 ? 's' : ''} added as pending — preview and publish to make ${files.length > 1 ? 'them' : 'it'} live.`,
      });
    } catch (err) {
      const friendly = friendlyError(err, 'upload photos');
      setError(friendly);
      showToast({ type: 'error', title: 'Upload failed', message: friendly });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeleteImage(img) {
    const confirmed = await confirm({
      title: 'Delete Photo?',
      message: 'Are you sure you want to delete this photo? This action cannot be undone.',
      confirmLabel: 'Delete Photo',
    });
    if (!confirmed) return;

    try {
      await deleteRoomImage(img.id, img.storage_path);
      setImages((imgs) => imgs.filter((i) => i.id !== img.id));
      showToast({ type: 'success', title: 'Photo deleted', message: 'The photo was removed from this room.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Delete failed', message: friendlyError(err, 'delete this photo') });
    }
  }

  async function handleMove(index, dir) {
    const next = [...images];
    const swapWith = index + dir;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setImages(next);
    await setRoomImageOrder(next);
  }

  async function handleSetCover(img) {
    await setRoomImageCover(id, img.id);
    setImages((imgs) => imgs.map((i) => ({ ...i, is_cover: i.id === img.id })));
  }

  if (loading) return <div className="admin-page"><p>Loading…</p></div>;

  if (!allowed) {
    return (
      <div className="admin-fullscreen-state">
        <h1>Restricted</h1>
        <p>Your role doesn't have access to {isNew ? 'add new rooms' : 'edit rooms'}.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow"><Link to="/admin/rooms">← Rooms</Link></p>
          <h1>{isNew ? 'Add Room' : form.name_en || 'Edit Room'}</h1>
        </div>
        {!isNew && (
          <div className="admin-editor-status">
            {dirty && <span className="admin-unsaved-badge">Unsaved changes</span>}
            {hasDraft && !dirty && <span className="admin-badge is-draft">Draft pending publish</span>}
            <Link to={`/admin/rooms/${id}/preview`} className="admin-btn-ghost admin-btn-ghost--dark">
              Preview
            </Link>
            {hasDraft && (
              <button type="button" className="admin-btn-ghost admin-btn-ghost--danger" onClick={handleDiscardDraft} disabled={discarding}>
                {discarding ? 'Discarding…' : 'Discard Draft'}
              </button>
            )}
          </div>
        )}
      </header>

      {!isNew && (
        <p className="admin-placeholder-note admin-editor-hint">
          Editing an existing room saves to a draft — the live public page won't change until you preview and publish.
        </p>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <p className="admin-auth-error">{error}</p>}

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Name (English)</span>
            <input value={form.name_en} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Name (Bengali)</span>
            <input value={form.name_bn} onChange={(e) => set('name_bn', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Slug</span>
            <input value={form.slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. cloudline-suite" />
          </label>
          <label className="admin-field">
            <span>Room Type</span>
            <input value={form.room_type} onChange={(e) => set('room_type', e.target.value)} placeholder="e.g. Suite, Cottage, Loft" />
          </label>

          <label className="admin-field">
            <span>Tag (English)</span>
            <input value={form.tag_en} onChange={(e) => set('tag_en', e.target.value)} placeholder="e.g. Mountain View" />
          </label>
          <label className="admin-field">
            <span>Tag (Bengali)</span>
            <input value={form.tag_bn} onChange={(e) => set('tag_bn', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Maximum Guests</span>
            <input type="number" min="1" value={form.max_guests} onChange={(e) => set('max_guests', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>Card Accent Style</span>
            <select value={form.tag_class} onChange={(e) => set('tag_class', e.target.value)}>
              <option value="tag-gold">Gold</option>
              <option value="tag-signature">Signature</option>
              <option value="tag-forest">Forest</option>
            </select>
          </label>

          <label className="admin-field">
            <span>Bed Configuration (English)</span>
            <input value={form.bed_configuration_en} onChange={(e) => set('bed_configuration_en', e.target.value)} placeholder="e.g. 2 King Beds" />
          </label>
          <label className="admin-field">
            <span>Bed Configuration (Bengali)</span>
            <input value={form.bed_configuration_bn} onChange={(e) => set('bed_configuration_bn', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Bathrooms</span>
            <input type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Size (English)</span>
            <input value={form.size_en} onChange={(e) => set('size_en', e.target.value)} placeholder="e.g. 320 sq.ft" />
          </label>
          <label className="admin-field">
            <span>Size (Bengali)</span>
            <input value={form.size_bn} onChange={(e) => set('size_bn', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Price (₹/night)</span>
            <input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} required disabled={!canChangePrice} />
          </label>
          <label className="admin-field">
            <span>Weekend Price (₹/night)</span>
            <input type="number" min="0" value={form.weekend_price} onChange={(e) => set('weekend_price', e.target.value)} placeholder="Optional — leave blank to use standard price" disabled={!canChangePrice} />
          </label>

          <label className="admin-field">
            <span>Sort Order</span>
            <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
          </label>
          <div className="admin-field-group">
            <label className="admin-field admin-field--checkbox">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} disabled={!canPublish} />
              <span>Published (visible on the live site)</span>
            </label>
            <label className="admin-field admin-field--checkbox">
              <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} disabled={!canChangeAvailability} />
              <span>Available (bookable right now)</span>
            </label>
            <label className="admin-field admin-field--checkbox">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
              <span>Featured room</span>
            </label>
          </div>
        </div>

        <label className="admin-field">
          <span>Short Description (English) — used on the room card</span>
          <textarea rows={2} value={form.short_desc_en} onChange={(e) => set('short_desc_en', e.target.value)} placeholder="Leave blank to reuse the full description" />
        </label>
        <label className="admin-field">
          <span>Short Description (Bengali)</span>
          <textarea rows={2} value={form.short_desc_bn} onChange={(e) => set('short_desc_bn', e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Full Description (English)</span>
          <textarea rows={3} value={form.desc_en} onChange={(e) => set('desc_en', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Full Description (Bengali)</span>
          <textarea rows={3} value={form.desc_bn} onChange={(e) => set('desc_bn', e.target.value)} />
        </label>

        <div className="admin-field">
          <span>Amenities</span>
          <div className="admin-amenity-grid">
            {COMMON_AMENITIES.map((label) => (
              <label key={label} className="admin-field admin-field--checkbox admin-amenity-checkbox">
                <input
                  type="checkbox"
                  checked={checkedAmenities.includes(label)}
                  onChange={() => toggleAmenity(label)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Other Amenities (English) — one per line</span>
            <textarea rows={3} value={form.features_en} onChange={(e) => set('features_en', e.target.value)} placeholder="Anything not covered above" />
          </label>
          <label className="admin-field">
            <span>Other Amenities (Bengali) — one per line</span>
            <textarea rows={3} value={form.features_bn} onChange={(e) => set('features_bn', e.target.value)} />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span>SEO Title</span>
            <input value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} placeholder="Leave blank to use the room name" />
          </label>
          <label className="admin-field">
            <span>SEO Description</span>
            <input value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} placeholder="Leave blank to use the short description" />
          </label>
        </div>

        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create Room' : 'Save Draft'}
        </button>
      </form>

      {!isNew && (
        <section className="admin-image-section">
          <h2>Photos</h2>
          <p className="admin-placeholder-note">First photo (or the one marked cover) is used on the room card.</p>

          <div className="admin-image-grid">
            {images.map((img, i) => (
              <div key={img.id} className={`admin-image-card${img.is_cover ? ' is-cover' : ''}`}>
                <img src={roomImagePublicUrl(img.storage_path)} alt="" />
                {img.is_cover && <span className="admin-image-cover-badge">Cover</span>}
                {img.is_draft && <span className="admin-image-pending-badge">Pending</span>}
                {canManageImages && (
                  <div className="admin-image-card-actions">
                    <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>
                    <button type="button" onClick={() => handleMove(i, 1)} disabled={i === images.length - 1} aria-label="Move later">→</button>
                    {!img.is_cover && (
                      <button type="button" onClick={() => handleSetCover(img)}>Set cover</button>
                    )}
                    <button type="button" onClick={() => handleDeleteImage(img)} className="admin-image-card-delete">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {canManageImages && (
            <label className="admin-btn-primary admin-btn-link admin-upload-btn">
              {uploading ? 'Uploading…' : '+ Upload Photos'}
              <input type="file" accept="image/*" multiple hidden onChange={handleUpload} disabled={uploading} />
            </label>
          )}
        </section>
      )}
    </div>
  );
}
