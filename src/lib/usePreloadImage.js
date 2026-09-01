import { useEffect } from 'react';

/* Route-scoped equivalent of a static <link rel="preload"> in
   index.html — that file is the shared shell for every route in this
   SPA, so a preload placed there for one page's hero image gets
   fetched (and flagged "preloaded but not used" by the browser) on
   every other route too. Injecting it only while the component that
   actually needs the image is mounted keeps the same early-discovery
   win where it helps, without the warning everywhere else. Mirrors
   useDocumentMeta.js's manual DOM approach — no react-helmet
   dependency for one link tag. */
export function usePreloadImage(href, { media, fetchPriority = 'high' } = {}) {
  useEffect(() => {
    if (!href) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    if (media) link.media = media;
    if (fetchPriority) link.setAttribute('fetchpriority', fetchPriority);
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [href, media, fetchPriority]);
}
