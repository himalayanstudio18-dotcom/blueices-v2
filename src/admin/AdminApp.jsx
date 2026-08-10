import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import RoomsList from './rooms/RoomsList';
import RoomEditor from './rooms/RoomEditor';
import RoomPreview from './rooms/RoomPreview';
import GalleryPage from './gallery/GalleryPage';
import InquiriesPage from './inquiries/InquiriesPage';
import SiteContentPage from './content/SiteContentPage';
import SiteContentPreview from './content/SiteContentPreview';
import StaffPage from './staff/StaffPage';
import ActivityLogPage from './activity/ActivityLogPage';
import SettingsPage from './settings/SettingsPage';
import AdminUIProvider from './ui/AdminUIProvider';
import './admin.css';

export default function AdminApp() {
  return (
    <AdminUIProvider>
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<RoomsList />} />
          <Route path="rooms/new" element={<RoomEditor />} />
          <Route path="rooms/:id" element={<RoomEditor />} />
          <Route path="rooms/:id/preview" element={<RoomPreview />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route
            path="content"
            element={
              <ProtectedRoute section="content">
                <SiteContentPage />
              </ProtectedRoute>
            }
          />
          <Route path="content/preview/:page" element={<SiteContentPreview />} />
          <Route
            path="staff"
            element={
              <ProtectedRoute section="staff">
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route path="activity" element={<ActivityLogPage />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute section="settings">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
    </AdminUIProvider>
  );
}
