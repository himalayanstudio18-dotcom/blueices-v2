import { supabase } from '../lib/supabaseClient';

const ENTITY_SECTION = {
  room: 'Rooms',
  gallery_image: 'Gallery',
  inquiry: 'Inquiries',
  site_content: 'Site Content',
  promotion: 'Promotions',
  staff: 'Staff',
  settings: 'Settings',
  account: 'Account',
};

/* Best-effort "Browser · OS" summary from the user agent string — no
   server round-trip needed, unlike a real IP address (see migration
   0018 for why IP isn't captured). Good enough for an admin activity
   log; not meant to be a precise UA parser. */
function describeDevice() {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent ?? '';
  let browser = 'Unknown browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';

  let os = 'Unknown OS';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return `${browser} · ${os}`;
}

/* Fire-and-forget: a failed log write should never block the actual
   action it's recording, so errors are swallowed (not surfaced to
   the user) rather than thrown. Every row that does get written is
   therefore a completed, successful action — there's no "failed"
   status to track. */
export async function logActivity(staff, { action, entity, entityId, detail, oldValue, newValue }) {
  if (!staff) return;
  const { error } = await supabase.from('activity_log').insert({
    user_id: staff.id,
    user_name: staff.name,
    user_role: staff.role ?? null,
    action,
    entity,
    section: ENTITY_SECTION[entity] ?? null,
    entity_id: entityId ?? null,
    description: detail ?? null,
    old_value: oldValue != null ? String(oldValue) : null,
    new_value: newValue != null ? String(newValue) : null,
    device: describeDevice(),
  });
  if (error) console.error('[admin] failed to log activity', error);
}

export async function listActivityLog(limit = 300) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('id, user_id, user_name, user_role, action, entity, section, entity_id, description, old_value, new_value, device, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
