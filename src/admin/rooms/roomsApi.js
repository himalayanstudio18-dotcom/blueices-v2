import { supabase } from '../../lib/supabaseClient';

const ROOM_COLUMNS = `
  id, name_en, name_bn, slug, room_type, tag_en, tag_bn, tag_class,
  short_desc_en, short_desc_bn, desc_en, desc_bn,
  max_guests, bathrooms, bed_configuration_en, bed_configuration_bn, size_en, size_bn,
  features_en, features_bn,
  price, weekend_price, sort_order, is_published, is_featured, is_available,
  seo_title, seo_description, draft_data,
  created_at, updated_at
`;

export function roomImagePublicUrl(storagePath) {
  return supabase.storage.from('rooms').getPublicUrl(storagePath).data.publicUrl;
}

const ROOM_IMAGE_COLUMNS = 'id, storage_path, sort_order, is_cover, is_draft';

export async function listRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select(`${ROOM_COLUMNS}, room_images (${ROOM_IMAGE_COLUMNS})`)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function getRoom(id) {
  const { data, error } = await supabase
    .from('rooms')
    .select(`${ROOM_COLUMNS}, room_images (${ROOM_IMAGE_COLUMNS})`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/* Appends -2, -3, ... to baseSlug until it no longer collides with
   another room's slug. excludeId lets an existing room keep its own
   slug when re-saved without that counting as a collision against
   itself. */
export async function getUniqueSlug(baseSlug, excludeId) {
  if (!baseSlug) return baseSlug;
  let candidate = baseSlug;
  let attempt = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from('rooms').select('id').eq('slug', candidate);
    if (excludeId) query = query.neq('id', excludeId);
    const { data, error } = await query.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return candidate;
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
}

export async function createRoom(fields) {
  const slug = await getUniqueSlug(fields.slug, null);
  const { data, error } = await supabase.from('rooms').insert({ ...fields, slug }).select().single();
  if (error) throw error;
  return data;
}

export async function updateRoom(id, fields) {
  const payload = { ...fields, updated_at: new Date().toISOString() };
  if (fields.slug) payload.slug = await getUniqueSlug(fields.slug, id);
  const { error } = await supabase
    .from('rooms')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteRoom(id) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
}

/* Draft / Preview / Publish — `fields` is saved as-is into draft_data
   without touching the live columns, so a currently-published room's
   public rendering is completely unaffected until publishDraft() is
   called. One pending draft per room; saving again overwrites it. */
export async function saveRoomDraft(id, fields) {
  const { error } = await supabase.from('rooms').update({ draft_data: fields }).eq('id', id);
  if (error) throw error;
}

export async function publishRoomDraft(id) {
  const room = await getRoom(id);

  /* Publishing also releases any photos uploaded since the last
     publish — they're pending (is_draft) the same way field edits
     are, so a photo added to an already-live room doesn't appear
     publicly until this runs. */
  const pendingImageIds = (room.room_images ?? []).filter((img) => img.is_draft).map((img) => img.id);
  if (pendingImageIds.length > 0) {
    const { error: imgError } = await supabase.from('room_images').update({ is_draft: false }).in('id', pendingImageIds);
    if (imgError) throw imgError;
  }

  if (!room.draft_data) return;
  const payload = { ...room.draft_data, draft_data: null, updated_at: new Date().toISOString() };
  if (payload.slug) payload.slug = await getUniqueSlug(payload.slug, id);
  const { error } = await supabase.from('rooms').update(payload).eq('id', id);
  if (error) throw error;
}

export async function revertRoomDraft(id) {
  const { error } = await supabase.from('rooms').update({ draft_data: null }).eq('id', id);
  if (error) throw error;
}

/* Copies a room's fields (not its photos — those stay attached to the
   original, and not any pending draft) as a new draft row, sorted to
   the end of the list. */
export async function duplicateRoom(id) {
  const source = await getRoom(id);
  const { data: existing } = await supabase.from('rooms').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const nextSortOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { room_images, id: _id, created_at, updated_at, draft_data, ...fields } = source;
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      ...fields,
      name_en: `${fields.name_en} (Copy)`,
      slug: null,
      is_published: false,
      sort_order: nextSortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setRoomOrder(rooms) {
  await Promise.all(
    rooms.map((room, i) =>
      supabase.from('rooms').update({ sort_order: i }).eq('id', room.id)
    )
  );
}

/* New photos are pending (is_draft: true) until the room's draft is
   published — see publishRoomDraft(), which flips this back to
   false. Keeps a newly uploaded photo on an already-live room from
   appearing publicly before the admin has previewed/published it. */
export async function uploadRoomImage(roomId, file) {
  const path = `${roomId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('rooms').upload(path, file);
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase
    .from('room_images')
    .insert({ room_id: roomId, storage_path: path, sort_order: 999, is_draft: true });
  if (insertError) throw insertError;
}

export async function deleteRoomImage(imageId, storagePath) {
  await supabase.storage.from('rooms').remove([storagePath]);
  const { error } = await supabase.from('room_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function setRoomImageOrder(images) {
  await Promise.all(
    images.map((img, i) =>
      supabase.from('room_images').update({ sort_order: i }).eq('id', img.id)
    )
  );
}

export async function setRoomImageCover(roomId, imageId) {
  await supabase.from('room_images').update({ is_cover: false }).eq('room_id', roomId);
  const { error } = await supabase.from('room_images').update({ is_cover: true }).eq('id', imageId);
  if (error) throw error;
}
