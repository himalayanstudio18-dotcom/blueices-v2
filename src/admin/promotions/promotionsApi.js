import { supabase } from '../../lib/supabaseClient';

const PROMOTION_COLUMNS = `
  id, internal_name,
  eyebrow_en, eyebrow_bn, headline_en, headline_bn,
  description_en, description_bn, location_en, location_bn,
  discount_type, discount_value, special_price, discount_custom_text,
  offer_condition_en, offer_condition_bn, min_count, benefits,
  cta_en, cta_bn, start_date, end_date,
  show_on_homepage, show_on_stays, show_as_popup, is_featured,
  image_storage_path, whatsapp_template, is_published, draft_data,
  created_at, updated_at
`;

export function promotionImagePublicUrl(storagePath) {
  if (!storagePath) return null;
  return supabase.storage.from('gallery').getPublicUrl(storagePath).data.publicUrl;
}

/* Derives the admin-facing lifecycle bucket from is_published +
   start_date/end_date — mirrors the RLS policy's own window check
   (migration 0021) so the admin list groups campaigns exactly the
   way the public site will treat them. Computed, never stored. */
export function promotionStatus(promo) {
  if (!promo.is_published) return 'draft';
  const today = new Date().toISOString().slice(0, 10);
  if (promo.start_date && promo.start_date > today) return 'scheduled';
  if (promo.end_date && promo.end_date < today) return 'expired';
  return 'active';
}

export async function listPromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select(PROMOTION_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPromotion(id) {
  const { data, error } = await supabase
    .from('promotions')
    .select(PROMOTION_COLUMNS)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPromotion(fields) {
  const { data, error } = await supabase
    .from('promotions')
    .insert({ ...fields, is_published: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePromotion(id, fields) {
  const { error } = await supabase
    .from('promotions')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deletePromotion(id, imageStoragePath) {
  if (imageStoragePath) await supabase.storage.from('gallery').remove([imageStoragePath]);
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) throw error;
}

/* Draft / Preview / Publish — same pattern as rooms/gallery/settings:
   saveDraft() only ever touches draft_data, so a currently-published
   campaign's public rendering is unaffected until publishPromotion()
   runs. A brand-new campaign (never published) has no live version to
   protect, so its edits are written straight to the live columns via
   updatePromotion() instead — publishPromotion() is what first flips
   is_published to true for it. */
export async function savePromotionDraft(id, fields) {
  const { error } = await supabase.from('promotions').update({ draft_data: fields }).eq('id', id);
  if (error) throw error;
}

/* One entry point for both "first publish" (is_published: false -> true,
   no draft_data yet) and "publish pending edits" (draft_data -> live
   columns) — the merge is a no-op when draft_data is null. Only one
   promotion may be the featured homepage campaign at a time, enforced
   here at the application layer (no DB constraint), same technique as
   roomsApi's setRoomImageCover(): whenever a publish results in
   is_featured = true, every other row is cleared in the same call. */
export async function publishPromotion(id) {
  const promo = await getPromotion(id);
  const merged = { ...promo, ...(promo.draft_data ?? {}) };
  const payload = { ...(promo.draft_data ?? {}), draft_data: null, is_published: true, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('promotions').update(payload).eq('id', id);
  if (error) throw error;
  if (merged.is_featured) {
    const { error: clearError } = await supabase.from('promotions').update({ is_featured: false }).neq('id', id);
    if (clearError) throw clearError;
  }
}

export async function unpublishPromotion(id) {
  const { error } = await supabase.from('promotions').update({ is_published: false }).eq('id', id);
  if (error) throw error;
}

export async function revertPromotionDraft(id) {
  const { error } = await supabase.from('promotions').update({ draft_data: null }).eq('id', id);
  if (error) throw error;
}

/* Copies a campaign's fields (not its image — the duplicate starts
   with no creative, so two campaigns never share one storage object)
   as a new, unpublished draft. */
export async function duplicatePromotion(id) {
  const source = await getPromotion(id);
  const {
    id: _id, created_at: _createdAt, updated_at: _updatedAt, draft_data: _draftData,
    image_storage_path: _image, ...fields
  } = source;
  const { data, error } = await supabase
    .from('promotions')
    .insert({
      ...fields,
      internal_name: `${fields.internal_name} (Copy)`,
      is_published: false,
      is_featured: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadPromotionImage(promotionId, file) {
  const path = `promotions/${promotionId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file);
  if (uploadError) throw uploadError;
  return path;
}

export async function deletePromotionImage(storagePath) {
  if (!storagePath) return;
  await supabase.storage.from('gallery').remove([storagePath]);
}
