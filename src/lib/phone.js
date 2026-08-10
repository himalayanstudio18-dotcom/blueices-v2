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
