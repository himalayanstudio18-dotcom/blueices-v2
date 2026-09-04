import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { formatPromotionDiscount } from './promotionMessage';

const PUBLIC_COLUMNS = `
  id, eyebrow_en, eyebrow_bn, headline_en, headline_bn,
  description_en, description_bn, location_en, location_bn,
  discount_type, discount_value, special_price, discount_custom_text,
  offer_condition_en, offer_condition_bn, min_count, benefits,
  cta_en, cta_bn, start_date, end_date,
  show_on_homepage, show_on_stays, show_as_popup, is_featured,
  image_storage_path, whatsapp_template
`;

function publicUrl(path) {
  if (!path) return null;
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

/* Resolves a raw promotions row (RLS already guarantees is_published
   and inside its date window — see migration 0021) into the shape
   public components render, in the visitor's current language. */
export function mapPromotionRow(row, lang) {
  const bn = lang === 'bn';
  return {
    id: row.id,
    eyebrow: (bn && row.eyebrow_bn) || row.eyebrow_en || '',
    headline: (bn && row.headline_bn) || row.headline_en || '',
    description: (bn && row.description_bn) || row.description_en || '',
    location: (bn && row.location_bn) || row.location_en || '',
    discountLabel: formatPromotionDiscount(row),
    /* A campaign can pair a percentage/flat headline discount with a
       supplementary "resulting price" detail (e.g. "15% FLAT OFF ·
       ₹950 / Person"). Skipped when discount_type is already
       'special_price' — formatPromotionDiscount() shows that same
       number in discountLabel, so this would just repeat it. */
    priceLabel: (row.special_price && row.discount_type !== 'special_price') ? `₹${row.special_price} / Person` : '',
    conditionText: (bn && row.offer_condition_bn) || row.offer_condition_en || '',
    minCount: row.min_count,
    benefits: Array.isArray(row.benefits)
      ? row.benefits.map((b) => (bn && b.bn) || b.en || '').filter(Boolean)
      : [],
    ctaLabel: (bn && row.cta_bn) || row.cta_en || '',
    imageUrl: publicUrl(row.image_storage_path),
    whatsappTemplate: row.whatsapp_template,
    showAsPopup: row.show_as_popup,
    startDate: row.start_date,
    endDate: row.end_date,
    raw: row,
  };
}

/* One active/published campaign for a given placement flag
   ('show_on_homepage' | 'show_on_stays' | 'show_as_popup'). When more
   than one campaign has that placement enabled (shouldn't normally
   happen for the homepage, since only one can be Featured — see
   promotionsApi.setFeaturedPromotion), the featured one wins, then
   the most recently created; this keeps "only one competing
   promotion shown at a time" true for every placement, not just the
   homepage. Returns { promotion: null, loading: true } while
   fetching, { promotion: null, loading: false } when nothing
   qualifies — callers render nothing in that case. */
function usePlacementPromotion(placementColumn, lang) {
  const [state, setState] = useState({ promotion: null, loading: true });

  useEffect(() => {
    let active = true;
    supabase
      .from('promotions')
      .select(PUBLIC_COLUMNS)
      .eq(placementColumn, true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data || data.length === 0) {
          setState({ promotion: null, loading: false });
          return;
        }
        setState({ promotion: mapPromotionRow(data[0], lang), loading: false });
      });
    return () => { active = false; };
  }, [placementColumn, lang]);

  return state;
}

export function useFeaturedHomePromotion(lang) {
  return usePlacementPromotion('show_on_homepage', lang);
}

export function useStaysPromotion(lang) {
  return usePlacementPromotion('show_on_stays', lang);
}

export function usePopupPromotion(lang) {
  return usePlacementPromotion('show_as_popup', lang);
}
