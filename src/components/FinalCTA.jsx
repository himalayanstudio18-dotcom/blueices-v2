import React from 'react';
import { StarIcon, ZapIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { useSiteContent } from '../lib/useSiteContent';
import { useSettings } from '../lib/useSettings';
import { normalizeWhatsAppNumber } from '../lib/phone';

/* Kept as the literal fallback so the section can never render with a
   missing/blank background — mirrors admin/content/sectionConfig.js's
   `defaultUrl` for this same field (must stay in sync with it). */
const DEFAULT_CTA_BACKGROUND = '/images/timeline_stargazing.webp';

export default function FinalCTA() {
  const { lang } = useLanguage();
  const tx = t[lang].finalCta;
  const settings = useSettings();
  /* This section renders on both the Homepage and the Stays page, but
     its background image is administered once, under the Homepage
     tab in Site Content — same page/section_key regardless of which
     public route is currently showing it, so there is exactly one
     canonical published value. */
  const { get } = useSiteContent('home', lang);
  const backgroundImage = get('final_cta_background_image', DEFAULT_CTA_BACKGROUND);
  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');
  const phone = settings?.phone || '+919804974595';

  return (
    <section id="cta" className="cta-section" aria-label="Book Your Stay">
      {/* Same stargazing plate the desktop CTA uses (previously only
          applied there via a CSS !important override beating this
          inline style) — mobile/tablet now render identical imagery. */}
      <div className="cta-bg" style={{ backgroundImage: `url('${backgroundImage}')` }}></div>
      <div className="cta-grade" aria-hidden="true"></div>
      <div className="cta-overlay"></div>

      <div className="cta-inner" data-reveal="fade-up">
        <p className="eyebrow-gold">{tx.eyebrow}</p>
        <h2 className="cta-heading">
          {tx.h2line1}<br/>
          <em>{tx.h2line2}</em>
        </h2>
        <p className="cta-sub">{tx.sub}</p>

        <div className="cta-actions">
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hello!%20I%20would%20like%20to%20reserve%20a%20stay%20at%20Lakhey%20Lachen%20Homestay.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-big"
          >
            <ZapIcon size={18} color="var(--ink)" />
            {tx.cta1}
          </a>

          <div className="cta-alt-actions">
            <a href={`tel:${phone}`} className="btn-outline-warm">
              {tx.cta2}
            </a>
          </div>
        </div>

        <div className="cta-trust">
          <span><StarIcon size={13} color="var(--amber-light)" /> {tx.trust1}</span>
          <span className="ct-dot">&middot;</span>
          <span>{tx.trust2}</span>
          <span className="ct-dot">&middot;</span>
          <span>{tx.trust3}</span>
        </div>
      </div>
    </section>
  );
}
