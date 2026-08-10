import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/rooms', label: 'Rooms' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/inquiries', label: 'Inquiries' },
  { to: '/admin/content', label: 'Site Content' },
  { to: '/admin/activity', label: 'Activity Log' },
];

export default function AdminLayout() {
  const { staff, role, signOut } = useAdminAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-hamburger"
          aria-label="Open menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(true)}
        >
          <span /><span /><span />
        </button>
        <span className="admin-topbar-brand">Lakhey Lachen Admin</span>
      </header>

      {navOpen && <div className="admin-backdrop" onClick={() => setNavOpen(false)} />}

      <aside className={`admin-sidebar${navOpen ? ' is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-name">Lakhey Lachen</span>
          <span className="admin-sidebar-brand-sub">Admin</span>
        </div>
        <button type="button" className="admin-sidebar-close" aria-label="Close menu" onClick={() => setNavOpen(false)}>✕</button>

        <nav className="admin-nav" aria-label="Admin sections">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          {role === 'owner' && (
            <NavLink
              to="/admin/staff"
              className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
            >
              Staff
            </NavLink>
          )}
          {role === 'owner' && (
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
            >
              Settings
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-name">{staff?.name ?? 'Staff'}</span>
            <span className="admin-user-role">{role}</span>
          </div>
          <button className="admin-btn-ghost" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
