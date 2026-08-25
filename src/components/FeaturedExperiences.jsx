import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SunIcon, FireIcon, LeafIcon, WaterIcon, 
  TrekIcon, ViewpointIcon, MonasteryIcon, FarmIcon, StargazingIcon, KitchenIcon 
} from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';

const expIcons = [
  <SunIcon key="sun" size={24} color="var(--amber-light)" />,
  <FireIcon key="fire" size={24} color="var(--amber-light)" />,
  <LeafIcon key="leaf" size={24} color="var(--amber-light)" />,
  <WaterIcon key="water" size={24} color="var(--amber-light)" />,
];

/* .webp siblings — same resolution, same look, 3.6 MB -> 0.8 MB
   across these four. See the note in HomeTeasers.jsx. */
const expImages = [
  'images/experience_sunrise_tea.webp',
  'images/experience_bonfire.webp',
  'images/experience_tea_garden.webp',
  'images/experience_waterfall.webp',
];

const actIcons = [
  <TrekIcon key="trek" size={20} color="var(--amber-light)" />,
  <ViewpointIcon key="viewpoint" size={20} color="var(--amber-light)" />,
  <MonasteryIcon key="monastery" size={20} color="var(--amber-light)" />,
  <FarmIcon key="farm" size={20} color="var(--amber-light)" />,
  <StargazingIcon key="stargazing" size={20} color="var(--amber-light)" />,
  <KitchenIcon key="kitchen" size={20} color="var(--amber-light)" />,
];

export default function FeaturedExperiences() {
  const { lang } = useLanguage();
  const tx = t[lang].featuredExp;

  return (
    <section id="moments" className="moments-section" aria-label="Mountain Moments">
      <div className="section-inner">
        {/* Header */}
        <div className="section-header" data-reveal="fade-up">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h2 className="section-heading">
            {tx.h2line1} <em>{tx.h2line2}</em>
          </h2>
          <p className="section-sub">{tx.sub}</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="moments-grid" data-reveal="fade-up">
          {tx.moments.map((m, i) => (
            <article key={i} className="moment-card">
              <div className="mc-img-wrap">
                <img src={expImages[i]} alt={m.title} className="mc-img" loading="lazy" />
                <div className="mc-img-overlay"></div>
                <span className="mc-tag">{m.tag}</span>
              </div>
              <div className="mc-body">
                <span className="mc-num" aria-hidden="true">{m.num}</span>
                <span className="mc-icon">{expIcons[i]}</span>
                <h3 className="mc-title">{m.title}</h3>
                <p className="mc-desc">{m.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Quick Activities Chips */}
        <div className="acts-wrap" data-reveal="fade-up">
          <p className="acts-label">{tx.actsLabel}</p>
          <div className="acts-chips">
            {tx.acts.map((a, i) => (
              <div key={i} className="act-chip">
                <span className="ac-icon">{actIcons[i]}</span>
                <div className="ac-text">
                  <strong>{a.title}</strong>
                  <span>{a.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-cta-row" data-reveal="fade-up">
          <Link to="/contact" className="btn-warm">{tx.cta}</Link>
        </div>
      </div>
    </section>
  );
}
