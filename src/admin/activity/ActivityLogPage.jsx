import React, { useEffect, useMemo, useState } from 'react';
import { listActivityLog } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useAdminAuth } from '../AdminAuthContext';
import { activityScope } from '../permissions';

const ROLES = ['owner', 'manager', 'editor', 'staff'];
const SECTIONS = ['Rooms', 'Gallery', 'Inquiries', 'Site Content', 'Staff', 'Settings', 'Account'];
const ACTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'publish', label: 'Publish' },
  { value: 'unpublish', label: 'Unpublish' },
  { value: 'upload', label: 'Upload' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'permission_change', label: 'Permission Change' },
  { value: 'settings_change', label: 'Settings Change' },
];
const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const ENTITY_LABEL = {
  room: 'Room', gallery_image: 'Gallery Image', inquiry: 'Inquiry',
  site_content: 'Site Content', staff: 'Staff', settings: 'Settings', account: 'Account',
};
const ACTION_VERB = {
  create: 'Added', update: 'Updated', delete: 'Deleted', publish: 'Published',
  unpublish: 'Unpublished', upload: 'Uploaded', login: 'Logged in', logout: 'Logged out',
  permission_change: 'Changed', settings_change: 'Updated',
};

function actionHeadline(entry) {
  if (entry.action === 'login' || entry.action === 'logout') return ACTION_VERB[entry.action];
  if (entry.action === 'permission_change' && entry.entity === 'staff') return 'Changed Staff Permission';
  const verb = ACTION_VERB[entry.action] ?? entry.action;
  const noun = ENTITY_LABEL[entry.entity] ?? entry.entity ?? '';
  return `${verb} ${noun}`.trim();
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatFullDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function dayBucket(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOf = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return formatDate(dateStr);
}

function inRange(dateStr, range, from, to) {
  if (range === 'all') return true;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'today') return d >= startOfToday;
  if (range === 'yesterday') {
    const y = new Date(startOfToday);
    y.setDate(y.getDate() - 1);
    return d >= y && d < startOfToday;
  }
  if (range === '7d') {
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 6);
    return d >= cutoff;
  }
  if (range === '30d') {
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 29);
    return d >= cutoff;
  }
  if (range === 'custom') {
    if (from && d < new Date(from)) return false;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  }
  return true;
}

export default function ActivityLogPage() {
  const { role, staff } = useAdminAuth();
  const scope = activityScope(role);
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');
  const [userFilter, setUserFilter] = useState(scope === 'own' ? (staff?.name ?? 'all') : 'all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listActivityLog().then(setEntries).catch((err) => setError(friendlyError(err, 'load the activity log')));
  }, []);

  const users = useMemo(() => {
    const set = new Set((entries ?? []).map((e) => e.user_name));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => (entries ?? []).filter((e) => {
    if (userFilter !== 'all' && e.user_name !== userFilter) return false;
    if (roleFilter !== 'all' && e.user_role !== roleFilter) return false;
    if (actionFilter !== 'all' && e.action !== actionFilter) return false;
    if (sectionFilter !== 'all' && e.section !== sectionFilter) return false;
    if (!inRange(e.created_at, dateRange, customFrom, customTo)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = [e.user_name, e.action, e.section, e.description].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [entries, userFilter, roleFilter, actionFilter, sectionFilter, dateRange, customFrom, customTo, search]);

  /* created_at is already newest-first from listActivityLog()'s
     query — grouping preserves that order within and across days. */
  const groups = useMemo(() => {
    const map = new Map();
    for (const e of filtered) {
      const key = dayBucket(e.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">Activity Log</p>
        <h1>Who Changed What</h1>
      </header>

      {scope === 'own' && (
        <p className="admin-placeholder-note">
          {role === 'staff' ? 'Showing Inquiries activity and your own activity.' : 'Showing Rooms/Gallery/Site Content activity and your own activity.'}
        </p>
      )}
      {scope === 'operational' && <p className="admin-placeholder-note">Showing operational activity — Staff, Settings, and Account changes are Owner-only.</p>}

      {error && <p className="admin-auth-error">{error}</p>}

      <div className="admin-activity-filters">
        <input
          className="admin-search-input"
          type="search"
          placeholder="Search by user, action, section, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-sort-select" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} aria-label="Filter by user">
          <option value="all">All Users</option>
          {users.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select className="admin-sort-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select className="admin-sort-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} aria-label="Filter by action">
          <option value="all">All Actions</option>
          {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <select className="admin-sort-select" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} aria-label="Filter by section">
          <option value="all">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-filter-tabs">
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            className={`admin-filter-tab${dateRange === r.value ? ' is-active' : ''}`}
            onClick={() => setDateRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {dateRange === 'custom' && (
        <div className="admin-activity-custom-range">
          <label className="admin-field">
            <span>From</span>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          </label>
          <label className="admin-field">
            <span>To</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </label>
        </div>
      )}

      {entries === null && !error && <p>Loading…</p>}
      {entries?.length === 0 && <p>No activity recorded yet.</p>}
      {entries?.length > 0 && filtered.length === 0 && <p>No activity matches your filters.</p>}

      <div className="admin-activity-list">
        {groups.map(([label, group]) => (
          <div key={label} className="admin-activity-day-group">
            <h2 className="admin-activity-day-heading">{label}</h2>
            {group.map((entry) => (
              <button key={entry.id} type="button" className="admin-activity-card" onClick={() => setSelected(entry)}>
                <div className="admin-activity-card-user">
                  <span className="admin-activity-card-name">{entry.user_name}</span>
                  <span className={`admin-badge admin-role-badge is-role-${entry.user_role}`}>{entry.user_role}</span>
                </div>
                <div className="admin-activity-card-body">
                  <p className="admin-activity-card-headline">{actionHeadline(entry)}</p>
                  {entry.description && <p className="admin-activity-card-item">{entry.description}</p>}
                </div>
                <div className="admin-activity-card-meta">
                  <span className="admin-activity-card-date">{formatDate(entry.created_at)}</span>
                  <span className="admin-activity-card-time">{formatTime(entry.created_at)}</span>
                </div>
                {entry.section && <span className="admin-badge is-draft admin-activity-section-badge">{entry.section}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <div className="admin-confirm-overlay" onClick={() => setSelected(null)}>
          <div className="admin-confirm-dialog admin-activity-detail-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Activity Details</h2>
            <dl className="admin-activity-detail-grid">
              <dt>User</dt><dd>{selected.user_name}</dd>
              <dt>Role</dt><dd>{selected.user_role ? selected.user_role[0].toUpperCase() + selected.user_role.slice(1) : '—'}</dd>
              <dt>Action</dt><dd>{ACTIONS.find((a) => a.value === selected.action)?.label ?? selected.action}</dd>
              <dt>Section</dt><dd>{selected.section ?? '—'}</dd>
              <dt>Item</dt><dd>{selected.description ?? '—'}</dd>
              <dt>Date</dt><dd>{formatFullDate(selected.created_at)}</dd>
              <dt>Time</dt><dd>{formatTime(selected.created_at)}</dd>
              {selected.old_value != null && <><dt>Previous Value</dt><dd>{selected.old_value}</dd></>}
              {selected.new_value != null && <><dt>New Value</dt><dd>{selected.new_value}</dd></>}
              <dt>Device</dt><dd>{selected.device ?? '—'}</dd>
              <dt>Status</dt><dd>Successful</dd>
            </dl>
            <div className="admin-confirm-actions">
              <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
