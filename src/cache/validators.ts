import type { CacheEntry } from "../types";

/**
 * Checks if a cache entry is fresh (not expired and not stale).
 * @param entry - The cache entry.
 * @param now - The current timestamp.
 * @returns True if the entry is fresh.
 */
export const isFresh = (
  entry: CacheEntry,

  /** @internal */
  now: number,
): boolean => {
  const expiredAt = entry[0][1];
  return now < expiredAt;
};

/**
 * Checks if a cache entry is stale (expired but within stale period).
 * @param entry - The cache entry.
 * @param now - The current timestamp.
 * @returns True if the entry is stale.
 */
export const isStale = (
  entry: CacheEntry,

  /** @internal */
  now: number,
): boolean => {
  const expiredAt = entry[0][1];
  const staleExpiresAt = entry[0][2] ?? 0;

  return staleExpiresAt > 0 && now >= expiredAt && now < staleExpiresAt;
};

/**
 * Checks if a cache entry is expired (beyond both TTL and stale TTL).
 * @param entry - The cache entry.
 * @param now - The current timestamp.
 * @returns True if the entry is expired.
 */
export const isExpired = (
  entry: CacheEntry,

  /** @internal */
  now: number,
): boolean => {
  const expiredAt = entry[0][1];
  const staleExpiresAt = entry[0][2] ?? 0;

  if (staleExpiresAt <= 0) return now >= expiredAt;

  return now >= staleExpiresAt;
};

/**
 * Checks if a cache entry is valid (not expired, considering stale period).
 * @param entry - The cache entry, or undefined if not found.
 * @param now - Optional timestamp override (defaults to Date.now()).
 * @returns True if the entry exists and is valid, false otherwise.
 */
export const isValid = (entry?: CacheEntry | null, now: number = Date.now()): boolean => {
  if (!entry) return false;

  return isFresh(entry, now) || isStale(entry, now);
};
