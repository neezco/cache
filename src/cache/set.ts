import type { CacheState, CacheEntry } from "../types";

/**
 * Sets or updates a value in the cache with TTL and optional stale TTL.
 *
 * @param state - The cache state.
 * @param input - Cache entry definition (key, value, ttl, staleMs).
 * @param now - Optional timestamp override used as the base time (defaults to Date.now()).
 *
 * @returns void
 */
export const setOrUpdate = (
  state: CacheState,
  input: CacheSetOrUpdateInput,

  /** @internal */
  now: number = Date.now(),
): void => {
  const { key, value, ttl: ttlInput, staleTtl: staleTtlInput } = input;

  if (value === undefined) return;
  if (key == null) throw new Error("Missing key.");

  const ttl = ttlInput ?? state.defaultTtl;
  const staleTTL = staleTtlInput ?? state.defaultStaleTtl;

  const entry: CacheEntry = [
    [
      now, // createdAt
      ttl > 0 ? now + ttl : Infinity, // expiresAt
      staleTTL > 0 ? now + staleTTL : 0, // staleExpiresAt
    ],
    value,
    null,
  ];

  state.store.set(key, entry);
};

/**
 * Input parameters for setting or updating a cache entry.
 */
export interface CacheSetOrUpdateInput {
  /**
   * Key under which the value will be stored.
   */
  key: string;

  /**
   * Value to be written to the cache.
   *
   * Considerations:
   * - Always overwrites any previous value, if one exists.
   * - `undefined` is ignored, leaving any previous value intact, if one exists.
   * - `null` is explicitly stored as a null value, replacing any previous value, if one exists.
   */
  value: unknown;

  /**
   * TTL (Time-To-Live) in milliseconds for this entry.
   */
  ttl?: number;

  /**
   * Optional stale TTL in milliseconds for this entry.
   * When provided, the entry may be served as stale after TTL
   * but before stale TTL expires.
   */
  staleTtl?: number;

  tags?: string | string[];
}
