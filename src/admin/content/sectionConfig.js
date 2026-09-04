import { DEFAULT_ROOM_RESERVATION_TEMPLATE } from '../../lib/phone';
import t from '../../translations';

/* Curated, editable regions per page — deliberately not fully
   freeform. Keeps the admin editor simple and keeps every editable
   field mapped to a real, known spot in the public site rather than
   letting staff create arbitrary orphaned content. */
export const PAGES = [
  { value: 'home', label: 'Homepage' },
  { value: 'story', label: 'About' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'policies', label: 'Policies' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'stays', label: 'Stays Page' },
];

export const SECTIONS = {
  home: [
    { key: 'hero_heading', label: 'Hero Heading', type: 'text', bilingual: true },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', bilingual: true },
    { key: 'hero_cta_text', label: 'Hero CTA Text', type: 'text', bilingual: true },
    { key: 'hero_cta_link', label: 'Hero CTA Link', type: 'text', bilingual: false },
    { key: 'hero_image', label: 'Hero Image URL', type: 'text', bilingual: false },
    {
      key: 'welcome_eyebrow',
      label: 'Welcome Eyebrow',
      type: 'text',
      bilingual: true,
      description: 'Small label above the "Slow Down. You’ve Reached the Ridge." heading, just below the homepage video.',
      // Editor shows the live translation copy until a CMS value is
      // published for this key, matching the fallback the public
      // Homepage already applies via useSiteContent's get().
      defaultValueEn: t.en.welcome.eyebrow,
      defaultValueBn: t.bn.welcome.eyebrow,
    },
    {
      key: 'welcome_heading_line1',
      label: 'Welcome Heading Line 1',
      type: 'text',
      bilingual: true,
      description: 'First line of the Welcome section heading (plain text, e.g. "Slow Down.").',
      defaultValueEn: t.en.welcome.h2line1,
      defaultValueBn: t.bn.welcome.h2line1,
    },
    {
      key: 'welcome_heading_line2',
      label: 'Welcome Heading Line 2',
      type: 'text',
      bilingual: true,
      description: 'Second line of the Welcome section heading, rendered italic below Line 1 (e.g. "You’ve Reached the Ridge.").',
      defaultValueEn: t.en.welcome.h2line2,
      defaultValueBn: t.bn.welcome.h2line2,
    },
    {
      key: 'welcome_description',
      label: 'Welcome Description',
      type: 'textarea',
      bilingual: true,
      description: 'Supporting paragraph beneath the Welcome section heading.',
      defaultValueEn: t.en.welcome.desc,
      defaultValueBn: t.bn.welcome.desc,
    },
    {
      key: 'homepage_video_embed_url',
      label: 'Homepage Video',
      type: 'embed',
      bilingual: false,
      description: 'Embed URL for the video shown immediately below the Hero section, before "Slow Down. You’ve Reached the Ridge." Visitors see a poster image with a play button until they click — the video itself never loads until then. Leave blank to hide the section entirely.',
    },
    {
      key: 'final_cta_background_image',
      label: 'Final CTA Background Image',
      type: 'image',
      bilingual: false,
      description: 'Background image used for the final reservation CTA section ("Ready to Step Above the Clouds?") immediately above the footer. Appears on both the Homepage and the Stays page — it does not affect any other hero image.',
      // Must match FinalCTA.jsx's own hardcoded fallback exactly — shown
      // in the admin preview whenever no custom image has been published yet.
      defaultUrl: '/images/timeline_stargazing.webp',
    },
    { key: 'seo_title', label: 'SEO Meta Title', type: 'text', bilingual: false },
    { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', bilingual: false },
    { key: 'seo_og_image', label: 'SEO Share Image URL', type: 'text', bilingual: false },
  ],
  story: [
    { key: 'heading', label: 'Heading', type: 'text', bilingual: true },
    { key: 'description', label: 'Description', type: 'textarea', bilingual: true },
    { key: 'seo_title', label: 'SEO Meta Title', type: 'text', bilingual: false },
    { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', bilingual: false },
  ],
  experiences: [
    { key: 'heading', label: 'Heading', type: 'text', bilingual: true },
    { key: 'description', label: 'Description', type: 'textarea', bilingual: true },
    { key: 'seo_title', label: 'SEO Meta Title', type: 'text', bilingual: false },
    { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', bilingual: false },
  ],
  policies: [
    { key: 'checkin', label: 'Check-in Policy', type: 'textarea', bilingual: true },
    { key: 'checkout', label: 'Check-out Policy', type: 'textarea', bilingual: true },
    { key: 'cancellation', label: 'Cancellation Policy', type: 'textarea', bilingual: true },
    { key: 'house_rules', label: 'House Rules', type: 'textarea', bilingual: true },
  ],
  contact: [
    { key: 'seo_title', label: 'SEO Meta Title', type: 'text', bilingual: false },
    { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', bilingual: false },
  ],
  stays: [
    {
      key: 'whatsapp_room_reservation_message',
      label: 'Room Reservation WhatsApp Message',
      type: 'whatsapp-template',
      bilingual: false,
      description: 'Sent when a visitor taps "Reserve This Suite" on a room card. Available variable: {{room_name}} — use it to automatically insert the selected room name (wrap it in *asterisks* for WhatsApp bold, e.g. *{{room_name}}*). Leave blank to use the default message below.',
      defaultValue: DEFAULT_ROOM_RESERVATION_TEMPLATE,
    },
    { key: 'seo_title', label: 'SEO Meta Title', type: 'text', bilingual: false },
    { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', bilingual: false },
  ],
};
