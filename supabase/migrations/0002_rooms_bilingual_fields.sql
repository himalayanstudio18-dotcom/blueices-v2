-- ═══════════════════════════════════════════════════════════════
-- Migration 0002 — bilingual room fields
--
-- The original schema.sql only made `name` and `desc` bilingual on
-- `rooms`. The actual site content also translates tag, capacity,
-- size, and the feature list per room (see src/translations/index.js
-- featuredStay.rooms in both `en` and `bn`), so those need EN/BN
-- columns too. Also adds `tag_class` — the card accent style
-- (tag-gold / tag-signature / tag-forest) used by the public site's
-- CSS, which isn't translatable content.
--
-- Safe to run once against the schema.sql from this project — the
-- `rooms` table exists but is empty (no rows), so old columns are
-- dropped rather than migrated.
--
-- HOW TO RUN: Supabase SQL Editor > New query > paste > Run.
-- ═══════════════════════════════════════════════════════════════

alter table rooms
  add column if not exists tag_en text,
  add column if not exists tag_bn text,
  add column if not exists capacity_en text,
  add column if not exists capacity_bn text,
  add column if not exists size_en text,
  add column if not exists size_bn text,
  add column if not exists features_en text[] not null default '{}',
  add column if not exists features_bn text[] not null default '{}',
  add column if not exists tag_class text not null default 'tag-gold'
    check (tag_class in ('tag-gold', 'tag-signature', 'tag-forest'));

alter table rooms
  drop column if exists tag,
  drop column if exists capacity,
  drop column if exists size;
