-- ═══════════════════════════════════════════════════════════════
-- Migration 0009 — Settings (Phase 8)
--
-- Single-row config table (id is pinned to 1 by the check
-- constraint, so there can only ever be one settings row). Publicly
-- readable — the public site reads phone/email/social links etc.
-- from here instead of hardcoded strings. Writable by the owner only.
-- ═══════════════════════════════════════════════════════════════

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  property_name text,
  logo_url text,
  favicon_url text,
  phone text,
  email text,
  whatsapp text,
  address text,
  google_maps_url text,
  checkin_time text,
  checkout_time text,
  booking_enabled boolean not null default true,
  min_stay int,
  max_guests int,
  cancellation_policy text,
  booking_message text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  google_business_url text,
  notify_new_inquiry boolean not null default true,
  notify_booking boolean not null default true,
  notify_staff boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

alter table settings enable row level security;

create policy "anyone can read settings" on settings
  for select using (true);

create policy "owner can write settings" on settings
  for all using (is_owner()) with check (is_owner());
