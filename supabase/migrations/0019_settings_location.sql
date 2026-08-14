-- ═══════════════════════════════════════════════════════════════
-- Migration 0019 — settings location fields
--
-- Footer.jsx's Google Maps embed and "View on Google Maps" link are
-- currently hardcoded. This adds the remaining location fields to
-- settings (address and google_maps_url already existed) so the
-- Owner can edit the full location block from Property Settings —
-- same draft/publish flow as every other settings field (draft_data
-- already covers these columns, see migration 0011). No new table:
-- this extends the existing single-row settings config.
--
-- google_maps_embed_url is the src used by the public <iframe> —
-- kept separate from google_maps_url (the public share link used by
-- the "View on Google Maps" CTA) because Google issues different
-- URLs for each purpose. The app only ever stores this string and
-- builds the <iframe> itself; no raw HTML is ever stored or
-- rendered, so there's no injection surface.
--
-- Column-level anon grant (see 0014/0015) is reissued to include the
-- new columns, same pattern as every prior settings migration.
-- ═══════════════════════════════════════════════════════════════

alter table settings
  add column if not exists google_maps_embed_url text,
  add column if not exists location_label text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists location_note text,
  add column if not exists map_cta_label_en text,
  add column if not exists map_cta_label_bn text;

revoke select on settings from anon;
grant select (
  id, property_name, logo_url, favicon_url, phone, email, whatsapp,
  address, google_maps_url, google_maps_embed_url, location_label,
  latitude, longitude, location_note, map_cta_label_en, map_cta_label_bn,
  checkin_time, checkout_time,
  booking_enabled, min_stay, max_guests, cancellation_policy,
  booking_message, instagram_url, facebook_url, youtube_url,
  google_business_url, notify_new_inquiry, notify_booking,
  notify_staff, inquiry_numbers, updated_at
) on settings to anon;
