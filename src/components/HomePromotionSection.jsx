import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../lib/useSettings';
import { useFeaturedHomePromotion } from '../lib/usePromotions';
import { buildPromotionWhatsAppUrl } from '../lib/promotionMessage';
import { normalizeWhatsAppNumber } from '../lib/phone';

/* Pure/presentational — takes an already-resolved promo (see
   mapPromotionRow in usePromotions.js) so the admin Preview screen
   can render the exact same markup against a merged draft row,
   guaranteeing preview/live parity. */
export function HomePromotionSectionView({ promo, lang, whatsappNumber }) {
  const waUrl = buildPromotionWhatsAppUrl(promo.raw, lang, whatsappNumber);
  const hasMedia = !!promo.imageUrl;

  return (
    <section className="promo-section" aria-label="Current Promotion">
      <div className="section-inner">
        <div className={`promo-banner${hasMedia ? '' : ' promo-banner--no-media'}`} data-reveal="fade-up">
          {hasMedia && (
            <div className="promo-media">
              <img src={promo.imageUrl} alt="" className="promo-media-img" loading="lazy" />
              <span className="promo-media-grade" aria-hidden="true"></span>
            </div>
          )}
          <div className="promo-info">
            {promo.eyebrow && <p className="eyebrow-warm">{promo.eyebrow}</p>}
            <h2 className="section-heading">{promo.headline}</h2>
            {promo.description && <p className="promo-desc">{promo.description}</p>}

            {(promo.discountLabel || promo.conditionText || promo.priceLabel) && (
              <div className="promo-offer-row">
                {promo.discountLabel && <span className="promo-discount-pill">{promo.discountLabel}</span>}
                {[promo.conditionText, promo.priceLabel].filter(Boolean).length > 0 && (
                  <span className="promo-condition">{[promo.conditionText, promo.priceLabel].filter(Boolean).join(' · ')}</span>
                )}
              </div>
            )}

            {promo.benefits.length > 0 && (
              <ul className="promo-benefits">
                {promo.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}

            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-warm promo-cta">
              {promo.ctaLabel || 'Plan Your Ride'} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Renders nothing at all when there is no active, published, featured
   campaign with "Show on Homepage" enabled — same "absent until
   configured" rule already used by HomeVideoTeaser/HomeDiningTeaser,
   so an expired or not-yet-scheduled campaign leaves zero empty
   section behind. */
export default function HomePromotionSection() {
  const { lang } = useLanguage();
  const settings = useSettings();
  const { promotion, loading } = useFeaturedHomePromotion(lang);

  if (loading || !promotion) return null;

  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');
  return <HomePromotionSectionView promo={promotion} lang={lang} whatsappNumber={whatsappNumber} />;
}
