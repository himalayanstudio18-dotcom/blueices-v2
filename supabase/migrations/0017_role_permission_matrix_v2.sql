-- ═══════════════════════════════════════════════════════════════
-- Migration 0017 — Role permission matrix v2 (Phase 10)
--
-- Revises 0016 to match a flatter, coarser role matrix now enforced
-- client-side by src/admin/permissions.js:
--
--   rooms        — delete: owner+manager (was owner-only);
--                  insert: owner+manager+editor (editor can now create)
--   staff table  — manager gains read-only visibility into the roster
--                  (never write — owner alone creates/edits/removes)
--   site_content — page-level restriction removed; owner/manager/editor
--                  can all write every page again (was split by page
--                  in 0016 — the new spec doesn't distinguish)
--   activity_log — owner: everything; manager: "operational" activity
--                  (excludes staff-management and settings changes);
--                  editor: own entries only (was "all" in 0016); staff:
--                  own entries only (unchanged)
--
-- Note: the "Editor's publish needs Owner/Manager approval" rule from
-- the new spec is enforced in the UI only (src/admin/permissions.js
-- canPublish()) — Publish is just a regular UPDATE on the same rows
-- Editor already needs UPDATE access to for saving drafts, so there's
-- no clean RLS-level distinction between "saving a draft" and
-- "publishing a draft" without a real approval-queue schema change.
-- ═══════════════════════════════════════════════════════════════

-- ─── ROOMS ───────────────────────────────────────────────────────
drop policy if exists "owner/manager can insert rooms" on rooms;
drop policy if exists "owner can delete rooms" on rooms;

create policy "owner/manager/editor can insert rooms" on rooms
  for insert with check (has_role(array['owner','manager','editor']));

create policy "owner/manager can delete rooms" on rooms
  for delete using (has_role(array['owner','manager']));

-- (update policy from 0016 — owner/manager/editor — is unchanged)

-- ─── STAFF (read-only roster access for manager) ──────────────────
drop policy if exists "owner can read all staff" on staff;

create policy "owner/manager can read all staff" on staff
  for select using (has_role(array['owner','manager']));

-- insert/update/delete on staff remain owner-only (schema.sql) — not
-- touched here, per "manager never gets create/change/delete on staff".

-- ─── SITE CONTENT (drop page-level restriction) ───────────────────
drop policy if exists "role-scoped write access to site content" on site_content;
drop function if exists can_write_content_page(text);

create policy "owner/manager/editor can write site content" on site_content
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

-- ─── ACTIVITY LOG ────────────────────────────────────────────────
drop policy if exists "owner/manager/editor can read all activity" on activity_log;
drop policy if exists "staff can read own activity" on activity_log;

create policy "owner can read all activity" on activity_log
  for select using (has_role(array['owner']));

create policy "manager can read operational activity" on activity_log
  for select using (has_role(array['manager']) and entity not in ('staff', 'settings'));

create policy "editor can read own activity" on activity_log
  for select using (has_role(array['editor']) and user_id = auth.uid());

create policy "staff can read own activity" on activity_log
  for select using (has_role(array['staff']) and user_id = auth.uid());
