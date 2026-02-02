import type { CacheState } from "../types";

import { isExpired } from "./validators";

/**
 * Returns the remaining stale TTL in milliseconds for a given key.
 * @param state - The cache state.
 * @param key - The key to check.
 * @param now - Optional timestamp override (defaults to Date.now()).
 * @returns The remaining stale TTL in milliseconds, or 0 if the key does not exist, has no stale TTL, or has expired.
 */
export const remainingStaleWindow = (
  state: CacheState,
  key: string,

  /** @internal */
  now: number = Date.now(),
): number => {
  const entry = state.store.get(key);
  if (!entry || isExpired(entry[0], now)) return 0;

  const staleExpiresAt = entry[0][2];
  return Math.max(0, staleExpiresAt - now);
};
