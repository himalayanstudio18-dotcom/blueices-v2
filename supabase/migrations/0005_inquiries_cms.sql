-- ═══════════════════════════════════════════════════════════════
-- Migration 0005 — Inquiries CMS (Phase 4)
--
-- Extends inquiries with structured booking details and admin
-- workflow status. Purely additive except the status enum, which is
-- widened (old 'closed' rows are remapped to 'archived' first so the
-- new check constraint never rejects existing data).
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

alter table inquiries
  add column if not exists check_in date,
  add column if not exists check_out date,
  add column if not exists guests int,
  add column if not exists preferred_room_id uuid references rooms(id) on delete set null,
  add column if not exists internal_notes text;

update inquiries set status = 'archived' where status = 'closed';

alter table inquiries drop constraint if exists inquiries_status_check;
alter table inquiries add constraint inquiries_status_check
  check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'archived'));
