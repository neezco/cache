import type { CacheState } from "../types";
import { _mergeTimestamps } from "../utils/merge-timestamps";

import { DELETE_REASON, deleteKey } from "./delete";
import { isFresh, isStale } from "./validators";

/**
 * Retrieves a value from the cache if the entry is valid.
 * @param state - The cache state.
 * @param key - The key to retrieve.
 * @param now - Optional timestamp override (defaults to Date.now()).
 * @returns The cached value if valid, null otherwise.
 */
export const get = (state: CacheState, key: string, now: number = Date.now()): unknown => {
  const entry = state.store.get(key);

  if (!entry) return undefined;

  const mergedTimestamps = _mergeTimestamps(state, entry);

  if (isFresh(mergedTimestamps, now)) return entry[1];

  if (isStale(mergedTimestamps, now)) {
    if (state.purgeStaleOnGet) {
      deleteKey(state, key, DELETE_REASON.STALE);
    }
    return entry[1];
  }

  // If it expired, always delete it
  deleteKey(state, key, DELETE_REASON.EXPIRED);

  return undefined;
};
