-- ═══════════════════════════════════════════════════════════════
-- Migration 0008 — Activity Log (Phase 7)
--
-- user_name is denormalized (copied at write time) rather than
-- always joined from staff, so the log stays readable even if that
-- staff member is later removed.
-- ═══════════════════════════════════════════════════════════════

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references staff(id) on delete set null,
  user_name text not null,
  action text not null check (action in ('create', 'update', 'delete', 'publish', 'unpublish')),
  entity text not null,
  entity_id uuid,
  detail text,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

create policy "staff can read activity log" on activity_log
  for select using (is_staff());

create policy "staff can write their own activity" on activity_log
  for insert with check (is_staff() and user_id = auth.uid());
