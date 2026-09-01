import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { useDiningImages } from '../lib/useDiningImages';
import FinalCTA from '../components/FinalCTA';

const CATEGORY_ORDER = ['breakfast', 'lunch', 'dinner', 'local_cuisine', 'tea_snacks'];

/* Full Dining collection with category filtering. Reuses the app-level
   LightboxModal (passed onOpenLightbox from App.jsx, same as StoryPage)
   rather than a second lightbox implementation — the lightbox opens
   against `visible` (the currently filtered set), so prev/next stays
   within whichever category the visitor is browsing. */
export default function DiningPage({ onOpenLightbox }) {
  const { lang } = useLanguage();
  const tx = t[lang].diningPage;
  const categoryLabels = t[lang].diningCategories;
  const { photos, loading } = useDiningImages(lang);
  const [activeCategory, setActiveCategory] = useState('all');

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => photos?.some((p) => p.category === cat)),
    [photos]
  );

  const visible = photos?.filter((p) => activeCategory === 'all' || p.category === activeCategory) ?? [];

  return (
    <div className="page-dining page-padding-top">
      <header className="dining-page-header">
        <div className="section-inner">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h1 className="section-heading">{tx.h1}</h1>
          <p className="section-sub">{tx.sub}</p>
        </div>
      </header>

      {!loading && photos && photos.length > 0 && (
        <div className="dining-tabs" role="tablist" aria-label="Filter dining photos by category">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            className={`dining-tab${activeCategory === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            {tx.filterAll}
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={`dining-tab${activeCategory === cat ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      <section className="dining-section">
        <div className="section-inner">
          {!loading && (!photos || photos.length === 0) ? (
            <p className="dining-empty">{tx.emptyState}</p>
          ) : (
            <div className="dining-grid">
              {visible.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  className="dining-card"
                  onClick={() => onOpenLightbox(i, visible)}
                  aria-label={photo.caption || photo.alt || 'View photo'}
                >
                  <img src={photo.src} alt={photo.alt} className="dining-card-img" loading="lazy" />
                  <span className="dining-card-overlay" aria-hidden="true">
                    {photo.caption && <span className="dining-card-caption">{photo.caption}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <FinalCTA />
    </div>
  );
}
