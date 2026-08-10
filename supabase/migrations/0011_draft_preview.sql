-- ═══════════════════════════════════════════════════════════════
-- Migration 0011 — Draft / Preview / Publish (Phase 12)
--
-- One nullable staging column per table for pending, unpublished
-- edits. Live columns are never touched until Publish explicitly
-- copies the draft over them. No version history, no audit trail —
-- one pending draft slot per row, overwritten on each Save Draft.
--
-- rooms/gallery_images/settings use a single jsonb column since they
-- have many editable fields; site_content only has two value columns
-- per row already, so plain draft_value_en/bn columns are simpler
-- than wrapping two strings in jsonb.
--
-- Purely additive — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

alter table rooms
  add column if not exists draft_data jsonb;

alter table gallery_images
  add column if not exists draft_data jsonb;

alter table settings
  add column if not exists draft_data jsonb;

alter table site_content
  add column if not exists draft_value_en text,
  add column if not exists draft_value_bn text;
