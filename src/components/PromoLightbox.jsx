import React from 'react';

/* Shared fullscreen viewer for a campaign creative — used by both the
   Homepage promotion section and the smart campaign popup so the two
   click-to-enlarge experiences stay visually identical. Purely
   presentational: the caller owns the open/close state and any
   Escape-key handling, since the popup needs Escape to close the
   lightbox first and only close the popup itself on a second press. */
export default function PromoLightbox({ imageUrl, alt, onClose }) {
  return (
    <div
      className="promo-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged promotion image"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <button
        type="button"
        className="promo-lightbox-close"
        aria-label="Close enlarged image"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        ✕
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="promo-lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
