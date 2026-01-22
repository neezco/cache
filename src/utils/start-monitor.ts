import { createMonitorObserver, type ReturnCreateMonitor } from "./process-monitor";

let monitorInstance: ReturnCreateMonitor | null = null;

if (!monitorInstance) {
  monitorInstance = createMonitorObserver();

  monitorInstance.start();
}

export const monitor: ReturnCreateMonitor = monitorInstance;
