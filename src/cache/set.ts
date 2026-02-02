import type { CacheState, CacheEntry } from "../types";

/**
 * Sets or updates a value in the cache with TTL and an optional stale window.
 *
 * @param state - The cache state.
 * @param input - Cache entry definition (key, value, ttl, staleWindow, tags).
 * @param now - Optional timestamp override used as the base time (defaults to Date.now()).
 *
 * @remarks
 * - `ttl` defines when the entry becomes expired.
 * - `staleWindow` defines how long the entry may still be served as stale
 *   after the expiration moment (`now + ttl`).
 */
export const setOrUpdate = (
  state: CacheState,
  input: CacheSetOrUpdateInput,

  /** @internal */
  now: number = Date.now(),
): void => {
  const { key, value, ttl: ttlInput, staleWindow: staleWindowInput, tags } = input;

  if (value === undefined) return;
  if (key == null) throw new Error("Missing key.");

  const ttl = ttlInput ?? state.defaultTtl;
  const staleWindow = staleWindowInput ?? state.defaultStaleWindow;

  const expiresAt = ttl > 0 ? now + ttl : Infinity;
  const entry: CacheEntry = [
    [
      now, // createdAt
      expiresAt, // expiresAt
      staleWindow > 0 ? expiresAt + staleWindow : 0, // staleExpiresAt (relative to expiration)
    ],
    value,
    typeof tags === "string" ? [tags] : Array.isArray(tags) ? tags : null,
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
   * Optional stale window in milliseconds.
   *
   * Defines how long the entry may continue to be served as stale
   * after it has reached its expiration time.
   *
   * The window is always relative to the entry’s own expiration moment,
   * whether that expiration comes from an explicit `ttl` or from the
   * cache’s default TTL.
   *
   * If omitted, the cache-level default stale window is used.
   */
  staleWindow?: number;

  /**
   * Optional tags associated with this entry.
   */
  tags?: string | string[];
}
