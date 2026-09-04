/* WhatsApp messaging for Promotions — same {{variable}} substitution
   convention as phone.js's buildRoomReservationMessage(), reusing the
   shared normalizeWhatsAppNumber()/buildWhatsAppUrl() helpers from
   there rather than duplicating them. */
import { buildWhatsAppUrl } from './phone';

export const DEFAULT_PROMOTION_WHATSAPP_TEMPLATE =
  'Hello BlueIce,\n\nI am interested in the {{offer_name}}.\n\nI would like to know more about this offer\nand availability.\n\nThank you.';

/* Human-readable discount label for a campaign, used both in the
   WhatsApp {{discount}} variable and in the public UI (homepage
   section / Stays reminder / popup) — one formatting rule, one place. */
export function formatPromotionDiscount(promo) {
  if (!promo) return '';
  switch (promo.discount_type) {
    case 'percentage':
      return promo.discount_value ? `${promo.discount_value}% OFF` : '';
    case 'flat':
      return promo.discount_value ? `₹${promo.discount_value} OFF` : '';
    case 'special_price':
      return promo.special_price ? `₹${promo.special_price}` : '';
    case 'custom':
    default:
      return promo.discount_custom_text || '';
  }
}

function formatPromotionPrice(promo) {
  return promo.special_price ? `₹${promo.special_price}` : '';
}

/* {{variable}} is replaced verbatim, whatever surrounds it (WhatsApp
   *bold* asterisks or not) is left exactly as written. Missing values
   resolve to '' rather than leaving the literal placeholder behind. */
export function buildPromotionMessage(promo, lang, template) {
  const tpl = template && template.trim() ? template : DEFAULT_PROMOTION_WHATSAPP_TEMPLATE;
  const offerName = (lang === 'bn' && promo.headline_bn) || promo.headline_en || promo.internal_name || 'this offer';
  const condition = (lang === 'bn' && promo.offer_condition_bn) || promo.offer_condition_en || '';
  const vars = {
    offer_name: offerName,
    discount: formatPromotionDiscount(promo),
    price: formatPromotionPrice(promo),
    condition,
  };
  return tpl.replace(/\{\{\s*(offer_name|discount|price|condition)\s*\}\}/g, (_, key) => vars[key] ?? '');
}

/* `promo` here is the raw DB row shape (or a merged live+draft row
   from the admin preview) — buildPromotionMessage() reads the
   language-suffixed columns directly, same as mapPromotionRow. */
export function buildPromotionWhatsAppUrl(promo, lang, whatsappNumber) {
  const message = buildPromotionMessage(promo, lang, promo.whatsapp_template);
  return buildWhatsAppUrl(whatsappNumber, message);
}
