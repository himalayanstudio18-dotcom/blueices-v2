import React from 'react';
import { signaturePhotos } from '../assets/photos';

/* Captions are index-aligned with signaturePhotos — the gallery
   passes its own index straight through, so both arrays must
   stay in the same order or the wrong photo opens. */
const captions = [
  'No alarm clock needed here.',
  'Where mornings are taken slowly.',
  'The house, and the quiet around it.',
  'Small corners worth sitting in.',
  'Every trail leads somewhere worth finding.',
  'Nothing here is in a hurry.',
];

const lightboxPhotos = signaturePhotos.map((p, i) => ({
  src: p.src,
  alt: p.alt,
  caption: captions[i] ?? p.alt,
}));

export default function LightboxModal({ activeIndex, onClose, onPrev, onNext }) {
  if (activeIndex === null) return null;
  const photo = lightboxPhotos[activeIndex] || lightboxPhotos[0];

  return (
    <div className="lightbox active" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" aria-label="Close" onClick={onClose}>✕</button>
        <button className="lightbox-prev" aria-label="Previous" onClick={onPrev}>‹</button>
        <button className="lightbox-next" aria-label="Next" onClick={onNext}>›</button>
        <img src={photo.src} alt={photo.caption} className="lightbox-img" />
        <p className="lightbox-caption">{photo.caption}</p>
        <p className="lightbox-counter">{activeIndex + 1} / {lightboxPhotos.length}</p>
      </div>
    </div>
  );
}
