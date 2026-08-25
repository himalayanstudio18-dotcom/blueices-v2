import React from 'react';
import { HomeIcon, CloudIcon, MapIcon, StarIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { whyPhotos } from '../assets/photos';

const icons = [
  <HomeIcon key="home" size={26} color="var(--amber-light)" />,
  <CloudIcon key="cloud" size={26} color="var(--amber-light)" />,
  <MapIcon key="map" size={26} color="var(--amber-light)" />,
];

const images = whyPhotos;

export default function WhyBlueIce() {
  const { lang } = useLanguage();
  const tx = t[lang].whyBlueIce;

  const stats = [
    { val: tx.stat1, label: tx.stat1Label },
    { val: tx.stat2, label: tx.stat2Label },
    { val: <span>{tx.stat3} <StarIcon size={14} color="var(--amber-light)" /></span>, label: tx.stat3Label },
    { val: tx.stat4, label: tx.stat4Label },
  ];

  return (
    <section id="why" className="why-section" aria-label="Why Blue Ice">
      <div className="section-inner">
        <div className="section-header" data-reveal="fade-up">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h2 className="section-heading">
            {tx.h2line1}<br/>{tx.h2line2}<br/><em>{tx.h2line3}</em>
          </h2>
        </div>

        <div className="why-grid" data-reveal="fade-up">
          {tx.pillars.map((p, i) => (
            <article key={i} className="why-card">
              <div className="wc-img-wrap">
                <img src={images[i]} alt={p.title} className="wc-img" loading="lazy" />
                <div className="wc-img-fog"></div>
              </div>
              <div className="wc-body">
                <span className="wc-num">0{i + 1}</span>
                <span className="wc-icon">{icons[i]}</span>
                <h3 className="wc-title">{p.title}</h3>
                <p className="wc-desc">{p.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Stats ribbon */}
        <div className="why-stats" data-reveal="fade-up">
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div className="ws-item">
                <span className="ws-val">{s.val}</span>
                <span className="ws-label">{s.label}</span>
              </div>
              {i < stats.length - 1 && <div className="ws-sep" aria-hidden="true"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
