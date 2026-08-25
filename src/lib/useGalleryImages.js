import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function publicUrl(path) {
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

/* Fetches published gallery photos from Supabase, ordered for the
   Story page's fan carousel. Returns `null` while loading (so callers
   can fall back to curated static photos rather than flash an empty
   carousel), then an array — possibly empty if no admin uploads yet. */
export function useGalleryImages(lang) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('gallery_images')
      .select('id, storage_path, caption_en, caption_bn, alt_text_en, alt_text_bn, sort_order')
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
  const photos = rows?.map((r) => ({
    id: `db-${r.id}`,
    src: publicUrl(r.storage_path),
    alt: (bn && r.alt_text_bn) || r.alt_text_en || (bn && r.caption_bn) || r.caption_en || '',
    caption: (bn && r.caption_bn) || r.caption_en || '',
    sortOrder: r.sort_order,
  }));

  return { photos, loading: rows === null && !error, error };
}
