-- ═══════════════════════════════════════════════════════════════
-- Fills in Site Content for About and Experiences with your real
-- existing copy (pulled from src/translations/index.js — the same
-- words already on your site today, just now editable from the
-- admin panel instead of buried in code).
--
-- Policies is DIFFERENT: your site never had check-in/check-out/
-- cancellation/house-rules text anywhere before, so there was
-- nothing real to pull. What's below for Policies is a DRAFT written
-- from common homestay conventions — read it, edit it in
-- Admin > Site Content > Policies before you consider it final. It
-- won't appear on the Contact page at all until it's shown there
-- (there's a review step, not an auto-publish).
--
-- Safe to run once. Re-running just overwrites these same values
-- (page + section_key are unique together), so it won't duplicate.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

insert into site_content (page, section_key, value_en, value_bn) values
  ('story', 'heading',
   'More Than a Stay. A Himalayan Home.',
   'একটি পরিবারের গল্প। একটি পাহাড়ের স্বপ্ন।'),
  ('story', 'description',
   'For generations, our family has called these mist-wrapped ridges home. We built Blue Ice not as a commercial resort, but as an open-hearted hearth for travelers seeking authentic Sikkim warmth.',
   'প্রজন্মের পর প্রজন্ম, কুয়াশা-জড়ানো এই পাহাড়ই ছিল আমাদের পরিবারের ঘর। ব্লু আইস তাই কোনো বাণিজ্যিক রিসোর্ট নয় — এ এক প্রতিজ্ঞা, যাতে প্রকৃত সিকিমি উষ্ণতা খুঁজে পাওয়া প্রতিটি পথিকের জন্য ঘরের আলো কখনো নিভে না যায়।'),

  ('experiences', 'heading',
   'Moments Written in Mist & Light',
   'কুয়াশা আর আলোর মাঝে লেখা কিছু মুহূর্ত'),
  ('experiences', 'description',
   'From sunrise tea above the cloudline to starlit wood bonfires and quiet tea-garden walks — this is not a checklist of activities. It is a different way of moving through the day.',
   'ভোরের চা থেকে তারার রাতের আগুন, শান্ত চা-বাগানের পথ হাঁটা — এ কোনো তালিকা নয়। এ দিন কাটানোর এক ভিন্ন ধরন।'),

  -- DRAFT — review and edit before treating as final
  ('policies', 'checkin',
   'Check-in from 12:00 PM onwards. Early check-in may be available on request, subject to room readiness — just message us ahead of your arrival.',
   'দুপুর ১২:০০ টা থেকে চেক-ইন। আগে থেকে জানালে সম্ভব হলে তাড়াতাড়ি চেক-ইনের ব্যবস্থা করা যেতে পারে।'),
  ('policies', 'checkout',
   'Check-out by 11:00 AM. Late check-out may be possible if the room isn''t booked that day — ask your host in the morning.',
   'সকাল ১১:০০ টার মধ্যে চেক-আউট। সেদিন ঘর খালি থাকলে দেরিতে চেক-আউট সম্ভব — সকালে আমাদের জিজ্ঞাসা করুন।'),
  ('policies', 'cancellation',
   'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours may be subject to a partial charge — please reach out directly and we''ll work with you.',
   'চেক-ইনের ৪৮ ঘণ্টা আগে পর্যন্ত বিনামূল্যে বাতিল করা যায়। এর মধ্যে বাতিল করলে আংশিক চার্জ প্রযোজ্য হতে পারে — সরাসরি যোগাযোগ করুন, আমরা সমাধান করব।'),
  ('policies', 'house_rules',
   'A quiet, family-run home — please keep noise low after 10 PM. No smoking indoors. Pets welcome with prior notice. We cook fresh, home-style meals; let us know your dietary needs in advance.',
   'এটি একটি শান্ত, পারিবারিক পরিবেশ — রাত ১০টার পর শব্দ কম রাখুন। ঘরের ভেতরে ধূমপান নিষিদ্ধ। আগে থেকে জানালে পোষ্য নিয়ে আসা যায়। আমরা ঘরোয়া খাবার রান্না করি — খাবারের বিশেষ চাহিদা থাকলে আগে জানাবেন।')
on conflict (page, section_key) do update set
  value_en = excluded.value_en,
  value_bn = excluded.value_bn;
