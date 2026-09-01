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

/* Falls back to "a suite" rather than interpolating an undefined/empty
   room name into the sentence, so a missing name still reads as a
   grammatical sentence instead of a broken WhatsApp message. */
export function buildRoomReservationMessage(roomName) {
  const subject = roomName ? `the ${roomName} room` : 'a suite';
  return `Hello BlueIce,\n\nI’m interested in booking ${subject} at Lakhey Lachen Homestay.\n\nI’d love to know the availability, room details, pricing, and the best way to reserve this room.\n\nCould you please share the details and available dates?\n\nThank you.`;
}

export function buildWhatsAppUrl(raw, message) {
  return `https://wa.me/${normalizeWhatsAppNumber(raw)}?text=${encodeURIComponent(message)}`;
}
