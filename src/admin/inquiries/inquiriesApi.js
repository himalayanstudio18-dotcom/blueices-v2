import { supabase } from '../../lib/supabaseClient';

const INQUIRY_COLUMNS = `
  id, name, phone, email, message, requested_dates,
  check_in, check_out, guests, preferred_room_id, internal_notes,
  source, status, created_at,
  rooms:preferred_room_id (name_en)
`;

export async function listInquiries() {
  const { data, error } = await supabase
    .from('inquiries')
    .select(INQUIRY_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateInquiry(id, fields) {
  const { error } = await supabase.from('inquiries').update(fields).eq('id', id);
  if (error) throw error;
}
