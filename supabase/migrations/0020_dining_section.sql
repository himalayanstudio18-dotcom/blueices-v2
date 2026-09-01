-- ═══════════════════════════════════════════════════════════════
-- Migration 0020 — Dining Section
--
-- Adds a `section` discriminator to gallery_images so Dining photos
-- reuse the existing Gallery table/bucket/RLS/draft-publish pipeline
-- while staying logically separate from the Story page's fan
-- carousel (which reads gallery_images with no category filter today
-- — without this column, any Dining photo would appear there too).
--
-- Purely additive: existing rows get section='gallery' via the
-- column default, so nothing already published changes. No rows are
-- deleted or rewritten, no table is dropped or recreated. RLS
-- policies on gallery_images and the `gallery` storage bucket are
-- untouched — they don't reference category/section, so Dining
-- photos automatically inherit the same public-read / staff-write
-- rules Gallery photos already have.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

alter table gallery_images
  add column if not exists section text not null default 'gallery';

alter table gallery_images
  drop constraint if exists gallery_images_section_check;
alter table gallery_images
  add constraint gallery_images_section_check check (section in ('gallery', 'dining'));

-- Widen the existing category constraint to also accept the five
-- Dining categories, alongside the four Gallery ones already there.
alter table gallery_images
  drop constraint if exists gallery_images_category_check;
alter table gallery_images
  add constraint gallery_images_category_check check (
    category in (
      'exterior', 'interior', 'nature', 'room',
      'breakfast', 'lunch', 'dinner', 'local_cuisine', 'tea_snacks'
    )
  );
