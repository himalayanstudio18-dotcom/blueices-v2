import React from 'react';
import { normalizeIndex } from '../lib/normalizeIndex';

/* Renders whatever gallery dataset the caller opened it with — no
   photo list of its own, so it can never drift out of sync with
   whichever carousel launched it. `activeIndex` is normalized at
   render time (not just by the nav handlers) so a stale or
   out-of-range index passed in can never read past the array. */
export default function LightboxModal({ images, activeIndex, onClose, onPrev, onNext }) {
  if (activeIndex === null || !images || images.length === 0) return null;

  const total = images.length;
  const safeIndex = normalizeIndex(activeIndex, total);
  const photo = images[safeIndex];

  return (
    <div className="lightbox active" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" aria-label="Close" onClick={onClose}>✕</button>
        <button className="lightbox-prev" aria-label="Previous" onClick={onPrev}>‹</button>
        <button className="lightbox-next" aria-label="Next" onClick={onNext}>›</button>
        <img src={photo.src} alt={photo.caption} className="lightbox-img" />
        <p className="lightbox-caption">{photo.caption}</p>
        <p className="lightbox-counter">{safeIndex + 1} / {total}</p>
      </div>
    </div>
  );
}
