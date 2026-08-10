-- ═══════════════════════════════════════════════════════════════
-- Migration 0018 — Activity Log v2 (Phase 11)
--
-- Extends activity_log with the fields needed for role/date/section
-- aware filtering: user_role (snapshot at log time), section (coarse
-- grouping for filters — derived from entity), old_value/new_value
-- (previous/new value shown in the Details view), device (parsed
-- client-side from navigator.userAgent — see activityLogApi.js; true
-- IP address isn't captured, see migration comment below), and
-- widens the action vocabulary to cover upload/login/logout/
-- permission_change/settings_change.
--
-- `detail` is renamed to `description` (same purpose, spec's naming).
--
-- No IP address: browser JS can't read its own public IP, and a
-- direct table insert via PostgREST only sees Supabase's own infra
-- IP, not the visitor's — getting the real IP needs every write to
-- route through an edge function reading request headers, which is
-- out of scope for now (device/browser via user-agent is captured
-- client-side instead, no new infra needed).
--
-- Immutability: activity_log only has SELECT/INSERT RLS policies —
-- with RLS enabled, that already means no role can UPDATE or DELETE
-- rows (Postgres denies any command with no matching policy). No
-- schema change needed for "logs can't be edited after creation".
-- ═══════════════════════════════════════════════════════════════

alter table activity_log rename column detail to description;

alter table activity_log
  add column user_role text,
  add column section text,
  add column old_value text,
  add column new_value text,
  add column device text;

-- Backfill user_role for existing rows from the staff table (best
-- effort — null if the staff member was since removed).
update activity_log al
set user_role = s.role
from staff s
where al.user_id = s.id and al.user_role is null;

-- Backfill section from the existing entity value.
update activity_log
set section = case entity
  when 'room' then 'Rooms'
  when 'gallery_image' then 'Gallery'
  when 'inquiry' then 'Inquiries'
  when 'site_content' then 'Site Content'
  when 'staff' then 'Staff'
  when 'settings' then 'Settings'
  when 'account' then 'Account'
  else initcap(entity)
end
where section is null;

alter table activity_log drop constraint if exists activity_log_action_check;
alter table activity_log add constraint activity_log_action_check
  check (action in (
    'create', 'update', 'delete', 'publish', 'unpublish', 'upload',
    'login', 'logout', 'permission_change', 'settings_change'
  ));

-- ─── RLS — role-scoped read access ────────────────────────────────
drop policy if exists "manager can read operational activity" on activity_log;
drop policy if exists "editor can read own activity" on activity_log;
drop policy if exists "staff can read own activity" on activity_log;

-- Manager: operational activity only — never Staff, Settings, or
-- Account (owner's own security/permission activity stays hidden).
create policy "manager can read operational activity" on activity_log
  for select using (has_role(array['manager']) and entity not in ('staff', 'settings', 'account'));

-- Editor: Rooms/Gallery/Site Content activity from anyone (their
-- working sections), plus their own activity in any section.
create policy "editor can read relevant or own activity" on activity_log
  for select using (
    has_role(array['editor'])
    and (entity in ('room', 'gallery_image', 'site_content') or user_id = auth.uid())
  );

-- Staff: Inquiries activity from anyone (shared team visibility),
-- plus their own activity — never other staff's private activity.
create policy "staff can read inquiries or own activity" on activity_log
  for select using (
    has_role(array['staff'])
    and (entity = 'inquiry' or user_id = auth.uid())
  );

-- owner's "read all activity" policy from 0017 is unchanged.
