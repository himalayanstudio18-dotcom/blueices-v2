/* Central role → capability map for the admin panel.
   Two layers enforce this: this file (UI gating — hide/disable) and
   supabase/migrations/0016_role_permission_matrix.sql (RLS — the real
   security boundary). Keep both in sync when this changes.

   The source spec used page/category names ("Rooms Content", "Dining",
   "Footer") that don't exist in this app's actual site-content pages
   (home/story/experiences/policies/contact/stays — see
   src/admin/content/sectionConfig.js). Mappings below note where a
   judgment call was made to fit the spec onto the real page set. */

const CAPABILITIES = {
  dashboard: {
    owner: ['view'],
    manager: ['view'],
    editor: ['view'],
    staff: ['view'],
  },
  rooms: {
    owner: ['view', 'create', 'edit', 'delete', 'changePrice', 'changeAvailability', 'manageImages', 'publish', 'reorder'],
    manager: ['view', 'create', 'edit', 'changePrice', 'changeAvailability', 'manageImages', 'reorder'],
    editor: ['view', 'edit', 'manageImages'],
    staff: ['view'],
  },
  gallery: {
    // "Manage Categories" isn't a real feature (categories are a fixed
    // list in GalleryPage.jsx) so owner/manager/editor are functionally
    // identical here — all get full gallery access, staff is view-only.
    owner: ['view', 'upload', 'edit', 'delete', 'reorder'],
    manager: ['view', 'upload', 'edit', 'delete', 'reorder'],
    editor: ['view', 'upload', 'edit', 'delete', 'reorder'],
    staff: ['view'],
  },
  inquiries: {
    // "Delete" isn't implemented anywhere in the app (inquiriesApi.js
    // has no delete function) — nothing to gate there.
    owner: ['view', 'search', 'filter', 'updateStatus', 'archive', 'addNotes', 'call', 'whatsapp', 'email'],
    manager: ['view', 'search', 'filter', 'updateStatus', 'archive', 'addNotes', 'call', 'whatsapp', 'email'],
    editor: ['view'],
    staff: ['view', 'search', 'filter', 'updateStatus', 'addNotes', 'call', 'whatsapp'],
  },
  staff: {
    owner: ['view', 'create', 'edit', 'delete'],
    manager: [],
    editor: [],
    staff: [],
  },
  activity: {
    owner: ['view'],
    manager: ['view'],
    editor: ['view'],
    staff: ['view'], // scope narrowed to own entries only — see activityScope()
  },
};

// Site Content: everyone with section access can view all pages;
// editing is restricted per page. "Rooms Content" -> stays page,
// "Contact Details" -> contact page (closest real equivalents).
const CONTENT_EDIT_PAGES = {
  owner: ['home', 'story', 'experiences', 'policies', 'contact', 'stays'],
  manager: ['experiences', 'policies', 'contact', 'stays'], // operational + room/experience content
  editor: ['home', 'story', 'experiences', 'policies'], // brand/narrative content
  staff: [],
};

// Settings: Manager's "Limited operational settings" is mapped to the
// Booking tab only. Manager doesn't get Account tab per the spec (only
// Owner's list includes Account/Security), so Manager can't self-serve
// a password change from here.
const SETTINGS_TABS = {
  owner: ['Property', 'Booking', 'Social', 'Notifications', 'Account'],
  manager: ['Booking'],
  editor: [],
  staff: [],
};

export function canView(role, section) {
  if (section === 'content') return editableContentPages(role).length > 0;
  if (section === 'settings') return visibleSettingsTabs(role).length > 0;
  const list = CAPABILITIES[section]?.[role];
  return Array.isArray(list) && list.includes('view');
}

export function can(role, section, action) {
  const list = CAPABILITIES[section]?.[role];
  return Array.isArray(list) && list.includes(action);
}

export function editableContentPages(role) {
  return CONTENT_EDIT_PAGES[role] ?? [];
}

export function canEditContentPage(role, page) {
  return editableContentPages(role).includes(page);
}

export function visibleSettingsTabs(role) {
  return SETTINGS_TABS[role] ?? [];
}

/* 'all' = sees every staff member's log entries, 'own' = only their
   own (RLS enforces this the same way — see migration 0016). */
export function activityScope(role) {
  if (role === 'staff') return 'own';
  if (['owner', 'manager', 'editor'].includes(role)) return 'all';
  return null;
}

export const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true, section: 'dashboard' },
  { to: '/admin/rooms', label: 'Rooms', section: 'rooms' },
  { to: '/admin/gallery', label: 'Gallery', section: 'gallery' },
  { to: '/admin/inquiries', label: 'Inquiries', section: 'inquiries' },
  { to: '/admin/content', label: 'Site Content', section: 'content' },
  { to: '/admin/staff', label: 'Staff', section: 'staff' },
  { to: '/admin/activity', label: 'Activity Log', section: 'activity' },
  { to: '/admin/settings', label: 'Settings', section: 'settings' },
];
