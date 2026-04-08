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

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('too short');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case3] no query provided', () => {
    when('[t0] search is called without --query', () => {
      then('error is returned', () => {
        const result = runSearch({
          searchArgs: [],
        });

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('query required');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case4] valid search query (LIVE API)', () => {
    // CRITICAL: this test MUST hit the live USPTO API
    // if this test passes with a mock, the test suite is broken
    when('[t0] search is called with specific terms', () => {
      then('real patents are returned from live API', () => {
        // use a simple query that matches the API documentation example
        const result = runSearch({
          searchArgs: ['--query', 'wireless'],
        });

        // DEBUG: show output on failure
        if (result.exitCode !== 0) {
          console.log('DEBUG stdout:', result.stdout);
          console.log('DEBUG stderr:', result.stderr);
        }

        // MUST succeed - exit 0 required
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('patent.priors.search');
        // verify results returned (shows results count or has patents listed)
        expect(result.stdout).not.toContain('(none found)');
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

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('too long');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case6] vague query with few keywords (LIVE API)', () => {
    // CRITICAL: this test MUST hit the live USPTO API
    when('[t0] search is called with only 2 keywords', () => {
      then('results returned with vague query alert', () => {
        const result = runSearch({
          searchArgs: ['--query', 'neural network'],
        });

        // MUST succeed - exit 0 required
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('vague');
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

  // multi-domain tests: prove search works across different patent categories
  // IMPORTANT: use technical patent terminology, not consumer terms
  // see blueprint: USPTO API returns OR matches, patent titles use technical terms

  given('[case8] fastener driver search (LIVE API)', () => {
    // tests tool patents: drills, impact drivers, screwdrivers
    when('[t0] search is called with technical term', () => {
      then('real fastener/driver patents are returned', () => {
        const result = runSearch({
          searchArgs: ['--query', 'fastener driver', '--limit', '10'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('patent.priors.search');
        // should find patents with "fastener" or "driver" in title
        expect(result.stdout).not.toContain('(none found)');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case9] rotary saw search (LIVE API)', () => {
    // tests tool patents: saws, blades
    when('[t0] search is called with technical term', () => {
      then('real saw/rotary patents are returned', () => {
        const result = runSearch({
          searchArgs: ['--query', 'rotary saw', '--limit', '10'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('patent.priors.search');
        // should find patents with "rotary" or "saw" in title
        expect(result.stdout).not.toContain('(none found)');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given('[case10] wireless transceiver search (LIVE API)', () => {
    // tests electronics patents: radio, wireless tech
    when('[t0] search is called with technical term', () => {
      then('real wireless/transceiver patents are returned', () => {
        const result = runSearch({
          searchArgs: ['--query', 'wireless transceiver', '--limit', '10'],
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('patent.priors.search');
        // should find patents with "wireless" or "transceiver" in title
        expect(result.stdout).not.toContain('(none found)');
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });
});
