-- ═══════════════════════════════════════════════════════════════
-- Migration 0003 — Rooms CMS upgrade (Phase 2)
--
-- rooms has 0 live rows (confirmed before writing this), so this
-- safely restructures capacity_en/bn rather than carrying it forward
-- alongside new, overlapping fields. Everything else is purely
-- additive ("if not exists" — safe to re-run).
--
-- Field mapping decisions (confirmed with the property owner):
--   - Tags        -> existing tag_en/bn + tag_class (unchanged)
--   - Amenities    -> existing features_en/bn text[] (unchanged)
--   - Full desc   -> existing desc_en/bn (unchanged)
--   - Short desc  -> new short_desc_en/bn (nullable; public site
--                    falls back to desc_en/bn when empty)
--   - Capacity    -> split into max_guests (int) + a new
--                    bed_configuration_en/bn, replacing the old
--                    single free-text capacity_en/bn field
--   - Display ord -> existing sort_order (unchanged)
--   - Published   -> existing is_published (unchanged)
--   - Availability-> new is_available (distinct from is_published:
--                    published = shown on site at all; available =
--                    bookable right now, e.g. a shown-but-sold-out room)
--
-- Main/multiple room images already handled by the existing
-- room_images table + is_cover flag — no schema change needed there.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

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

-- Unique slug, but only enforced among rooms that have one set —
-- lets the admin UI backfill slugs gradually rather than requiring
-- every existing row to get one atomically.
create unique index if not exists rooms_slug_unique
  on rooms (slug) where slug is not null;
