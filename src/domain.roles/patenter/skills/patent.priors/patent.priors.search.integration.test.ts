import { spawnSync } from 'child_process';
import * as path from 'path';
import { given, then, when } from 'test-fns';

/**
 * BLOCKER: USPTO_ODP_API_KEY required for live API tests
 *
 * get a key at: https://data.uspto.gov
 * then: rhx keyrack fill (or export USPTO_ODP_API_KEY=your_key)
 */
describe('patent.priors.search.sh', () => {
  const scriptPath = path.join(__dirname, 'patent.priors.search.sh');

  // fail fast if API key not set
  beforeAll(() => {
    if (!process.env.USPTO_ODP_API_KEY) {
      throw new Error(
        'USPTO_ODP_API_KEY required. get a key at https://data.uspto.gov',
      );
    }
  });

  const runSearch = (input: {
    searchArgs: string[];
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.searchArgs], {
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
        const result = runSearch({
          searchArgs: ['--help'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage');
        expect(result.stdout).toContain('--query');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case2] query too short', () => {
    when('[t0] search is called with 2 char query', () => {
      then('error is returned', () => {
        const result = runSearch({
          searchArgs: ['--query', 'ab'],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('too short');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case3] no query provided', () => {
    when('[t0] search is called without --query', () => {
      then('error is returned', () => {
        const result = runSearch({
          searchArgs: [],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('query required');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case4] valid search query', () => {
    when('[t0] search is called with specific terms', () => {
      then('search executes and returns results or empty set', () => {
        const result = runSearch({
          searchArgs: [
            '--query',
            'neural network model compression distillation',
          ],
        });

        // exit 0 = success (results found)
        // exit 1 = malfunction (API unavailable)
        expect([0, 1]).toContain(result.exitCode);
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('🦅');
          expect(result.stdout).toContain('patent.priors.search');
        }
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case5] query too long', () => {
    when('[t0] search is called with >1000 char query', () => {
      then('error is returned', () => {
        const longQuery = 'a'.repeat(1001);
        const result = runSearch({
          searchArgs: ['--query', longQuery],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('too long');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case6] vague query with few keywords', () => {
    when('[t0] search is called with only 2 keywords', () => {
      then('search executes with vague query alert', () => {
        const result = runSearch({
          searchArgs: ['--query', 'neural network'],
        });

        // exit 0 = success (results found)
        // exit 1 = malfunction (API unavailable)
        expect([0, 1]).toContain(result.exitCode);
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('🦅');
          expect(result.stdout).toContain('vague');
        }
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case7] unknown argument', () => {
    when('[t0] search is called with invalid flag', () => {
      then('error is returned', () => {
        const result = runSearch({
          searchArgs: ['--invalid-flag', 'value'],
        });

        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown argument');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });
});
