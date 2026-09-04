-- ═══════════════════════════════════════════════════════════════
-- Migration 0022 — Promotions: custom discount text
--
-- discount_type = 'custom' ("Custom / text-based offer" per the
-- Promotion Manager spec) needs its own free-text field — the
-- existing discount_value/special_price columns are numeric and
-- don't fit a text-based offer. Purely additive; every existing row
-- gets discount_custom_text = null.
-- ═══════════════════════════════════════════════════════════════

alter table promotions add column discount_custom_text text;

revoke select on promotions from anon;
grant select (
  id, eyebrow_en, eyebrow_bn, headline_en, headline_bn,
  description_en, description_bn, location_en, location_bn,
  discount_type, discount_value, special_price, discount_custom_text,
  offer_condition_en, offer_condition_bn, min_count, benefits,
  cta_en, cta_bn, start_date, end_date,
  show_on_homepage, show_on_stays, show_as_popup, is_featured,
  image_storage_path, whatsapp_template, is_published,
  created_at, updated_at
) on promotions to anon;
