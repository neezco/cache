import { ENTRY_STATUS, type CacheEntry, type CacheState } from "../types";

/**
 * Computes the derived status of a cache entry based on its associated tags.
 *
 * Tags may impose stricter expiration or stale rules on the entry. Only tags
 * created at or after the entry's creation timestamp are considered relevant.
 *
 * Resolution rules:
 * - If any applicable tag marks the entry as expired, the status becomes `EXPIRED`.
 * - Otherwise, if any applicable tag marks it as stale, the status becomes `STALE`.
 * - If no tag imposes stricter rules, the entry remains `FRESH`.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry whose status is being evaluated.
 * @returns A tuple containing:
 *   - The final {@link ENTRY_STATUS} imposed by tags.
 *   - The earliest timestamp at which a tag marked the entry as stale
 *     (or 0 if no tag imposed a stale rule).
 */
export function _statusFromTags(state: CacheState, entry: CacheEntry): [ENTRY_STATUS, number] {
  const entryCreatedAt = entry[0][0];

  // Tracks the earliest point in time when any tag marked this entry as stale.
  // Initialized to Infinity so that comparisons always pick the minimum.
  let earliestTagStaleInvalidation = Infinity;

  // Default assumption: entry is fresh unless tags override.
  let status = ENTRY_STATUS.FRESH;

  const tags = entry[2];
  if (tags) {
    for (const tag of tags) {
      const ts = state._tags.get(tag);
      if (!ts) continue;

      // Each tag provides two timestamps:
      // - tagExpiredAt: when the tag forces expiration
      // - tagStaleSinceAt: when the tag forces stale status
      const [tagExpiredAt, tagStaleSinceAt] = ts;

      // A tag can only override if it was created after the entry itself.
      if (tagExpiredAt >= entryCreatedAt) {
        status = ENTRY_STATUS.EXPIRED;
        break; // Expired overrides everything, no need to check further.
      }

      if (tagStaleSinceAt >= entryCreatedAt) {
        // Keep track of the earliest stale timestamp across all tags.
        if (tagStaleSinceAt < earliestTagStaleInvalidation) {
          earliestTagStaleInvalidation = tagStaleSinceAt;
        }
        status = ENTRY_STATUS.STALE;
      }
    }
  }

  // If no tag imposed stale, return 0 for the timestamp.
  return [status, status === ENTRY_STATUS.STALE ? earliestTagStaleInvalidation : 0];
}
