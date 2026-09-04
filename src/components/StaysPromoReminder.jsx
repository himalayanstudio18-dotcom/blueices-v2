import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../lib/useSettings';
import { useStaysPromotion } from '../lib/usePromotions';
import { buildPromotionWhatsAppUrl } from '../lib/promotionMessage';
import { normalizeWhatsAppNumber } from '../lib/phone';

/* Presentational — same split as HomePromotionSectionView, reused
   verbatim by the admin Preview screen. */
export function StaysPromoReminderView({ promo, lang, whatsappNumber }) {
  const waUrl = buildPromotionWhatsAppUrl(promo.raw, lang, whatsappNumber);
  const summary = [promo.discountLabel, promo.conditionText, promo.priceLabel].filter(Boolean).join(' · ');

  return (
    <section className="promo-reminder" aria-label="Special Offer">
      <div className="section-inner">
        <div className="promo-reminder-inner" data-reveal="fade-up">
          <div className="promo-reminder-text">
            {promo.eyebrow && <p className="eyebrow-warm">{promo.eyebrow}</p>}
            <p className="promo-reminder-title">{promo.headline}</p>
            {summary && <p className="promo-reminder-sub">{summary}</p>}
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-warm promo-reminder-cta">
            {promo.ctaLabel || 'Explore Offer'} →
          </a>
        </div>
      </div>
    </section>
  );
}

/* Renders nothing when no active/published campaign has "Show on
   Stays" enabled — never disturbs the room cards or booking CTAs
   around it either way. */
export default function StaysPromoReminder() {
  const { lang } = useLanguage();
  const settings = useSettings();
  const { promotion, loading } = useStaysPromotion(lang);

  if (loading || !promotion) return null;

  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');
  return <StaysPromoReminderView promo={promotion} lang={lang} whatsappNumber={whatsappNumber} />;
}
