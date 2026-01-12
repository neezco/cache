import type { CacheOptions, CacheState } from "../types";

/**
 * Creates the initial state for the TTL cache.
 * @param options - Configuration options for the cache.
 * @returns The initial cache state.
 */
export const createCache = (options: CacheOptions = {}): CacheState => {
  const {
    onExpire,
    onDelete,
    defaultTTL = 1000 * 60 * 5, // 5 minutes
    maxLength = 100_000,
    maxSize = 512, // MB
    sweepIntervalMs = 250,
    keysPerBatch = 500,
    sweepTimeBudgetMs = 30,
    sweepExpiredRatio = 0.3,
    defaultStaleTTL = 0,
  } = options;

  const state: CacheState = {
    store: new Map(),
    sweeper: undefined,
    currentSize: 0,
    processMemory: false,
    onExpire,
    onDelete,
    maxLength,
    maxSize,
    defaultTTL,
    defaultStaleTTL,
    sweepTimeBudgetMs,
    sweepExpiredRatio,
    sweepIntervalMs,
    keysPerBatch,
  };

  return state;
};
