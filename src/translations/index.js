/*
  Translations — Blue Ice / Lakhey Lachen Homestay
  ──────────────────────────────────────────────────
  BENGALI PHILOSOPHY:
  Independent, deeply poetic, authentic and professional Bengali copywriting.
  No informal/cheap translations; refined CTA text and elegant hospitality voice.
*/

const t = {

  /* ══════════════════════════════════════════════════════════
     ENGLISH
     ══════════════════════════════════════════════════════════ */
  en: {

    /* NAV */
    nav: {
      home: 'Home',
      stays: 'Stays',
      experiences: 'Experiences',
      story: 'Our Story',
      contact: 'Contact',
      book: 'Book Your Stay',
      langLabel: '\u09AC\u09BE\u0982',
      langFull: '\u09AC\u09BE\u0982\u09B2\u09BE',
    },

    /* HERO */
    hero: {
      location: 'Lower Burmaik \u00B7 Munsong \u00B7 3,800 ft',
      line1: 'Where the Clouds Rest',
      line2: '\u0026 Your Soul Breathes.',
      sub: 'Perched at 3,800 feet in Munsong. A private family sanctuary built on warm hearths, home-grown meals, and unfiltered mountain silence.',
      cta1: 'Reserve Your Stay',
      cta2: 'Explore Our Story',
      trust1: '4.9 Guest Rating',
      trust2: '3,800 ft Cloudline',
      trust3: 'Authentic Family Home',
    },

    /* HOME WELCOME */
    welcome: {
      eyebrow: 'A Private Himalayan Sanctuary',
      h2line1: 'Slow Down.',
      h2line2: 'You\u2019ve Reached the Ridge.',
      desc: 'Lower Burmaik isn\u2019t just a destination on a map \u2014 it\u2019s a feeling you carry home. Here at 3,800 feet above sea level, the clamor of city life quietly dissolves into wood-smoke, pine-scented rain, and the first golden rays spilling across the Kanchenjunga horizon.',
      cta: 'Discover Our Full Story \u2192',
      badge: '3,800 ft Elevation',
      badgeSub: 'Lower Burmaik \u00B7 Kalimpong',
    },

    /* HOME EXPERIENCES TEASER */
    expTeaser: {
      eyebrow: 'Life at Altitude',
      h2line1: 'Moments That',
      h2line2: 'Stay With You',
      sub: 'Immerse yourself in the living rhythm of Lower Burmaik.',
      cta: 'Explore All Experiences \u0026 Treks \u2192',
      moments: [
        {
          num: '01', tag: 'Every Morning',
          title: 'Sunrise Above the Clouds',
          desc: 'Wake before the valley stirs. Watch liquid gold pour across snow-capped peaks with a piping cup of local hill tea.',
        },
        {
          num: '02', tag: 'Every Night',
          title: 'Starlit Bonfire Evenings',
          desc: 'As evening mist rolls through the pine trees, gather by a crackling timber fire beneath an unfiltered canopy of stars.',
        },
        {
          num: '03', tag: '2 km from Home',
          title: 'Misty Tea Garden Trails',
          desc: 'Wander quiet terraced slopes where rain smells of wild pine and fresh tea leaves, guided only by gentle mountain breeze.',
        },
        {
          num: '04', tag: 'Off the Trail',
          title: 'Hidden Mountain Cascades',
          desc: 'Follow secret forest paths to quiet mountain waterfalls known only to local village elders.',
        },
      ],
    },

    /* HOME GALLERY STRIP */
    galleryStrip: {
      eyebrow: 'Signature Impressions',
      h2line1: 'Glimpses of',
      h2line2: 'Stillness',
      sub: 'A visual glimpse into our mountain homestay.',
      cta: 'Read Our Full Story \u0026 Heritage \u2192',
      photos: [
        { caption: 'Terraced slopes wrapped in morning mist.' },
        { caption: 'No alarm clocks. Just mountain light.' },
        { caption: 'Where morning fog embraces the ridge.' },
        { caption: 'Kanchenjunga, glimpsed through the pines.' },
        { caption: 'A road that asks you to slow down.' },
        { caption: 'Clouds settling into the valley below.' },
        { caption: 'Lanterns lit, long before you arrive.' },
        { caption: 'Evenings warmed by a porch light glow.' },
        { caption: 'The valley, wide open and unhurried.' },
        { caption: 'A window seat built for slow mornings.' },
        { caption: 'Fired by wood, served with love.' },
        { caption: 'The village, terraced into the mountainside.' },
      ],
    },

    /* HOME WHY TEASER */
    whyTeaser: {
      eyebrow: 'The Lakhey Promise',
      h2: 'Not a Hotel. A Home That Remembers You.',
      sub: '100% Organic Farm Kitchen \u00B7 3,800 ft Cloudline Vistas \u00B7 Genuine Sikkim Hospitality',
      cta: 'Discover Why Guests Return \u2192',
    },

    /* STAYS PAGE */
    staysPage: {
      eyebrow: 'Sanctuaries Above the Mist',
      h1: 'Crafted for Rest \u0026 Reflection',
      sub: 'Handcrafted cedar suites designed with natural warmth, private verandahs, and unfiltered vistas of the Kanchenjunga horizon.',
      heroLine1: 'A Cedar Sanctuary,',
      heroLine2: 'Wrapped in Mountain Silence',
      heroBody: 'Perched at 3,800 feet above Lower Burmaik, each handcrafted suite opens onto an unbroken view of the Kanchenjunga range — where mornings arrive in mist, and evenings end by firelight.',
      heroCta1: 'Book Your Stay',
      heroCta2: 'Explore Rooms',
      heroDetails: [
        { label: '3,800 ft Cloudline Elevation' },
        { label: 'Handcrafted Cedar Interiors' },
        { label: 'Farm-to-Table Breakfast' },
        { label: 'Genuine Sikkim Hospitality' },
      ],
    },
    featuredStay: {
      eyebrow: 'Crafted for Rest \u0026 Reflection',
      h2line1: 'Sanctuaries in',
      h2line2: 'the Clouds',
      sub: 'Thoughtfully designed mountain rooms built with natural cedar timber and genuine Himalayan warmth.',
      amenitiesTitle: 'Included With Every Stay',
      ctaCard: 'Reserve This Suite \u2192',
      ctaBottom: 'Check Custom Availability \u2192',
      rooms: [
        {
          name: 'Cloudline Suite',
          tag: 'Mountain View',
          capacity: '2 Guests \u00B7 King Bed',
          size: '320 sq.ft',
          desc: 'Floor-to-ceiling glass framing the Kanchenjunga horizon. Fall asleep to mountain crickets, wake to soft clouds drifting past your windowsill.',
          features: ['Private Verandah', 'Farm Breakfast Included', 'Heated Electric Blanket', 'Unfiltered Mountain Panorama'],
        },
        {
          name: 'Heritage Loft',
          tag: 'Signature Haven',
          capacity: '2\u20133 Guests \u00B7 Queen + Daybed',
          size: '410 sq.ft',
          desc: 'Reclaimed cedar woodwork, hand-loomed hill textiles, and a private stone fireplace carrying the warmth of mountain winters past.',
          features: ['Stone Fireplace', 'Handcrafted Cedar Details', 'Verandah Tea Lounge', 'All Meals Included Option'],
        },
        {
          name: 'Forest Cottage',
          tag: 'Rhododendron Sanctuary',
          capacity: '2 Guests \u00B7 Double Bed',
          size: '280 sq.ft',
          desc: 'Tucked beneath ancient rhododendron trees. A quiet, secluded corner where wild birdsong is your only morning alarm.',
          features: ['Pine Forest View', 'Private Entrance', 'Continuous Hot Water', 'Birdwatching Porch'],
        },
      ],
      amenities: [
        'Home-cooked Organic Meals',
        '3,800 ft Cloudline Vistas',
        'Nightly Wood Bonfire',
        'High-Speed Fiber WiFi',
        'Private Airport Pickup Available',
        'Fresh Local Tea Service',
      ],
    },

    /* EXPERIENCES PAGE */
    expPage: {
      eyebrow: 'Unhurried Himalayan Life',
      h1: 'Moments Written in Mist \u0026 Light',
      sub: 'From sunrise tea above the cloudline to starlit wood bonfires and quiet tea-garden walks \u2014 step into the living rhythm of Lower Burmaik.',
      heroLine1: 'Moments Written',
      heroLine2: 'in Mist & Light',
      heroBody: 'From sunrise tea above the cloudline to starlit wood bonfires and quiet tea-garden walks \u2014 this is not a checklist of activities. It is a different way of moving through the day.',
      heroCta1: 'Explore Experiences',
      heroCta2: 'Plan Your Journey',
    },
    featuredExp: {
      eyebrow: 'Immersive Mountain Life',
      h2line1: 'What Will You',
      h2line2: 'Feel Here?',
      sub: 'Every hour in Lower Burmaik carries its own quiet, unhurried magic.',
      actsLabel: 'Curated Activities at Lakhey Lachen',
      cta: 'Plan Your Himalayan Journey \u2192',
      moments: [
        {
          num: '01', tag: 'Every Morning',
          title: 'Sunrise Above the Clouds',
          desc: 'Wake before the valley stirs. Watch gold pour over the Kanchenjunga range from your private verandah with a steaming cup of fresh-brewed hill tea.',
        },
        {
          num: '02', tag: 'Every Night',
          title: 'Starlit Bonfire Evenings',
          desc: 'As night mist settles across the pine ridges, gather around a wood hearth beneath an endless sea of stars unmarred by city lights.',
        },
        {
          num: '03', tag: '2 km from Home',
          title: 'Misty Tea Garden Trails',
          desc: 'Walk the terraced slopes of Munsong\u2019s tea gardens. Pluck fresh leaves, breathe rain-washed air, and listen to the whisper of mountain breeze.',
        },
        {
          num: '04', tag: 'Off the Trail',
          title: 'Hidden Mountain Cascades',
          desc: 'Follow secret forest trails to secluded gorges known only to village elders \u2014 quiet spots where mountain streams tumble clear and cold.',
        },
      ],
      acts: [
        { title: 'Pine Forest Treks', detail: '1.5 hrs \u00B7 Local trails' },
        { title: 'Teesta River View', detail: '20 min scenic drive' },
        { title: 'Monastery Visits', detail: '30 min drive' },
        { title: 'Organic Farm Harvest', detail: 'In Homestay Garden' },
        { title: 'Night Stargazing', detail: 'Clear Sky Nights' },
        { title: 'Hearth Cooking', detail: 'Daily Home Meals' },
      ],
    },

    /* STORY PAGE */
    storyPage: {
      eyebrow: 'Lower Burmaik \u00B7 Munsong \u00B7 3,800 ft',
      h1: 'Our Family Story \u0026 Heritage',
      sub: 'For generations, our family has guarded these quiet ridges. Discover our heritage, farm-to-table kitchen, and open-hearted hill hospitality.',
      heroLine1: 'Our Family Story',
      heroLine2: '& Heritage',
      heroBody: 'For generations, our family has guarded these quiet ridges — a home built not for guests to pass through, but to belong to, if only for a few days.',
    },
    introduction: {
      eyebrow: 'The Lakhey Heritage',
      h2line1: 'More Than a Stay.',
      h2line2: 'A Himalayan Home.',
      lead: 'For generations, our family has called these mist-wrapped ridges home. We built Blue Ice not as a commercial resort, but as an open-hearted hearth for travelers seeking authentic Sikkim warmth.',
      body: 'Here, meals are prepared with vegetables picked fresh from our own organic terrace farm. Conversations unfold over wood-fired tea, and your hosts remember your name, your preferences, and your stories.',
      stat1: '100%', stat1Label: 'Organic Farm Kitchen',
      stat2: '4.9\u2605', stat2Label: 'Guest Hospitality Rating',
      stat3: '0', stat3Label: 'City Noise \u0026 Traffic',
      cta: 'Plan Your Journey \u2192',
      badgeAlt: '3,800', badgeUnit: 'FT',
      badgeLabel: 'Lower Burmaik \u00B7 Munsong',
    },
    gallery: {
      eyebrow: 'Signature Gallery',
      h2line1: 'Moments Captured in',
      h2line2: 'Stillness',
      sub: 'A visual journey through Lakhey Lachen.',
      cta: 'Plan Your Journey \u2192',
      photos: [
        { caption: 'No alarm clocks. Just mountain light.' },
        { caption: 'Where morning fog embraces the ridge.' },
        { caption: 'Evenings warmed by crackling timber.' },
        { caption: 'Where the mountain exhales.' },
        { caption: 'Trails paved with quiet reflection.' },
        { caption: 'Fired by wood, served with love.' },
        { caption: 'Lanterns lit before the dark arrives.' },
        { caption: 'A balcony that lingers long after sunset.' },
        { caption: 'Clouds that drift without a destination.' },
        { caption: 'A window seat built for slow mornings.' },
        { caption: 'Evening light settling into every corner.' },
        { caption: 'Mornings that arrive soft, unannounced.' },
        { caption: 'Where every meal begins with a story.' },
        { caption: 'A village stitched gently into the hillside.' },
      ],
    },
    whyBlueIce: {
      eyebrow: 'Why Guests Return',
      h2line1: 'Three Pillars of',
      h2line2: 'Our Mountain',
      h2line3: 'Sanctuary',
      stat1: '100%', stat1Label: 'Organic Farm Kitchen',
      stat2: '3,800 ft', stat2Label: 'Cloudline Elevation',
      stat3: '4.9', stat3Label: 'Guest Hospitality Rating',
      stat4: '\u221E', stat4Label: 'Unbroken Stillness',
      pillars: [
        {
          title: 'Stay Like Family',
          desc: 'Not a commercial hotel. A real home \u2014 farm-grown meals from our hearth, hosts who remember your name, and warmth no resort can replicate.',
        },
        {
          title: 'Wake Above the Clouds',
          desc: 'At 3,800 ft, Lower Burmaik sits above the valley mist. Your morning view is an unfiltered horizon stretching across Kanchenjunga.',
        },
        {
          title: 'The Hidden Himalayas',
          desc: 'Munsong remains untouched by crowded tourist buses. Secret waterfalls, tea garden trails, and mountain silence right outside your porch.',
        },
      ],
    },

    /* CONTACT PAGE */
    contactPage: {
      eyebrow: 'Your Table by the Fire is Waiting',
      h1line1: 'Reserve Your',
      h1line2: 'Sanctuary',
      sub: 'We host only a few guests at a time to preserve the peace, warmth, and intimacy of a true family home. Reach out directly to plan your dates with us.',
      heroLine1: 'A Seat by the Fire,',
      heroLine2: 'Always Waiting for You',
      heroBody: 'We host only a handful of guests at a time, so every visit feels less like a booking and more like coming home. Write to us, and let’s begin planning your days in the mountains together.',
      card1badge: 'Instant Host Chat',
      card1h3: 'WhatsApp Booking',
      card1p: 'Chat directly with your hosts for instant room confirmation, personalized meal preferences, and hill travel advice.',
      card1cta: 'Chat on WhatsApp \u2192',
      card2badge: 'Direct Line',
      card2h3: 'Speak With Us',
      card2p: 'Prefer a voice call? Reach us between 8:00 AM and 8:00 PM IST for any questions before you travel.',
      card2cta: 'Call +91 98049 74595',
      card3badge: 'Email Inquiry',
      card3h3: 'Custom Inquiries',
      card3p: 'For extended work-from-mountains stays, family reunions, or custom retreat bookings, drop us an email.',
      card3cta: 'Send Email \u2192',
      locationH2: 'Finding Lower Burmaik, Munsong',
      locationSub: 'Nestled 3,800 feet high in the quiet green hills of Kalimpong district.',
      loc1h: 'By Air \u2014 Bagdogra Airport (IXB)',
      loc1p: 'Approx. 85 km / 3 hours scenic drive through the Teesta River valley.',
      loc2h: 'By Rail \u2014 NJP Station',
      loc2p: 'Approx. 80 km / 2.5\u20133 hours drive via Sevoke Bridge \u0026 Kalimpong route.',
      loc3h: 'Private Homestay Transfer',
      loc3p: 'We arrange private pre-booked cabs directly from NJP or Bagdogra straight to our doorstep.',
    },

    /* INQUIRY FORM (Contact page) */
    inquiryForm: {
      eyebrow: 'Or Write to Us Directly',
      h2: 'Send an Inquiry',
      sub: 'Share your travel dates and we’ll confirm availability directly — no automated booking engine, just your hosts.',
      labelName: 'Full Name',
      labelPhone: 'Phone Number',
      labelEmail: 'Email',
      labelCheckIn: 'Check-in',
      labelCheckOut: 'Check-out',
      labelGuests: 'Guests',
      labelRoom: 'Preferred Room',
      roomAny: 'No preference',
      labelMessage: 'Message',
      messagePlaceholder: 'Tell us about your stay — occasion, dietary needs, anything else we should know.',
      submit: 'Send Inquiry',
      submitting: 'Sending…',
      success: 'Thank you — your inquiry has been sent. We’ll reach out shortly to confirm your dates.',
      error: 'Something went wrong sending your inquiry. Please try WhatsApp or call us directly.',
      requiredName: 'Please enter your name.',
    },

    /* FINAL CTA */
    finalCta: {
      eyebrow: 'Your Mountain Escape Awaits',
      h2line1: 'Ready to Step Above',
      h2line2: 'the Clouds?',
      sub: 'Reserve your suite directly with your hosts. No middlemen, no automated portals \u2014 just personal Sikkim warmth from the moment you inquire.',
      cta1: 'Reserve via WhatsApp',
      cta2: 'Call Host +91 98049 74595',
      trust1: 'Instant Availability Check',
      trust2: '100% Home-Cooked Meals',
      trust3: 'Free Cancellation Option',
    },

    /* FOOTER */
    footer: {
      tagline: 'A family home in Lower Burmaik, Munsong, Kalimpong \u2014 where strangers become family.',
      colExplore: 'Explore',
      colContact: 'Contact',
      colFindUs: 'Find Us',
      mapCta: 'View on Google Maps',
      linkHome: 'Home',
      linkStays: 'Stay Collection',
      linkExp: 'Experiences',
      linkStory: 'Our Story',
      linkContact: 'Contact \u0026 Book',
      linkWhatsApp: 'Reserve via WhatsApp',
      inquiryLabel: 'Inquiry Numbers',
      copyright: '\u00A9 2025 Lakhey Lachen Homestay by Blue Ice \u00B7 All Rights Reserved',
      madeWith: 'Crafted with',
      madeIn: 'in the Himalayas',
    },

    /* MOBILE MENU */
    mobileMenu: {
      links: [
        { label: 'Home', sub: 'Welcome \u0026 Overview' },
        { label: 'Stay Collection', sub: 'Suites \u0026 Accommodations' },
        { label: 'Himalayan Experiences', sub: 'Moments \u0026 Excursions' },
        { label: 'Our Story \u0026 Legacy', sub: 'Heritage \u0026 Gallery' },
        { label: 'Contact \u0026 Reservations', sub: 'Direct Booking' },
      ],
      cta: 'Plan Your Stay \u2192',
      location: 'Lower Burmaik \u00B7 Munsong \u00B7 Kalimpong',
    },

  },


  /* ══════════════════════════════════════════════════════════
     BENGALI
     Authentic, deeply poetic, professional & warm.
     ══════════════════════════════════════════════════════════ */
  bn: {

    /* NAV */
    nav: {
      home: 'হোম',
      stays: 'থাকার ব্যবস্থা',
      experiences: 'অভিজ্ঞতা',
      story: 'আমাদের গল্প',
      contact: 'যোগাযোগ',
      book: 'বুক করুন',
      langLabel: 'EN',
      langFull: 'English',
    },
    /* HERO */
    hero: {
      location: 'লোয়ার বর্মায়েক · মুনসং · ৩,৮০০ ফুট',
      line1: 'শহরের শোর ফেলে',
      line2: 'চলো ঘুরে আসি',
      line3: 'শান্ত পাহাড়ের কোলে',
      sub: 'কাঞ্চনজঙ্ঘার ছায়ায় মুনসং-এর পাহাড়ে আমাদের পরিবার আপনার জন্য উনুন জ্বালিয়ে রেখেছে। এখানে সময় একটু ধীরে চলে — আর সেটাই এর সবচেয়ে বড় সম্পদ।',
      cta1: 'আপনার জায়গা বুক করুন',
      cta2: 'আমাদের গল্প শুনুন',
      trust1: '৪.৯ অতিথি মূল্যায়ন',
      trust2: '৩,৮০০ ফুট উচ্চতায়',
      trust3: 'একটি পরিবারের আপন ঘর',
    },
    /* HOME WELCOME */
    welcome: {
      eyebrow: 'হিমালয়ের কোলে এক নিভৃত আশ্রয়',
      h2line1: 'যেখানে সময় থমকে যায়।',
      h2line2: 'মন ভরে ওঠে শান্তিতে।',
      desc: 'লোয়ার বুরমাইক মানচিত্রের একটি বিন্দু নয় — এ এক অনুভূতি, যা আপনি ঘরে নিয়ে ফেরেন। সমুদ্রপৃষ্ঠ থেকে ৩,৮০০ ফুট উঁচুতে শহরের কোলাহল ধীরে ধীরে মিলিয়ে যায় কাঠের ধোঁয়ায়, বৃষ্টিভেজা পাইনের গন্ধে, আর কাঞ্চনজঙ্ঘার দিগন্তে ছড়িয়ে পড়া প্রথম সোনালি আলোয়।',
      cta: 'আমাদের পরিবারিক গল্প পড়ুন →',
      badge: '৩,৮০০ ফুট উচ্চতায়',
      badgeSub: 'লোয়ার বর্মায়েক · কালিম্পং',
    },
    /* HOME EXPERIENCES TEASER */
    expTeaser: {
      eyebrow: 'পাহাড়ের ছন্দে জীবন',
      h2line1: 'কিছু মুহূর্ত',
      h2line2: 'বুকে গেঁথে থাকে',
      sub: 'লোয়ার বর্মায়েকের প্রতিটি ভোর, প্রতিটি সন্ধ্যা — একেকটি ছোট্ট কবিতার মতো।',
      cta: 'সব অভিজ্ঞতা দেখুন →',
      moments: [
        {
          num: '০১',
          tag: 'প্রতিটি ভোরবেলা',
          title: 'পাহাড়ে ভোর হয় ধীরে ধীরে',
          desc: 'যখন উপত্যকা এখনো ঘুমে, তখন কাঞ্চনজঙ্ঘার চূড়ায় রং ধরে — হাতে একটুখানি পাহাড়ি চা, চোখে সেই প্রথম আলো।',
        },
        {
          num: '০২',
          tag: 'প্রতিটি রাতে',
          title: 'আগুনের পাশে, তারার নিচে',
          desc: 'পাইনের বনে যখন কুয়াশা নামে, তখন কাঠের আগুন জ্বলে ওঠে। মাথার উপরে শহরের আলোর ভিড় নেই — শুধু তারা, শুধু নীরবতা।',
        },
        {
          num: '০৩',
          tag: 'বাড়ি থেকে দুই পা',
          title: 'চা-বাগানের শিশির-ভেজা পথ',
          desc: 'মুনসং-এর সবুজ ঢালে হাঁটতে হাঁটতে মনে হয় পৃথিবীটা অনেক সহজ। পাতায় বৃষ্টির গন্ধ, হাওয়ায় তাজা চায়ের সুবাস।',
        },
        {
          num: '০৪',
          tag: 'গোপন পথের শেষে',
          title: 'যে ঝরনার কথা মানচিত্রে নেই',
          desc: 'গ্রামের প্রবীণদের জানা সেই বনপথ ধরে যান — নির্জন গিরিখাদে সেই ঝরনা আজও নিজের মতো বয়ে চলে, নিঃশব্দে।',
        },
      ],
    },
    /* HOME GALLERY STRIP */
    galleryStrip: {
      eyebrow: 'কয়েকটি মুহূর্তের ছবি',
      h2line1: 'চুপ করে থাকা',
      h2line2: 'পাহাড়ের ভাষা',
      sub: 'যা কথায় বলা যায় না, ছবি তা ধরে রাখে।',
      cta: 'আমাদের পরিবারের গল্প পড়ুন →',
      photos: [
        {
          caption: 'পাহাড়ের ধাপ কুয়াশায় মোড়া সকাল।',
        },
        {
          caption: 'ঘুম ভাঙে পাখির ডাকে, পাহাড়ের আলোয়।',
        },
        {
          caption: 'কুয়াশা পাহাড়কে আলিঙ্গন করে — রোজ সকালে।',
        },
        {
          caption: 'দেবদারুর ফাঁক দিয়ে দেখা কাঞ্চনজঙ্ঘা।',
        },
        {
          caption: 'এক পথ, যে আপনাকে ধীর হতে বলে।',
        },
        {
          caption: 'মেঘেরা নেমে আসে উপত্যকায়।',
        },
        {
          caption: 'আপনি পৌঁছানোর আগেই জ্বলে ওঠে লণ্ঠন।',
        },
        {
          caption: 'সন্ধ্যা উষ্ণ হয় বারান্দার আলোয়।',
        },
        {
          caption: 'উপত্যকা, খোলা ও নিরুদ্বিগ্ন।',
        },
        {
          caption: 'ধীর সকালের জন্য গড়া জানালার আসন।',
        },
        {
          caption: 'মায়ের রান্নার মতো — ভালোবাসা মিশে থাকে।',
        },
        {
          caption: 'পাহাড়ের গায়ে ধাপে ধাপে বসানো গ্রাম।',
        },
      ],
    },
    /* HOME WHY TEASER */
    whyTeaser: {
      eyebrow: 'লাখে লাচেনের প্রতিশ্রুতি',
      h2: 'এটি হোটেল নয় — এমন এক ঘর, যা আপনাকে মনে রাখে।',
      sub: 'শতভাগ জৈব খামারের রান্না · ৩,৮০০ ফুট পাহাড়ি নিস্তব্ধতা · মাটির কাছের মানুষের আতিথেয়তা',
      cta: 'অতিথিরা কেন বারবার ফেরেন →',
    },
    /* STAYS PAGE */
    staysPage: {
      eyebrow: 'পাহাড়ের বুকে আপনার ঘর',
      h1: 'একটু বিশ্রামের জন্য, একটু নিজের জন্য',
      sub: 'দেবদারু কাঠের উষ্ণতায়, বারান্দার কাঞ্চনজঙ্ঘার দৃশ্যে — এই ঘরগুলো তৈরি হয়েছে শুধু আপনার জন্য।',
      heroLine1: 'দেবদারু কাঠের নীড়,',
      heroLine2: 'পাহাড়ের নীরবতায় মোড়া',
      heroBody: 'লোয়ার বুরমাইকের ৩,৮০০ ফুট উচ্চতায়, প্রতিটি হাতে গড়া ঘর থেকে দেখা যায় কাঞ্চনজঙ্ঘার অবারিত দৃশ্য — যেখানে সকাল আসে কুয়াশা মেখে, সন্ধ্যা নামে আগুনের আলোয়।',
      heroCta1: 'বুক করুন আপনার ঘর',
      heroCta2: 'ঘরগুলি দেখুন',
      heroDetails: [
        {
          label: '৩,৮০০ ফুট মেঘরেখায়',
        },
        {
          label: 'হাতে গড়া দেবদারু কাঠ',
        },
        {
          label: 'খামারের তাজা প্রাতরাশ',
        },
        {
          label: 'প্রকৃত সিকিমি আতিথেয়তা',
        },
      ],
    },
    featuredStay: {
      eyebrow: 'পাহাড়ের বুকে আপনার ঘর',
      h2line1: 'মেঘের ওপারে',
      h2line2: 'প্রশান্তির নীড়',
      sub: 'প্রকৃতির দেবদারু কাঠ, হাতের বোনা কাপড় আর পাহাড়ের নিজস্ব উষ্ণতায় গড়া নিভৃত স্থান।',
      amenitiesTitle: 'প্রতিটি থাকায় যা যা পাবেন',
      ctaCard: 'এই ঘরটি বুক করুন →',
      ctaBottom: 'উপলব্ধতা জানুন →',
      rooms: [
        {
          name: 'ক্লাউডলাইন স্যুট',
          tag: 'পাহাড়ের দৃশ্য',
          capacity: '২ জন · কিং বেড',
          size: '৩২০ বর্গফুট',
          desc: 'জানালা খুললেই কাঞ্চনজঙ্ঘা। ঘুমোন পাহাড়ের ঝিঁঝিঁর সুরে, জেগে উঠুন মেঘ ভেসে যাওয়া দেখতে দেখতে।',
          features: [
            'নিজস্ব বারান্দা',
            'খামারের সকালের নাস্তা',
            'গরম বৈদ্যুতিক কম্বল',
            'অখণ্ড পাহাড়ি দিগন্ত',
          ],
        },
        {
          name: 'হেরিটেজ লফট',
          tag: 'বিশেষ আশ্রয়',
          capacity: '২–৩ জন · কুইন + ডে-বেড',
          size: '৪১০ বর্গফুট',
          desc: 'পুরনো দেবদারু কাঠের গন্ধ, পাথরের উনুনের উষ্ণতা — যেন কোনো পুরনো বাংলা গল্পের বনবাড়িতে এসে পড়েছেন। শীতের পাহাড়ে এই ঘর যেন বুকের ভেতরে আলো জ্বালিয়ে দেয়।',
          features: [
            'পাথরের আগুনকুণ্ড',
            'হাতে তৈরি দেবদারু অন্দরসজ্জা',
            'বারান্দার চা-কোণ',
            'সব খাবার-সহ বিকল্প',
          ],
        },
        {
          name: 'ফরেস্ট কটেজ',
          tag: 'রডোডেন্ড্রনের ছায়ায়',
          capacity: '২ জন · ডাবল বেড',
          size: '২৮০ বর্গফুট',
          desc: 'পুরনো রডোডেন্ড্রনের ছায়ায় লুকিয়ে থাকা একচিলতে নিভৃত কোণ। পাখির ডাক ছাড়া আর কোনো শব্দ নেই — এই নীরবতাই আপনার সকালের অ্যালার্ম।',
          features: [
            'পাইন বনের দৃশ্য',
            'আলাদা প্রবেশপথ',
            'সারাক্ষণ গরম জল',
            'পাখি দেখার বারান্দা',
          ],
        },
      ],
      amenities: [
        'জৈব খামারের ঘরের রান্না',
        '৩,৮০০ ফুট পাহাড়ি দিগন্ত',
        'প্রতি রাতে কাঠের আগুন',
        'দ্রুতগতির ফাইবার ইন্টারনেট',
        'বিমানবন্দর থেকে নিজস্ব যাত্রা',
        'তাজা পাহাড়ি চা পরিষেবা',
      ],
    },
    /* EXPERIENCES PAGE */
    expPage: {
      eyebrow: 'পাহাড়ের ছন্দে, প্রকৃতির সুরে',
      h1: 'কুয়াশা আর আলোর মাঝে লেখা কিছু গল্প',
      sub: 'এখানে প্রতিটি মুহূর্তের নিজস্ব কবিতা আছে — ভোরের চা থেকে তারার রাত, চা-বাগান থেকে লুকানো ঝরনা।',
      heroLine1: 'কুয়াশা আর আলোর মাঝে',
      heroLine2: 'লেখা কিছু মুহূর্ত',
      heroBody: 'ভোরের চা থেকে তারার রাতের আগুন, শান্ত চা-বাগানের পথ হাঁটা — এ কোনো তালিকা নয়। এ দিন কাটানোর এক ভিন্ন ধরন।',
      heroCta1: 'অভিজ্ঞতাগুলো দেখুন',
      heroCta2: 'আপনার যাত্রার পরিকল্পনা করুন',
    },
    featuredExp: {
      eyebrow: 'পাহাড়ের জীবনে নিজেকে মেলে দিন',
      h2line1: 'এখানে এসে',
      h2line2: 'কী পাবেন?',
      sub: 'লোয়ার বর্মায়েকের প্রতিটি প্রহরে আছে তার নিজস্ব নিস্তব্ধ যাদু।',
      actsLabel: 'লাখে লাচেনে যা করা যায়',
      cta: 'আপনার পাহাড়যাত্রা সাজান →',
      moments: [
        {
          num: '০১',
          tag: 'প্রতিটি ভোরবেলা',
          title: 'পাহাড়ে ভোর হয় ধীরে ধীরে',
          desc: 'উপত্যকা ঘুমিয়ে থাকতে থাকতেই বারান্দায় বসুন। হাতে গরম পাহাড়ি চা, চোখে কাঞ্চনজঙ্ঘার প্রথম আলো — এই মুহূর্তের জন্যই আসা।',
        },
        {
          num: '০২',
          tag: 'প্রতিটি রাতে',
          title: 'আগুনের পাশে, তারার নিচে',
          desc: 'পাইন রিজে রাতের কুয়াশা যখন ঘন হয়, তখন কাঠের আগুনের পাশে বসুন। মাথার উপরে শহরের আলোর ভিড় নেই — শুধু তারা, শুধু নীরবতা।',
        },
        {
          num: '০৩',
          tag: 'বাড়ির কাছেই',
          title: 'চা-বাগানের শিশির-ভেজা পথ',
          desc: 'মুনসং-এর সবুজ ঢালে হাঁটুন। তাজা পাতা ছোঁয়া হাত, বৃষ্টিধোয়া বাতাসে বুক ভরা নিঃশ্বাস — এটাই সত্যিকারের বিশ্রাম।',
        },
        {
          num: '০৪',
          tag: 'লুকানো পথের শেষে',
          title: 'যে ঝরনার কথা মানচিত্রে নেই',
          desc: 'গ্রামের প্রবীণদের জানা সেই বনপথ ধরে যান — নির্জন গিরিখাদে সেই ঝরনা আজও নিজের মতো বয়ে চলে, নিঃশব্দে।',
        },
      ],
      acts: [
        {
          title: 'পাইন বন ট্রেক',
          detail: 'দেড় ঘণ্টা · স্থানীয় পথ',
        },
        {
          title: 'তিস্তা নদীর দৃশ্য',
          detail: '২০ মিনিট মনোরম যাত্রা',
        },
        {
          title: 'মনাস্ট্রি দর্শন',
          detail: '৩০ মিনিট দূরত্ব',
        },
        {
          title: 'জৈব খামারে ফসল তোলা',
          detail: 'হোমস্টে বাগানে',
        },
        {
          title: 'রাতে তারা দেখা',
          detail: 'নির্মেঘ আকাশের রাতে',
        },
        {
          title: 'উনুনে রান্না',
          detail: 'প্রতিদিনের ঘরোয়া খাবার',
        },
      ],
    },
    /* STORY PAGE */
    storyPage: {
      eyebrow: 'লোয়ার বর্মায়েক · মুনসং · ৩,৮০০ ফুট',
      h1: 'আমাদের পরিবারের গল্প ও ঐতিহ্য',
      sub: 'প্রজন্মের পর প্রজন্ম এই পাহাড়কে ঘর বলে জেনেছি। সেই শিকড়ের গল্প, উনুনের গল্প, দরজা খোলা রাখার গল্প।',
      heroLine1: 'আমাদের পরিবারের গল্প',
      heroLine2: 'ও ঐতিহ্য',
      heroBody: 'প্রজন্মের পর প্রজন্ম এই পাহাড়কে ঘর বলে জেনেছি। এ ঘর অতিথিদের সাময়িক থাকার জায়গা নয় — কয়েকটা দিনের জন্য হলেও, এখানে যুক্ত হয়ে যাওয়ার জায়গা।',
    },
    introduction: {
      eyebrow: 'লাখে পরিবারের শিকড়',
      h2line1: 'একটি পরিবারের গল্প।',
      h2line2: 'একটি পাহাড়ের স্বপ্ন।',
      lead: 'প্রজন্মের পর প্রজন্ম, কুয়াশা-জড়ানো এই পাহাড়ই ছিল আমাদের পরিবারের ঘর। ব্লু আইস তাই কোনো বাণিজ্যিক রিসোর্ট নয় — এ এক প্রতিজ্ঞা, যাতে প্রকৃত সিকিমি উষ্ণতা খুঁজে পাওয়া প্রতিটি পথিকের জন্য ঘরের আলো কখনো নিভে না যায়।',
      body: 'আমরা নিজের বাগানে ফলা সবজিতে রান্না করি। চায়ের কাপের পাশে গল্প জমে। এখানে যিনি আসেন, তিনি অতিথি নন — পরিবারের একজন হয়ে যান। আমরা আপনার নাম মনে রাখি, আপনার পছন্দ মনে রাখি।',
      stat1: '১০০%',
      stat1Label: 'জৈব খামারের রান্না',
      stat2: '৪.৯★',
      stat2Label: 'অতিথির মূল্যায়ন',
      stat3: '০',
      stat3Label: 'শহুরে কোলাহল',
      cta: 'আপনার যাত্রা সাজান →',
      badgeAlt: '৩,৮০০',
      badgeUnit: 'ফুট',
      badgeLabel: 'লোয়ার বর্মায়েক · মুনসং',
    },
    gallery: {
      eyebrow: 'আমাদের মুহূর্তের সংগ্রহ',
      h2line1: 'ছবিতে ধরা',
      h2line2: 'আমাদের পাহাড়',
      sub: 'কিছু মুহূর্ত কথায় বলা যায় না — শুধু দেখা যায়।',
      cta: 'আপনার যাত্রা সাজান →',
      photos: [
        {
          caption: 'ঘুম ভাঙে পাখির ডাকে, পাহাড়ের আলোয়।',
        },
        {
          caption: 'কুয়াশা পাহাড়কে আলিঙ্গন করে — রোজ সকালে।',
        },
        {
          caption: 'আগুনের উষ্ণতায় সন্ধ্যা বাড়ে।',
        },
        {
          caption: 'এখানে পাহাড়ও শ্বাস নেয়।',
        },
        {
          caption: 'পথ হাঁটলে, মন হালকা হয়।',
        },
        {
          caption: 'উনুনের রান্নায় মিশে থাকে ভালোবাসা।',
        },
        {
          caption: 'আঁধার নামার আগেই জ্বলে ওঠে লণ্ঠন।',
        },
        {
          caption: 'সূর্য ডোবার পরেও জেগে থাকে বারান্দা।',
        },
        {
          caption: 'মেঘের ভেসে চলায় নেই কোনো গন্তব্য।',
        },
        {
          caption: 'জানালার ধারে বসে থাকা ধীর সকালের আসন।',
        },
        {
          caption: 'সন্ধ্যার আলো ছড়িয়ে পড়ে ঘরের প্রতিটি কোণে।',
        },
        {
          caption: 'সকাল আসে নিঃশব্দে, নিমন্ত্রণ ছাড়াই।',
        },
        {
          caption: 'যেখানে প্রতিটি পদ শুরু হয় এক গল্প দিয়ে।',
        },
        {
          caption: 'পাহাড়ের গায়ে যত্নে বোনা একটি গ্রাম।',
        },
      ],
    },
    whyBlueIce: {
      eyebrow: 'অতিথিরা বারবার ফেরেন কেন',
      h2line1: 'তিনটি কারণ যা',
      h2line2: 'আমাদের এই পাহাড়ি',
      h2line3: 'আশ্রয়কে আলাদা করে',
      stat1: '১০০%',
      stat1Label: 'জৈব খামারের রান্না',
      stat2: '৩,৮০০ ফুট',
      stat2Label: 'পাহাড়ি উচ্চতা',
      stat3: '৪.৯',
      stat3Label: 'অতিথির মূল্যায়ন',
      stat4: '∞',
      stat4Label: 'পাহাড়ের নিস্তব্ধতা',
      pillars: [
        {
          title: 'অতিথি নন, পরিবারের একজন',
          desc: 'কোনো রিসেপশন নেই, কোনো রুম সার্ভিস নেই — আছে উনুনের রান্না, আছে পরিচিত মুখের হাসি। আমরা আপনার নাম মনে রাখি।',
        },
        {
          title: 'যেখানে ভোরটা অন্যরকম হয়',
          desc: '৩,৮০০ ফুটে লোয়ার বর্মায়েক মেঘের উপরে বাস করে। আপনার সকাল শুরু হয় কাঞ্চনজঙ্ঘার রং বদলানো দেখতে দেখতে।',
        },
        {
          title: 'পর্যটনের ভিড় যেখানে পৌঁছয় না',
          desc: 'মুনসং আজও সেই পাহাড় — নিবিড়, নিভৃত, নিজের মতো। গোপন ঝরনা, চা-বাগান, আর অখণ্ড নীরবতা আপনার বারান্দার বাইরেই।',
        },
      ],
    },
    /* CONTACT PAGE */
    contactPage: {
      eyebrow: 'আগুনের পাশে আপনার জায়গাটা খালি আছে',
      h1line1: 'আসুন,',
      h1line2: 'কথা বলি।',
      sub: 'আমরা একসাথে বেশি অতিথি রাখি না — কারণ প্রত্যেকের আলাদা যত্ন প্রাপ্য। আপনার ভ্রমণের কথা জানান, আমরা বাকিটা সামলে নেব।',
      card1badge: 'সরাসরি কথা বলুন',
      card1h3: 'হোয়াটসঅ্যাপে যোগাযোগ',
      card1p: 'ঘর নিশ্চিত করা, খাবারের পছন্দ জানাতে, পাহাড়ি পথের পরমর্শে — সব কিছু আমাদের সাথে সরাসরি।',
      card1cta: 'হোয়াটসঅ্যাপে সরাসরি বুকিং →',
      card2badge: 'ফোনে কথা বলুন',
      card2h3: 'আমাদের ডাকুন',
      card2p: 'কথায় স্বাচ্ছন্দ্য পান? সকাল ৮টা থেকে রাত ৮টার মধ্যে ফোন করুন — আমরা সেখানেই আছি।',
      card2cta: 'ফোন করুন: +91 98049 74595',
      card3badge: 'বিস্তারিত জানান',
      card3h3: 'ইমেইল করুন',
      card3p: 'দীর্ঘ থাকার পরিকল্পনা, পরিবারিক আড্ডা বা বিশেষ অনুষ্ঠানের জন্য ইমেইলে বিস্তারিত জানান।',
      card3cta: 'ইমেইল পাঠান →',
      locationH2: 'লোয়ার বর্মায়েক, মুনসং — কীভাবে পৌঁছাবেন',
      locationSub: 'কালিম্পং জেলার শান্ত পাহাড়ে, ৩,৮০০ ফুট উচ্চতায় আমাদের দরজা খোলা।',
      loc1h: 'বিমানে — Bagdogra Airport (IXB)',
      loc1p: 'প্রায় ৮৫ কিমি — তিস্তার উপত্যকা দিয়ে ৩ ঘণ্টার সুন্দর পথ।',
      loc2h: 'ট্রেনে — NJP Station',
      loc2p: 'প্রায় ৮০ কিমি — সেবক ব্রিজ ও কালিম্পং রুট দিয়ে ২.৫–৩ ঘণ্টার পথ।',
      loc3h: 'আমাদের নিজস্ব যাত্রার ব্যবস্থা',
      loc3p: 'NJP বা বাগডোগরা থেকে সরাসরি আমাদের দোরগোড়ায় — আগে থেকে জানালে আমরা ব্যবস্থা করে রাখি।',
      heroLine1: 'আগুনের ধারে একটি আসন,',
      heroLine2: 'সবসময় আপনার জন্য',
      heroBody: 'আমরা একসাথে অল্প কয়েকজন অতিথি রাখি — যাতে প্রতিটি সাক্ষাৎ হয়ে ওঠে বাড়ি ফেরার মতো। লিখুন আমাদের, পাহাড়ের দিনগুলোর পরিকল্পনা শুরু করি একসাথে।',
    },
    /* INQUIRY FORM (Contact page) */
    inquiryForm: {
      eyebrow: 'অথবা সরাসরি লিখুন',
      h2: 'অনুসন্ধান পাঠান',
      sub: 'আপনার ভ্রমণের তারিখ জানান — আমরা সরাসরি নিশ্চিত করব, কোনো স্বয়ংক্রিয় বুকিং ব্যবস্থা নয়।',
      labelName: 'পুরো নাম',
      labelPhone: 'ফোন নম্বর',
      labelEmail: 'ইমেইল',
      labelCheckIn: 'চেক-ইন',
      labelCheckOut: 'চেক-আউট',
      labelGuests: 'অতিথি সংখ্যা',
      labelRoom: 'পছন্দের কক্ষ',
      roomAny: 'কোনো নির্দিষ্ট পছন্দ নেই',
      labelMessage: 'বার্তা',
      messagePlaceholder: 'আপনার ভ্রমণ সম্পর্কে বলুন — উপলক্ষ, খাবারের চাহিদা, বা অন্য কিছু।',
      submit: 'পাঠান',
      submitting: 'পাঠানো হচ্ছে…',
      success: 'ধন্যবাদ — আপনার অনুসন্ধান পাঠানো হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।',
      error: 'অনুসন্ধান পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে হোয়াটসঅ্যাপ বা ফোনে যোগাযোগ করুন।',
      requiredName: 'অনুগ্রহ করে আপনার নাম লিখুন।',
    },
    /* FINAL CTA */
    finalCta: {
      eyebrow: 'পাহাড়ের বুকে আপনার নিভৃত সময়',
      h2line1: 'পাহাড় ডাকছে।',
      h2line2: 'উত্তর দিন।',
      sub: 'পাহাড়ের নীরবতা আর ঘরের উষ্ণতায় কাটুক আপনার প্রিয় মুহূর্তগুলো। সরাসরি কথা বলে বুক করুন আপনার পছন্দের কক্ষ।',
      cta1: 'হোয়াটসঅ্যাপে সরাসরি বুকিং →',
      cta2: 'ফোন করুন: +91 98049 74595',
      trust1: 'তাৎক্ষণিক সাড়া',
      trust2: 'শতভাগ ঘরের রান্না',
      trust3: 'সহজ বাতিলের সুবিধা',
    },
    /* FOOTER */
    footer: {
      tagline: 'লোয়ার বর্মায়েক, মুনসং, কালিম্পং — একটি পরিবারের ঘর, যেখানে অপরিচিতরা আপন হয়ে যায়।',
      colExplore: 'ঘুরে দেখুন',
      colContact: 'কথা বলুন',
      colFindUs: 'আমাদের অবস্থান',
      mapCta: 'গুগল ম্যাপে দেখুন',
      linkHome: 'হোম',
      linkStays: 'থাকার ব্যবস্থা',
      linkExp: 'অভিজ্ঞতা',
      linkStory: 'আমাদের গল্প',
      linkContact: 'যোগাযোগ ও বুকিং',
      linkWhatsApp: 'হোয়াটসঅ্যাপে সরাসরি যোগাযোগ',
      inquiryLabel: 'যোগাযোগের নম্বর',
      copyright: '© ২০২৫ লাখে লাচেন হোমস্টে · ব্লু আইস · সর্বস্বত্ব সংরক্ষিত',
      madeWith: 'গড়া হয়েছে',
      madeIn: 'হিমালয়ের ভালোবাসায়',
    },
    /* MOBILE MENU */
    mobileMenu: {
      links: [
        {
          label: 'হোম',
          sub: 'স্বাগত ও পরিচয়',
        },
        {
          label: 'থাকার ব্যবস্থা',
          sub: 'স্যুট ও থাকার ঘর',
        },
        {
          label: 'অভিজ্ঞতা',
          sub: 'পাহাড়ি মুহূর্ত ও ভ্রমণ',
        },
        {
          label: 'আমাদের গল্প',
          sub: 'শিকড় ও ঐতিহ্য',
        },
        {
          label: 'যোগাযোগ',
          sub: 'সরাসরি বুকিং ও সাহায্য',
        },
      ],
      cta: 'বুক করুন →',
      location: 'লোয়ার বর্মায়েক · মুনসং · কালিম্পং',
    },

  },

};

export default t;
