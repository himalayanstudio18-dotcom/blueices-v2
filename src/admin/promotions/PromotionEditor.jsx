import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getPromotion, createPromotion, updatePromotion,
  savePromotionDraft, revertPromotionDraft,
  uploadPromotionImage, deletePromotionImage, promotionImagePublicUrl,
} from './promotionsApi';
import { DEFAULT_PROMOTION_WHATSAPP_TEMPLATE } from '../../lib/promotionMessage';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { can } from '../permissions';

const emptyForm = {
  internal_name: '',
  eyebrow_en: '', eyebrow_bn: '',
  headline_en: '', headline_bn: '',
  description_en: '', description_bn: '',
  location_en: '', location_bn: '',
  discount_type: 'percentage',
  discount_value: '', special_price: '', discount_custom_text: '',
  offer_condition_en: '', offer_condition_bn: '',
  min_count: '',
  benefits: [],
  cta_en: '', cta_bn: '',
  start_date: '', end_date: '',
  show_on_homepage: false, show_on_stays: false, show_as_popup: false, is_featured: false,
  image_storage_path: null,
  whatsapp_template: '',
};

function shapeForm(row) {
  return {
    internal_name: row.internal_name ?? '',
    eyebrow_en: row.eyebrow_en ?? '', eyebrow_bn: row.eyebrow_bn ?? '',
    headline_en: row.headline_en ?? '', headline_bn: row.headline_bn ?? '',
    description_en: row.description_en ?? '', description_bn: row.description_bn ?? '',
    location_en: row.location_en ?? '', location_bn: row.location_bn ?? '',
    discount_type: row.discount_type ?? 'percentage',
    discount_value: row.discount_value ?? '', special_price: row.special_price ?? '', discount_custom_text: row.discount_custom_text ?? '',
    offer_condition_en: row.offer_condition_en ?? '', offer_condition_bn: row.offer_condition_bn ?? '',
    min_count: row.min_count ?? '',
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    cta_en: row.cta_en ?? '', cta_bn: row.cta_bn ?? '',
    start_date: row.start_date ?? '', end_date: row.end_date ?? '',
    show_on_homepage: row.show_on_homepage ?? false, show_on_stays: row.show_on_stays ?? false,
    show_as_popup: row.show_as_popup ?? false, is_featured: row.is_featured ?? false,
    image_storage_path: row.image_storage_path ?? null,
    whatsapp_template: row.whatsapp_template ?? '',
  };
}

