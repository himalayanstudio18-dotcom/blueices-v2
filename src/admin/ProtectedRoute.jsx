import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { canView } from './permissions';

export default function ProtectedRoute({ children, section }) {
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

  if (section && !canView(role, section)) {
    return (
      <div className="admin-fullscreen-state">
        <h1>Restricted</h1>
        <p>Your role doesn't have access to this section.</p>
      </div>
    );
  }

  return children;
}
