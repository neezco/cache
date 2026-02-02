import type { EntryTimestamp } from "../types";

/**
 * Checks if a cache entryTimestamp is fresh (not expired and not stale).
 * @param entryTimestamp - The cache entryTimestamp.
 * @param now - The current timestamp.
 * @returns True if the entryTimestamp is fresh.
 */
export const isFresh = (
  entryTimestamp: EntryTimestamp,

  /** @internal */
  now: number,
): boolean => {
  const expiredAt = entryTimestamp[1];
  return now < expiredAt;
};

/**
 * Checks if a cache entryTimestamp is stale (expired but within stale period).
 * @param entryTimestamp - The cache entryTimestamp.
 * @param now - The current timestamp.
 * @returns True if the entryTimestamp is stale.
 */
export const isStale = (
  entryTimestamp: EntryTimestamp,

  /** @internal */
  now: number,
): boolean => {
  const expiredAt = entryTimestamp[1];
  const staleExpiresAt = entryTimestamp[2] ?? 0;

  return staleExpiresAt > 0 && now >= expiredAt && now < staleExpiresAt;
};

/**
 * Checks if a cache entryTimestamp is expired (beyond both TTL and stale TTL).
 * @param entryTimestamp - The cache entryTimestamp.
 * @param now - The current timestamp.
 * @returns True if the entryTimestamp is expired.
 */
export const isExpired = (
  entryTimestamp: EntryTimestamp,

  /** @internal */
  now: number,
): boolean => {
  const expiredAt = entryTimestamp[1];
  const staleExpiresAt = entryTimestamp[2] ?? 0;

  if (staleExpiresAt <= 0) return now >= expiredAt;

  return now >= staleExpiresAt;
};

/**
 * Checks if a cache entryTimestamp is valid (not expired, considering stale period).
 * @param entryTimestamp - The cache entryTimestamp, or undefined if not found.
 * @param now - Optional timestamp override (defaults to Date.now()).
 * @returns True if the entryTimestamp exists and is valid, false otherwise.
 */
export const isValid = (
  entryTimestamp?: EntryTimestamp | null,
  now: number = Date.now(),
): boolean => {
  if (!entryTimestamp) return false;

  return isFresh(entryTimestamp, now) || isStale(entryTimestamp, now);
};
