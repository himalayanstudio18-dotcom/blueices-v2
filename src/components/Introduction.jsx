import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { photos } from '../assets/photos';
import { useSiteContent } from '../lib/useSiteContent';

export default function Introduction() {
  const { lang } = useLanguage();
  const tx = t[lang].introduction;
  const { get } = useSiteContent('story', lang);
  const heading = get('heading', null);
  const description = get('description', tx.lead);

  return (
    <section id="story" className="story-section" aria-label="Our Story">
      <div className="section-inner">
        <div className="story-inner" data-reveal="fade-up">
          {/* Left Column: Image Frame */}
          <div className="story-img-frame">
            {/* The scale-on-hover, its overlay grade, mask and radius
                all live on this one wrapper now — previously the
                transform sat on .story-img alone while .story-img-grade
                stayed a static sibling, so hovering visibly desynced
                the two (the grade no longer matched the enlarged
                photo's edges) and, since the outer frame switches to
                overflow:visible on desktop to let the inset frame
                overlap it, the scaled image could bleed past its own
                rounded corner. Scoping overflow/radius/transform to
                this inner wrapper fixes both at once, while leaving
                the inset frame free to overlap the outer frame. */}
            <div className="story-img-main">
              <img src={photos.heritageMain} alt="A misty cedar forest trail above Lakhey Lachen, Munsong" className="story-img" loading="lazy" />
              <span className="story-img-grade" aria-hidden="true"></span>
            </div>
            {/* Desktop-only overlapping frame */}
            <img
              src={photos.heritageInset}
              alt=""
              aria-hidden="true"
              className="story-img-inset"
              loading="lazy"
            />
            <div className="story-badge">
              <span className="sb-num">{tx.badgeAlt}</span>
              <span className="sb-unit">{tx.badgeUnit}</span>
              <span className="sb-label">{tx.badgeLabel}</span>
            </div>
          </div>

          {/* Right Column: Narrative Copy */}
          <div className="story-text">
            <p className="eyebrow-warm">{tx.eyebrow}</p>
            {heading ? (
              <h2 className="story-heading">{heading}</h2>
            ) : (
              <h2 className="story-heading">
                {tx.h2line1}<br/>
                <em>{tx.h2line2}</em>
              </h2>
            )}

            <p className="story-para story-lead">{description}</p>
            <p className="story-para">{tx.body}</p>

            <div className="story-stats-row">
              <div className="story-stat">
                <span className="stat-num">{tx.stat1}</span>
                <span className="stat-lbl">{tx.stat1Label}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="story-stat">
                <span className="stat-num">{tx.stat2}</span>
                <span className="stat-lbl">{tx.stat2Label}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="story-stat">
                <span className="stat-num">{tx.stat3}</span>
                <span className="stat-lbl">{tx.stat3Label}</span>
              </div>
            </div>

            <div className="story-action">
              <Link to="/contact" className="btn-warm">{tx.cta}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
