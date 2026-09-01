import { supabase } from '../../lib/supabaseClient';

const IMAGE_COLUMNS = `
  id, storage_path, caption_en, caption_bn, alt_text_en, alt_text_bn,
  category, section, sort_order, is_published, is_featured, draft_data, created_at
`;

export function galleryImagePublicUrl(storagePath) {
  return supabase.storage.from('gallery').getPublicUrl(storagePath).data.publicUrl;
}

export async function listGalleryImages() {
  const { data, error } = await supabase
    .from('gallery_images')
    .select(IMAGE_COLUMNS)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function uploadGalleryImages(files, section = 'gallery') {
  const defaultCategory = section === 'dining' ? 'breakfast' : 'exterior';
  for (const file of files) {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file);
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase
      .from('gallery_images')
      .insert({ storage_path: path, category: defaultCategory, section, sort_order: 999 });
    if (insertError) throw insertError;
  }
}

export async function updateGalleryImage(id, fields) {
  const { error } = await supabase.from('gallery_images').update(fields).eq('id', id);
  if (error) throw error;
}

/* Caption/alt-text/category edits go here — draft_data only, so an
   already-published photo's live caption doesn't change until the
   draft is published. Publish/unpublish/feature stay instant (same
   as Rooms) since those are already deliberate, single-click,
   toast-confirmed actions rather than in-progress content edits. */
export async function saveImageDraft(id, fields) {
  const { error } = await supabase.from('gallery_images').update({ draft_data: fields }).eq('id', id);
  if (error) throw error;
}

export async function publishImageDraft(id, draftData) {
  const { error } = await supabase
    .from('gallery_images')
    .update({ ...draftData, draft_data: null })
    .eq('id', id);
  if (error) throw error;
}

export async function revertImageDraft(id) {
  const { error } = await supabase.from('gallery_images').update({ draft_data: null }).eq('id', id);
  if (error) throw error;
}

export async function deleteGalleryImage(id, storagePath) {
  await supabase.storage.from('gallery').remove([storagePath]);
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) throw error;
}

export async function setGalleryOrder(images) {
  await Promise.all(
    images.map((img, i) =>
      supabase.from('gallery_images').update({ sort_order: i }).eq('id', img.id)
    )
  );
}
