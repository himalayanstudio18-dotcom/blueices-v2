import { useEffect } from 'react';

/* Sets document.title and <meta name="description"> for the current
   page, restoring the previous values on unmount. No react-helmet —
   this app has only a handful of routes that need custom per-page
   metadata, so a tiny hook covers it without adding a dependency. */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    if (!title) return;
    const prevTitle = document.title;
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute('content') ?? null;
    if (meta && description) meta.setAttribute('content', description);

    return () => {
      document.title = prevTitle;
      if (meta && prevDescription !== null) meta.setAttribute('content', prevDescription);
    };
  }, [title, description]);
}
