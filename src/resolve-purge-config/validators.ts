/**
 * Validates if a numeric value is a valid positive limit.
 * @internal
 */
export const isValidLimit = (value: number): boolean => Number.isFinite(value) && value > 0;

/**
 * Checks if the required limits are configured for the given metric.
 * @internal
 */
export const checkRequiredLimits = (
  metric: "size" | "memory" | "higher" | "fixed",
  limitStatus: {
    hasSizeLimit: boolean;
    hasMemoryLimit: boolean;
  },
): boolean => {
  if (metric === "fixed") return false;
  if (metric === "size") return limitStatus.hasSizeLimit;
  if (metric === "memory") return limitStatus.hasMemoryLimit;
  if (metric === "higher") return limitStatus.hasSizeLimit && limitStatus.hasMemoryLimit;
  return false;
};
