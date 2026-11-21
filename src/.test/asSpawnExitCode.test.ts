import { spawnSync } from 'child_process';
import { getError } from 'test-fns';

import { asSpawnExitCode } from './asSpawnExitCode';

describe('asSpawnExitCode', () => {
  test('returns the exit status of a child that exited', () => {
    expect(
      asSpawnExitCode({ result: { status: 3, signal: null }, timeout: 1000 }),
    ).toEqual(3);
  });

  test('returns 0 for a clean exit', () => {
    expect(
      asSpawnExitCode({ result: { status: 0, signal: null }, timeout: 1000 }),
    ).toEqual(0);
  });

  test('⭐ names the signal and the budget for a child killed at its timeout', async () => {
    const error = await getError(async () =>
      asSpawnExitCode({
        result: { status: null, signal: 'SIGTERM' },
        timeout: 30000,
      }),
    );
    expect(error.message).toContain('SIGTERM');
    expect(error.message).toContain('30000ms');
  });

  test('⭐ a real child that outlives a tiny timeout is reported as a kill, never as exit 1', async () => {
    const result = spawnSync('sleep', ['5'], { encoding: 'utf-8', timeout: 50 });
    const error = await getError(async () =>
      asSpawnExitCode({ result, timeout: 50 }),
    );
    expect(error.message).toContain('spawn killed by SIGTERM');
  });
});
