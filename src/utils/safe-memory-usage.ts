/**
 * Safely gets the current memory usage of the Node.js process.
 * Returns null if the information is not available.
 */
export function safeGetMemoryUsage(): NodeJS.MemoryUsage | null {
  if (typeof process === "undefined") return null;

  if (typeof process.memoryUsage !== "function") return null;

  try {
    return process.memoryUsage();
  } catch {
    return null;
  }
}
