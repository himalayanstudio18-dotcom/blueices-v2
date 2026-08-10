-- ═══════════════════════════════════════════════════════════════
-- Migration 0004 — Gallery CMS (Phase 3)
--
-- gallery_images already has storage_path, caption_en/bn, category,
-- sort_order, is_published from schema.sql. This adds alt text
-- (accessibility, distinct from caption) and a featured flag.
-- Purely additive — safe to re-run.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

alter table gallery_images
  add column if not exists alt_text_en text,
  add column if not exists alt_text_bn text,
  add column if not exists is_featured boolean not null default false;
