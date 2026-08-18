/* Wraps an index onto a circular [0, total) range — e.g. -1 becomes
   total - 1, and `total` becomes 0. The extra `+ total` guards against
   JS's `%` returning negative results for negative operands. Shared by
   every component that navigates a looping gallery so they can never
   drift into different index spaces. */
export function normalizeIndex(index, total) {
  if (!total) return 0;
  return ((index % total) + total) % total;
}
