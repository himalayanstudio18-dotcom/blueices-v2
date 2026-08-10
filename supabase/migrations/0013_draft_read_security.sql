-- ═══════════════════════════════════════════════════════════════
-- Migration 0013 — Draft/publish read security fix
--
-- Two gaps found in a read-only security audit of the 0011/0012
-- draft system:
--
-- 1. room_images' public SELECT policy checked only that the parent
--    room was published — it never excluded is_draft photos, so a
--    pending (unpublished) photo on an already-live room was
--    directly queryable via the anon key even though the app's own
--    UI (shapeRoom in usePublishedRooms.js) filters it out client-
--    side only. Fixed by adding is_draft = false to the public
--    policy's USING clause. Staff still see draft photos via the
--    separate "staff can read all room images" policy (RLS SELECT
--    policies for the same command are OR'd together, so that
--    policy is untouched by this change).
--
-- 2. rooms.draft_data, gallery_images.draft_data, and
--    site_content.draft_value_en/bn are readable by anyone, because
--    Postgres RLS is row-level, not column-level — "anyone can read
--    published rooms" (etc.) makes the whole row visible, pending
--    draft content included. None of the public-facing hooks
--    (usePublishedRooms, useGalleryImages, useSiteContent outside
--    preview mode) select these columns, so removing the anon role's
--    access to them is safe with no frontend changes required.
--    Fixed with a column-level REVOKE of table-wide SELECT from
--    anon, replaced with an explicit GRANT of every other column.
--    The authenticated role (used by logged-in staff, gated further
--    by is_staff()/has_role() in the existing RLS policies) is not
--    touched, so admin/editor access is unaffected.
--
-- NOT fixed here: settings.draft_data. useSettings.js (used publicly
-- in Footer.jsx/Hero.jsx, under the anon key) does `select('*')`,
-- which requires SELECT privilege on every column — revoking just
-- draft_data would break that call outright for every public site
-- visitor. Closing this gap needs a one-line frontend change
-- (explicit column list instead of '*'), which is application code,
-- out of scope for this database-only migration. Left open
-- deliberately rather than guessing at a frontend fix.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. room_images: exclude pending/draft photos from public reads ───
drop policy if exists "anyone can read images of published rooms" on room_images;
create policy "anyone can read published images of published rooms" on room_images
  for select using (
    is_draft = false
    and exists (select 1 from rooms where rooms.id = room_images.room_id and rooms.is_published = true)
  );

-- ─── 2. Hide draft columns from the anon (public, unauthenticated) role ───
-- Table-level SELECT is revoked from anon, then re-granted as an
-- explicit column list that excludes the draft column(s). Row
-- visibility (is_published = true etc.) is still enforced separately
-- by the existing RLS policies on each table — this only restricts
-- which columns of an already-visible row can be read.

-- rooms
revoke select on rooms from anon;
grant select (
  id, name_en, name_bn, desc_en, desc_bn, price, sort_order, is_published,
  created_at, updated_at, tag_en, tag_bn, size_en, size_bn, features_en,
  features_bn, tag_class, slug, room_type, short_desc_en, short_desc_bn,
  weekend_price, max_guests, bed_configuration_en, bed_configuration_bn,
  is_featured, is_available, seo_title, seo_description, bathrooms
) on rooms to anon;

-- gallery_images
revoke select on gallery_images from anon;
grant select (
  id, storage_path, caption_en, caption_bn, category, sort_order,
  is_published, created_at, alt_text_en, alt_text_bn, is_featured
) on gallery_images to anon;

-- site_content
revoke select on site_content from anon;
grant select (
  id, page, section_key, value_en, value_bn, updated_at, updated_by
) on site_content to anon;
