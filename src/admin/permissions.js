/* Central role → capability map for the admin panel.
   Two layers enforce this: this file (UI gating — hide/disable) and
   supabase/migrations/0017_role_permission_matrix_v2.sql (RLS — the
   real security boundary). Keep both in sync when this changes.

   This is v2 of the matrix — a flatter, coarser model (View / Edit /
   Full / None, plus a cross-cutting Publish permission) that replaced
   the earlier per-field/per-page v1 matrix. See judgment-call notes
   inline where the spec was ambiguous. */

const CAPABILITIES = {
  dashboard: {
    owner: ['view'],
    manager: ['view'],
    editor: ['view'],
    staff: ['view'],
  },
  rooms: {
    // Full = view+create+edit+delete. Editor gets "Edit" (view+create+edit,
    // no delete) — a relaxation from v1, where editor couldn't create rooms.
    owner: ['view', 'create', 'edit', 'delete', 'reorder'],
    manager: ['view', 'create', 'edit', 'delete', 'reorder'],
    editor: ['view', 'create', 'edit', 'reorder'],
    staff: ['view'],
  },
  gallery: {
    // Gallery is "Full" for owner/manager/editor alike — unrestricted,
    // including its own direct publish/unpublish toggle and draft
    // caption workflow (gallery isn't subject to the cross-cutting
    // Publish-Changes-needs-approval rule below; only Rooms and Site
    // Content have that dedicated Preview → Publish Changes screen).
    owner: ['view', 'upload', 'edit', 'delete', 'reorder'],
    manager: ['view', 'upload', 'edit', 'delete', 'reorder'],
    editor: ['view', 'upload', 'edit', 'delete', 'reorder'],
    staff: ['view'],
  },
  inquiries: {
    // Staff now gets full parity (their core job is "handles inquiries")
    // — includes Email and Archive, which v1 had withheld from staff.
    // "Delete" isn't implemented anywhere in the app (inquiriesApi.js
    // has no delete function) — nothing to gate there.
    owner: ['view', 'search', 'filter', 'updateStatus', 'archive', 'addNotes', 'call', 'whatsapp', 'email'],
    manager: ['view', 'search', 'filter', 'updateStatus', 'archive', 'addNotes', 'call', 'whatsapp', 'email'],
    editor: ['view', 'search', 'filter'],
    staff: ['view', 'search', 'filter', 'updateStatus', 'archive', 'addNotes', 'call', 'whatsapp', 'email'],
  },
  // Site Content is now a flat per-role toggle, not per-page — v1 split
  // manager/editor across different page subsets, but this matrix's
  // "Site Content: Edit" for both manager and editor is unqualified, so
  // all three writer roles get every page (home/story/experiences/
  // policies/contact/stays).
  content: {
    owner: ['view', 'edit'],
    manager: ['view', 'edit'],
    editor: ['view', 'edit'],
    staff: [],
  },
  // Staff (team) management — owner only for anything beyond viewing.
  // Manager gets read-only visibility into the team roster; can never
  // create/change-role/deactivate/remove (owner controls the hierarchy).
  staff: {
    owner: ['view', 'create', 'edit', 'delete'],
    manager: ['view'],
    editor: [],
    staff: [],
  },
  activity: {
    owner: ['view'], // scope: 'all'
    manager: ['view'], // scope: 'operational' — see activityScope()
    editor: ['view'], // scope: 'own'
    staff: ['view'], // scope: 'own'
  },
};

// Cross-cutting: can this role hit "Publish Changes" on the Rooms/Site
// Content draft-preview screen? Editor is spec'd as "requires Owner/
// Manager approval" — there's no approval-queue feature in this app
// (would need a new pending-review state + notifications), so this is
// implemented as: Editor can save/preview drafts same as anyone else,
// but the Publish button itself is Owner/Manager-only — an Owner or
// Manager has to open the draft and publish it. That satisfies "an
// editor's change never goes live without owner/manager action"
// without building new approval infrastructure. Flagging this as a
// simplification worth revisiting if a real approval queue is wanted.
export function canPublish(role) {
  return role === 'owner' || role === 'manager';
}

// Settings: Manager gets everything except Account & Security (and
// "Staff Permissions", which isn't a Settings tab — it's the Staff
// section's role-management controls, already owner-gated there).
const SETTINGS_TABS = {
  owner: ['Property', 'Booking', 'Social', 'Notifications', 'Account'],
  manager: ['Property', 'Booking', 'Social', 'Notifications'],
  editor: [],
  staff: [],
};

export function canView(role, section) {
  if (section === 'settings') return visibleSettingsTabs(role).length > 0;
  const list = CAPABILITIES[section]?.[role];
  return Array.isArray(list) && list.includes('view');
}

export function can(role, section, action) {
  const list = CAPABILITIES[section]?.[role];
  return Array.isArray(list) && list.includes(action);
}

export function visibleSettingsTabs(role) {
  return SETTINGS_TABS[role] ?? [];
}

/* 'all' = every entry; 'operational' = everything except staff-
   management and settings changes (Manager doesn't get visibility
   into who-changed-what-role or account/security edits — that's
   Owner's domain); 'own' = only entries this user authored. Enforced
   both here (UI) and in RLS (migration 0017). */
export function activityScope(role) {
  if (role === 'owner') return 'all';
  if (role === 'manager') return 'operational';
  if (role === 'editor' || role === 'staff') return 'own';
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
