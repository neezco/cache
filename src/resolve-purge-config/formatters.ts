import type { PurgeMode } from "../types";

/**
 * Gets the requirement text for a metric when limits are missing.
 * @internal
 */
export const getLimitRequirementText = (metric: "size" | "memory" | "higher" | "fixed"): string => {
  if (metric === "fixed") return "Numeric thresholds are not supported (metric is 'fixed')";
  if (metric === "size") return "'maxSize' must be a valid positive number";
  if (metric === "memory") return "'maxMemorySize' must be a valid positive number";
  if (metric === "higher")
    return "both 'maxSize' and 'maxMemorySize' must be valid positive numbers";
  return "required configuration";
};

/**
 * Formats a purge mode value for display.
 * @internal
 */
export const formatPurgeValue = (mode: PurgeMode): string => {
  if (typeof mode === "number") return `threshold ${(mode * 100).toFixed(0)}%`;
  return `${mode}`;
};
