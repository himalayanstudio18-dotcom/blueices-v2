-- ═══════════════════════════════════════════════════════════════
-- Migration 0006 — Site Content CMS (Phase 5)
--
-- site_content (page, section_key, value_en, value_bn) already
-- exists from schema.sql. This widens the allowed `page` values to
-- include a standalone 'policies' page (house rules / check-in
-- policy aren't naturally any single existing page) and 'seo' isn't
-- a page of its own — SEO fields are stored as section_keys
-- (seo_title, seo_description, seo_og_image) on each existing page
-- instead, so no schema change is needed for that.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

alter table site_content drop constraint if exists site_content_page_check;
alter table site_content add constraint site_content_page_check
  check (page in ('home', 'stays', 'experiences', 'story', 'contact', 'policies'));
