-- ═══════════════════════════════════════════════════════════════
-- Migration 0021 — Promotions (Promotion Manager V1)
--
-- New, fully additive feature: a dedicated `promotions` table so the
-- site owner can create/schedule/retire marketing campaigns (e.g.
-- "September Bikers Special") entirely from the Admin panel, with no
-- code changes for future offers.
--
-- Deliberately its own table rather than reusing site_content (which
-- is a fixed page/section_key -> value store for curated existing
-- fields, not a fit for an open-ended list of campaigns) or
-- gallery_images (a different shape entirely). Follows the same
-- conventions already established elsewhere in this schema:
--   - draft_data jsonb + live columns, same draft/publish pattern as
--     rooms/gallery_images/settings (see roomsApi.js / galleryApi.js).
--   - bilingual content as _en/_bn column pairs, same as rooms, not
--     the site_content key/value indirection — because every field
--     here must be admin-manageable per-campaign, matching how Rooms
--     works rather than how Site Content works.
--   - benefits is a jsonb array of {en, bn} pairs, the same shape
--     "dynamic repeatable bilingual list" already used informally
--     elsewhere (features_en/features_bn on rooms are plain arrays;
--     here the two languages must stay paired per-row, so a single
--     jsonb array of objects is used instead of two parallel arrays,
--     which could drift out of index alignment on reorder).
--   - image reuses the existing `gallery` storage bucket (no new
--     bucket, no new storage RLS policy needed — bucket_id = 'gallery'
--     policies from migration 0007 already cover read/write here),
--     under its own promotions/<id>/ prefix, same technique as
--     siteContentApi.uploadSiteContentImage()'s site-content/<key>/
--     prefix.
--   - RLS: has_role(array['owner','manager','editor']) for writes,
--     same as Gallery. Public (anon) reads are restricted to rows
--     that are published AND currently within their date window,
--     enforced in the RLS policy itself (not just client-side
--     filtering) — and draft_data/internal_name are excluded from the
--     anon column grant, same column-revoke technique migration 0013
--     used for rooms/gallery_images/site_content.
--   - "Only one featured promotion at a time" and "publish gated to
--     owner/manager" are both enforced at the application layer (see
--     promotionsApi.js / permissions.js), matching how
--     setRoomImageCover() and canPublish() already work — no DB
--     constraint needed for either.
-- ═══════════════════════════════════════════════════════════════

create table promotions (
  id uuid primary key default gen_random_uuid(),
  internal_name text not null,

  -- Basic information
  eyebrow_en text,
  eyebrow_bn text,
  headline_en text,
  headline_bn text,
  description_en text,
  description_bn text,
  location_en text,
  location_bn text,

  -- Offer information
  discount_type text not null default 'custom'
    check (discount_type in ('percentage', 'flat', 'special_price', 'custom')),
  discount_value numeric,
  special_price numeric,
  offer_condition_en text,
  offer_condition_bn text,
  min_count int,

  -- Benefits: [{ "en": "...", "bn": "..." }, ...], order = display order
  benefits jsonb not null default '[]'::jsonb,

  -- CTA
  cta_en text,
  cta_bn text,

  -- Scheduling
  start_date date,
  end_date date,

  -- Placements
  show_on_homepage boolean not null default false,
  show_on_stays boolean not null default false,
  show_as_popup boolean not null default false,
  is_featured boolean not null default false,

  -- Popup/creative image (gallery bucket, promotions/<id>/ prefix)
  image_storage_path text,

  -- WhatsApp CTA — {{offer_name}} {{discount}} {{price}} {{condition}}
  -- variables, falls back to a generic default in code when blank.
  whatsapp_template text,

  is_published boolean not null default false,
  draft_data jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index promotions_active_idx on promotions (is_published, start_date, end_date);

alter table promotions enable row level security;

-- Public: only published campaigns currently inside their date window
-- (an unset start/end date does not gate that side of the window).
create policy "anyone can read active published promotions" on promotions
  for select using (
    is_published = true
    and (start_date is null or start_date <= current_date)
    and (end_date is null or end_date >= current_date)
  );

create policy "staff can read all promotions" on promotions
  for select using (is_staff());

create policy "owner/manager/editor can write promotions" on promotions
  for all using (has_role(array['owner','manager','editor']))
  with check (has_role(array['owner','manager','editor']));

-- Column-level lockdown for anon, same technique as migration 0013 —
-- draft_data and internal_name (admin-only bookkeeping) are never
-- exposed to public reads even for a row visible under the policy
-- above.
revoke select on promotions from anon;
grant select (
  id, eyebrow_en, eyebrow_bn, headline_en, headline_bn,
  description_en, description_bn, location_en, location_bn,
  discount_type, discount_value, special_price,
  offer_condition_en, offer_condition_bn, min_count, benefits,
  cta_en, cta_bn, start_date, end_date,
  show_on_homepage, show_on_stays, show_as_popup, is_featured,
  image_storage_path, whatsapp_template, is_published,
  created_at, updated_at
) on promotions to anon;
