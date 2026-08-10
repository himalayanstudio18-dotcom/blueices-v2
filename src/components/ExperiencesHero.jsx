import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import heroImage from '../../hero section image/experience page hero image.png';
import { useSiteContent } from '../lib/useSiteContent';

export default function ExperiencesHero() {
  const { lang } = useLanguage();
  const tx = t[lang].expPage;
  const { get } = useSiteContent('experiences', lang);
  const heading = get('heading', null);
  const body = get('description', tx.heroBody);

  return (
    <section className="experiences-hero" aria-label="Lakhey Lachen Experiences">
      <div className="experiences-hero-inner">
        <div className="experiences-hero-copy">
          <p className="eyebrow-warm experiences-hero-eyebrow">{tx.eyebrow}</p>
          {heading ? (
            <h1 className="experiences-hero-heading">{heading}</h1>
          ) : (
            <h1 className="experiences-hero-heading">
              {tx.heroLine1}<br/>
              <em>{tx.heroLine2}</em>
            </h1>
          )}
          <p className="experiences-hero-body">{body}</p>
          <div className="experiences-hero-actions">
            <a href="#moments" className="btn-warm">{tx.heroCta1}</a>
            <Link to="/contact" className="btn-outline-warm">{tx.heroCta2}</Link>
          </div>
        </div>

        <div className="experiences-hero-art">
          <div className="experiences-hero-frame">
            <img
              src={heroImage}
              alt="Sunrise light over misty terraced tea gardens with the Kanchenjunga range on the horizon"
              className="experiences-hero-img"
              loading="eager"
              fetchPriority="high"
            />
            <div className="experiences-hero-frame-sheen" aria-hidden="true"></div>
          </div>

          {/* Desktop-only atmosphere — reuses the homepage hero's own
              drifting mist layers (.hero-mist-1/2) rather than a new
              implementation; the wrapper keeps them off below 1025px. */}
          <div className="experiences-hero-mist-wrap" aria-hidden="true">
            <div className="hero-mist hero-mist-1"></div>
            <div className="hero-mist hero-mist-2"></div>
          </div>
        </div>

        {/* Desktop-only seam into the next section — display:none below
            1025px, where the framed-card composition needs no fade. */}
        <div className="experiences-hero-bottom-fade" aria-hidden="true"></div>
      </div>
    </section>
  );
}
