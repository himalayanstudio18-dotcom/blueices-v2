-- ═══════════════════════════════════════════════════════════════
-- Migration 0010 — Room SEO fields + bathroom count
--
-- Purely additive — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

alter table rooms
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists bathrooms int;
