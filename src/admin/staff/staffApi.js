import { supabase } from '../../lib/supabaseClient';

export async function listStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('id, name, role, created_at')
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function addStaff({ email, password, name, role }) {
  const { data, error } = await supabase.functions.invoke('create-staff-member', {
    body: { email, password, name, role },
  });
  if (error) {
    let message = error.message;
    try {
      const body = await error.context.json();
      if (body?.error) message = body.error;
    } catch {
      // response body wasn't JSON; fall back to the default error message
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data.staff;
}

export async function updateStaffRole(id, role) {
  const { error } = await supabase.from('staff').update({ role }).eq('id', id);
  if (error) throw error;
}

export async function updateStaffName(id, name) {
  const { error } = await supabase.from('staff').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function removeStaff(id) {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}
