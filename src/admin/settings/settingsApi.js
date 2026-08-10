import { supabase } from '../../lib/supabaseClient';

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function updateSettings(fields) {
  const { error } = await supabase
    .from('settings')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

/* Draft / Publish for settings — same pattern as rooms/gallery/site
   content: draft_data holds pending edits only, live columns (which
   Footer/Hero/ContactPage/FinalCTA read directly) are untouched until
   publishSettingsDraft() runs. */
export async function saveSettingsDraft(fields) {
  const current = await getSettings();
  const { error } = await supabase
    .from('settings')
    .update({ draft_data: { ...(current.draft_data ?? {}), ...fields } })
    .eq('id', 1);
  if (error) throw error;
}

export async function publishSettingsDraft() {
  const current = await getSettings();
  if (!current.draft_data) return;
  const { error } = await supabase
    .from('settings')
    .update({ ...current.draft_data, draft_data: null, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

export async function revertSettingsDraft() {
  const { error } = await supabase.from('settings').update({ draft_data: null }).eq('id', 1);
  if (error) throw error;
}
