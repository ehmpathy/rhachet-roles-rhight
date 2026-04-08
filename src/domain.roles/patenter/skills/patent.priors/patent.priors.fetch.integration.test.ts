import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, when } from 'test-fns';

/**
 * BLOCKER: credentials required for live API tests
 *
 * USPTO_ODP_API_KEY: get a key at https://data.uspto.gov
 * GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS: for OCR transcription
 *
 * locally: rhx keyrack unlock --owner ehmpath --env test
 * in CI: secrets injected via GitHub secrets
 */
describe('patent.priors.fetch.sh', () => {
  const scriptPath = path.join(__dirname, 'patent.priors.fetch.sh');

// fail fast if credentials not set
  beforeAll(() => {
    if (!process.env.USPTO_ODP_API_KEY) {
      throw new Error(
        'USPTO_ODP_API_KEY required. get a key at https://data.uspto.gov',
      );
    }
    if (!process.env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS) {
      throw new Error(
        'GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS required for OCR. run: rhx keyrack unlock --owner ehmpath --env test',
      );
    }
  });

  const runFetch = (input: {
    fetchArgs: string[];
    timeout?: number;
    cwd?: string;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.fetchArgs], {
      encoding: 'utf-8' as const,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: input.timeout ?? 60000, // 60s default, can override for slow tests
      env: process.env, // explicitly pass env for API key
      cwd: input.cwd, // optional: run in a specific directory (for genTempDir tests)
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

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('exid required');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case3] invalid exid format', () => {
    when('[t0] fetch is called with malformed exid', () => {
      then('error is returned', () => {
        const result = runFetch({
          // not 8 digits - publication number format is wrong
          fetchArgs: ['--exid', 'US7654321B2'],
        });

        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('invalid');
        expect(result.stderr).toContain('application number');
        expect(result.stderr).toMatchSnapshot();
      });
    });
  });

  given('[case4] valid exid (LIVE API)', () => {
    // CRITICAL: this test MUST hit the live USPTO API
    // if this test passes with a mock, the test suite is broken
    // note: USPTO API requires APPLICATION numbers (8 digits), not publication numbers
    const knownExid = '19399196';

    // use isolated temp directory to ensure fresh fetch (no stale cache)
    const tempDir = genTempDir({
      slug: 'fetch-live-api',
      git: true,
    });

    const cacheDir = path.join(tempDir, '.cache', 'patents', knownExid);
    const metaPath = path.join(cacheDir, '0.overview.meta.json');

    when('[t0] fetch is called with valid USPTO exid', () => {
      then('patent is fetched from live API', () => {
        // fresh fetch requires metadata + doc + prosecution docs + OCR
        const result = runFetch({
          cwd: tempDir,
          fetchArgs: ['--exid', knownExid],
          timeout: 600000, // 10 minutes for full fetch + OCR
        });

        // DEBUG: always show stderr to diagnose document fetch issues
        if (result.stderr) {
          console.log('DEBUG stderr:', result.stderr);
        }
        if (result.exitCode !== 0) {
          console.log('DEBUG stdout:', result.stdout);
        }

        // MUST succeed - exit 0 required
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('🦅');
        expect(result.stdout).toContain('patent.priors.fetch');
        expect(result.stdout).toContain(knownExid);
        expect(result.stdout).toMatchSnapshot();
      });

      then('metadata cache file is created with raw USPTO response', () => {
        // verify metadata cache file exists
        expect(fs.existsSync(metaPath)).toBe(true);

        // verify cache contains raw USPTO API response (not parsed)
        // raw response has patentFileWrapperDataBag array
        const cached = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

        // raw USPTO response should be valid JSON object
        expect(typeof cached).toBe('object');
        expect(cached).not.toBeNull();

        // raw response should have patentFileWrapperDataBag (USPTO API structure)
        expect(cached.patentFileWrapperDataBag).toBeDefined();
      });

      then(
        'prosecution documents are fetched (PDFs and transcribed markdown)',
        () => {
          // 19399196 is an ungranted application (filed 2025-11-19), NOT a granted patent
          // so there's no .doc.xml - but prosecution documents should exist
          const docsDir = cacheDir;
          const files = fs.readdirSync(docsDir);

          // should have prosecution document PDFs (1.event.*.pdf files)
          const pdfFiles = files.filter(
            (f) => f.startsWith('1.event.') && f.endsWith('.pdf'),
          );
          expect(pdfFiles.length).toBeGreaterThan(0);

          // should have OCR transcribed markdown files (.md)
          const mdFiles = files.filter(
            (f) => f.startsWith('1.event.') && f.endsWith('.md'),
          );
          expect(mdFiles.length).toBeGreaterThan(0);

          // verify at least one markdown file has content (claims or specification)
          const claimsMd = files.find(
            (f) => f.includes('claims') && f.endsWith('.md'),
          );
          if (claimsMd) {
            const content = fs.readFileSync(
              path.join(docsDir, claimsMd),
              'utf-8',
            );
            expect(content.length).toBeGreaterThan(100);
            expect(content).toContain('claim');
          }
        },
      );
    });
  });

  given(
    '[case5] valid exid but patent not found (LIVE API)',
    () => {
      // CRITICAL: this test MUST hit the live USPTO API to get a real 404
      when('[t0] fetch is called with nonexistent patent', () => {
        then('not found error is returned', () => {
          const result = runFetch({
            // valid 8-digit format but doesn't exist
            fetchArgs: ['--exid', '00000001'],
          });

          // exit 2 = constraint (patent not found)
          // error messages go to stderr (propagate through command substitution)
          expect(result.exitCode).toBe(2);
          expect(result.stderr).toContain('not found');
          expect(result.stderr).toMatchSnapshot();
        });
      });
    },
  );

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

  given(
    '[case7] --cache skip bypasses cache (LIVE API)',
    () => {
      // CRITICAL: this test verifies --cache skip forces a fresh API call
      const knownExid = '19399196';
      const gitRoot = spawnSync('git', ['rev-parse', '--show-toplevel'], {
        encoding: 'utf-8',
      }).stdout.trim();
      const cacheDir = path.join(gitRoot, '.cache', 'patents', knownExid);
      const metaPath = path.join(cacheDir, '0.overview.meta.json');

      // pre-populate cache with marker data
      beforeAll(() => {
        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(
          metaPath,
          JSON.stringify({ marker: 'stale-cache-data' }),
        );
      });

      when('[t0] fetch is called with --cache skip', () => {
        then(
          'cache is overwritten with fresh data (proves cache bypass)',
          () => {
            // --cache skip refetches everything: metadata + doc + prosecution docs
            // this can take > 2 minutes; allow long timeout and just verify cache got updated
            const result = runFetch({
              fetchArgs: ['--exid', knownExid, '--cache', 'skip'],
              timeout: 180000, // 3 minutes
            });

            // the key proof: marker data was replaced with real USPTO data
            const cached = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            expect(cached.marker).toBeUndefined();
            expect(cached.patentFileWrapperDataBag).toBeDefined();

            // output should contain the eagle mascot
            expect(result.stdout).toContain('🦅');

            // exit code 0 = success, exit code 1 = partial failure (some docs failed)
            // USPTO API sometimes returns empty responses for certain documents
            // this is acceptable as long as cache was refreshed (verified above)
            expect([0, 1]).toContain(result.exitCode);
          },
        );
      });
    },
  );

  given('[case8] deterministic cached flow (uses fixture)', () => {
    // this test uses a pre-populated fixture to prove the cached flow works
    // without any API calls - deterministic and fast
    const knownExid = '19399196';
    const fixturePath = path.join(__dirname, '__fixtures__', 'cached-patent');

    // genTempDir clones the fixture into an isolated temp directory with git init
    const tempDir = genTempDir({
      slug: 'fetch-cached',
      clone: fixturePath,
      git: true,
    });

    when('[t0] fetch is called in temp dir with pre-populated cache', () => {
      then('all documents report cached status (no API calls)', () => {
        const result = runFetch({
          cwd: tempDir,
          fetchArgs: ['--exid', knownExid],
          timeout: 30000, // 30s is plenty for cached flow (no network)
        });

        // DEBUG: show output on failure
        if (result.exitCode !== 0) {
          console.log('DEBUG stdout:', result.stdout);
          console.log('DEBUG stderr:', result.stderr);
        }

        // must succeed
        expect(result.exitCode).toBe(0);

        // all documents should report "cached" status (not "fetched")
        expect(result.stdout).toContain('retrieval: cached');
        expect(result.stdout).toContain('transcription: cached');
        expect(result.stdout).not.toContain('retrieval: fetched');
        expect(result.stdout).not.toContain('transcription: fetched');

        // snapshot for vibecheck
        expect(result.stdout).toMatchSnapshot();
      });
    });
  });

  given.skip(
    '[case9] deterministic uncached flow (empty temp dir, LIVE API)',
    () => {
      // this test uses an empty temp directory to prove fresh fetch works
      // REQUIRES: USPTO_ODP_API_KEY and GOOGLE_CLOUD_VISION_API_KEY
      // SLOW: fetches metadata + documents + OCR transcription (> 5 minutes)
      const knownExid = '19399196';

      // genTempDir creates isolated temp directory with git init but NO cache
      const tempDir = genTempDir({
        slug: 'fetch-uncached',
        git: true,
      });

      when('[t0] fetch is called in temp dir with empty cache', () => {
        then('all documents report fetched status (live API calls)', () => {
          const result = runFetch({
            cwd: tempDir,
            fetchArgs: ['--exid', knownExid],
            timeout: 600000, // 10 minutes for full fetch + OCR
          });

          // documents should report "fetched" status (not "cached")
          // note: at least some documents should be fetched; all would be ideal
          expect(result.stdout).toContain('retrieval: fetched');
          expect(result.stdout).toContain('transcription: fetched');

          // should NOT contain "cached" since we started with empty cache
          expect(result.stdout).not.toContain('retrieval: cached');
          expect(result.stdout).not.toContain('transcription: cached');

          // exit code 0 = success, exit code 1 = partial failure (some docs failed)
          // USPTO API sometimes returns empty responses for certain documents
          // this is acceptable as long as documents were fetched (verified above)
          expect([0, 1]).toContain(result.exitCode);

          // snapshot for vibecheck
          expect(result.stdout).toMatchSnapshot();
        });

        then('cache is populated in temp dir', () => {
          const cacheDir = path.join(tempDir, '.cache', 'patents', knownExid);

          // metadata should exist
          const metaPath = path.join(cacheDir, '0.overview.meta.json');
          expect(fs.existsSync(metaPath)).toBe(true);

          // prosecution documents should exist
          const files = fs.readdirSync(cacheDir);
          const pdfFiles = files.filter(
            (f) => f.startsWith('1.event.') && f.endsWith('.pdf'),
          );
          expect(pdfFiles.length).toBeGreaterThan(0);

          // OCR transcriptions should exist
          const mdFiles = files.filter(
            (f) => f.startsWith('1.event.') && f.endsWith('.md'),
          );
          expect(mdFiles.length).toBeGreaterThan(0);
        });
      });
    },
  );
});
