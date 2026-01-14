import { DELETE_REASON, deleteKey } from "../cache/delete";
import { isExpired, isStale } from "../cache/validators";
import type { CacheState } from "../types";

/**
 * Performs a sweep operation on the cache to remove expired and optionally stale entries.
 * Uses a linear scan with a saved pointer to resume from the last processed key.
 * @param state - The cache state.
 */
export const sweep = async (
  state: CacheState,

  /** @internal */
  utilities: SweepUtilities = {},
): Promise<void> => {
  const { schedule = defaultSchedule, yieldFn = defaultYieldFn, now = Date.now() } = utilities;
  let processed = 0;
  const startTime = now;

  // Ensure iterator exists
  if (!state._sweepIter) {
    state._sweepIter = state.store.entries();
  }

  while (true) {
    const next = state._sweepIter.next();

    // Iterator exhausted → reset and stop this cycle
    if (next.done) {
      state._sweepIter = state.store.entries();
      break;
    }

    const [key, entry] = next.value;

    if (isExpired(entry, now)) {
      deleteKey(state, key, DELETE_REASON.EXPIRED);
    } else if (isStale(entry, now) && state.purgeStaleOnSweep) {
      deleteKey(state, key, DELETE_REASON.STALE);
    }

    processed++;

    if (Date.now() - startTime > state.sweepTimeBudgetMs) {
      break;
    }

    if (processed >= state.keysPerBatch) {
      processed = 0;

      // Yield to release event loop
      await yieldFn();
    }
  }

  // Schedule next sweep
  schedule(() => void sweep(state, utilities), state.sweepIntervalMs);
};

const defaultSchedule: scheduleType = (fn, ms) => {
  setTimeout(fn, ms);
};
export const defaultYieldFn: yieldFnType = () => new Promise(resolve => setImmediate(resolve));

type scheduleType = (fn: () => void, ms: number) => void;
type yieldFnType = () => Promise<void>;
interface SweepUtilities {
  /**
   *  Default scheduling function using setTimeout.
   *  This can be overridden for testing.
   *  @internal
   */
  schedule?: scheduleType;

  /**
   *  Default yielding function using setImmediate.
   *  This can be overridden for testing.
   *  @internal
   */
  yieldFn?: yieldFnType;

  /** Current timestamp for testing purposes. */
  now?: number;
}
