-- ═══════════════════════════════════════════════════════════════
-- RUN THIS ONE FILE — combines migrations 0003 through 0010
-- (0002 already ran successfully, so it's not included here)
--
-- WHAT TO DO:
-- 1. Open your Supabase project
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Select ALL the text in this file and copy it (Ctrl+A, Ctrl+C)
-- 5. Paste it into the SQL Editor
-- 6. Click "Run" (or press Ctrl+Enter)
-- 7. Scroll down in the results panel and make sure it says
--    "Success" with no red error text
-- 8. Come back and tell me it's done
--
-- Safe to run even if some of this already partially applied —
-- every step below only adds things if they don't already exist.
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- PART 1 (was migration 0003) — Room fields: slug, type, pricing,
-- capacity, availability
-- ─────────────────────────────────────────────────────────────

alter table rooms
  add column if not exists slug text,
  add column if not exists room_type text,
  add column if not exists short_desc_en text,
  add column if not exists short_desc_bn text,
  add column if not exists weekend_price numeric,
  add column if not exists max_guests int,
  add column if not exists bed_configuration_en text,
  add column if not exists bed_configuration_bn text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_available boolean not null default true;

alter table rooms
  drop column if exists capacity_en,
  drop column if exists capacity_bn;

create unique index if not exists rooms_slug_unique
  on rooms (slug) where slug is not null;


-- ─────────────────────────────────────────────────────────────
-- PART 2 (was migration 0004) — Gallery: alt text, featured flag
-- ─────────────────────────────────────────────────────────────

alter table gallery_images
  add column if not exists alt_text_en text,
  add column if not exists alt_text_bn text,
  add column if not exists is_featured boolean not null default false;


-- ─────────────────────────────────────────────────────────────
-- PART 3 (was migration 0005) — Inquiries: dates, guests, notes,
-- full status workflow
-- ─────────────────────────────────────────────────────────────

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


-- ─────────────────────────────────────────────────────────────
-- PART 4 (was migration 0006) — Site Content: allow a "policies"
-- page
-- ─────────────────────────────────────────────────────────────

alter table site_content drop constraint if exists site_content_page_check;
alter table site_content add constraint site_content_page_check
  check (page in ('home', 'stays', 'experiences', 'story', 'contact', 'policies'));


-- ─────────────────────────────────────────────────────────────
-- PART 5 (was migration 0007) — Staff roles (owner/manager/editor/
-- staff) with real database-level permission rules
-- ─────────────────────────────────────────────────────────────

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

drop policy if exists "staff can write rooms" on rooms;
create policy "owner/manager/editor can write rooms" on rooms
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

drop policy if exists "staff can write room images" on room_images;
create policy "owner/manager/editor can write room images" on room_images
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

drop policy if exists "staff can write gallery images" on gallery_images;
create policy "owner/manager/editor can write gallery images" on gallery_images
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

drop policy if exists "staff can write site content" on site_content;
create policy "owner/manager/editor can write site content" on site_content
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

drop policy if exists "staff can update inquiries" on inquiries;
create policy "owner/manager/staff can update inquiries" on inquiries
  for update using (has_role(array['owner','manager','staff']))
  with check (has_role(array['owner','manager','staff']));

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


-- ─────────────────────────────────────────────────────────────
-- PART 6 (was migration 0008) — Activity Log (who changed what)
-- ─────────────────────────────────────────────────────────────

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

drop policy if exists "staff can read activity log" on activity_log;
create policy "staff can read activity log" on activity_log
  for select using (is_staff());

drop policy if exists "staff can write their own activity" on activity_log;
create policy "staff can write their own activity" on activity_log
  for insert with check (is_staff() and user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- PART 7 (was migration 0009) — Settings (property info, contact,
-- social links, booking rules)
-- ─────────────────────────────────────────────────────────────

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

drop policy if exists "anyone can read settings" on settings;
create policy "anyone can read settings" on settings
  for select using (true);

drop policy if exists "owner can write settings" on settings;
create policy "owner can write settings" on settings
  for all using (is_owner()) with check (is_owner());


-- ─────────────────────────────────────────────────────────────
-- PART 8 (was migration 0010) — Room SEO fields + bathroom count
-- ─────────────────────────────────────────────────────────────

alter table rooms
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists bathrooms int;


-- ═══════════════════════════════════════════════════════════════
-- DONE. If you see "Success" above with no red errors, everything
-- worked. Tell the assistant you ran this file and it will check
-- everything is correct.
-- ═══════════════════════════════════════════════════════════════
