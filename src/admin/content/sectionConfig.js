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
    { key: 'seo_title', label: 'SEO Meta Title', type: 'text', bilingual: false },
    { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', bilingual: false },
  ],
};
