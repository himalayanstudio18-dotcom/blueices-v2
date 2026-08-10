import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PAGES, SECTIONS } from './sectionConfig';
import { listSiteContent, saveDraftContent, publishAllDrafts, revertAllDrafts } from './siteContentApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { canEditContentPage } from '../permissions';

export default function SiteContentPage() {
  const { staff, role } = useAdminAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [page, setPage] = useState('home');
  const canEditPage = canEditContentPage(role, page);
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [savedKey, setSavedKey] = useState(null);
  const [publishing, setPublishing] = useState(false);

  async function load() {
    setContent(null);
    try {
      setContent(await listSiteContent(page));
      setError('');
    } catch (err) {
      setError(friendlyError(err, "load this page's content"));
    }
  }

  useEffect(() => { load(); }, [page]);

  async function save(sectionKey, fields) {
    try {
      await saveDraftContent(page, sectionKey, fields);
      logActivity(staff, { action: 'update', entity: 'site_content', detail: `${page} → ${sectionKey} (draft)` });
      setContent((c) => ({ ...c, [sectionKey]: { section_key: sectionKey, ...c?.[sectionKey], draft_value_en: fields.value_en, draft_value_bn: fields.value_bn } }));
      setSavedKey(sectionKey);
      setTimeout(() => setSavedKey((k) => (k === sectionKey ? null : k)), 1800);
    } catch (err) {
      const friendly = friendlyError(err, 'save this change');
      setError(friendly);
      showToast({ type: 'error', title: 'Save failed', message: friendly });
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
    } catch (err) {
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
              <button type="button" className="admin-btn-primary" onClick={handlePublishAll} disabled={publishing}>
                {publishing ? 'Publishing…' : 'Publish Changes'}
              </button>
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
              <div className={s.bilingual ? 'admin-form-grid' : undefined}>
                <label className="admin-field">
                  <span>{s.bilingual ? 'English' : 'Value'}</span>
                  <InputTag
                    {...(s.type === 'textarea' ? { rows: 3 } : {})}
                    defaultValue={shownEn}
                    key={`${s.key}-en-${shownEn}`}
                    disabled={!canEditPage}
                    onBlur={(e) => e.target.value !== shownEn && save(s.key, { value_en: e.target.value, value_bn: shownBn || null })}
                  />
                </label>
                {s.bilingual && (
                  <label className="admin-field">
                    <span>Bengali</span>
                    <InputTag
                      {...(s.type === 'textarea' ? { rows: 3 } : {})}
                      defaultValue={shownBn}
                      key={`${s.key}-bn-${shownBn}`}
                      disabled={!canEditPage}
                      onBlur={(e) => e.target.value !== shownBn && save(s.key, { value_en: shownEn || null, value_bn: e.target.value })}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
