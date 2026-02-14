import type { PurgeMode } from "../types";

import { checkRequiredLimits, isValidLimit } from "./validators";
import { warnInvalidPurgeMode } from "./warnings";

/**
 * Generic purge mode resolver that handles both get and sweep operations.
 *
 * Resolves valid user values or returns appropriate defaults based on:
 * - Available configuration limits (maxSize, maxMemorySize)
 * - Purge resource metric support (size, memory, higher, fixed)
 * - User-provided threshold validity (0 < value ≤ 1)
 *
 * Behavior:
 * - Boolean values (true/false): always valid, returns as-is
 * - Numeric thresholds (0-1): validated against 3 conditions:
 *   1. Range validation: must be 0 < value ≤ 1
 *   2. Metric compatibility: metric must support thresholds (not 'fixed')
 *   3. Configuration requirement: metric's required limits must be set
 * - Invalid numerics: logs warning and returns configuration default
 *
 * Defaults:
 * - With required limits: threshold-based (0.80 for get, 0.5 for sweep)
 * - Without required limits: boolean (false for get, true for sweep)
 *
 * @internal
 */
export const resolvePurgeMode = (
  limits: {
    maxSize: number;
    maxMemorySize: number;
  },
  config: {
    purgeResourceMetric: "size" | "memory" | "higher" | "fixed";
    operation: "purgeStaleOnGet" | "purgeStaleOnSweep";
  },
  defaults: {
    withLimits: number;
    withoutLimits: boolean;
  },
  userValue?: PurgeMode,
): PurgeMode => {
  const hasSizeLimit = isValidLimit(limits.maxSize);
  const hasMemoryLimit = isValidLimit(limits.maxMemorySize);
  const hasRequiredLimits = checkRequiredLimits(config.purgeResourceMetric, {
    hasSizeLimit,
    hasMemoryLimit,
  });

  const fallback = hasRequiredLimits ? defaults.withLimits : defaults.withoutLimits;

  if (userValue !== undefined) {
    // Compute validity conditions once
    const isNumeric = typeof userValue === "number";
    const isOutOfRange = isNumeric && (userValue <= 0 || userValue > 1);
    const isIncompatibleWithMetric = isNumeric && config.purgeResourceMetric === "fixed";
    const isMissingLimits = isNumeric && !hasRequiredLimits;

    // Only warn if any condition is invalid
    if (isOutOfRange || isIncompatibleWithMetric || isMissingLimits) {
      warnInvalidPurgeMode(
        {
          mode: userValue,
          metric: config.purgeResourceMetric,
          operation: config.operation,
          fallback,
        },
        {
          isOutOfRange,
          isIncompatibleWithMetric,
          isMissingLimits,
        },
      );
      return fallback;
    }

    return userValue;
  }

  return fallback;
};
