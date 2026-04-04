import { spawnSync } from 'child_process';
import * as path from 'path';
import { given, then, when } from 'test-fns';

/**
 * BLOCKER: USPTO_ODP_API_KEY required for live API tests
 *
 * get a key at: https://data.uspto.gov
 * then: rhx keyrack fill (or export USPTO_ODP_API_KEY=your_key)
 */
describe('patent.priors.fetch.sh', () => {
  const scriptPath = path.join(__dirname, 'patent.priors.fetch.sh');

  // fail fast if API key not set
  beforeAll(() => {
    if (!process.env.USPTO_ODP_API_KEY) {
      throw new Error(
        'USPTO_ODP_API_KEY required. get a key at https://data.uspto.gov',
      );
    }
  });

  const runFetch = (input: {
    fetchArgs: string[];
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.fetchArgs], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000, // 60s timeout for API calls
      env: process.env, // explicitly pass env for API key
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  given('[case1] --help', () => {
    when('[t0] help is requested', () => {
      then('usage is shown', () => {
        const result = runFetch({
          fetchArgs: ['--help'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage');
        expect(result.stdout).toContain('--exid');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] no exid provided', () => {
    when('[t0] fetch is called without --exid', () => {
      then('error is returned', () => {
        const result = runFetch({
          fetchArgs: [],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('exid required');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] invalid exid format', () => {
    when('[t0] fetch is called with malformed exid', () => {
      then('error is returned', () => {
        const result = runFetch({
          fetchArgs: ['--exid', 'INVALID123'],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('invalid');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] valid exid', () => {
    when('[t0] fetch is called with valid USPTO exid', () => {
      then('fetch executes', () => {
        const result = runFetch({
          fetchArgs: ['--exid', 'US7654321B2'],
        });

        // exit 0 = success (cached or fetched)
        // exit 1 = malfunction (API unavailable)
        // exit 2 = constraint (patent not found)
        expect([0, 1, 2]).toContain(result.exitCode);
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('🦅');
          expect(result.stdout).toContain('patent.priors.fetch');
        }
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case5] valid exid but patent not found', () => {
    when('[t0] fetch is called with nonexistent patent', () => {
      then('not found error is returned', () => {
        const result = runFetch({
          fetchArgs: ['--exid', 'US00000000A1'],
        });

        // exit 2 = constraint (patent not found or API error)
        // exit 1 = malfunction (network error)
        expect([1, 2]).toContain(result.exitCode);
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case6] unknown argument', () => {
    when('[t0] fetch is called with invalid flag', () => {
      then('error is returned', () => {
        const result = runFetch({
          fetchArgs: ['--invalid-flag', 'value'],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown argument');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });
});
