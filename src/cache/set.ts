import type { CacheState, CacheEntry } from "../types";
import { _metrics } from "../utils/start-monitor";

/**
 * Sets or updates a value in the cache with TTL and an optional stale window.
 *
 * @param state - The cache state.
 * @param input - Cache entry definition (key, value, ttl, staleWindow, tags).
 * @param now - Optional timestamp override used as the base time (defaults to Date.now()).
 * @returns True if the entry was created or updated, false if rejected due to limits or invalid input.
 *
 * @remarks
 * - `ttl` defines when the entry becomes expired.
 * - `staleWindow` defines how long the entry may still be served as stale
 *   after the expiration moment (`now + ttl`).
 * - Returns false if value is `undefined` (entry ignored, existing value untouched).
 * - Returns false if new entry would exceed `maxSize` limit (existing keys always allowed).
 * - Returns false if new entry would exceed `maxMemorySize` limit (existing keys always allowed).
 * - Returns true if entry was set or updated (or if existing key was updated at limit).
 */
export const setOrUpdate = (
  state: CacheState,
  input: CacheSetOrUpdateInput,

  /** @internal */
  now: number = Date.now(),
): boolean => {
  const { key, value, ttl: ttlInput, staleWindow: staleWindowInput, tags } = input;

  if (value === undefined) return false; // Ignore undefined values, leaving existing entry intact if it exists
  if (key == null) throw new Error("Missing key.");
  if (state.size >= state.maxSize && !state.store.has(key)) {
    // Ignore new entries when max size is reached, but allow updates to existing keys
    return false;
  }
  if (
    !__BROWSER__ &&
    _metrics?.memory.total.rss &&
    _metrics?.memory.total.rss >= state.maxMemorySize * 1024 * 1024 &&
    !state.store.has(key)
  ) {
    // Ignore new entries when max memory size is reached, but allow updates to existing keys
    return false;
  }

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
  return true;
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
