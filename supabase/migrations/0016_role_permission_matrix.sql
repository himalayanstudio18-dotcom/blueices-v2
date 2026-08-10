-- ═══════════════════════════════════════════════════════════════
-- Migration 0016 — Role permission matrix (Phase 9)
--
-- Tightens RLS to match the app-wide role/permission matrix now
-- enforced client-side by src/admin/permissions.js. Only touches
-- policies that actually change vs. 0007 — room_images, gallery
-- policies, and inquiries already matched the new matrix exactly.
--
--   rooms   — insert: owner/manager (editor can't create rooms);
--             update: owner/manager/editor (unchanged);
--             delete: owner only (was owner/manager/editor)
--   settings — write: owner/manager (was owner only). Manager's UI
--             only exposes the Booking tab, but settings uses a
--             single draft_data JSON column shared by every tab, so
--             this grant is row-level, not field-level — a manager
--             calling the API directly could technically write any
--             settings field, not just booking ones. Tightening that
--             further needs a trigger validating draft_data keys
--             against an allowlist per role; flagging as a known gap.
--   site_content — write: page-scoped per role via can_write_content_page()
--   activity_log — read: owner/manager/editor see everything;
--             staff sees only their own entries
-- ═══════════════════════════════════════════════════════════════

-- ─── ROOMS ───────────────────────────────────────────────────────
drop policy if exists "owner/manager/editor can write rooms" on rooms;

create policy "owner/manager can insert rooms" on rooms
  for insert with check (has_role(array['owner','manager']));

create policy "owner/manager/editor can update rooms" on rooms
  for update using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

create policy "owner can delete rooms" on rooms
  for delete using (has_role(array['owner']));

-- ─── SETTINGS ────────────────────────────────────────────────────
drop policy if exists "owner can write settings" on settings;

create policy "owner/manager can write settings" on settings
  for all using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

-- ─── SITE CONTENT ──────────────────────────────────────────────
-- Mirrors src/admin/permissions.js CONTENT_EDIT_PAGES exactly.
create or replace function can_write_content_page(target_page text)
returns boolean
language sql
security definer
stable
as $$
  select case
    when has_role(array['owner']) then true
    when has_role(array['editor']) then target_page in ('home','story','experiences','policies')
    when has_role(array['manager']) then target_page in ('experiences','policies','contact','stays')
    else false
  end;
$$;

drop policy if exists "owner/manager/editor can write site content" on site_content;

create policy "role-scoped write access to site content" on site_content
  for all using (can_write_content_page(page))
  with check (can_write_content_page(page));

-- ─── ACTIVITY LOG ────────────────────────────────────────────────
drop policy if exists "staff can read activity log" on activity_log;

create policy "owner/manager/editor can read all activity" on activity_log
  for select using (has_role(array['owner','manager','editor']));

create policy "staff can read own activity" on activity_log
  for select using (has_role(array['staff']) and user_id = auth.uid());
