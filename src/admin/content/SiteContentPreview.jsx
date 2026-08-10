import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SECTIONS, PAGES } from './sectionConfig';
import { listSiteContent, publishAllDrafts, revertAllDrafts } from './siteContentApi';
import { SiteContentPreviewProvider } from '../../lib/useSiteContent';
import { LanguageProvider } from '../../context/LanguageContext';
import Hero from '../../components/Hero';
import Introduction from '../../components/Introduction';
import ExperiencesHero from '../../components/ExperiencesHero';
import PoliciesBox from '../../components/PoliciesBox';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast } from '../ui/AdminUIProvider';
import PreviewShell from '../ui/PreviewShell';

/* Only pages with real visual content get a rendered preview — the
   'contact'/'stays' pages currently only carry SEO meta fields
   (title/description), which have no visible on-page representation
   to render; those get a plain text summary instead. */
const VISUAL_PREVIEW = {
  home: () => <Hero />,
  story: () => <Introduction />,
  experiences: () => <ExperiencesHero />,
  policies: () => <PoliciesBox />,
};

export default function SiteContentPreview() {
  const { page } = useParams();
  const navigate = useNavigate();
  const { staff } = useAdminAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const sections = SECTIONS[page] ?? [];
  const pageLabel = PAGES.find((p) => p.value === page)?.label ?? page;

  async function load() {
    setContent(await listSiteContent(page));
  }

  useEffect(() => { load(); }, [page]);

  if (!content) return <div className="admin-page"><p>Loading preview…</p></div>;

  const draftKeys = sections
    .map((s) => s.key)
    .filter((key) => content[key]?.draft_value_en != null || content[key]?.draft_value_bn != null);
  const hasDraft = draftKeys.length > 0;

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishAllDrafts(page, draftKeys);
      logActivity(staff, { action: 'publish', entity: 'site_content', detail: `${page} — ${draftKeys.length} section(s) published` });
      showToast({ type: 'success', title: 'Changes published', message: 'Changes published successfully.' });
      navigate('/admin/content');
    } catch (err) {
      showToast({ type: 'error', title: 'Publish failed', message: 'Unable to publish changes. Please try again.' });
      console.error('[admin] publish site content draft failed', err);
    } finally {
      setPublishing(false);
    }
  }

  async function handleRevert() {
    try {
      await revertAllDrafts(page, draftKeys);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed. The live version is unchanged.' });
      navigate('/admin/content');
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    }
  }

  const VisualComponent = VISUAL_PREVIEW[page];

  return (
    <PreviewShell
      onBack={() => navigate('/admin/content')}
      onPublish={handlePublish}
      onRevert={handleRevert}
      publishing={publishing}
      hasDraft={hasDraft}
    >
      <p className="admin-preview-note">
        {pageLabel} preview — {hasDraft ? 'showing your unpublished draft' : 'no pending draft, showing the live version'}.
      </p>

      {VisualComponent ? (
        <div className="admin-preview-frame">
          <LanguageProvider>
            <SiteContentPreviewProvider>
              <VisualComponent />
            </SiteContentPreviewProvider>
          </LanguageProvider>
        </div>
      ) : (
        <div className="admin-content-card">
          <p className="admin-placeholder-note">
            This page only has SEO meta fields, which don't have a visible on-page appearance to preview —
            they affect how the page shows up in search results and link previews instead. Pending changes:
          </p>
          <ul>
            {sections.filter((s) => draftKeys.includes(s.key)).map((s) => (
              <li key={s.key}>
                <strong>{s.label}:</strong> {content[s.key]?.draft_value_en || <em>(unchanged)</em>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </PreviewShell>
  );
}
