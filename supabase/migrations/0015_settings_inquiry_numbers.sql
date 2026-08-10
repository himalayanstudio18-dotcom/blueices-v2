-- ═══════════════════════════════════════════════════════════════
-- Migration 0015 — settings.inquiry_numbers
--
-- Footer.jsx hardcoded a second list of phone numbers (the "Inquiry
-- Numbers" block) separately from settings.phone/whatsapp. Moves
-- that list into settings as a jsonb array so the admin can add,
-- remove, and reorder inquiry numbers without a code change — same
-- draft/publish flow as every other settings field (draft_data
-- already covers this column, see migration 0011).
--
-- Defaults to the numbers that were previously hardcoded, so
-- existing installs see no visible change until the admin edits
-- them. Column-level anon grant (see 0014) is reissued to include
-- the new column, same pattern as the existing settings columns.
-- ═══════════════════════════════════════════════════════════════

alter table settings
  add column if not exists inquiry_numbers jsonb not null default '["9804974595", "7602661373", "7063122577"]'::jsonb;

revoke select on settings from anon;
grant select (
  id, property_name, logo_url, favicon_url, phone, email, whatsapp,
  address, google_maps_url, checkin_time, checkout_time,
  booking_enabled, min_stay, max_guests, cancellation_policy,
  booking_message, instagram_url, facebook_url, youtube_url,
  google_business_url, notify_new_inquiry, notify_booking,
  notify_staff, inquiry_numbers, updated_at
) on settings to anon;
