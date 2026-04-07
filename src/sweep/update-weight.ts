import { _instancesCache } from "../cache/create-cache";

import { calculateOptimalMaxExpiredRatio } from "./calculate-optimal-max-expired-ratio";

/**
 * Updates the sweep weight (`_sweepWeight`) for each cache instance.
 *
 * The sweep weight determines the probability that an instance will be selected
 * for a cleanup (sweep) process. It is calculated based on the store size and
 * the ratio of expired keys.
 *
 * This function complements (`_selectInstanceToSweep`), which is responsible
 * for selecting the correct instance based on the weights assigned here.
 *
 * ### Sweep systems:
 * 1. **Normal sweep**
 *    - Runs whenever the percentage of expired keys exceeds the allowed threshold
 *      calculated by `calculateOptimalMaxExpiredRatio`.
 *    - It is the main cleanup mechanism and is applied proportionally to the
 *      store size and the expired‑key ratio.
 *
 * 2. **Round‑robin sweep (minimal control)**
 *    - Always runs, even if the expired ratio is low or memory usage does not
 *      require it.
 *    - Processes a very small number of keys per instance, much smaller than
 *      the normal sweep.
 *    - Its main purpose is to ensure that all instances receive at least a
 *      periodic weight update and minimal expired‑key control.
 *
 * @returns The total accumulated sweep weight across all cache instances.
 */
export function _updateWeightSweep(): number {
  let totalSweepWeight = 0;

  for (const instCache of _instancesCache) {
    if (instCache.store.size <= 0) {
      // Empty instance → no sweep weight needed, skip sweep for this instance.
      instCache._sweepWeight = 0;
      continue;
    }

    const expiredRatio = instCache._expiredRatio;
    if (!__BROWSER__) {
      // In non‑browser environments, compute an optimal maximum allowed ratio.
      const optimalMaxExpiredRatio = calculateOptimalMaxExpiredRatio(
        instCache._maxAllowExpiredRatio,
      );

      if (expiredRatio <= optimalMaxExpiredRatio) {
        // If memory usage allows it and the expired ratio is low,
        // this sweep can be skipped. The reduced round‑robin sweep will still run.
        instCache._sweepWeight = 0;
        continue;
      }
    }

    // Normal sweep: weight proportional to store size and expired ratio.
    instCache._sweepWeight = instCache.store.size * expiredRatio;
    totalSweepWeight += instCache._sweepWeight;
  }

  return totalSweepWeight;
}
