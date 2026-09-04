import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PAGES, SECTIONS } from './sectionConfig';
import { listSiteContent, saveDraftContent, publishAllDrafts, revertAllDrafts, uploadSiteContentImage } from './siteContentApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { can, canPublish } from '../permissions';
import { buildRoomReservationMessage } from '../../lib/phone';

/* Admin-only example names for the "Preview Message" room selector on
   the whatsapp-template field — cosmetic only, never used to build the
   real reservation URL (that always uses the live room.name from
   usePublishedRooms(), see FeaturedStay.jsx). */
const PREVIEW_ROOM_NAMES = ['Siddhi', 'Riddhi', 'Swastik'];

/* Deliberately provider-agnostic (no host allowlist, unlike Settings'
   google_maps_embed_url validator) — this field accepts any video
   embed provider's URL, not just one. Blank is valid: it means "no
   video configured," and the public section simply doesn't render. */
function validateEmbedUrl(value) {
  if (!value) return null;
  let url;
  try { url = new URL(value); } catch { return 'Enter a valid embed URL (starting with https://).'; }
  if (url.protocol !== 'https:') return 'Embed URL must use https://.';
  return null;
}

export default function SiteContentPage() {
  const { staff, role } = useAdminAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [page, setPage] = useState('home');
  const canEditPage = can(role, 'content', 'edit');
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [savedKey, setSavedKey] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [previewKey, setPreviewKey] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewRoomName, setPreviewRoomName] = useState(PREVIEW_ROOM_NAMES[0]);

  const load = useCallback(async () => {
    setContent(null);
    try {
      setContent(await listSiteContent(page));
      setError('');
    } catch (err) {
      setError(friendlyError(err, "load this page's content"));
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function save(sectionKey, fields, previousValue) {
    try {
      await saveDraftContent(page, sectionKey, fields);
      logActivity(staff, {
        action: 'update',
        entity: 'site_content',
        detail: `${page} → ${sectionKey} (draft)`,
        oldValue: previousValue,
        newValue: fields.value_en ?? fields.value_bn,
      });
      setContent((c) => ({ ...c, [sectionKey]: { section_key: sectionKey, ...c?.[sectionKey], draft_value_en: fields.value_en, draft_value_bn: fields.value_bn } }));
      setSavedKey(sectionKey);
      setTimeout(() => setSavedKey((k) => (k === sectionKey ? null : k)), 1800);
    } catch (err) {
      const friendly = friendlyError(err, 'save this change');
      setError(friendly);
      showToast({ type: 'error', title: 'Save failed', message: friendly });
    }
  }

  /* Uploads go through the same draft path as every other field —
     save() below only ever writes draft_value_en, so the live image
     is untouched until Publish, exactly like a typed hero_image URL. */
  async function handleImageUpload(sectionKey, file, previousValue) {
    setUploadingKey(sectionKey);
    try {
      const url = await uploadSiteContentImage(file, sectionKey);
      await save(sectionKey, { value_en: url, value_bn: null }, previousValue);
    } catch (err) {
      const friendly = friendlyError(err, 'upload this image');
      setError(friendly);
      showToast({ type: 'error', title: 'Upload failed', message: friendly });
    } finally {
      setUploadingKey(null);
    }
  }

  const sections = SECTIONS[page] ?? [];
  const draftKeys = sections
    .map((s) => s.key)
    .filter((key) => content?.[key]?.draft_value_en != null || content?.[key]?.draft_value_bn != null);
  const hasDraft = draftKeys.length > 0;

  async function handlePublishAll() {
    setPublishing(true);
    try {
      await publishAllDrafts(page, draftKeys);
      logActivity(staff, { action: 'publish', entity: 'site_content', detail: `${page} — ${draftKeys.length} section(s)` });
      showToast({ type: 'success', title: 'Changes published', message: 'Changes published successfully.' });
      await load();
    } catch {
      showToast({ type: 'error', title: 'Publish failed', message: 'Unable to publish changes. Please try again.' });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDiscardAll() {
    const confirmed = await confirm({
      title: 'Discard Draft?',
      message: `Discard your unpublished changes on this page? The live version will stay exactly as it is now.`,
      confirmLabel: 'Discard Draft',
    });
    if (!confirmed) return;
    try {
      await revertAllDrafts(page, draftKeys);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed.' });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow">Site Content</p>
          <h1>Edit Page Content</h1>
        </div>
        <div className="admin-editor-status">
          {hasDraft && <span className="admin-badge is-draft">{draftKeys.length} pending change{draftKeys.length > 1 ? 's' : ''}</span>}
          <Link to={`/admin/content/preview/${page}`} className="admin-btn-ghost admin-btn-ghost--dark">Preview</Link>
          {hasDraft && (
            <>
              <button type="button" className="admin-btn-ghost admin-btn-ghost--danger" onClick={handleDiscardAll}>Discard Draft</button>
              {canPublish(role) ? (
                <button type="button" className="admin-btn-primary" onClick={handlePublishAll} disabled={publishing}>
                  {publishing ? 'Publishing…' : 'Publish Changes'}
                </button>
              ) : (
                <span className="admin-placeholder-note">Ask an Owner or Manager to publish this draft.</span>
              )}
            </>
          )}
        </div>
      </header>

      <p className="admin-placeholder-note admin-editor-hint">
        {canEditPage
          ? "Changes save as a draft — the live site won't change until you Preview and Publish."
          : "You can view this page's content, but your role can't edit it."}
      </p>

      {error && <p className="admin-auth-error">{error}</p>}

      <div className="admin-filter-tabs">
        {PAGES.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`admin-filter-tab${page === p.value ? ' is-active' : ''}`}
            onClick={() => setPage(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {content === null && !error && <p>Loading…</p>}

      <div className="admin-content-sections">
        {content && sections.map((s) => {
          const row = content[s.key] ?? {};
          const isDraft = row.draft_value_en != null || row.draft_value_bn != null;
          const shownEn = isDraft ? (row.draft_value_en ?? '') : (row.value_en ?? '');
          const shownBn = isDraft ? (row.draft_value_bn ?? '') : (row.value_bn ?? '');
          const InputTag = s.type === 'textarea' ? 'textarea' : 'input';
          return (
            <div key={s.key} className="admin-content-card">
              <div className="admin-content-card-header">
                <h3>{s.label}</h3>
                {isDraft && <span className="admin-badge is-draft">Draft</span>}
                {savedKey === s.key && <span className="admin-content-saved">Draft saved</span>}
              </div>
              {s.description && <p className="admin-placeholder-note">{s.description}</p>}
              {s.type === 'image' ? (
                <div className="admin-image-grid">
                  <div className="admin-image-card">
                    <img src={shownEn || s.defaultUrl} alt="" />
                  </div>
                </div>
              ) : s.type === 'embed' ? (
                <div className="admin-embed-field">
                  <label className="admin-field">
                    <span>Embed URL</span>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/… or https://player.vimeo.com/video/…"
                      defaultValue={shownEn}
                      key={`${s.key}-en-${shownEn}`}
                      disabled={!canEditPage}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === shownEn) return;
                        const validationError = validateEmbedUrl(value);
                        setFieldErrors((f) => ({ ...f, [s.key]: validationError }));
                        if (validationError) return;
                        save(s.key, { value_en: value || null, value_bn: null }, shownEn);
                      }}
                    />
                  </label>
                  {fieldErrors[s.key] && <p className="admin-auth-error">{fieldErrors[s.key]}</p>}
                  <button
                    type="button"
                    className="admin-btn-ghost"
                    onClick={() => setPreviewKey((k) => (k === s.key ? null : s.key))}
                    disabled={!shownEn}
                  >
                    {previewKey === s.key ? 'Hide Preview' : 'Preview Embed'}
                  </button>
                  {previewKey === s.key && shownEn && (
                    <div className="admin-embed-preview">
                      <div className="admin-embed-preview-frame">
                        <iframe src={shownEn} title="Embed preview" loading="lazy" allowFullScreen />
                      </div>
                    </div>
                  )}
                </div>
              ) : s.type === 'whatsapp-template' ? (
                <div className="admin-embed-field">
                  <label className="admin-field">
                    <span>Message Template</span>
                    <textarea
                      rows={6}
                      defaultValue={shownEn || s.defaultValue || ''}
                      key={`${s.key}-en-${shownEn}`}
                      disabled={!canEditPage}
                      onBlur={(e) => {
                        const current = shownEn || s.defaultValue || '';
                        if (e.target.value !== current) save(s.key, { value_en: e.target.value, value_bn: null }, current);
                      }}
                    />
                  </label>
                  <div className="admin-form-grid">
                    <label className="admin-field">
                      <span>Preview Room</span>
                      <select value={previewRoomName} onChange={(e) => setPreviewRoomName(e.target.value)}>
                        {PREVIEW_ROOM_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-ghost"
                    onClick={() => setPreviewKey((k) => (k === s.key ? null : s.key))}
                  >
                    {previewKey === s.key ? 'Hide Preview' : 'Preview Message'}
                  </button>
                  {previewKey === s.key && (
                    <div className="admin-embed-preview">
                      <p className="admin-placeholder-note" style={{ marginBottom: '0.5rem' }}>
                        Exact message sent for the {previewRoomName} room:
                      </p>
                      <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
                        {buildRoomReservationMessage(previewRoomName, shownEn || s.defaultValue)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className={s.bilingual ? 'admin-form-grid' : undefined}>
                  <label className="admin-field">
                    <span>{s.bilingual ? 'English' : 'Value'}</span>
                    <InputTag
                      {...(s.type === 'textarea' ? { rows: 3 } : {})}
                      defaultValue={shownEn || s.defaultValueEn || ''}
                      key={`${s.key}-en-${shownEn}`}
                      disabled={!canEditPage}
                      onBlur={(e) => {
                        const current = shownEn || s.defaultValueEn || '';
                        if (e.target.value !== current) save(s.key, { value_en: e.target.value, value_bn: shownBn || null }, current);
                      }}
                    />
                  </label>
                  {s.bilingual && (
                    <label className="admin-field">
                      <span>Bengali</span>
                      <InputTag
                        {...(s.type === 'textarea' ? { rows: 3 } : {})}
                        defaultValue={shownBn || s.defaultValueBn || ''}
                        key={`${s.key}-bn-${shownBn}`}
                        disabled={!canEditPage}
                        onBlur={(e) => {
                          const current = shownBn || s.defaultValueBn || '';
                          if (e.target.value !== current) save(s.key, { value_en: shownEn || null, value_bn: e.target.value }, current);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
              {s.type === 'image' && canEditPage && (
                <label className="admin-btn-primary admin-btn-link admin-upload-btn">
                  {uploadingKey === s.key ? 'Uploading…' : shownEn ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploadingKey === s.key}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) handleImageUpload(s.key, file, shownEn);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
