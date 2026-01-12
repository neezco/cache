import type { CacheState } from "../types";

export const enum DeleteReason {
  MANUAL = "manual",
  EXPIRED = "expired",
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
  reason: DeleteReason = DeleteReason.MANUAL,
): boolean => {
  const onDelete = state.onDelete;

  if (!onDelete) {
    return state.store.delete(key);
  }

  const entry = state.store.get(key);
  if (!entry) return false;

  state.store.delete(key);
  state.onDelete?.(key, entry.v, reason);

  return true;
};
