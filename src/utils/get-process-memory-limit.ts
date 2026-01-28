import fs from "fs";
import v8 from "v8";

/**
 * Reads a number from a file.
 * @param path File path to read the number from.
 * @returns The number read from the file, or null if reading fails.
 */
function readNumber(path: string): number | null {
  try {
    const raw = fs.readFileSync(path, "utf8").trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Gets the memory limit imposed by cgroups, if any.
 * @return The memory limit in bytes, or null if no limit is found.
 */
function getCgroupLimit(): number | null {
  // cgroup v2
  const v2 = readNumber("/sys/fs/cgroup/memory.max");
  if (v2 !== null) return v2;

  // cgroup v1
  const v1 = readNumber("/sys/fs/cgroup/memory/memory.limit_in_bytes");
  if (v1 !== null) return v1;

  return null;
}

/**
 * Gets the effective memory limit for the current process, considering both V8 heap limits and cgroup limits.
 * @returns The effective memory limit in bytes.
 */
export function getProcessMemoryLimit(): number {
  const heapLimit = v8.getHeapStatistics().heap_size_limit;
  const cgroupLimit = getCgroupLimit();

  if (cgroupLimit && cgroupLimit > 0 && cgroupLimit < Infinity) {
    return Math.min(heapLimit, cgroupLimit);
  }

  return heapLimit;
}
