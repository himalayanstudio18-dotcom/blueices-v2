import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from './AdminAuthContext';

const todayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function AdminDashboard() {
  const { staff } = useAdminAuth();
  const [newInquiries, setNewInquiries] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count, error }) => {
        if (!active) return;
        if (error) {
          console.error('[admin] failed to load inquiry count', error);
          setNewInquiries(null);
          return;
        }
        setNewInquiries(count ?? 0);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-welcome">
          <p className="admin-eyebrow">Welcome back</p>
          <h1 className="admin-dashboard-name">{staff?.name ?? 'Staff'}</h1>
          <p className="admin-dashboard-subtitle">Here&rsquo;s what&rsquo;s happening with Lakhey Lachen today.</p>
        </div>
        <div className="admin-dashboard-date">
          <span className="admin-dashboard-date-label">Today</span>
          <span className="admin-dashboard-date-value">{todayFormatter.format(new Date())}</span>
        </div>
      </header>

      <div className="admin-card-grid">
        <Link to="/admin/inquiries" className="admin-stat-card admin-stat-card--highlight">
          <span className="admin-stat-value">{newInquiries ?? '—'}</span>
          <span className="admin-stat-label">New inquiries</span>
          {newInquiries > 0 && <span className="admin-stat-hint">Requires your attention</span>}
        </Link>
        <Link to="/admin/rooms" className="admin-quick-card">
          <span>Manage Rooms</span>
          <span className="admin-quick-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/admin/gallery" className="admin-quick-card">
          <span>Manage Gallery</span>
          <span className="admin-quick-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/admin/content" className="admin-quick-card">
          <span>Edit Site Content</span>
          <span className="admin-quick-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/admin/promotions" className="admin-quick-card">
          <span>Manage Promotions</span>
          <span className="admin-quick-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
