-- ═══════════════════════════════════════════════════════════════
-- Seeds the 3 rooms that were previously hardcoded on the site, now
-- updated to match the current rooms schema (post migrations 0002-
-- 0010). Real content pulled from the site's original copy — not
-- placeholder text.
--
-- Photos are NOT seeded here — upload them yourself via the admin
-- panel (Admin > Rooms > [room] > Upload Photos) after this runs.
-- Until then the public site shows a placeholder image per room.
--
-- Safe to run once. If you run it twice you'll get duplicate rooms
-- (there's no unique constraint on name), so check Admin > Rooms
-- first if you're not sure whether this already ran.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

insert into rooms (
  name_en, name_bn, slug, room_type, tag_en, tag_bn, tag_class,
  max_guests, bed_configuration_en, bed_configuration_bn, size_en, size_bn,
  desc_en, desc_bn, features_en, features_bn,
  price, sort_order, is_published, is_available
) values
(
  'Cloudline Suite', 'ক্লাউডলাইন স্যুট', 'cloudline-suite', 'Suite',
  'Mountain View', 'পাহাড়ের দৃশ্য', 'tag-gold',
  2, 'King Bed', 'কিং বেড',
  '320 sq.ft', '৩২০ বর্গফুট',
  'Floor-to-ceiling glass framing the Kanchenjunga horizon. Fall asleep to mountain crickets, wake to soft clouds drifting past your windowsill.',
  'জানালা খুললেই কাঞ্চনজঙ্ঘা। ঘুমোন পাহাড়ের ঝিঁঝিঁর সুরে, জেগে উঠুন মেঘ ভেসে যাওয়া দেখতে দেখতে।',
  ARRAY['Private Verandah', 'Farm Breakfast Included', 'Heated Electric Blanket', 'Unfiltered Mountain Panorama'],
  ARRAY['নিজস্ব বারান্দা', 'খামারের সকালের নাস্তা', 'গরম বৈদ্যুতিক কম্বল', 'অখণ্ড পাহাড়ি দিগন্ত'],
  3800, 0, true, true
),
(
  'Heritage Loft', 'হেরিটেজ লফট', 'heritage-loft', 'Loft',
  'Signature Haven', 'বিশেষ আশ্রয়', 'tag-signature',
  3, 'Queen + Daybed', 'কুইন + ডে-বেড',
  '410 sq.ft', '৪১০ বর্গফুট',
  'Reclaimed cedar woodwork, hand-loomed hill textiles, and a private stone fireplace carrying the warmth of mountain winters past.',
  'পুরনো দেবদারু কাঠের গন্ধ, পাথরের উনুনের উষ্ণতা — যেন কোনো পুরনো বাংলা গল্পের বনবাড়িতে এসে পড়েছেন। শীতের পাহাড়ে এই ঘর যেন বুকের ভেতরে আলো জ্বালিয়ে দেয়।',
  ARRAY['Stone Fireplace', 'Handcrafted Cedar Details', 'Verandah Tea Lounge', 'All Meals Included Option'],
  ARRAY['পাথরের আগুনকুণ্ড', 'হাতে তৈরি দেবদারু অন্দরসজ্জা', 'বারান্দার চা-কোণ', 'সব খাবার-সহ বিকল্প'],
  4500, 1, true, true
),
(
  'Forest Cottage', 'ফরেস্ট কটেজ', 'forest-cottage', 'Cottage',
  'Rhododendron Sanctuary', 'রডোডেন্ড্রনের ছায়ায়', 'tag-forest',
  2, 'Double Bed', 'ডাবল বেড',
  '280 sq.ft', '২৮০ বর্গফুট',
  'Tucked beneath ancient rhododendron trees. A quiet, secluded corner where wild birdsong is your only morning alarm.',
  'পুরনো রডোডেন্ড্রনের ছায়ায় লুকিয়ে থাকা একচিলতে নিভৃত কোণ। পাখির ডাক ছাড়া আর কোনো শব্দ নেই — এই নীরবতাই আপনার সকালের অ্যালার্ম।',
  ARRAY['Pine Forest View', 'Private Entrance', 'Continuous Hot Water', 'Birdwatching Porch'],
  ARRAY['পাইন বনের দৃশ্য', 'আলাদা প্রবেশপথ', 'সারাক্ষণ গরম জল', 'পাখি দেখার বারান্দা'],
  3200, 2, true, true
);
