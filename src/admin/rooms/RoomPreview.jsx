import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getRoom, publishRoomDraft, revertRoomDraft } from './roomsApi';
import { shapeRoom } from '../../lib/usePublishedRooms';
import RoomDetailsModal from '../../components/RoomDetailsModal';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast } from '../ui/AdminUIProvider';
import PreviewShell from '../ui/PreviewShell';

export default function RoomPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staff } = useAdminAuth();
  const { showToast } = useToast();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [previewLang, setPreviewLang] = useState('en');

  async function load() {
    try {
      setRoom(await getRoom(id));
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load this room'));
    }
  }

  useEffect(() => { load(); }, [id]);

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

  if (!room) return <div className="admin-page"><p>Loading preview…</p></div>;

  const hasPendingImages = (room.room_images ?? []).some((img) => img.is_draft);
  const hasDraft = !!room.draft_data || hasPendingImages;
  const merged = { ...room, ...(room.draft_data ?? {}) };
  const shaped = shapeRoom(merged, previewLang, { includeDraftImages: true });

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishRoomDraft(id);
      logActivity(staff, { action: 'publish', entity: 'room', entityId: id, detail: `${merged.name_en} — draft published` });
      showToast({ type: 'success', title: 'Changes published', message: 'Changes published successfully.' });
      navigate(`/admin/rooms/${id}`);
    } catch (err) {
      showToast({ type: 'error', title: 'Publish failed', message: 'Unable to publish changes. Please try again.' });
      console.error('[admin] publish room draft failed', err);
    } finally {
      setPublishing(false);
    }
  }

  async function handleRevert() {
    try {
      await revertRoomDraft(id);
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed. The live version is unchanged.' });
      navigate(`/admin/rooms/${id}`);
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    }
  }

  return (
    <PreviewShell
      onBack={() => navigate(`/admin/rooms/${id}`)}
      onPublish={handlePublish}
      onRevert={handleRevert}
      publishing={publishing}
      hasDraft={hasDraft}
    >
      <div className="admin-preview-toolbar">
        <p className="admin-preview-note">
          Public room page preview — {hasDraft ? 'showing your unpublished draft' : 'no pending draft, showing the live version'}.
        </p>
        <div className="admin-preview-lang-toggle">
          <button type="button" className={previewLang === 'en' ? 'is-active' : ''} onClick={() => setPreviewLang('en')}>EN</button>
          <button type="button" className={previewLang === 'bn' ? 'is-active' : ''} onClick={() => setPreviewLang('bn')}>বাং</button>
        </div>
      </div>

      <section className="stays-section admin-preview-frame" aria-label="Room preview">
        <div className="section-inner">
          <div className="stays-grid">
            <article className="room-card" onClick={() => setModalOpen(true)} role="button" tabIndex={0}>
              <div className="rc-img-wrap">
                <img src={shaped.img} alt={shaped.name} className="rc-img" />
                <div className="rc-img-overlay"></div>
                <span className={`rc-tag ${shaped.tagClass}`}>{shaped.tag}</span>
              </div>
              <div className="rc-body">
                <h3 className="rc-name">{shaped.name}</h3>
                <div className="rc-meta">
                  <span>{shaped.capacity}</span>
                  <span className="rc-meta-sep" aria-hidden="true"></span>
                  <span>{shaped.size}</span>
                </div>
                <p className="rc-desc">{shaped.shortDesc}</p>
                {shaped.isAvailable ? (
                  <Link to="#" className="btn-warm rc-btn" onClick={(e) => e.preventDefault()}>Reserve This Room</Link>
                ) : (
                  <span className="btn-warm rc-btn rc-btn--disabled">Currently Unavailable</span>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      {modalOpen && (
        <RoomDetailsModal room={shaped} ctaLabel="Reserve This Room" onClose={() => setModalOpen(false)} />
      )}
    </PreviewShell>
  );
}
