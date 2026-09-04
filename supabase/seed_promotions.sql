-- ═══════════════════════════════════════════════════════════════
-- Seed — September Bikers Special (demonstration/test campaign)
--
-- Inserted as a DRAFT (is_published = false) — it will not appear
-- anywhere on the public site until an Owner or Manager reviews it in
-- Admin ▸ Promotions and explicitly publishes it. Nothing here is
-- hardcoded into any frontend component; this is pure data, the same
-- way seed_rooms.sql/seed_site_content.sql seed their own tables.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run. Safe to re-run — it only inserts if a
-- promotion with this internal_name doesn't already exist.
-- ═══════════════════════════════════════════════════════════════

insert into promotions (
  internal_name,
  eyebrow_en, headline_en, description_en, location_en,
  discount_type, discount_value, special_price,
  offer_condition_en, min_count,
  benefits,
  cta_en,
  start_date, end_date,
  show_on_homepage, show_on_stays, show_as_popup, is_featured,
  is_published
)
select
  'September Bikers Special',
  'SEPTEMBER ESCAPE', 'Ride. Relax. Recharge.', 'Bring your crew to the mountains.', 'Kalimpong Lower Burmaik, Darjeeling',
  'percentage', 15, 950,
  '6+ Riders', 6,
  '[{"en":"Fooding & Lodging Included"},{"en":"On-site Bike Parking"},{"en":"Local Sightseeing Assistance"}]'::jsonb,
  'Plan Your Ride',
  '2026-09-01', '2026-09-30',
  true, true, true, true,
  false
where not exists (select 1 from promotions where internal_name = 'September Bikers Special');