export default function PromotionEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { staff, role } = useAdminAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const canCreate = can(role, 'promotions', 'create');
  const canEdit = can(role, 'promotions', 'edit');
  const allowed = isNew ? canCreate : canEdit;

  const [form, setForm] = useState(emptyForm);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [baseline, setBaseline] = useState('');

  const dirty = JSON.stringify(form) !== baseline;

  useEffect(() => {
    if (isNew) return;
    getPromotion(id).then((promo) => {
      /* Same "resume from the pending draft" convention as RoomEditor
         — reopening the editor after Save Draft shows your own
         unpublished edits, not the stale live values. */
      const merged = { ...promo, ...(promo.draft_data ?? {}) };
      const nextForm = shapeForm(merged);
      setForm(nextForm);
      setIsPublished(promo.is_published);
      setHasDraft(!!promo.draft_data);
      setBaseline(JSON.stringify(nextForm));
      setLoading(false);
    }).catch((err) => { setError(friendlyError(err, 'load this promotion')); setLoading(false); });
  }, [id, isNew]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setBenefit(index, lang, value) {
    setForm((f) => ({
      ...f,
      benefits: f.benefits.map((b, i) => (i === index ? { ...b, [lang]: value } : b)),
    }));
  }

  function addBenefit() {
    setForm((f) => ({ ...f, benefits: [...f.benefits, { en: '', bn: '' }] }));
  }

  function removeBenefit(index) {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== index) }));
  }

  function moveBenefit(index, dir) {
    setForm((f) => {
      const next = [...f.benefits];
      const swapWith = index + dir;
      if (swapWith < 0 || swapWith >= next.length) return f;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...f, benefits: next };
    });
  }

  function buildPayload() {
    return {
      ...form,
      discount_value: form.discount_value === '' ? null : Number(form.discount_value),
      special_price: form.special_price === '' ? null : Number(form.special_price),
      min_count: form.min_count === '' ? null : Number(form.min_count),
      start_date: form.start_date === '' ? null : form.start_date,
      end_date: form.end_date === '' ? null : form.end_date,
      benefits: form.benefits.filter((b) => (b.en && b.en.trim()) || (b.bn && b.bn.trim())),
      whatsapp_template: form.whatsapp_template.trim() === '' ? null : form.whatsapp_template,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = buildPayload();
    try {
      if (isNew) {
        const created = await createPromotion(payload);
        logActivity(staff, { action: 'create', entity: 'promotion', entityId: created.id, detail: payload.internal_name });
        showToast({ type: 'success', title: 'Promotion created', message: 'Saved as a draft — preview and publish it when ready.' });
        navigate(`/admin/promotions/${created.id}`, { replace: true });
      } else if (!isPublished) {
        /* Never been published — no live version exists yet to
           protect, so edits write straight to the row. */
        await updatePromotion(id, payload);
        logActivity(staff, { action: 'update', entity: 'promotion', entityId: id, detail: `${payload.internal_name} — draft updated` });
        setBaseline(JSON.stringify(form));
        showToast({ type: 'success', title: 'Draft saved', message: 'Preview your changes, then publish when ready.' });
      } else {
        /* Already live — never write straight to the live columns
           from here; everything goes into draft_data until Publish
           Changes is clicked on the Preview screen. */
        await savePromotionDraft(id, payload);
        logActivity(staff, { action: 'update', entity: 'promotion', entityId: id, detail: `${payload.internal_name} — draft saved` });
        setHasDraft(true);
        setBaseline(JSON.stringify(form));
        showToast({ type: 'success', title: 'Draft saved', message: 'Preview your changes before publishing them.' });
      }
    } catch (err) {
      const friendly = friendlyError(err, 'save this promotion');
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
      await revertPromotionDraft(id);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed.' });
      const promo = await getPromotion(id);
      const nextForm = shapeForm(promo);
      setForm(nextForm);
      setIsPublished(promo.is_published);
      setHasDraft(false);
      setBaseline(JSON.stringify(nextForm));
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    } finally {
      setDiscarding(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const previousPath = form.image_storage_path;
      const path = await uploadPromotionImage(id, file);
      set('image_storage_path', path);
      if (previousPath) await deletePromotionImage(previousPath);
      showToast({ type: 'success', title: 'Creative uploaded', message: 'Save the form to attach it to this promotion.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Upload failed', message: friendlyError(err, 'upload this image') });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleRemoveImage() {
    set('image_storage_path', null);
  }

  if (loading) return <div className="admin-page"><p>Loading…</p></div>;

  if (!allowed) {
    return (
      <div className="admin-fullscreen-state">
        <h1>Restricted</h1>
        <p>Your role doesn&rsquo;t have access to {isNew ? 'create new promotions' : 'edit promotions'}.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow"><Link to="/admin/promotions">← Promotions</Link></p>
          <h1>{isNew ? 'Create Promotion' : form.internal_name || 'Edit Promotion'}</h1>
        </div>
        {!isNew && (
          <div className="admin-editor-status">
            {dirty && <span className="admin-unsaved-badge">Unsaved changes</span>}
            {hasDraft && !dirty && <span className="admin-badge is-draft">Draft pending publish</span>}
            <Link to={`/admin/promotions/${id}/preview`} className="admin-btn-ghost admin-btn-ghost--dark">
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

      {!isNew && isPublished && (
        <p className="admin-placeholder-note admin-editor-hint">
          This promotion is live — editing saves to a draft, and the public site won&rsquo;t change until you preview and publish.
        </p>
      )}
      {!isNew && !isPublished && (
        <p className="admin-placeholder-note admin-editor-hint">
          This promotion has never been published — it won&rsquo;t appear on the site until you publish it from the Preview screen.
        </p>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <p className="admin-auth-error">{error}</p>}

        <h2 className="admin-form-section-title">Basic Information</h2>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Internal Promotion Name</span>
            <input value={form.internal_name} onChange={(e) => set('internal_name', e.target.value)} placeholder="e.g. September Bikers Special" required />
          </label>
          <div />

          <label className="admin-field">
            <span>Eyebrow (English)</span>
            <input value={form.eyebrow_en} onChange={(e) => set('eyebrow_en', e.target.value)} placeholder="e.g. SEPTEMBER ESCAPE" />
          </label>
          <label className="admin-field">
            <span>Eyebrow (Bengali)</span>
            <input value={form.eyebrow_bn} onChange={(e) => set('eyebrow_bn', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Headline (English)</span>
            <input value={form.headline_en} onChange={(e) => set('headline_en', e.target.value)} placeholder="e.g. Ride. Relax. Recharge." />
          </label>
          <label className="admin-field">
            <span>Headline (Bengali)</span>
            <input value={form.headline_bn} onChange={(e) => set('headline_bn', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Location (English)</span>
            <input value={form.location_en} onChange={(e) => set('location_en', e.target.value)} placeholder="e.g. Kalimpong Lower Burmaik, Darjeeling" />
          </label>
          <label className="admin-field">
            <span>Location (Bengali)</span>
            <input value={form.location_bn} onChange={(e) => set('location_bn', e.target.value)} />
          </label>
        </div>

        <label className="admin-field">
          <span>Description (English)</span>
          <textarea rows={2} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} placeholder="e.g. Bring your crew to the mountains." />
        </label>
        <label className="admin-field">
          <span>Description (Bengali)</span>
          <textarea rows={2} value={form.description_bn} onChange={(e) => set('description_bn', e.target.value)} />
        </label>

        <h2 className="admin-form-section-title">Offer Information</h2>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Discount Type</span>
            <select value={form.discount_type} onChange={(e) => set('discount_type', e.target.value)}>
              <option value="percentage">Percentage OFF</option>
              <option value="flat">Flat ₹ OFF</option>
              <option value="special_price">Special Price</option>
              <option value="custom">Custom / text-based offer</option>
            </select>
          </label>
          <label className="admin-field">
            <span>Minimum Guest/Rider Count</span>
            <input type="number" min="0" value={form.min_count} onChange={(e) => set('min_count', e.target.value)} placeholder="Optional, e.g. 6" />
          </label>

          {form.discount_type === 'percentage' && (
            <label className="admin-field">
              <span>Discount Value (%)</span>
              <input type="number" min="0" max="100" value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} placeholder="e.g. 15" />
            </label>
          )}
          {form.discount_type === 'flat' && (
            <label className="admin-field">
              <span>Discount Value (₹)</span>
              <input type="number" min="0" value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} placeholder="e.g. 500" />
            </label>
          )}
          {form.discount_type === 'special_price' && (
            <label className="admin-field">
              <span>Special Price (₹ / person)</span>
              <input type="number" min="0" value={form.special_price} onChange={(e) => set('special_price', e.target.value)} placeholder="e.g. 950" />
            </label>
          )}
          {form.discount_type === 'custom' && (
            <label className="admin-field">
              <span>Custom Offer Text</span>
              <input value={form.discount_custom_text} onChange={(e) => set('discount_custom_text', e.target.value)} placeholder="e.g. Free Late Checkout" />
            </label>
          )}

          <label className="admin-field">
            <span>Offer Condition (English)</span>
            <input value={form.offer_condition_en} onChange={(e) => set('offer_condition_en', e.target.value)} placeholder="e.g. 6+ Riders" />
          </label>
          <label className="admin-field">
            <span>Offer Condition (Bengali)</span>
            <input value={form.offer_condition_bn} onChange={(e) => set('offer_condition_bn', e.target.value)} />
          </label>
        </div>

        <h2 className="admin-form-section-title">Benefits</h2>
        <div className="admin-benefit-list">
          {form.benefits.map((b, i) => (
            <div key={i} className="admin-benefit-row">
              <input value={b.en} onChange={(e) => setBenefit(i, 'en', e.target.value)} placeholder="Benefit (English), e.g. Fooding & Lodging Included" />
              <input value={b.bn} onChange={(e) => setBenefit(i, 'bn', e.target.value)} placeholder="Benefit (Bengali)" />
              <div className="admin-benefit-row-actions">
                <button type="button" onClick={() => moveBenefit(i, -1)} disabled={i === 0} aria-label="Move earlier">↑</button>
                <button type="button" onClick={() => moveBenefit(i, 1)} disabled={i === form.benefits.length - 1} aria-label="Move later">↓</button>
                <button type="button" onClick={() => removeBenefit(i)} className="admin-image-card-delete" aria-label="Remove benefit">✕</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={addBenefit}>+ Add Benefit</button>

        <h2 className="admin-form-section-title">Call to Action</h2>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>CTA (English)</span>
            <input value={form.cta_en} onChange={(e) => set('cta_en', e.target.value)} placeholder="e.g. Plan Your Ride" />
          </label>
          <label className="admin-field">
            <span>CTA (Bengali)</span>
            <input value={form.cta_bn} onChange={(e) => set('cta_bn', e.target.value)} />
          </label>
        </div>

        <h2 className="admin-form-section-title">Scheduling</h2>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Start Date</span>
            <input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>End Date</span>
            <input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
          </label>
        </div>

        <h2 className="admin-form-section-title">Placements</h2>
        <div className="admin-field-group">
          <label className="admin-field admin-field--checkbox">
            <input type="checkbox" checked={form.show_on_homepage} onChange={(e) => set('show_on_homepage', e.target.checked)} />
            <span>Show on Homepage</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input type="checkbox" checked={form.show_on_stays} onChange={(e) => set('show_on_stays', e.target.checked)} />
            <span>Show on Stays</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input type="checkbox" checked={form.show_as_popup} onChange={(e) => set('show_as_popup', e.target.checked)} />
            <span>Show as Popup</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
            <span>Featured Promotion (only one at a time — publishing this will unfeature any other campaign)</span>
          </label>
        </div>

        <h2 className="admin-form-section-title">WhatsApp CTA</h2>
        <label className="admin-field">
          <span>Message Template — variables: {'{{offer_name}}'} {'{{discount}}'} {'{{price}}'} {'{{condition}}'}</span>
          <textarea
            rows={5}
            value={form.whatsapp_template}
            onChange={(e) => set('whatsapp_template', e.target.value)}
            placeholder={DEFAULT_PROMOTION_WHATSAPP_TEMPLATE}
          />
        </label>

        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create Promotion' : 'Save Draft'}
        </button>
      </form>

      {!isNew && (
        <section className="admin-image-section">
          <h2>Campaign Creative</h2>
          <p className="admin-placeholder-note">Used as the popup creative and homepage/Stays imagery. Displayed in a 1:1 frame — any ratio is accepted and cropped intelligently, never stretched.</p>

          {form.image_storage_path ? (
            <div className="admin-image-grid">
              <div className="admin-image-card is-cover">
                <img src={promotionImagePublicUrl(form.image_storage_path)} alt="" />
                <div className="admin-image-card-actions">
                  <button type="button" onClick={handleRemoveImage} className="admin-image-card-delete">Remove</button>
                </div>
              </div>
            </div>
          ) : (
            <p className="admin-placeholder-note">No creative uploaded yet — the popup will fall back to a clean text-only design until one is added.</p>
          )}

          <label className="admin-btn-primary admin-btn-link admin-upload-btn">
            {uploading ? 'Uploading…' : form.image_storage_path ? 'Replace Creative' : '+ Upload Creative'}
            <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
          </label>
          <p className="admin-placeholder-note">Remember to Save Draft after uploading so the new image is attached to this promotion.</p>
        </section>
      )}
    </div>
  );
}
