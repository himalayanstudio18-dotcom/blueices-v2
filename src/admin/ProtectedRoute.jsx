import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { loading, isAuthenticated, isRecognizedStaff, role } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-fullscreen-state">
        <div className="admin-spinner" aria-hidden="true" />
        <p>Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isRecognizedStaff) {
    return (
      <div className="admin-fullscreen-state">
        <h1>Access pending</h1>
        <p>
          You're signed in, but this account isn't set up as staff yet.
          Ask the owner to add you.
        </p>
      </div>
    );
  }

  if (requireRole && role !== requireRole) {
    return (
      <div className="admin-fullscreen-state">
        <h1>Restricted</h1>
        <p>This section is only available to the {requireRole}.</p>
      </div>
    );
  }

  return children;
}
