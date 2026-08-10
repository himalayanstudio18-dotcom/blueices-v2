import React, { useEffect, useMemo, useState } from 'react';
import { listInquiries, updateInquiry } from './inquiriesApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast } from '../ui/AdminUIProvider';
import { can } from '../permissions';

const STATUSES = ['new', 'contacted', 'confirmed', 'cancelled', 'archived'];

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InquiriesPage() {
  const { staff, role } = useAdminAuth();
  const canSearchFilter = can(role, 'inquiries', 'search');
  const canUpdateStatus = can(role, 'inquiries', 'updateStatus');
  const canArchive = can(role, 'inquiries', 'archive');
  const canAddNotes = can(role, 'inquiries', 'addNotes');
  const canCall = can(role, 'inquiries', 'call');
  const canWhatsapp = can(role, 'inquiries', 'whatsapp');
  const canEmail = can(role, 'inquiries', 'email');
  const visibleStatuses = canArchive ? STATUSES : STATUSES.filter((s) => s !== 'archived');
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('new');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});

  async function load() {
    try {
      setInquiries(await listInquiries());
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load inquiries'));
    }
  }

  useEffect(() => { load(); }, []);

  async function setStatus(inquiry, status) {
    setBusyId(inquiry.id);
    try {
      await updateInquiry(inquiry.id, { status });
      logActivity(staff, { action: 'update', entity: 'inquiry', entityId: inquiry.id, detail: `${inquiry.name} → ${status}` });
      showToast({
        type: 'success',
        title: 'Inquiry status changed',
        message: `"${inquiry.name}" marked as ${status}.`,
      });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: friendlyError(err, 'update this inquiry') });
    } finally {
      setBusyId(null);
    }
  }

  async function saveNotes(inquiry) {
    const value = notesDraft[inquiry.id];
    if (value === undefined || value === (inquiry.internal_notes ?? '')) return;
    setBusyId(inquiry.id);
    try {
      await updateInquiry(inquiry.id, { internal_notes: value });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Save failed', message: friendlyError(err, 'save these notes') });
    } finally {
      setBusyId(null);
    }
  }

  const visible = useMemo(() => {
    let list = inquiries ?? [];
    if (filter !== 'all') list = list.filter((i) => i.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) =>
        i.name?.toLowerCase().includes(q) ||
        i.phone?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiries, filter, search]);

  const counts = useMemo(() => {
    const c = { all: inquiries?.length ?? 0 };
    STATUSES.forEach((s) => { c[s] = inquiries?.filter((i) => i.status === s).length ?? 0; });
    return c;
  }, [inquiries]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">Inquiries</p>
        <h1>Guest Inquiries</h1>
      </header>

      {error && <p className="admin-auth-error">{error}</p>}

      {canSearchFilter && (
        <div className="admin-inquiries-toolbar">
          <div className="admin-filter-tabs">
            {['all', ...STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                className={`admin-filter-tab${filter === s ? ' is-active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s[0].toUpperCase() + s.slice(1)} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
          <input
            className="admin-search-input"
            type="search"
            placeholder="Search name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {inquiries === null && !error && <p>Loading…</p>}
      {inquiries?.length === 0 && <p>No inquiries yet.</p>}
      {inquiries?.length > 0 && visible.length === 0 && <p>No inquiries match this filter.</p>}

      <div className="admin-inquiry-list">
        {visible.map((inq) => {
          const busy = busyId === inq.id;
          return (
            <div key={inq.id} className="admin-inquiry-card">
              <div className="admin-inquiry-card-top">
                <div>
                  <h3>{inq.name}</h3>
                  <p className="admin-inquiry-meta">
                    {formatDate(inq.created_at)}
                    {inq.check_in && ` · Stay: ${formatDate(inq.check_in)} → ${formatDate(inq.check_out)}`}
                    {inq.guests && ` · ${inq.guests} guest${inq.guests > 1 ? 's' : ''}`}
                    {inq.rooms?.name_en && ` · ${inq.rooms.name_en}`}
                  </p>
                </div>
                <span className={`admin-badge is-${inq.status}`}>{inq.status}</span>
              </div>

              {inq.message && <p className="admin-inquiry-message">{inq.message}</p>}

              <div className="admin-inquiry-contact-actions">
                {inq.phone && canCall && (
                  <a className="admin-btn-ghost admin-btn-ghost--dark" href={`tel:${inq.phone}`}>Call</a>
                )}
                {inq.phone && canWhatsapp && (
                  <a className="admin-btn-ghost admin-btn-ghost--dark" href={`https://wa.me/${inq.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                )}
                {inq.email && canEmail && (
                  <a className="admin-btn-ghost admin-btn-ghost--dark" href={`mailto:${inq.email}`}>Email</a>
                )}
              </div>

              {canAddNotes && (
                <label className="admin-field admin-inquiry-notes">
                  <span>Internal Notes</span>
                  <textarea
                    rows={2}
                    defaultValue={inq.internal_notes ?? ''}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [inq.id]: e.target.value }))}
                    onBlur={() => saveNotes(inq)}
                    placeholder="Private notes — not visible to the guest"
                  />
                </label>
              )}

              {canUpdateStatus && (
                <div className="admin-inquiry-status-actions">
                  {visibleStatuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`admin-btn-ghost admin-btn-ghost--dark${inq.status === s ? ' is-active' : ''}`}
                      onClick={() => setStatus(inq, s)}
                      disabled={busy || inq.status === s}
                    >
                      {s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
