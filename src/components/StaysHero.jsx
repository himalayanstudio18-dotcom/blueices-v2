import React from 'react';
import { Link } from 'react-router-dom';
import { ElevationIcon, HomeIcon, KitchenIcon, HeartIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import heroImage from '../../hero section image/stay page hero section.png';

const DETAIL_ICONS = [ElevationIcon, HomeIcon, KitchenIcon, HeartIcon];

export default function StaysHero() {
  const { lang } = useLanguage();
  const tx = t[lang].staysPage;

  return (
    <section className="stays-hero" aria-label="Lakhey Lachen Stays">
      <div className="stays-hero-inner">
        <div className="stays-hero-copy">
          <p className="eyebrow-warm stays-hero-eyebrow">{tx.eyebrow}</p>
          <h1 className="stays-hero-heading">
            {tx.heroLine1}<br/>
            <em>{tx.heroLine2}</em>
          </h1>
          <p className="stays-hero-body">{tx.heroBody}</p>
          <div className="stays-hero-actions">
            <Link to="/contact" className="btn-warm">{tx.heroCta1}</Link>
            <a href="#stays" className="btn-outline-warm">{tx.heroCta2}</a>
          </div>
          <div className="stays-hero-details">
            {tx.heroDetails.map((d, i) => {
              const Icon = DETAIL_ICONS[i % DETAIL_ICONS.length];
              return (
                <span className="shd-item" key={i}>
                  <Icon size={16} color="var(--amber-light)" />
                  {d.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="stays-hero-art">
          <div className="stays-hero-frame">
            <img
              src={heroImage}
              alt="A lantern-lit cedar cabin porch overlooking the misty Kanchenjunga range at dusk"
              className="stays-hero-img"
              loading="eager"
              fetchPriority="high"
            />
            <div className="stays-hero-frame-sheen" aria-hidden="true"></div>
          </div>

          {/* Desktop-only atmosphere — reuses the homepage hero's own
              drifting mist layers (.hero-mist-1/2) rather than a new
              implementation; the wrapper keeps them off below 1025px. */}
          <div className="stays-hero-mist-wrap" aria-hidden="true">
            <div className="hero-mist hero-mist-1"></div>
            <div className="hero-mist hero-mist-2"></div>
          </div>
        </div>

        {/* Desktop-only seam into the next section — display:none below
            1025px, where the framed-card composition needs no fade. */}
        <div className="stays-hero-bottom-fade" aria-hidden="true"></div>
      </div>
    </section>
  );
}
