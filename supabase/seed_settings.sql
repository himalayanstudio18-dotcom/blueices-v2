-- ═══════════════════════════════════════════════════════════════
-- Fills in your Settings row with the real contact/social info that
-- was previously hardcoded across Footer.jsx, Hero.jsx, ContactPage.jsx
-- and FinalCTA.jsx. Once this runs, those components read from here
-- instead — so this is the same information, just centralized.
--
-- Safe to run any time — it only UPDATEs the single existing
-- settings row (id=1), it doesn't create a new one.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste
-- this whole file > Run.
-- ═══════════════════════════════════════════════════════════════

update settings set
  property_name = 'Lakhey Lachen Homestay by Blue Ice',
  phone = '+919804974595',
  email = 'blueicemunsong@gmail.com',
  whatsapp = '919804974595',
  address = 'Lower Burmaik, Munsong, Kalimpong, West Bengal',
  facebook_url = 'https://facebook.com/blueice.munsong',
  instagram_url = 'https://instagram.com/blueice.munsong',
  inquiry_numbers = '["9804974595", "7602661373", "7063122577"]'::jsonb
where id = 1;
