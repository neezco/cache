import type { CacheState } from "../types";

export const enum DELETE_REASON {
  MANUAL = "manual",
  EXPIRED = "expired",
  STALE = "stale",
}

/**
 * Deletes a key from the cache.
 * @param state - The cache state.
 * @param key - The key.
 * @returns A boolean indicating whether the key was successfully deleted.
 */
export const deleteKey = (
  state: CacheState,
  key: string,
  reason: DELETE_REASON = DELETE_REASON.MANUAL,
): boolean => {
  const onDelete = state.onDelete;
  const onExpire = state.onExpire;

  if (!onDelete && !onExpire) {
    return state.store.delete(key);
  }

  const entry = state.store.get(key);
  if (!entry) return false;

  state.store.delete(key);
  state.onDelete?.(key, entry[1], reason);
  if (reason !== DELETE_REASON.MANUAL) {
    state.onExpire?.(key, entry[1], reason);
  }

  return true;
};
