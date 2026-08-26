import { supabase } from '../../lib/supabaseClient';

const COLUMNS = 'section_key, value_en, value_bn, draft_value_en, draft_value_bn';

/* Reuses the existing 'gallery' Storage bucket (already public-read,
   already RLS-gated to owner/manager/editor for writes — see
   supabase/migrations/0007_staff_roles_rls.sql) under its own
   site-content/<sectionKey>/ prefix, so these images never appear in
   the Gallery admin's photo grid (that grid is driven by rows in
   gallery_images, which this never inserts into — it only stores a
   plain public URL string, same as the existing hero_image text
   field). No new bucket, no new RLS. */
export async function uploadSiteContentImage(file, sectionKey) {
  const path = `site-content/${sectionKey}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file);
  if (uploadError) throw uploadError;
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

export async function listSiteContent(page) {
  const { data, error } = await supabase
    .from('site_content')
    .select(COLUMNS)
    .eq('page', page);
  if (error) throw error;
  const map = {};
  for (const row of data) map[row.section_key] = row;
  return map;
}

/* Writes only to the draft_* columns — never touches value_en/bn, so
   the public site (which only ever reads value_en/bn) is completely
   unaffected until publishSection() runs. */
export async function saveDraftContent(page, sectionKey, fields) {
  const { error } = await supabase
    .from('site_content')
    .upsert(
      { page, section_key: sectionKey, draft_value_en: fields.value_en, draft_value_bn: fields.value_bn },
      { onConflict: 'page,section_key' }
    );
  if (error) throw error;
}

export async function publishSection(page, sectionKey) {
  const { data, error: fetchError } = await supabase
    .from('site_content')
    .select('draft_value_en, draft_value_bn')
    .eq('page', page).eq('section_key', sectionKey)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!data || (data.draft_value_en === null && data.draft_value_bn === null)) return;

  const { error } = await supabase
    .from('site_content')
    .update({
      value_en: data.draft_value_en,
      value_bn: data.draft_value_bn,
      draft_value_en: null,
      draft_value_bn: null,
      updated_at: new Date().toISOString(),
    })
    .eq('page', page).eq('section_key', sectionKey);
  if (error) throw error;
}

export async function revertSection(page, sectionKey) {
  const { error } = await supabase
    .from('site_content')
    .update({ draft_value_en: null, draft_value_bn: null })
    .eq('page', page).eq('section_key', sectionKey);
  if (error) throw error;
}

/* Publishes every section on a page that has a pending draft, in one
   action — used by the page-level "Publish Changes" button so the
   admin doesn't have to publish each field individually. */
export async function publishAllDrafts(page, sectionKeys) {
  for (const key of sectionKeys) await publishSection(page, key);
}

export async function revertAllDrafts(page, sectionKeys) {
  for (const key of sectionKeys) await revertSection(page, key);
}
