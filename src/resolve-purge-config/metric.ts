import { isValidLimit } from "./validators";

/**
 * Resolves the purge resource metric based on available limits and environment.
 *
 * - Browser: returns "size" if maxSize is valid, otherwise "fixed"
 * - Backend with both maxSize and maxMemorySize: returns "higher"
 * - Backend with only maxMemorySize: returns "memory"
 * - Backend with only maxSize: returns "size"
 * - Backend with no limits: returns "fixed"
 *
 * @param config - Configuration object with maxSize and maxMemorySize limits
 * @returns The appropriate purge resource metric for this configuration
 *
 * @internal
 */
export const resolvePurgeResourceMetric = (config: {
  maxSize: number;
  maxMemorySize: number;
}): "size" | "memory" | "higher" | "fixed" => {
  const limitStatus = {
    hasSizeLimit: isValidLimit(config.maxSize),
    hasMemoryLimit: isValidLimit(config.maxMemorySize),
  };

  if (__BROWSER__) {
    return limitStatus.hasSizeLimit ? "size" : "fixed";
  }

  if (limitStatus.hasSizeLimit && limitStatus.hasMemoryLimit) return "higher";
  if (limitStatus.hasMemoryLimit) return "memory";
  if (limitStatus.hasSizeLimit) return "size";

  return "fixed";
};
