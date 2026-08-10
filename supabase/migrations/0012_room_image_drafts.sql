-- ═══════════════════════════════════════════════════════════════
-- Migration 0012 — Room image drafts
--
-- Closes the one gap flagged in the Draft/Preview/Publish system:
-- uploaded photos previously went live immediately, even on an
-- already-published room. New uploads are now marked is_draft until
-- the room's draft is published (see publishRoomDraft in
-- src/admin/rooms/roomsApi.js, which flips this back to false).
--
-- Deletion stays instant (same as deleting a whole room) — only
-- new/pending photos are draft-gated, not removals.
-- ═══════════════════════════════════════════════════════════════

alter table room_images
  add column if not exists is_draft boolean not null default false;
