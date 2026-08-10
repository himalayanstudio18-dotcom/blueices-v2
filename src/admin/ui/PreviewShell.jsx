import React from 'react';

/* Shared chrome for every Draft Preview screen (Rooms, Site Content,
   ...) — the PREVIEW MODE banner + Back/Publish actions are always
   the same, only what's rendered underneath differs per entity. */
export default function PreviewShell({ onBack, onPublish, onRevert, publishing, hasDraft, children }) {
  return (
    <div className="admin-preview-shell">
      <div className="admin-preview-banner">
        <div className="admin-preview-banner-text">
          <strong>PREVIEW MODE</strong>
          <span>These changes are not live yet.</span>
        </div>
        <div className="admin-preview-banner-actions">
          {hasDraft && (
            <span className="admin-preview-unsaved">Unsaved changes</span>
          )}
          <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={onBack}>
            ← Back to Editor
          </button>
          {onRevert && hasDraft && (
            <button type="button" className="admin-btn-ghost admin-btn-ghost--danger" onClick={onRevert}>
              Discard Draft
            </button>
          )}
          <button
            type="button"
            className="admin-btn-primary"
            onClick={onPublish}
            disabled={!hasDraft || publishing}
          >
            {publishing ? 'Publishing…' : 'Publish Changes'}
          </button>
        </div>
      </div>
      <div className="admin-preview-content">
        {children}
      </div>
    </div>
  );
}
