import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import heroImage from '../../hero section image/CONTACT PAGE HERO.png';

export default function ContactHero() {
  const { lang } = useLanguage();
  const tx = t[lang].contactPage;

  return (
    <section className="contact-hero" aria-label="Get in Touch">
      <div className="contact-hero-inner">
        <div className="contact-hero-copy">
          <p className="eyebrow-warm contact-hero-eyebrow">{tx.eyebrow}</p>
          <h1 className="contact-hero-heading">
            {tx.heroLine1}<br/>
            <em>{tx.heroLine2}</em>
          </h1>
          <p className="contact-hero-body">{tx.heroBody}</p>
        </div>

        <div className="contact-hero-art">
          <div className="contact-hero-frame">
            <img
              src={heroImage}
              alt="A stone mountain lodge glowing with warm lantern light at dusk, with a lantern-lit terrace overlooking misty hills"
              className="contact-hero-img"
              loading="eager"
              fetchPriority="high"
            />
            <div className="contact-hero-frame-sheen" aria-hidden="true"></div>
          </div>

          {/* Desktop-only atmosphere — reuses the homepage hero's own
              drifting mist layers rather than a new implementation. */}
          <div className="contact-hero-mist-wrap" aria-hidden="true">
            <div className="hero-mist hero-mist-1"></div>
            <div className="hero-mist hero-mist-2"></div>
          </div>
        </div>

        {/* Desktop-only seam into the next section. */}
        <div className="contact-hero-bottom-fade" aria-hidden="true"></div>
      </div>
    </section>
  );
}
