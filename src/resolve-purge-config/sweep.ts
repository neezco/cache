import { DEFAULT_PURGE_STALE_ON_SWEEP_THRESHOLD } from "../defaults";
import type { PurgeMode } from "../types";

import { resolvePurgeMode } from "./core";

/**
 * Resolves the purgeStaleOnSweep mode based on available configuration.
 *
 * Returns:
 * - User value if valid (boolean always valid; numeric must satisfy all conditions)
 * - Configuration default if user value is invalid
 *
 * Validation for numeric user values (0-1 thresholds):
 * - Must be in range: 0 < value ≤ 1
 * - Metric must support thresholds: not 'fixed'
 * - Metric must have required limits: 'size' needs maxSize, 'memory' needs maxMemorySize, 'higher' needs both
 *
 * Configuration defaults:
 * - With limits matching metric: 0.5 (50% purge threshold)
 * - Without matching limits: true (always purge to prevent unbounded growth)
 *
 * @param config - Configuration with limits, purgeResourceMetric, and optional userValue
 * @returns Valid purgeStaleOnSweep value (boolean or threshold 0-1)
 *
 * @internal
 */
export const resolvePurgeStaleOnSweep = (config: {
  limits: {
    maxSize: number;
    maxMemorySize: number;
  };
  purgeResourceMetric: "size" | "memory" | "higher" | "fixed";
  userValue?: PurgeMode;
}): PurgeMode =>
  resolvePurgeMode(
    config.limits,
    {
      purgeResourceMetric: config.purgeResourceMetric,
      operation: "purgeStaleOnSweep",
    },
    {
      withLimits: DEFAULT_PURGE_STALE_ON_SWEEP_THRESHOLD,
      withoutLimits: true,
    },
    config.userValue,
  );
