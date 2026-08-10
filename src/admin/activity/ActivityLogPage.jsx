import React, { useEffect, useState } from 'react';
import { listActivityLog } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useAdminAuth } from '../AdminAuthContext';
import { activityScope } from '../permissions';

function formatWhen(d) {
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function describe(entry) {
  const entity = entry.entity.replace(/_/g, ' ');
  return `${entry.user_name} ${entry.action}d ${entity}${entry.detail ? ` — ${entry.detail}` : ''}`;
}

export default function ActivityLogPage() {
  const { role } = useAdminAuth();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');
  const limitedScope = activityScope(role) === 'own';

  useEffect(() => {
    listActivityLog().then(setEntries).catch((err) => setError(friendlyError(err, 'load the activity log')));
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">Activity Log</p>
        <h1>Who Changed What</h1>
      </header>

      {limitedScope && <p className="admin-placeholder-note">Showing your own activity only.</p>}

      {error && <p className="admin-auth-error">{error}</p>}
      {entries === null && !error && <p>Loading…</p>}
      {entries?.length === 0 && <p>No activity recorded yet.</p>}

      <div className="admin-activity-list">
        {entries?.map((entry) => (
          <div key={entry.id} className="admin-activity-row">
            <span className={`admin-badge is-${entry.action === 'delete' ? 'unavailable' : entry.action === 'create' ? 'live' : 'draft'}`}>
              {entry.action}
            </span>
            <p>{describe(entry)}</p>
            <span className="admin-activity-time">{formatWhen(entry.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
