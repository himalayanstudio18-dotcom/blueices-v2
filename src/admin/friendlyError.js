/* Admin pages must never show raw database errors (e.g. "column
   rooms.slug does not exist") to staff — those are only meaningful
   to a developer. The real error is always logged to the console for
   debugging; the UI gets a short, human message keyed off what kind
   of failure it was. */
export function friendlyError(err, context = 'load this') {
  console.error(`[admin] ${context} failed`, err);

  const code = err?.code;
  const message = err?.message ?? '';

  if (code === '42703' || /column .* does not exist/i.test(message)) {
    return `Unable to ${context} — the database is missing an expected column. This usually means a pending migration hasn't been run yet.`;
  }
  if (code === '42P01' || /relation .* does not exist/i.test(message)) {
    return `Unable to ${context} — a required table doesn't exist yet. This usually means a pending migration hasn't been run yet.`;
  }
  if (code === '23505') {
    return 'That value is already in use — please choose a different one.';
  }
  if (code === '23503') {
    return 'This action references something that no longer exists.';
  }
  if (code === 'PGRST301' || code === '42501' || /permission denied|row-level security/i.test(message)) {
    return "You don't have permission to do that.";
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Unable to connect — please check your internet connection and try again.';
  }
  return `Unable to ${context}. Please try again.`;
}
