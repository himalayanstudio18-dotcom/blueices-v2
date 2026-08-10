import { supabase } from './supabaseClient';

export async function submitInquiry(fields) {
  const { error } = await supabase.from('inquiries').insert({
    name: fields.name,
    phone: fields.phone || null,
    email: fields.email || null,
    check_in: fields.checkIn || null,
    check_out: fields.checkOut || null,
    guests: fields.guests ? Number(fields.guests) : null,
    preferred_room_id: fields.preferredRoomId || null,
    message: fields.message || null,
    source: 'form',
  });
  if (error) throw error;
}
