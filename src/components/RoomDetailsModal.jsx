import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function RoomDetailsModal({ room, ctaLabel, onClose }) {
  const [activeImg, setActiveImg] = useState(0);
  const gallery = room.gallery;
  const touchStartX = useRef(null);

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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, prev, next]);

  return (
    <div className="room-modal-overlay" role="dialog" aria-modal="true" aria-label={`${room.name} details`} onClick={onClose}>
      <div className="room-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="room-modal-close" aria-label="Close" onClick={onClose}>✕</button>

        <div className="room-modal-gallery">
          <div className="rmg-main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <img src={gallery[activeImg]} alt={`${room.name} — view ${activeImg + 1} of ${gallery.length}`} className="rmg-main-img" />
            <div className="rmg-main-grade" aria-hidden="true"></div>
            {gallery.length > 1 && (
              <>
                <button type="button" className="rmg-nav rmg-nav--prev" aria-label="Previous photo" onClick={prev}>‹</button>
                <button type="button" className="rmg-nav rmg-nav--next" aria-label="Next photo" onClick={next}>›</button>
                <span className="rmg-counter">{activeImg + 1} / {gallery.length}</span>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="rmg-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rmg-thumb${i === activeImg ? ' is-active' : ''}`}
                  aria-label={`View photo ${i + 1}`}
                  aria-current={i === activeImg}
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
          <h2 className="rmd-name">{room.name}</h2>
          {room.slug && (
            <Link to={`/rooms/${room.slug}`} className="rmd-full-page-link" onClick={onClose}>
              View full room page ↗
            </Link>
          )}
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
              <Link to="/contact" className="btn-warm" onClick={onClose}>{ctaLabel}</Link>
            ) : (
              <span className="btn-warm rmd-price-cta--disabled" aria-disabled="true">Currently Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
