import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { usePublishedRoomBySlug } from '../lib/usePublishedRoomBySlug';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function RoomDetailPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const tx = t[lang].featuredStay;
  const { room, loading, notFound, error } = usePublishedRoomBySlug(slug, lang);

  useDocumentMeta(
    room ? (room.seoTitle || room.name) : null,
    room ? (room.seoDescription || room.shortDesc) : null
  );

  const [activeImg, setActiveImg] = useState(0);
  const touchStartX = useRef(null);
  const gallery = room?.gallery ?? [];

  /* The page component is reused (not remounted) across a `:slug`
     change, so activeImg from the previous room can outlive its
     gallery — reset it whenever the route lands on a different room. */
  useEffect(() => {
    setActiveImg(0);
  }, [slug]);

  /* Render-time safety net for the one render between a gallery
     shrinking and the effect above committing (effects always fire a
     render behind the state change that triggers them) — same fix as
     SignatureGallery's safeCenterIndex. */
  const safeActiveImg = gallery.length ? Math.min(activeImg, gallery.length - 1) : 0;

  const prev = useCallback(() => {
    setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const next = useCallback(() => {
    setActiveImg((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40 || gallery.length < 2) return;
    if (dx < 0) next(); else prev();
  };

  useEffect(() => {
    if (!room) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [room, prev, next]);

  if (loading) {
    return (
      <div className="page-stays page-padding-top">
        <section className="stays-section">
          <div className="section-inner room-page-state">
            <p>Loading room…</p>
          </div>
        </section>
      </div>
    );
  }

  if (error || notFound || !room) {
    return (
      <div className="page-stays page-padding-top">
        <section className="stays-section">
          <div className="section-inner room-page-state">
            <p>{notFound ? 'This room could not be found — it may have been removed or unpublished.' : 'Rooms are temporarily unavailable — please check back shortly.'}</p>
            <Link to="/stays" className="btn-outline-warm">Back to all rooms</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stays page-padding-top">
      <section className="stays-section" aria-label={`${room.name} details`}>
        <div className="section-inner">
          <p className="room-page-back"><Link to="/stays">← Back to all rooms</Link></p>

          <div className="room-page-frame">
            <div className="room-modal-gallery">
              <div className="rmg-main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <img src={gallery[safeActiveImg]} alt={`${room.name} — view ${safeActiveImg + 1} of ${gallery.length}`} className="rmg-main-img" />
                <div className="rmg-main-grade" aria-hidden="true"></div>
                {gallery.length > 1 && (
                  <>
                    <button type="button" className="rmg-nav rmg-nav--prev" aria-label="Previous photo" onClick={prev}>‹</button>
                    <button type="button" className="rmg-nav rmg-nav--next" aria-label="Next photo" onClick={next}>›</button>
                    <span className="rmg-counter">{safeActiveImg + 1} / {gallery.length}</span>
                  </>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="rmg-thumbs">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`rmg-thumb${i === safeActiveImg ? ' is-active' : ''}`}
                      aria-label={`View photo ${i + 1}`}
                      aria-current={i === safeActiveImg}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="room-modal-details">
              <span className="rmd-tag">{room.tag}</span>
              <h1 className="rmd-name">{room.name}</h1>
              <div className="rmd-meta">
                <span>{room.capacity}</span>
                <span className="rmd-meta-sep" aria-hidden="true"></span>
                <span>{room.size}</span>
              </div>
              <p className="rmd-desc">{room.desc}</p>

              {room.features?.length > 0 && (
                <div className="rmd-features">
                  {room.features.map((f, i) => (
                    <span key={i} className="rmd-feature">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="rmd-footer">
                <div className="rmd-price-block">
                  <div className="rmd-price">
                    <span className="rmd-price-num">{room.price}</span>
                    <small>/night</small>
                  </div>
                  {room.weekendPrice && (
                    <p className="rmd-price-weekend">Weekend: {room.weekendPrice}/night</p>
                  )}
                </div>
                {room.isAvailable ? (
                  <Link to="/contact" className="btn-warm">{tx.ctaCard}</Link>
                ) : (
                  <span className="btn-warm rmd-price-cta--disabled" aria-disabled="true">Currently Unavailable</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
