import { _statusFromTags } from "../status-from-tags";
import { ENTRY_STATUS, type CacheEntry, type CacheState } from "../types";

/**
 * Computes the final derived status of a cache entry by combining:
 *
 * - The entry's own expiration timestamps (TTL and stale TTL).
 * - Any stricter expiration or stale rules imposed by its associated tags.
 *
 * Precedence rules:
 * - `EXPIRED` overrides everything.
 * - `STALE` overrides `FRESH`.
 * - If neither the entry nor its tags impose stricter rules, the entry is `FRESH`.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry being evaluated.
 * @returns The final {@link ENTRY_STATUS} for the entry.
 */
export function computeEntryStatus(
  state: CacheState,
  entry: CacheEntry,

  /** @internal */
  now: number,
): ENTRY_STATUS {
  const [__createdAt, expiresAt, staleExpiresAt] = entry[0];

  // 1. Status derived from tags
  const [tagStatus, earliestTagStaleInvalidation] = _statusFromTags(state, entry);
  if (tagStatus === ENTRY_STATUS.EXPIRED) return ENTRY_STATUS.EXPIRED;
  const windowStale = staleExpiresAt - expiresAt;
  if (
    tagStatus === ENTRY_STATUS.STALE &&
    staleExpiresAt > 0 &&
    now < earliestTagStaleInvalidation + windowStale
  ) {
    // A tag can mark the entry as stale only if the entry itself supports a stale window.
    // The tag's stale invalidation time is extended by the entry's stale window duration.
    // If "now" is still within that extended window, the entry is considered stale.
    return ENTRY_STATUS.STALE;
  }

  // 2. Status derived from entry timestamps
  if (now < expiresAt) {
    return ENTRY_STATUS.FRESH;
  }
  if (staleExpiresAt > 0 && now < staleExpiresAt) {
    return ENTRY_STATUS.STALE;
  }

  return ENTRY_STATUS.EXPIRED;
}

// ---------------------------------------------------------------------------
// Entry status wrappers (semantic helpers built on top of computeEntryStatus)
// ---------------------------------------------------------------------------
/**
 * Determines whether a cache entry is fresh.
 *
 * A fresh entry is one whose final derived status is `FRESH`, meaning:
 * - It has not expired according to its own timestamps, and
 * - No associated tag imposes a stricter stale or expired rule.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry being evaluated.
 * @returns True if the entry is fresh.
 */
export const isFresh = (state: CacheState, entry: CacheEntry, now: number): boolean =>
  computeEntryStatus(state, entry, now) === ENTRY_STATUS.FRESH;

/**
 * Determines whether a cache entry is stale.
 *
 * A stale entry is one whose final derived status is `STALE`, meaning:
 * - It has passed its TTL but is still within its stale window, or
 * - A tag imposes a stale rule that applies to this entry.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry being evaluated.
 * @returns True if the entry is stale.
 */
export const isStale = (
  state: CacheState,
  entry: CacheEntry,

  /** @internal */
  now: number,
): boolean => computeEntryStatus(state, entry, now) === ENTRY_STATUS.STALE;

/**
 * Determines whether a cache entry is expired.
 *
 * An expired entry is one whose final derived status is `EXPIRED`, meaning:
 * - It has exceeded both its TTL and stale TTL, or
 * - A tag imposes an expiration rule that applies to this entry.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry being evaluated.
 * @returns True if the entry is expired.
 */
export const isExpired = (
  state: CacheState,
  entry: CacheEntry,

  /** @internal */
  now: number,
): boolean => computeEntryStatus(state, entry, now) === ENTRY_STATUS.EXPIRED;

/**
 * Determines whether a cache entry is valid.
 *
 * A valid entry is one whose final derived status is either:
 * - `FRESH`, or
 * - `STALE` (still within its stale window).
 *
 * Expired entries are considered invalid.
 *
 * @param state - The cache state containing tag metadata.
 * @param entry - The cache entry, or undefined/null if not found.
 * @returns True if the entry exists and is fresh or stale.
 */
export const isValid = (
  state: CacheState,
  entry?: CacheEntry | null,

  /** @internal */
  now: number = Date.now(),
): boolean => {
  if (!entry) return false;
  const status = computeEntryStatus(state, entry, now);
  return status === ENTRY_STATUS.FRESH || status === ENTRY_STATUS.STALE;
};
