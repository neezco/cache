import { DEFAULT_MAX_EXPIRED_RATIO, MINIMAL_EXPIRED_RATIO } from "../defaults";
import { interpolate } from "../utils/interpolate";
import { _metrics } from "../utils/start-monitor";

/**
 * Calculates the optimal maximum expired ratio based on current memory utilization.
 *
 * This function interpolates between `maxAllowExpiredRatio` and `MINIMAL_EXPIRED_RATIO`
 * depending on the memory usage reported by `_metrics`. At low memory usage (0%),
 * the optimal ratio equals `maxAllowExpiredRatio`. At high memory usage
 * the optimal ratio decreases toward `MINIMAL_EXPIRED_RATIO`.
 *
 * @param maxAllowExpiredRatio - The maximum allowed expired ratio at minimal memory usage.
 * Defaults to `DEFAULT_MAX_EXPIRED_RATIO`.
 * @returns A normalized value between 0 and 1 representing the optimal expired ratio.
 */
export function calculateOptimalMaxExpiredRatio(
  maxAllowExpiredRatio: number = DEFAULT_MAX_EXPIRED_RATIO,
): number {
  const optimalExpiredRatio = interpolate({
    value: _metrics?.memory.utilization ?? 0,

    fromStart: 0, // baseline: memory usage ratio at 0%
    fromEnd: 1, // max: memory usage ratio at 100%

    toStart: maxAllowExpiredRatio, // allowed ratio at minimal memory usage
    toEnd: MINIMAL_EXPIRED_RATIO, // allowed ratio at high memory usage
  });

  // At 0% memory usage, the optimalExpiredRatio equals maxAllowExpiredRatio.
  // At 100% memory usage, the optimalExpiredRatio equals MINIMAL_EXPIRED_RATIO.

  return Math.min(1, Math.max(0, optimalExpiredRatio));
}
