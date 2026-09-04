import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../lib/useSettings';
import { usePopupPromotion } from '../lib/usePromotions';
import { buildPromotionWhatsAppUrl } from '../lib/promotionMessage';
import { normalizeWhatsAppNumber } from '../lib/phone';
import PromoLightbox from './PromoLightbox';

const POPUP_DELAY_MS = 9000; // "wait approximately 8-10 seconds"
const COOLDOWN_MS = 10 * 60 * 1000; // "default cooldown: 10 minutes"

/* Promotion-specific key so a future campaign never inherits an old
   one's dismissal — each promotion id gets its own independent
   cooldown window. Best-effort: a private-browsing tab or a blocked
   accessor just means the popup can show every visit, never a crash. */
function cooldownKey(promotionId) {
  return `blueice_promotion_popup_${promotionId}`;
}

function isCoolingDown(promotionId) {
  try {
    const until = localStorage.getItem(cooldownKey(promotionId));
    return !!until && Date.now() < Number(until);
  } catch {
    return false;
  }
}

function startCooldown(promotionId) {
  try {
    localStorage.setItem(cooldownKey(promotionId), String(Date.now() + COOLDOWN_MS));
  } catch {
    /* storage unavailable — the popup will simply be able to show again next visit */
  }
}

/* Presentational — reused by the admin Preview screen so "Show as
   Popup" can be previewed pixel-for-pixel against a merged draft row,
   including both the image-forward and text-only fallback layouts. */
export function PromotionPopupView({ promo, lang, whatsappNumber, onClose }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return;
      if (lightboxOpen) setLightboxOpen(false);
      else onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, lightboxOpen]);

  const waUrl = buildPromotionWhatsAppUrl(promo.raw, lang, whatsappNumber);
  const hasMedia = !!promo.imageUrl;
  const summary = [promo.discountLabel, promo.conditionText, promo.priceLabel].filter(Boolean).join(' · ');
  const imageAlt = promo.headline ? `${promo.headline} — promotion image` : 'Promotion image';

  return (
    <div className="promo-popup-backdrop" role="dialog" aria-modal="true" aria-label="Current promotion" onClick={onClose}>
      <div className={`promo-popup${hasMedia ? '' : ' promo-popup--text-only'}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="promo-popup-close" aria-label="Close" onClick={onClose}>✕</button>

        {hasMedia ? (
          <>
            <button
              type="button"
              className="promo-popup-media promo-popup-media-trigger"
              aria-label={`View larger image${promo.headline ? `: ${promo.headline}` : ''}`}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            >
              <img src={promo.imageUrl} alt={imageAlt} className="promo-popup-media-img" />
              <span className="promo-popup-media-grade" aria-hidden="true"></span>
              <div className="promo-popup-media-overlay">
                {promo.eyebrow && <p className="eyebrow-gold">{promo.eyebrow}</p>}
                <h3 className="promo-popup-heading">{promo.headline}</h3>
                {promo.discountLabel && <span className="promo-discount-pill">{promo.discountLabel}</span>}
              </div>
            </button>
            <div className="promo-popup-footer">
              {summary && <p className="promo-popup-summary">{summary}</p>}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-warm promo-popup-cta">
                {promo.ctaLabel || 'Plan Your Ride'} →
              </a>
            </div>
          </>
        ) : (
          <div className="promo-popup-textbody">
            {promo.eyebrow && <p className="eyebrow-gold">{promo.eyebrow}</p>}
            <h3 className="promo-popup-heading">{promo.headline}</h3>
            {promo.description && <p className="promo-popup-summary">{promo.description}</p>}
            {(promo.discountLabel || promo.conditionText || promo.priceLabel) && (
              <div className="promo-offer-row promo-popup-offer-row">
                {promo.discountLabel && <span className="promo-discount-pill">{promo.discountLabel}</span>}
                {[promo.conditionText, promo.priceLabel].filter(Boolean).length > 0 && (
                  <span className="promo-condition">{[promo.conditionText, promo.priceLabel].filter(Boolean).join(' · ')}</span>
                )}
              </div>
            )}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-warm promo-popup-cta">
              {promo.ctaLabel || 'Plan Your Ride'} →
            </a>
          </div>
        )}
      </div>

      {hasMedia && lightboxOpen && (
        <PromoLightbox imageUrl={promo.imageUrl} alt={imageAlt} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

/* Homepage-only smart campaign popup — waits 8-10s after the
   homepage mounts, then shows the single active/published campaign
   with "Show as Popup" enabled (if any). Dismissing it starts a
   10-minute, promotion-specific cooldown; visiting other pages during
   that window never reopens it, and returning to the homepage after
   the cooldown expires may show it again. Mounted once at the App
   shell level (not inside HomePage) so route changes reliably reset
   the "just entered the homepage" timer via the pathname effect
   below, exactly as the spec describes. */
export default function PromotionPopup() {
  const location = useLocation();
  const { lang } = useLanguage();
  const settings = useSettings();
  const { promotion, loading } = usePopupPromotion(lang);
  const [visible, setVisible] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => { setVisible(false); }, [location.pathname]);

  useEffect(() => {
    if (!isHome || loading || !promotion || !promotion.showAsPopup) return;
    if (isCoolingDown(promotion.id)) return;
    const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isHome, loading, promotion]);

  if (!isHome || !visible || !promotion) return null;

  function handleClose() {
    startCooldown(promotion.id);
    setVisible(false);
  }

  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');
  return <PromotionPopupView promo={promotion} lang={lang} whatsappNumber={whatsappNumber} onClose={handleClose} />;
}
