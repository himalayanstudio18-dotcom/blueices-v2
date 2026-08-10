import { supabase } from '../lib/supabaseClient';

/* Fire-and-forget: a failed log write should never block the actual
   action it's recording, so errors are swallowed (not surfaced to
   the user) rather than thrown. */
export async function logActivity(staff, { action, entity, entityId, detail }) {
  if (!staff) return;
  const { error } = await supabase.from('activity_log').insert({
    user_id: staff.id,
    user_name: staff.name,
    action,
    entity,
    entity_id: entityId ?? null,
    detail: detail ?? null,
  });
  if (error) console.error('[admin] failed to log activity', error);
}

export async function listActivityLog(limit = 100) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('id, user_name, action, entity, entity_id, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
