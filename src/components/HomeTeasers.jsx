import React from 'react';
import { Link } from 'react-router-dom';
import { SunIcon, FireIcon, LeafIcon, WaterIcon, ElevationIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { photos, galleryPhotos } from '../assets/photos';

const expIcons = [
  <SunIcon key="sun" size={20} color="var(--amber-light)" />,
  <FireIcon key="fire" size={20} color="var(--amber-light)" />,
  <LeafIcon key="leaf" size={20} color="var(--amber-light)" />,
  <WaterIcon key="water" size={20} color="var(--amber-light)" />,
];

/* Experiences keep the generated artwork — these depict moments
   (bonfire, sunrise tea, waterfall) with no real photographic
   equivalent in the supplied folders.

   .webp, not .png: every file in images/ ships both, at identical
   resolution and visually identical quality, but these four total
   3.6 MB as .png against 0.8 MB as .webp. (The .png files are in
   fact JPEG data behind a .png extension, which is why they are
   so large.) */
const expImages = [
  'images/experience_sunrise_tea.webp',
  'images/experience_bonfire.webp',
  'images/experience_tea_garden.webp',
  'images/experience_waterfall.webp',
];

/* Gallery now draws from real property photography */
const galleryImages = galleryPhotos;

export function HomeWelcomeTeaser() {
  const { lang } = useLanguage();
  const tx = t[lang].welcome;

  return (
    <section className="home-welcome-section">
      <div className="section-inner" data-reveal="fade-up">
        <div className="hw-grid">
          <div className="hw-text">
            <p className="eyebrow-warm">{tx.eyebrow}</p>
            <h2 className="section-heading">
              {tx.h2line1}<br/><em>{tx.h2line2}</em>
            </h2>
            <p className="hw-desc">{tx.desc}</p>
            <Link to="/story" className="btn-warm">
              {tx.cta}
            </Link>
          </div>
          <div className="hw-image-card">
            <img src={photos.valley} alt="The valley road winding through forested hills toward Lakhey Lachen" className="hw-img" loading="lazy" />
            <span className="hw-img-grade" aria-hidden="true"></span>
            {/* Desktop-only overlapping second photograph */}
            <img
              src={photos.arrival}
              alt=""
              aria-hidden="true"
              className="hw-img-inset"
              loading="lazy"
            />
            <div className="hw-badge">
              <span className="hw-badge-icon"><ElevationIcon size={17} color="var(--amber-light)" /></span>
              <span className="hw-badge-text">
                <span>{tx.badge}</span>
                <small>{tx.badgeSub}</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeExperiencesTeaser() {
  const { lang } = useLanguage();
  const tx = t[lang].expTeaser;

  return (
    <section className="home-exp-teaser-section">
      <div className="section-inner">
        <div className="section-header" data-reveal="fade-up">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h2 className="section-heading">
            {tx.h2line1} <em>{tx.h2line2}</em>
          </h2>
          <p className="section-sub">{tx.sub}</p>
        </div>

        <div className="hexp-grid" data-reveal="fade-up">
          {tx.moments.map((m, i) => (
            <article key={i} className="hexp-card">
              <div className="hexp-img-wrap">
                <img src={expImages[i]} alt={m.title} className="hexp-img" loading="lazy" />
                <div className="hexp-overlay"></div>
                <span className="hexp-tag">{m.tag}</span>
              </div>
              <div className="hexp-body">
                <div className="hexp-meta">
                  <span className="hexp-icon">{expIcons[i]}</span>
                  <span className="hexp-num">{m.num}</span>
                </div>
                <h3 className="hexp-title">{m.title}</h3>
                <p className="hexp-desc">{m.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="section-cta-row" data-reveal="fade-up">
          <Link to="/experiences" className="btn-warm">
            {tx.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeGalleryStrip() {
  const { lang } = useLanguage();
  const tx = t[lang].galleryStrip;

  return (
    <section className="home-gallery-strip-section">
      <div className="section-inner">
        <div className="section-header" data-reveal="fade-up">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h2 className="section-heading">
            {tx.h2line1} <em>{tx.h2line2}</em>
          </h2>
          <p className="section-sub">{tx.sub}</p>
        </div>

        {/* .hgs-track is display:contents until 1025px, so on mobile
            the items stay direct children of the .hgs-grid CSS grid
            and that layout is completely unchanged. On desktop the
            track becomes a flex row and drifts continuously.

            The animation lives on the track, never on .hgs-grid:
            ScrollToTop.jsx force-writes inline `transform: none` to
            every [data-reveal] element on route change, which would
            reset a transform animated on the grid itself. */}
        <div className="hgs-grid" data-reveal="fade-up">
          <div className="hgs-track">
            {tx.photos.map((photo, i) => (
              <div
                key={i}
                className={`hgs-item hgs-${i + 1}`}
                onTouchStart={(e) => e.currentTarget.classList.add('is-touched')}
                onTouchEnd={(e) => e.currentTarget.classList.remove('is-touched')}
                onTouchCancel={(e) => e.currentTarget.classList.remove('is-touched')}
              >
                <img src={galleryImages[i]} alt={photo.caption || `Lakhey Lachen — view ${i + 1}`} className="hgs-img" loading="lazy" />
                <span className="hgs-grade" aria-hidden="true"></span>
                <div className="hgs-overlay">
                  <span className="hgs-caption">{photo.caption}</span>
                </div>
              </div>
            ))}

            {/* Second pass of the same photographs, so the track can
                loop seamlessly. Hidden from assistive tech and from
                mobile entirely — it is duplicate content, not a
                second gallery. */}
            {tx.photos.map((photo, i) => (
              <div
                key={`dup-${i}`}
                className="hgs-item hgs-dup"
                aria-hidden="true"
                onTouchStart={(e) => e.currentTarget.classList.add('is-touched')}
                onTouchEnd={(e) => e.currentTarget.classList.remove('is-touched')}
                onTouchCancel={(e) => e.currentTarget.classList.remove('is-touched')}
              >
                <img src={galleryImages[i]} alt="" className="hgs-img" loading="lazy" />
                <span className="hgs-grade" aria-hidden="true"></span>
                <div className="hgs-overlay">
                  <span className="hgs-caption">{photo.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-cta-row" data-reveal="fade-up">
          <Link to="/story" className="btn-outline-warm">
            {tx.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeWhyTeaser() {
  const { lang } = useLanguage();
  const tx = t[lang].whyTeaser;

  return (
    <section className="home-why-teaser-section">
      <div className="section-inner" data-reveal="fade-up">
        <div className="hwt-banner">
          <div className="hwt-media" aria-hidden="true">
            <img src={photos.promiseAccent} alt="" className="hwt-media-img" loading="lazy" />
            <span className="hwt-media-grade"></span>
          </div>
          <div className="hwt-info">
            <p className="eyebrow-warm">{tx.eyebrow}</p>
            <h2>{tx.h2}</h2>
            <p>{tx.sub}</p>
            <div className="hwt-cta">
              <Link to="/story" className="btn-outline-warm">
                {tx.cta}
              </Link>
              <Link to="/stays#stays" className="btn-warm">
                {tx.ctaRooms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
