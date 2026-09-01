/* Shared number formatting for wa.me / tel: links so admin-entered
   values (spaces, +, dashes, parentheses) never produce a broken
   link regardless of how they were typed into the Settings form. */

export function normalizeWhatsAppNumber(raw) {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '');
}

export function toIndianTelHref(raw) {
  const digits = normalizeWhatsAppNumber(raw);
  if (!digits) return '';
  return digits.length === 10 ? `tel:+91${digits}` : `tel:+${digits}`;
}

/* Admin-editable via Admin ▸ Site Content ▸ Stays Page ▸ "Room
   Reservation WhatsApp Message" (site_content page='stays', section_key
   'whatsapp_room_reservation_message'). This is also the fallback used
   whenever that field is empty/unset, so reservation never breaks on
   an unconfigured or cleared template. */
export const DEFAULT_ROOM_RESERVATION_TEMPLATE =
  'Hello BlueIce,\n\nI’m interested in booking the *{{room_name}}* room at Lakhey Lachen Homestay.\n\nI’d love to know the availability, room details, pricing, and the best way to reserve this room.\n\nCould you please share the details and available dates?\n\nThank you.';

/* {{room_name}} is replaced verbatim — whatever surrounds it in the
   template (WhatsApp *bold* asterisks or not) is left exactly as
   written, never re-added. "Suite" is a defensive fallback only; every
   real room from usePublishedRooms() always has a name. */
export function buildRoomReservationMessage(roomName, template) {
  const tpl = template && template.trim() ? template : DEFAULT_ROOM_RESERVATION_TEMPLATE;
  return tpl.replace(/\{\{\s*room_name\s*\}\}/g, roomName || 'Suite');
}

export function buildWhatsAppUrl(raw, message) {
  return `https://wa.me/${normalizeWhatsAppNumber(raw)}?text=${encodeURIComponent(message)}`;
}
