import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import heroImage from '../../hero section image/OUR STORY PAGE HERO.png';

export default function StoryHero() {
  const { lang } = useLanguage();
  const tx = t[lang].storyPage;

  return (
    <section className="story-hero" aria-label="Our Family Story">
      <div className="story-hero-inner">
        <div className="story-hero-copy">
          <p className="eyebrow-warm story-hero-eyebrow">{tx.eyebrow}</p>
          <span className="story-hero-rule" aria-hidden="true"></span>
          <h1 className="story-hero-heading">
            {tx.heroLine1}<br/>
            <em>{tx.heroLine2}</em>
          </h1>
          <p className="story-hero-body">{tx.heroBody}</p>
        </div>

        <div className="story-hero-art">
          <div className="story-hero-frame">
            <img
              src={heroImage}
              alt="A traditional carved-timber heritage house at sunrise, framed by tall pines on a misty Himalayan ridge"
              className="story-hero-img"
              loading="eager"
              fetchPriority="high"
            />
            <div className="story-hero-frame-sheen" aria-hidden="true"></div>
          </div>

          {/* Desktop-only atmosphere — reuses the homepage hero's own
              drifting mist layers rather than a new implementation. */}
          <div className="story-hero-mist-wrap" aria-hidden="true">
            <div className="hero-mist hero-mist-1"></div>
            <div className="hero-mist hero-mist-2"></div>
          </div>
        </div>

        {/* Desktop-only seam into the next section. */}
        <div className="story-hero-bottom-fade" aria-hidden="true"></div>
      </div>
    </section>
  );
}
