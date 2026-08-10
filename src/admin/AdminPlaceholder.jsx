import React from 'react';

export default function AdminPlaceholder({ title, phase }) {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">Coming in {phase}</p>
        <h1>{title}</h1>
      </header>
      <p className="admin-placeholder-note">
        This section isn't built yet — it's next in the build plan.
      </p>
    </div>
  );
}
