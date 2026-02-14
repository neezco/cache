import type { PurgeMode } from "../types";

import { formatPurgeValue } from "./formatters";
import { getLimitRequirementText } from "./formatters";

/**
 * Warns user about invalid purge configuration.
 * Only called when user-provided threshold value is invalid.
 *
 * @internal
 */
export const warnInvalidPurgeMode = (
  config: {
    /** User-provided purge mode value (threshold or boolean). */
    mode: PurgeMode;
    /** Selected purge resource metric. */
    metric: "size" | "memory" | "higher" | "fixed";
    /** Operation that triggered validation: purgeStaleOnGet or purgeStaleOnSweep. */
    operation: "purgeStaleOnGet" | "purgeStaleOnSweep";
    /** Default fallback value when user value is invalid. */
    fallback: PurgeMode;
  },
  invalidConditions: {
    /** Numeric value outside valid threshold range (0 < value ≤ 1). */
    isOutOfRange: boolean;
    /** Numeric threshold used with unsupported metric='fixed'. */
    isIncompatibleWithMetric: boolean;
    /** Numeric threshold without required configuration limits for metric. */
    isMissingLimits: boolean;
  },
): void => {
  // Threshold range validation: must be 0 < value <= 1
  if (invalidConditions.isOutOfRange) {
    console.warn(
      `[Cache] ${config.operation}: Set to ${formatPurgeValue(config.mode)} with purgeResourceMetric '${config.metric}'.\n` +
        `  ⚠ Invalid: Numeric threshold must be between 0 (exclusive) and 1 (inclusive).\n` +
        `  ✓ Fallback: ${config.operation} = ${formatPurgeValue(config.fallback)}, purgeResourceMetric = '${config.metric}'`,
    );
    return;
  }

  // Metric compatibility: 'fixed' metric doesn't support threshold values
  if (invalidConditions.isIncompatibleWithMetric) {
    console.warn(
      `[Cache] ${config.operation}: Set to ${formatPurgeValue(config.mode)} with purgeResourceMetric '${config.metric}'.\n` +
        `  ⚠ Not supported: Numeric thresholds don't work with purgeResourceMetric 'fixed'.\n` +
        `  ✓ Fallback: ${config.operation} = ${formatPurgeValue(config.fallback)}, purgeResourceMetric = '${config.metric}'`,
    );
    return;
  }

  // Configuration validation: metric requires matching limits
  if (invalidConditions.isMissingLimits) {
    const requirement = getLimitRequirementText(config.metric);
    console.warn(
      `[Cache] ${config.operation}: Set to ${formatPurgeValue(config.mode)} with purgeResourceMetric '${config.metric}'.\n` +
        `  ⚠ Not supported: ${requirement}\n` +
        `  ✓ Fallback: ${config.operation} = ${formatPurgeValue(config.fallback)}, purgeResourceMetric = '${config.metric}'`,
    );
  }
};
