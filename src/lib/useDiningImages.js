import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const DINING_COLUMNS = 'id, storage_path, caption_en, caption_bn, alt_text_en, alt_text_bn, category, sort_order';

function publicUrl(path) {
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

function mapRow(r, bn) {
  return {
    id: `dining-${r.id}`,
    src: publicUrl(r.storage_path),
    alt: (bn && r.alt_text_bn) || r.alt_text_en || (bn && r.caption_bn) || r.caption_en || '',
    caption: (bn && r.caption_bn) || r.caption_en || '',
    category: r.category,
    sortOrder: r.sort_order,
  };
}

/* Homepage teaser — fetches only featured, published Dining photos
   (server-side, capped by `limit`) so the homepage never downloads
   the full Dining library. Mirrors useGalleryImages.js but with the
   `section = 'dining'` filter that keeps this dataset out of the
   Story page's gallery entirely. */
export function useFeaturedDiningImages(lang, limit = 6) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('gallery_images')
      .select(DINING_COLUMNS)
      .eq('section', 'dining')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('sort_order')
      .limit(limit)
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) { setError(err); return; }
        setRows(data);
      });
    return () => { active = false; };
  }, [limit]);

  const bn = lang === 'bn';
  const photos = rows?.map((r) => mapRow(r, bn));
  return { photos, loading: rows === null && !error, error };
}

/* Dedicated /dining page — the full published Dining collection,
   for client-side category filtering. */
export function useDiningImages(lang) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('gallery_images')
      .select(DINING_COLUMNS)
      .eq('section', 'dining')
      .eq('is_published', true)
      .order('sort_order')
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) { setError(err); return; }
        setRows(data);
      });
    return () => { active = false; };
  }, []);

  const bn = lang === 'bn';
  const photos = rows?.map((r) => mapRow(r, bn));
  return { photos, loading: rows === null && !error, error };
}
