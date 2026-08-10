-- ═══════════════════════════════════════════════════════════════
-- Phase 0 schema — Lakhey Lachen / BlueIce admin panel
--
-- HOW TO RUN:
-- Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Safe to re-run (uses "if not exists" / "on conflict"
-- where practical) but is meant to be run once on a fresh project.
-- ═══════════════════════════════════════════════════════════════

-- ─── STAFF (roles) ─────────────────────────────────────────────
create table staff (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('owner', 'manager', 'editor')),
  created_at timestamptz not null default now()
);

-- Helper: is the current logged-in user staff at all?
create or replace function is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from staff where id = auth.uid());
$$;

-- Helper: is the current logged-in user the owner?
create or replace function is_owner()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from staff where id = auth.uid() and role = 'owner');
$$;

alter table staff enable row level security;

create policy "staff can read own row" on staff
  for select using (auth.uid() = id);

create policy "owner can read all staff" on staff
  for select using (is_owner());

create policy "owner can insert staff" on staff
  for insert with check (is_owner());

create policy "owner can update staff" on staff
  for update using (is_owner());

create policy "owner can delete staff" on staff
  for delete using (is_owner());


-- ─── ROOMS ─────────────────────────────────────────────────────
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_bn text,
  desc_en text,
  desc_bn text,
  price numeric,
  capacity text,
  size text,
  tag text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table rooms enable row level security;

create policy "anyone can read published rooms" on rooms
  for select using (is_published = true);

create policy "staff can read all rooms" on rooms
  for select using (is_staff());

create policy "staff can write rooms" on rooms
  for all using (is_staff()) with check (is_staff());


-- ─── ROOM IMAGES ───────────────────────────────────────────────
create table room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false
);

alter table room_images enable row level security;

create policy "anyone can read images of published rooms" on room_images
  for select using (
    exists (select 1 from rooms where rooms.id = room_images.room_id and rooms.is_published = true)
  );

create policy "staff can read all room images" on room_images
  for select using (is_staff());

create policy "staff can write room images" on room_images
  for all using (is_staff()) with check (is_staff());


-- ─── GALLERY IMAGES ────────────────────────────────────────────
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption_en text,
  caption_bn text,
  category text check (category in ('exterior', 'interior', 'nature', 'room')),
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table gallery_images enable row level security;

create policy "anyone can read published gallery images" on gallery_images
  for select using (is_published = true);

create policy "staff can read all gallery images" on gallery_images
  for select using (is_staff());

create policy "staff can write gallery images" on gallery_images
  for all using (is_staff()) with check (is_staff());


-- ─── INQUIRIES (booking/contact form submissions) ─────────────
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text,
  requested_dates text,
  source text not null default 'form' check (source in ('form', 'whatsapp')),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table inquiries enable row level security;

-- Anyone (including anonymous site visitors) can submit an inquiry,
-- but never read or list them back — protects guest contact details.
create policy "anyone can submit an inquiry" on inquiries
  for insert with check (true);

create policy "staff can read inquiries" on inquiries
  for select using (is_staff());

create policy "staff can update inquiries" on inquiries
  for update using (is_staff()) with check (is_staff());

create policy "owner can delete inquiries" on inquiries
  for delete using (is_owner());


-- ─── SITE CONTENT (editable text, bilingual) ──────────────────
create table site_content (
  id uuid primary key default gen_random_uuid(),
  page text not null check (page in ('home', 'stays', 'experiences', 'story', 'contact')),
  section_key text not null,
  value_en text,
  value_bn text,
  updated_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  unique (page, section_key)
);

alter table site_content enable row level security;

create policy "anyone can read site content" on site_content
  for select using (true);

create policy "staff can write site content" on site_content
  for all using (is_staff()) with check (is_staff());


-- ─── STORAGE BUCKETS ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('rooms', 'rooms', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "anyone can view room images" on storage.objects
  for select using (bucket_id = 'rooms');

create policy "staff can upload room images" on storage.objects
  for insert with check (bucket_id = 'rooms' and is_staff());

create policy "staff can update room images" on storage.objects
  for update using (bucket_id = 'rooms' and is_staff());

create policy "staff can delete room images" on storage.objects
  for delete using (bucket_id = 'rooms' and is_staff());

create policy "anyone can view gallery images" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "staff can upload gallery images" on storage.objects
  for insert with check (bucket_id = 'gallery' and is_staff());

create policy "staff can update gallery images" on storage.objects
  for update using (bucket_id = 'gallery' and is_staff());

create policy "staff can delete gallery images" on storage.objects
  for delete using (bucket_id = 'gallery' and is_staff());


-- ═══════════════════════════════════════════════════════════════
-- AFTER RUNNING THIS FILE — create the first owner account:
--
-- 1. Supabase dashboard > Authentication > Users > Add user
--    (enter your email + a password)
-- 2. Copy that user's UID from the Users list
-- 3. Run this, replacing the two placeholders:
--
--    insert into staff (id, name, role)
--    values ('paste-the-uid-here', 'Your Name', 'owner');
-- ═══════════════════════════════════════════════════════════════
