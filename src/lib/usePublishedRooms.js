import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const PLACEHOLDER = 'https://placehold.co/800x600?text=Photo+Coming+Soon';

function publicUrl(path) {
  return supabase.storage.from('rooms').getPublicUrl(path).data.publicUrl;
}

const GUEST_WORD = { en: 'Guest', bn: 'অতিথি' };

function capacityLine(r, bn) {
  const bedConfig = (bn && r.bed_configuration_bn) || r.bed_configuration_en;
  if (!r.max_guests && !bedConfig) return '';
  const guestPart = r.max_guests
    ? `${r.max_guests} ${GUEST_WORD[bn ? 'bn' : 'en']}${!bn && r.max_guests > 1 ? 's' : ''}`
    : '';
  return [guestPart, bedConfig].filter(Boolean).join(' · ');
}

/* Exported so the admin Draft Preview can shape a room the exact
   same way the public site does — same function, same output shape,
   just fed draft-merged data instead of a live Supabase query.
   includeDraftImages: the public site never sees pending (unpublished)
   photos; the admin Preview screen passes true so it can show exactly
   what publishing will reveal, drafts included. */
export function shapeRoom(r, lang, { includeDraftImages = false } = {}) {
  const images = [...(r.room_images ?? [])]
    .filter((i) => includeDraftImages || !i.is_draft)
    .sort((a, b) => a.sort_order - b.sort_order);
  const cover = images.find((i) => i.is_cover) ?? images[0];
  const gallery = images.length ? images.map((i) => publicUrl(i.storage_path)) : [PLACEHOLDER];
  const bn = lang === 'bn';
  const features = (bn ? r.features_bn : r.features_en);
  const desc = (bn && r.desc_bn) || r.desc_en;
  const shortDesc = (bn && r.short_desc_bn) || r.short_desc_en || desc;

  return {
    id: r.id,
    slug: r.slug,
    name: (bn && r.name_bn) || r.name_en,
    tag: (bn && r.tag_bn) || r.tag_en,
    tagClass: r.tag_class,
    roomType: r.room_type,
    capacity: capacityLine(r, bn),
    size: (bn && r.size_bn) || r.size_en,
    desc,
    shortDesc,
    features: features?.length ? features : r.features_en,
    price: r.price != null ? `₹${Number(r.price).toLocaleString('en-IN')}` : '',
    weekendPrice: r.weekend_price != null ? `₹${Number(r.weekend_price).toLocaleString('en-IN')}` : null,
    isFeatured: !!r.is_featured,
    isAvailable: r.is_available !== false,
    img: cover ? publicUrl(cover.storage_path) : PLACEHOLDER,
    gallery,
  };
}

/* Fetches published rooms (+ their images) from Supabase and shapes
   them into the flat, language-resolved object the room card /
   details-modal UI already expects — same field names the old
   hardcoded roomMeta + translations.rooms merge used to produce. */
export function usePublishedRooms(lang) {
  const [rawRooms, setRawRooms] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('rooms')
      .select(`
        id, slug, name_en, name_bn, room_type, tag_en, tag_bn, tag_class,
        max_guests, bed_configuration_en, bed_configuration_bn, size_en, size_bn,
        short_desc_en, short_desc_bn, desc_en, desc_bn, features_en, features_bn,
        price, weekend_price, sort_order, is_featured, is_available,
        room_images (id, storage_path, sort_order, is_cover, is_draft)
      `)
      .eq('is_published', true)
      .order('sort_order')
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) { setError(err); return; }
        setRawRooms(data);
      });
    return () => { active = false; };
  }, []);

  const rooms = rawRooms ? rawRooms.map((r) => shapeRoom(r, lang)) : null;
  return { rooms, loading: rawRooms === null && !error, error };
}
