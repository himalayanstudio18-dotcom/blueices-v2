import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill in your project values. ' +
    'Using a placeholder client — all requests will fail until this is set.'
  );
}

// createClient() throws on a malformed URL, so a syntactically valid
// placeholder is used when env vars are absent — this keeps the admin
// UI (login form, etc.) rendering instead of a blank crash screen
// before Supabase credentials are configured.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
);
