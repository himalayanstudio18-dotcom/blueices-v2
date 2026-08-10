-- ═══════════════════════════════════════════════════════════════
-- RUN THIS ONE FILE — combines migrations 0011 and 0012
-- (everything before this, 0002-0010, was already run separately)
--
-- WHAT TO DO:
-- 1. Open your Supabase project → SQL Editor → New query
-- 2. Select all the text in this file and copy it (Ctrl+A, Ctrl+C)
-- 3. Paste it into the SQL Editor
-- 4. Click "Run"
-- 5. Scroll the results panel — make sure it says "Success" with no
--    red error text
-- 6. Tell me it's done and I'll verify it myself
--
-- This adds the Draft / Preview / Publish system: editing a room,
-- gallery photo, site content, or settings now saves as a draft
-- instead of instantly changing the live public site — you preview
-- it, then explicitly publish.
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- PART 1 (was migration 0011) — draft staging columns
-- ─────────────────────────────────────────────────────────────

alter table rooms
  add column if not exists draft_data jsonb;

alter table gallery_images
  add column if not exists draft_data jsonb;

alter table settings
  add column if not exists draft_data jsonb;

alter table site_content
  add column if not exists draft_value_en text,
  add column if not exists draft_value_bn text;


-- ─────────────────────────────────────────────────────────────
-- PART 2 (was migration 0012) — room photo uploads also draft-gated
-- ─────────────────────────────────────────────────────────────

alter table room_images
  add column if not exists is_draft boolean not null default false;


-- ═══════════════════════════════════════════════════════════════
-- DONE. If you see "Success" above with no red errors, tell the
-- assistant — it will verify everything live and then walk you
-- through testing the actual Save Draft → Preview → Publish flow.
-- ═══════════════════════════════════════════════════════════════
