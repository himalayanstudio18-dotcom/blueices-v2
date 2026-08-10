import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { shapeRoom } from './usePublishedRooms';

const ROOM_COLUMNS = `
  id, name_en, name_bn, room_type, tag_en, tag_bn, tag_class,
  max_guests, bed_configuration_en, bed_configuration_bn, size_en, size_bn,
  short_desc_en, short_desc_bn, desc_en, desc_bn, features_en, features_bn,
  price, weekend_price, sort_order, is_featured, is_available,
  seo_title, seo_description,
  room_images (id, storage_path, sort_order, is_cover, is_draft)
`;

/* Fetches a single published room by slug for the /rooms/:slug page.
   room stays undefined while loading, null once the fetch resolves
   with no match (unpublished, wrong slug, or deleted) — callers use
   that to tell "still loading" apart from "genuinely not found". */
export function usePublishedRoomBySlug(slug, lang) {
  const [rawRoom, setRawRoom] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setRawRoom(undefined);
    setError(null);
    supabase
      .from('rooms')
      .select(ROOM_COLUMNS)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) { setError(err); return; }
        setRawRoom(data ?? null);
      });
    return () => { active = false; };
  }, [slug]);

  const room = rawRoom ? { ...shapeRoom(rawRoom, lang), seoTitle: rawRoom.seo_title, seoDescription: rawRoom.seo_description } : null;

  return {
    room,
    loading: rawRoom === undefined && !error,
    notFound: rawRoom === null && !error,
    error,
  };
}
