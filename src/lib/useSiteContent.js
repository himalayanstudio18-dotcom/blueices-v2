import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/* When a component tree is wrapped in <SiteContentPreviewProvider>,
   every useSiteContent() call inside it prefers draft_value_en/bn
   over the live value_en/bn — this is what lets the admin's Draft
   Preview render the exact same public components (Hero,
   Introduction, ...) and have them show pending, unpublished
   content. Outside a provider (i.e. on the real public site) this is
   always null, so behavior there is completely unchanged. */
const SiteContentPreviewContext = createContext(false);

export function SiteContentPreviewProvider({ children }) {
  return React.createElement(SiteContentPreviewContext.Provider, { value: true }, children);
}

/* Fetches admin-editable overrides for one page's content and
   resolves them against the site's bilingual translation defaults —
   an empty/unset field in the DB falls back to the original copy, so
   nothing regresses on pages nobody has touched in the admin panel
   yet. Returns a plain lookup: get(key) -> resolved string. */
export function useSiteContent(page, lang) {
  const previewMode = useContext(SiteContentPreviewContext);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let active = true;
    const columns = previewMode
      ? 'section_key, value_en, value_bn, draft_value_en, draft_value_bn'
      : 'section_key, value_en, value_bn';
    supabase
      .from('site_content')
      .select(columns)
      .eq('page', page)
      .then(({ data, error }) => {
        if (!active) return;
        setRows(error ? [] : data);
      });
    return () => { active = false; };
  }, [page, previewMode]);

  const bn = lang === 'bn';
  function get(key, fallback) {
    const row = rows?.find((r) => r.section_key === key);
    if (previewMode && row) {
      const draftValue = (bn && row.draft_value_bn) || row.draft_value_en;
      if (draftValue) return draftValue;
    }
    const value = (bn && row?.value_bn) || row?.value_en;
    return value || fallback;
  }

  return { get, loading: rows === null };
}
