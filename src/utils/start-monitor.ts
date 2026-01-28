import { DEFAULT_MAX_PROCESS_MEMORY_MB, WORST_SWEEP_INTERVAL } from "../defaults";

import { getProcessMemoryLimit } from "./get-process-memory-limit";
import {
  createMonitorObserver,
  type PerformanceMetrics,
  type ReturnCreateMonitor,
} from "./process-monitor";

let _monitorInstance: ReturnCreateMonitor | null = null;

/** Latest collected metrics from the monitor */
export let _metrics: PerformanceMetrics | null;

/** Maximum memory limit for the monitor (in MB) */
export let maxMemoryLimit: number = DEFAULT_MAX_PROCESS_MEMORY_MB;

export function startMonitor(): void {
  if (__BROWSER__) {
    // Ignore monitor in browser environments
    return;
  }

  if (!_monitorInstance) {
    try {
      const processMemoryLimit = getProcessMemoryLimit();

      if (processMemoryLimit && processMemoryLimit > 0) {
        maxMemoryLimit = (processMemoryLimit / 1024 / 1024) * 0.8; // Use 80% of the effective limit
      }
    } catch {
      // TODO: proper logger
      // Ignore errors and use default
      // console.log("error getProcessMemoryLimit:", e);
    }

    _monitorInstance = createMonitorObserver({
      callback(metrics) {
        _metrics = metrics;
      },
      interval: WORST_SWEEP_INTERVAL,
      maxMemory: maxMemoryLimit, // 1 GB
    });

    _monitorInstance.start();
  }
}
