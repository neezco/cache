import type { CacheEntry, CacheState, EntryTimestamp } from "../types";

/**
 * Merges the timestamps of a cache entry with any applicable tag timestamps.
 *
 * Tag timestamps override the entry's expiration rules **only if**:
 * - The tag was created **after** the entry.
 * - The tag has a stricter **earlier** expiration or stale expiration.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry whose timestamps will be merged.
 * @returns A merged timestamp tuple: [createdAt, expiresAt, staleExpiresAt].
 */
export function _mergeTimestamps(state: CacheState, entry: CacheEntry): EntryTimestamp {
  const [createdAt, expiresAt, staleExpiresAt] = entry[0];
  let mergedExpiresAt = expiresAt;
  let mergedStaleExpiresAt = staleExpiresAt;

  const tags = entry[2];
  if (tags) {
    for (const tag of tags) {
      const ts = state._tags.get(tag);
      if (!ts) continue;

      const [tagCreatedAt, tagExpiresAt, tagStaleExpiresAt] = ts;

      // Ignore tags created before the entry
      if (tagCreatedAt < createdAt) continue;

      // Apply stricter expiration if the tag expires earlier
      if (tagExpiresAt < mergedExpiresAt) {
        mergedExpiresAt = tagExpiresAt;
      }

      // Apply stricter stale expiration if the tag stale-expires earlier
      if (tagStaleExpiresAt < mergedStaleExpiresAt) {
        mergedStaleExpiresAt = tagStaleExpiresAt;
      }
    }
  }

  return [createdAt, mergedExpiresAt, mergedStaleExpiresAt];
}
