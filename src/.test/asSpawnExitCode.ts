import type { SpawnSyncReturns } from 'child_process';

/**
 * .what = read a spawnSync result as an exit code, and fail loud on a kill
 * .why  = a child killed at its timeout has `status === null` and a
 *         `signal`. the bare `status ?? 1` reads that kill as exit 1,
 *         which looks just like the skill's own malfunction exit, and
 *         sends the reader to debug the skill instead of the budget
 */
export const asSpawnExitCode = (input: {
  result: Pick<SpawnSyncReturns<string>, 'status' | 'signal'>;
  timeout: number;
}): number => {
  // a kill is the harness budget, never a skill verdict
  if (input.result.signal)
    throw new Error(
      `spawn killed by ${input.result.signal} after timeout ${input.timeout}ms; widen the test budget, the skill did not exit`,
    );

  // no signal and no status is a spawn that never ran
  if (input.result.status === null)
    throw new Error('spawn returned no status and no signal; it never ran');

  return input.result.status;
};
