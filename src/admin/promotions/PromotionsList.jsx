import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listPromotions, promotionImagePublicUrl, promotionStatus,
  deletePromotion, duplicatePromotion, publishPromotion, unpublishPromotion,
} from './promotionsApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { can, canPublish } from '../permissions';

const GROUPS = [
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'draft', label: 'Draft' },
  { key: 'expired', label: 'Expired / Archived' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PromotionsList() {
  const { staff, role } = useAdminAuth();
  const canCreate = can(role, 'promotions', 'create');
  const canEdit = can(role, 'promotions', 'edit');
  const canDelete = can(role, 'promotions', 'delete');
  const canDup = can(role, 'promotions', 'duplicate');
  const canTogglePublish = canPublish(role);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [promotions, setPromotions] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setPromotions(await listPromotions());
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load promotions'));
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const buckets = { active: [], scheduled: [], draft: [], expired: [] };
    for (const promo of promotions ?? []) buckets[promotionStatus(promo)].push(promo);
    return buckets;
  }, [promotions]);

  async function handleToggle(promo) {
    setBusyId(promo.id);
    const nextPublished = !promo.is_published;
    try {
      if (nextPublished) await publishPromotion(promo.id);
      else await unpublishPromotion(promo.id);
      logActivity(staff, { action: nextPublished ? 'publish' : 'unpublish', entity: 'promotion', entityId: promo.id, detail: promo.internal_name, oldValue: promo.is_published, newValue: nextPublished });
      showToast({
        type: 'success',
        title: nextPublished ? 'Promotion enabled' : 'Promotion disabled',
        message: `"${promo.internal_name}" is ${nextPublished ? 'now live within its scheduled window' : 'no longer visible on the live site'}.`,
      });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: nextPublished ? 'Enable failed' : 'Disable failed', message: friendlyError(err, 'update this promotion') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(promo) {
    setBusyId(promo.id);
    try {
      const created = await duplicatePromotion(promo.id);
      logActivity(staff, { action: 'create', entity: 'promotion', entityId: created.id, detail: `duplicated from ${promo.internal_name}` });
      showToast({ type: 'success', title: 'Promotion duplicated', message: `A draft copy of "${promo.internal_name}" was created.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Duplicate failed', message: friendlyError(err, 'duplicate this promotion') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(promo) {
    const status = promotionStatus(promo);
    const confirmed = await confirm({
      title: 'Delete Promotion?',
      message: status === 'active'
        ? `"${promo.internal_name}" is currently ACTIVE and visible on the live site. Deleting it will remove it immediately. This action cannot be undone.`
        : `Are you sure you want to delete "${promo.internal_name}"? This action cannot be undone.`,
      confirmLabel: 'Delete Promotion',
    });
    if (!confirmed) return;

    setBusyId(promo.id);
    try {
      await deletePromotion(promo.id, promo.image_storage_path);
      logActivity(staff, { action: 'delete', entity: 'promotion', entityId: promo.id, detail: promo.internal_name });
      showToast({ type: 'success', title: 'Promotion deleted', message: `"${promo.internal_name}" was deleted successfully.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Delete failed', message: friendlyError(err, 'delete this promotion') });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow">Promotions</p>
          <h1>Manage Promotions</h1>
        </div>
        {canCreate && (
          <Link to="/admin/promotions/new" className="admin-btn-primary admin-btn-link" aria-label="Create a new promotion">
            <span aria-hidden="true">+</span> Create Promotion
          </Link>
        )}
      </header>

      {error && (
        <div className="admin-error-state">
          <p>{error}</p>
          <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={load}>Try Again</button>
        </div>
      )}

      {promotions === null && !error && (
        <div className="admin-loading-state">
          <div className="admin-spinner" aria-hidden="true" />
          <p>Loading promotions…</p>
        </div>
      )}

      {promotions?.length === 0 && !error && (
        <div className="admin-empty-state">
          <p className="admin-empty-state-title">No promotions yet</p>
          <p className="admin-empty-state-sub">Create your first campaign — it starts as a draft and won&rsquo;t appear on the site until you publish it.</p>
          {canCreate && <Link to="/admin/promotions/new" className="admin-btn-primary admin-btn-link">+ Create Promotion</Link>}
        </div>
      )}

      {promotions && promotions.length > 0 && GROUPS.map(({ key, label }) => (
        grouped[key].length > 0 && (
          <section key={key} className="admin-promo-group">
            <h2 className="admin-promo-group-title">{label} <span className="admin-promo-group-count">({grouped[key].length})</span></h2>
            <div className="admin-room-list">
              {grouped[key].map((promo) => {
                const busy = busyId === promo.id;
                return (
                  <div key={promo.id} className="admin-room-row">
                    <div className="admin-room-row-img">
                      {promo.image_storage_path
                        ? <img src={promotionImagePublicUrl(promo.image_storage_path)} alt="" />
                        : <div className="admin-room-row-img-empty">No creative</div>}
                    </div>
                    <div className="admin-room-row-body">
                      <h3>{promo.internal_name}</h3>
                      <p>{promo.headline_en || 'No headline set'}</p>
                      <p className="admin-room-row-updated">
                        {formatDate(promo.start_date)} – {formatDate(promo.end_date)}
                      </p>
                    </div>
                    <div className="admin-room-row-badges">
                      <span className={`admin-badge ${promo.is_published ? 'is-live' : 'is-draft'}`}>
                        {promo.is_published ? 'Published' : 'Draft'}
                      </span>
                      {promo.is_featured && <span className="admin-badge is-featured">Featured</span>}
                      {promo.show_as_popup && <span className="admin-badge is-unavailable">Popup</span>}
                    </div>
                    <div className="admin-room-row-actions">
                      {canEdit && <Link to={`/admin/promotions/${promo.id}/preview`} className="admin-btn-ghost admin-btn-ghost--dark">Preview</Link>}
                      {canEdit && <Link to={`/admin/promotions/${promo.id}`} className="admin-btn-ghost admin-btn-ghost--dark">Edit</Link>}
                      {canTogglePublish && (
                        <button className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => handleToggle(promo)} disabled={busy}>
                          {promo.is_published ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      {canDup && (
                        <button className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => handleDuplicate(promo)} disabled={busy}>Duplicate</button>
                      )}
                      {canDelete && (
                        <button className="admin-btn-ghost admin-btn-ghost--danger" onClick={() => handleDelete(promo)} disabled={busy}>
                          {busy ? 'Working…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
