/* Shared client-side guard for image uploads across the admin panel
   (Promotions, Rooms, Gallery/Dining, Site Content) — none of these
   upload paths validated file size before, so a friendly cap is
   applied here rather than letting an oversized file hit storage and
   fail with a raw error. Purely a client-side courtesy: it does not
   relax or replace whatever limit the storage backend itself enforces. */
export function validateImageSize(file, maxMB) {
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Image is too large. Maximum allowed size is ${maxMB} MB.`;
  }
  return null;
}
