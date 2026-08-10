-- ═══════════════════════════════════════════════════════════════
-- Migration 0007 — Staff roles & granular RLS (Phase 6)
--
-- Widens staff.role to a 4th tier ('staff') and replaces the
-- blanket "any staff member can write everything" policies from
-- schema.sql with per-role checks:
--
--   owner    — full access everywhere (unchanged, via is_owner())
--   manager  — write rooms, gallery, inquiries, site content
--   editor   — write rooms, gallery, site content (not inquiries)
--   staff    — write inquiries only (status/notes); read-only elsewhere
--
-- Read access is unchanged (any recognized staff member, any role,
-- can still read everything in the admin panel — this migration
-- only tightens WRITE policies).
-- ═══════════════════════════════════════════════════════════════

alter table staff drop constraint if exists staff_role_check;
alter table staff add constraint staff_role_check
  check (role in ('owner', 'manager', 'editor', 'staff'));

create or replace function has_role(roles text[])
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from staff where id = auth.uid() and role = any(roles));
$$;

-- ─── ROOMS ───────────────────────────────────────────────────────
drop policy if exists "staff can write rooms" on rooms;
create policy "owner/manager/editor can write rooms" on rooms
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

-- ─── ROOM IMAGES ─────────────────────────────────────────────────
drop policy if exists "staff can write room images" on room_images;
create policy "owner/manager/editor can write room images" on room_images
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

-- ─── GALLERY IMAGES ────────────────────────────────────────────
drop policy if exists "staff can write gallery images" on gallery_images;
create policy "owner/manager/editor can write gallery images" on gallery_images
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

-- ─── SITE CONTENT ──────────────────────────────────────────────
drop policy if exists "staff can write site content" on site_content;
create policy "owner/manager/editor can write site content" on site_content
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

-- ─── INQUIRIES ─────────────────────────────────────────────────
drop policy if exists "staff can update inquiries" on inquiries;
create policy "owner/manager/staff can update inquiries" on inquiries
  for update using (has_role(array['owner','manager','staff']))
  with check (has_role(array['owner','manager','staff']));

-- ─── STORAGE (room + gallery image files) ─────────────────────
drop policy if exists "staff can upload room images" on storage.objects;
drop policy if exists "staff can update room images" on storage.objects;
drop policy if exists "staff can delete room images" on storage.objects;
create policy "owner/manager/editor can upload room images" on storage.objects
  for insert with check (bucket_id = 'rooms' and has_role(array['owner','manager','editor']));
create policy "owner/manager/editor can update room images" on storage.objects
  for update using (bucket_id = 'rooms' and has_role(array['owner','manager','editor']));
create policy "owner/manager/editor can delete room images" on storage.objects
  for delete using (bucket_id = 'rooms' and has_role(array['owner','manager','editor']));

drop policy if exists "staff can upload gallery images" on storage.objects;
drop policy if exists "staff can update gallery images" on storage.objects;
drop policy if exists "staff can delete gallery images" on storage.objects;
create policy "owner/manager/editor can upload gallery images" on storage.objects
  for insert with check (bucket_id = 'gallery' and has_role(array['owner','manager','editor']));
create policy "owner/manager/editor can update gallery images" on storage.objects
  for update using (bucket_id = 'gallery' and has_role(array['owner','manager','editor']));
create policy "owner/manager/editor can delete gallery images" on storage.objects
  for delete using (bucket_id = 'gallery' and has_role(array['owner','manager','editor']));
