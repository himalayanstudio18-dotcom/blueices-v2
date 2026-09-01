import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { useSiteContent } from '../lib/useSiteContent';
import { useSettings } from '../lib/useSettings';
import { normalizeWhatsAppNumber } from '../lib/phone';
import { usePreloadImage } from '../lib/usePreloadImage';

export default function Hero() {
  const { lang } = useLanguage();
  const tx = t[lang].hero;
  const contact = t[lang].contactPage;
  const finalCta = t[lang].finalCta;
  const { get } = useSiteContent('home', lang);
  const settings = useSettings();
  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');
  const phone = settings?.phone || '+919804974595';

  const DEFAULT_HERO_IMAGE = '/images/hero_himalayan_sunrise.webp';
  const heroImage = get('hero_image', DEFAULT_HERO_IMAGE);
  /* index.html already preloads DEFAULT_HERO_IMAGE synchronously,
     before this component (or even the JS bundle) exists — see its
     inline <script>. Re-preloading that same URL here would just
     start a second, redundant fetch. This hook only needs to fire
     when an admin has actually overridden the hero image in the CMS,
     since that URL can't be known until useSiteContent's Supabase
     fetch resolves. */
  usePreloadImage(heroImage === DEFAULT_HERO_IMAGE ? null : heroImage, { media: '(min-width: 1025px)' });
  const heroHeading = get('hero_heading', null);
  const heroSub = get('hero_subtitle', tx.sub);
  const ctaText = get('hero_cta_text', tx.cta1);
  const ctaLink = get('hero_cta_link', null);

  return (
    <section id="hero" className="hero" aria-label="Lakhey Lachen Homestay">
      {/* Same photo the desktop hero uses (previously only applied
          there via a CSS !important override beating this inline
          style) — mobile/tablet now render identical imagery. */}
      <div className="hero-bg" style={{ backgroundImage: `url('${heroImage}')` }}></div>
      {/* Tonal grade: unifies daylight photography with the dark amber palette */}
      <div className="hero-grade" aria-hidden="true"></div>
      <div className="hero-overlay"></div>
      <div className="hero-sun-glow" aria-hidden="true"></div>
      <div className="hero-mist hero-mist-1" aria-hidden="true"></div>
      <div className="hero-mist hero-mist-2" aria-hidden="true"></div>

      <div className="hero-content">
        <p className="hero-location">{tx.location}</p>
        {heroHeading ? (
          <h1 className="hero-headline">{heroHeading}</h1>
        ) : tx.line3 ? (
          /* Bengali-only 3-line variant (see translations/index.js
             bn.hero.line3) — English never sets line3, so its 2-line
             render below is unaffected. */
          <h1 className="hero-headline">
            {tx.line1}<br/>
            {tx.line2}<br/>
            <em>{tx.line3}</em>
          </h1>
        ) : (
          <h1 className="hero-headline">
            {tx.line1}<br/>
            <em>{tx.line2}</em>
          </h1>
        )}
        <p className="hero-sub">{heroSub}</p>
        <div className="hero-actions">
          {ctaLink ? (
            <a href={ctaLink} className="btn-warm" id="btn-plan">{ctaText}</a>
          ) : (
            <Link to="/contact" className="btn-warm" id="btn-plan">{ctaText}</Link>
          )}
          <Link to="/story" className="btn-outline-warm">{tx.cta2}</Link>
        </div>
        <div className="hero-trust">
          <span><StarIcon size={14} color="var(--amber-light)" /> {tx.trust1}</span>
          <span className="ht-sep">&middot;</span>
          <span>{tx.trust2}</span>
          <span className="ht-sep">&middot;</span>
          <span>{tx.trust3}</span>
        </div>
      </div>

      <div className="hero-mountain" aria-hidden="true">
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,260 L0,180 L120,140 L200,165 L300,100 L400,145 L500,80 L600,125 L700,70 L800,115 L900,75 L1000,120 L1100,85 L1200,130 L1300,95 L1380,125 L1440,105 L1440,260 Z" fill="rgba(10,8,5,0.9)"/>
          <path d="M0,260 L0,220 L160,200 L320,218 L480,195 L640,215 L800,198 L960,218 L1120,202 L1280,220 L1440,208 L1440,260 Z" fill="rgba(6,5,3,1)"/>
        </svg>
      </div>

      {/* The hero's own end marker — fades into whatever section
          renders next and caps it with the same fine gold divider
          every other page's hero uses at this boundary (see
          StaysHero.jsx's .stays-hero-bottom-fade). Belongs to the
          hero itself so it stays correctly positioned regardless of
          which section follows (previously this line lived on
          .home-welcome-section's own top edge, which broke the
          moment a section other than Welcome — the homepage video —
          was inserted directly after Hero). */}
      <div className="hero-bottom-fade" aria-hidden="true"></div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="scroll-dot"></div>
        <span>Scroll</span>
      </div>

      {/* Desktop-only editorial rail — display:none until 1025px,
          so mobile DOM renders exactly as before. aria-hidden keeps
          it out of the a11y tree since it duplicates hero-trust. */}
      <div className="hero-rail" aria-hidden="true">
        <span className="hero-rail-line"></span>
        <span className="hero-rail-text">{tx.trust2}</span>
      </div>

      {/* Desktop-only floating reservation panel — display:none until
          1025px. The reference's booking widget, reimagined honestly
          for a single homestay: real contact channels (WhatsApp,
          phone) instead of a destination-search form with nowhere
          real to send a query. Every string below is reused from
          existing translations — nothing here is new copy. */}
      <div className="hero-reserve-card">
        <span className="hrc-badge">{finalCta.trust1}</span>
        <h2 className="hrc-title">{tx.cta1}</h2>
        <span className="hrc-rating"><StarIcon size={13} color="var(--amber-light)" /> {tx.trust1}</span>

        <div className="hrc-tags">
          <span className="hrc-tag">{tx.trust3}</span>
          <span className="hrc-tag">{tx.trust2}</span>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hello!%20I%20would%20like%20to%20check%20availability%20at%20Lakhey%20Lachen%20Homestay.`}
          target="_blank"
          rel="noopener noreferrer"
          className="hrc-cta hrc-cta-primary"
        >
          {contact.card1cta}
        </a>
        <a href={`tel:${phone}`} className="hrc-cta hrc-cta-secondary">
          {contact.card2cta}
        </a>

        <span className="hrc-foot">{finalCta.trust3}</span>
      </div>
    </section>
  );
}
