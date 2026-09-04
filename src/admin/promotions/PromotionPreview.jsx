import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPromotion, publishPromotion, revertPromotionDraft } from './promotionsApi';
import { mapPromotionRow } from '../../lib/usePromotions';
import { HomePromotionSectionView } from '../../components/HomePromotionSection';
import { StaysPromoReminderView } from '../../components/StaysPromoReminder';
import { PromotionPopupView } from '../../components/PromotionPopup';
import { useAdminAuth } from '../AdminAuthContext';
import { useSettings } from '../../lib/useSettings';
import { normalizeWhatsAppNumber } from '../../lib/phone';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast } from '../ui/AdminUIProvider';
import PreviewShell from '../ui/PreviewShell';
import { canPublish } from '../permissions';

const TABS = [
  { key: 'homepage', label: 'Homepage Section' },
  { key: 'stays', label: 'Stays Reminder' },
  { key: 'popup', label: 'Popup' },
];

export default function PromotionPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staff, role } = useAdminAuth();
  const { showToast } = useToast();
  const settings = useSettings();
  const [promo, setPromo] = useState(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [previewLang, setPreviewLang] = useState('en');
  const [tab, setTab] = useState('homepage');

  const load = useCallback(async () => {
    try {
      setPromo(await getPromotion(id));
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load this promotion'));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error-state">
          <p>{error}</p>
          <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={load}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!promo) return <div className="admin-page"><p>Loading preview…</p></div>;

  const hasDraft = !!promo.draft_data;
  const merged = { ...promo, ...(promo.draft_data ?? {}) };
  const mapped = mapPromotionRow(merged, previewLang);
  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishPromotion(id);
      logActivity(staff, { action: 'publish', entity: 'promotion', entityId: id, detail: `${merged.internal_name} — ${promo.is_published ? 'draft published' : 'first published'}` });
      showToast({ type: 'success', title: 'Promotion published', message: 'Changes published successfully.' });
      navigate(`/admin/promotions/${id}`);
    } catch (err) {
      showToast({ type: 'error', title: 'Publish failed', message: friendlyError(err, 'publish this promotion') });
    } finally {
      setPublishing(false);
    }
  }

  async function handleRevert() {
    try {
      await revertPromotionDraft(id);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed. The live version is unchanged.' });
      navigate(`/admin/promotions/${id}`);
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    }
  }

  return (
    <PreviewShell
      onBack={() => navigate(`/admin/promotions/${id}`)}
      onPublish={handlePublish}
      onRevert={promo.is_published ? handleRevert : undefined}
      publishing={publishing}
      hasDraft={!promo.is_published || hasDraft}
      canPublish={canPublish(role)}
    >
      <div className="admin-preview-toolbar">
        <p className="admin-preview-note">
          {!promo.is_published
            ? 'This promotion has never been published — showing your unpublished draft.'
            : hasDraft ? 'Showing your unpublished draft.' : 'No pending draft, showing the live version.'}
        </p>
        <div className="admin-preview-lang-toggle">
          <button type="button" className={previewLang === 'en' ? 'is-active' : ''} onClick={() => setPreviewLang('en')}>EN</button>
          <button type="button" className={previewLang === 'bn' ? 'is-active' : ''} onClick={() => setPreviewLang('bn')}>বাং</button>
        </div>
      </div>

      <div className="admin-filter-tabs admin-promo-preview-tabs">
        {TABS.map(({ key, label }) => (
          <button key={key} type="button" className={`admin-filter-tab${tab === key ? ' is-active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="admin-preview-frame">
        {tab === 'homepage' && (
          merged.show_on_homepage
            ? <HomePromotionSectionView promo={mapped} lang={previewLang} whatsappNumber={whatsappNumber} />
            : <p className="admin-placeholder-note">&ldquo;Show on Homepage&rdquo; is off — this campaign won&rsquo;t appear here until it&rsquo;s enabled.</p>
        )}
        {tab === 'stays' && (
          merged.show_on_stays
            ? <StaysPromoReminderView promo={mapped} lang={previewLang} whatsappNumber={whatsappNumber} />
            : <p className="admin-placeholder-note">&ldquo;Show on Stays&rdquo; is off — this campaign won&rsquo;t appear here until it&rsquo;s enabled.</p>
        )}
        {tab === 'popup' && (
          merged.show_as_popup ? (
            <div className="admin-promo-popup-stage">
              <PromotionPopupView promo={mapped} lang={previewLang} whatsappNumber={whatsappNumber} onClose={() => {}} />
            </div>
          ) : (
            <p className="admin-placeholder-note">&ldquo;Show as Popup&rdquo; is off — this campaign won&rsquo;t appear here until it&rsquo;s enabled.</p>
          )
        )}
      </div>
    </PreviewShell>
  );
}
