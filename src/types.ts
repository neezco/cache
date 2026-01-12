/**
 * Base configuration shared between CacheOptions and CacheState.
 * Centralizes all repeated fields to avoid duplication.
 */
export interface CacheConfigBase {
  /**
   * Callback invoked when a key expires naturally.
   * @param key - The expired key.
   * @param value - The value associated with the expired key.
   */
  onExpire?: (key: string, value: unknown) => void;

  /**
   * Callback invoked when a key is deleted, either manually or due to expiration.
   * @param key - The deleted key.
   * @param value - The value of the deleted key.
   * @param reason - The reason for deletion ('manual' or 'expired').
   */
  onDelete?: (key: string, value: unknown, reason: "manual" | "expired") => void;

  /**
   * Default TTL (Time-To-Live) in milliseconds for entries without explicit TTL.
   * @default 300_000 (5 minutes)
   */
  defaultTTL: number;

  /**
   * Default stale TTL in milliseconds for entries without explicit stale TTL.
   * @default 0 (no stale period)
   */
  defaultStaleTTL: number;

  /**
   * Maximum number of entries the cache can hold.
   * @default 100_000
   */
  maxLength: number;

  /**
   * Maximum size of the cache in MB, based on process memory usage.
   * @default 512
   */
  maxSize: number;

  /**
   * Interval in milliseconds between sweep operations to check for expired keys.
   * @default 250
   */
  sweepIntervalMs: number;

  /**
   * Number of keys to process in each batch before yielding to the event loop.
   *
   * This does NOT limit the total number of keys processed in a sweep.
   * As long as there is remaining sweepTimeBudgetMs, the sweeper will run
   * multiple batches, yielding after each one to avoid blocking the event loop.
   *
   * @default 500
   */
  keysPerBatch: number;

  /**
   * Ratio of expired keys to target during sweeps.
   * @default 0.3
   */
  sweepExpiredRatio: number;

  /**
   * Maximum amount of time (in milliseconds) that a sweep cycle
   * is allowed to run.
   *
   * @default 30
   */
  sweepTimeBudgetMs: number;
}

/**
 * Public configuration options for the TTL cache.
 * All fields are optional and override the defaults.
 *
 * Declared as a `type` instead of an `interface` to avoid
 * the ESLint rule @typescript-eslint/no-empty-object-type.
 */
export type CacheOptions = Partial<CacheConfigBase>;

/**
 * Represents a single cache entry.
 */
export interface CacheEntry {
  /** The stored value. */
  v: unknown;

  /** expiresAt: Absolute timestamp when the entry becomes invalid (Date.now() + TTL). */
  e: number;

  /** staleExpiresAt: Absolute timestamp when the entry stops being stale (Date.now() + staleTTL). */
  se?: number;
}

/**
 * Internal state of the TTL cache.
 * Extends the base configuration and adds internal-only fields.
 */
export interface CacheState extends CacheConfigBase {
  /** Map storing key-value entries. */
  store: Map<string, CacheEntry>;

  /** Background sweeper timer. */
  sweeper?: NodeJS.Timeout;

  /** Current memory size in bytes. */
  currentSize: number;

  /** Whether process.memoryUsage is available. */
  processMemory: boolean;

  /** Iterator for sweeping keys. */
  //   _sweepIter: Generator<string | null, void, unknown>;
}
