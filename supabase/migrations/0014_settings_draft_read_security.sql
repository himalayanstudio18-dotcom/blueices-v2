-- ═══════════════════════════════════════════════════════════════
-- Migration 0014 — settings.draft_data read security (closes the
-- gap deliberately left open in 0013)
--
-- 0013 could not lock down settings.draft_data from the anon role
-- because useSettings.js (public — used in Footer.jsx, Hero.jsx,
-- FinalCTA.jsx, ContactPage.jsx) ran `select('*')`, which requires
-- SELECT on every column; revoking just draft_data would have
-- broken that call for every public site visitor.
--
-- useSettings.js has since been changed to request an explicit
-- column list (excluding draft_data) instead of '*', so the same
-- column-level REVOKE/GRANT pattern used for rooms/gallery_images/
-- site_content in 0013 is now safe to apply here too.
--
-- Purely a grant change — no RLS policy is touched (settings only
-- has "anyone can read settings" / "owner can write settings", both
-- unchanged), no rows are modified.
-- ═══════════════════════════════════════════════════════════════

revoke select on settings from anon;
grant select (
  id, property_name, logo_url, favicon_url, phone, email, whatsapp,
  address, google_maps_url, checkin_time, checkout_time,
  booking_enabled, min_stay, max_guests, cancellation_policy,
  booking_message, instagram_url, facebook_url, youtube_url,
  google_business_url, notify_new_inquiry, notify_booking,
  notify_staff, updated_at
) on settings to anon;
