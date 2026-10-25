import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, when } from 'test-fns';

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

  /**
   * ⛔ the credential guards are SCOPED to the LIVE cases, deliberately.
   *
   * they used to sit in a suite-level beforeAll, which failed all eight
   * cases when a key was absent — including [case8], the one deterministic,
   * offline, fixture-driven case whose entire purpose is to prove the cached
   * flow works with NO network and NO credentials. a guard that grounds the
   * offline test has inverted its own job.
   *
   * this is NOT a conditional skip (see rule.forbid.test-skip): every case
   * that needs a credential still throws loudly and immediately when it is
   * absent. the guard simply stopped claiming a dependency that is not real.
   */
  const requireUsptoKey = (): void => {
    if (!process.env.USPTO_ODP_API_KEY)
      throw new Error(
        'USPTO_ODP_API_KEY required for this LIVE case. get a key at https://data.uspto.gov, then: rhx keyrack unlock --owner ehmpath --env test',
      );
  };

  const requireOcrCreds = (): void => {
    if (!process.env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS)
      throw new Error(
        'GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS required for OCR in this LIVE case. run: rhx keyrack unlock --owner ehmpath --env test',
      );
  };

  const runFetch = (input: {
    fetchArgs: string[];
    timeout?: number;
    cwd?: string;
    /** a bin dir prepended to PATH, to shadow `curl` / `rhx` — see genFakeApi */
    binFirst?: string;
    /**
     * ⚠️ when true, USPTO_ODP_API_KEY is REMOVED from the child env.
     *
     * check_api_key returns early at :134 whenever that variable is already
     * set, so a harness that inherits a filled key can never reach the two
     * keyrack refusals below it. removal is what makes those arms reachable.
     */
    noApiKey?: boolean;
    /**
     * ⚠️ when true, BOTH Google credential variables are removed.
     *
     * check_vision_api_key has TWO early returns above its keyrack fallback —
     * :173 on GOOGLE_APPLICATION_CREDENTIALS (a file path that must exist) and
     * :178 on GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS (the raw json). either
     * one alone short-circuits the function, so a harness that drops only the
     * first still cannot reach the two refusals below them.
     *
     * ⚠️ this repo's own `rhx keyrack unlock` fills the second variable, so a
     *    developer with creds unlocked and a bare-CI run would otherwise
     *    disagree about whether these arms are reachable at all.
     */
    noVisionCreds?: boolean;
    /**
     * ⭐ when true, USPTO_ODP_API_KEY is PINNED to a fake value.
     *
     * the inverse of `noApiKey`, and it exists to ISOLATE the vision guard.
     * check_api_key and check_vision_api_key both reach keyrack through the
     * same stub, and check_api_key's verdict `keyrack failed` is a SUBSTRING
     * of the vision one, `vision API keyrack failed` — so if both functions
     * refuse in one run, no exclusion can tell whose words reached the caller.
     *
     * a pinned key short-circuits check_api_key at :134, so the only refusal
     * a run can produce is the vision one under test.
     *
     * ⚠️ this must not be left to the ambient env: task #21 records that this
     *    credential is UNFILLED today, so an inherited value cannot be relied
     *    on to be present OR absent.
     */
    usptoKey?: boolean;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const env: NodeJS.ProcessEnv = { ...process.env };
    if (input.binFirst)
      env.PATH = `${input.binFirst}:${process.env.PATH ?? ''}`;
    if (input.noApiKey) delete env.USPTO_ODP_API_KEY;
    if (input.usptoKey) env.USPTO_ODP_API_KEY = 'pinned-so-only-vision-refuses';
    if (input.noVisionCreds) {
      delete env.GOOGLE_APPLICATION_CREDENTIALS;
      delete env.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS;
    }

    const result = spawnSync('bash', [scriptPath, ...input.fetchArgs], {
      encoding: 'utf-8' as const,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: input.timeout ?? 60000, // 60s default, can override for slow tests
      env,
      cwd: input.cwd, // optional: run in a specific directory (for genTempDir tests)
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = a PATH-first bin dir that shadows `rhx` and `curl`, so the skill
   *         runs its metadata phase with no credential and no network.
   *
   * .why  = `fetch_metadata`'s three refusal arms sit behind a live http code,
   *         and `check_api_key`'s two keyrack refusals sit behind a live
   *         `rhx`. neither is reachable from the LIVE cases in this file —
   *         which are red today anyway while USPTO_ODP_API_KEY is unfilled.
   *         so this harness is hermetic on purpose: it must be able to bite
   *         while that credential is still absent.
   *
   * the `curl` stub answers the exact shape `fetch_metadata` parses — a body
   * line, then the http code on its own line, because the skill runs
   * `curl -w "\n%{http_code}"` and splits with `tail -1` / `sed '$d'`.
   */
  const genFakeApi = (input: {
    tempDir: string;
    /** the http code the stub answers with; default 200 */
    httpCode?: string;
    /** the `rhx keyrack get` stub's behavior; default a valid grant */
    keyrack?: 'ok' | 'dies' | 'no-secret';
    /**
     * how the stub answers the DOCUMENT fetch — the one call that passes `-o`.
     *
     * ⚠️ `-o` is what tells the two calls apart. the metadata phase and the
     *    doc-list phase both use `-w "\n%{http_code}"` and want a body on
     *    stdout; the document fetch wants bytes in a file. so a branch on `-o`
     *    lets one stub serve both without a guess at argument order.
     */
    docFetch?: 'network-fails' | 'empty-body';
  }): { bin: string } => {
    const bin = path.join(input.tempDir, '.fakebin');
    fs.mkdirSync(bin, { recursive: true });

    const rhxStub = path.join(bin, 'rhx');
    /**
     * ⭐ the stub echoes back the `--key` it was handed.
     *
     * two DIFFERENT functions in this skill reach keyrack — check_api_key for
     * the USPTO key, check_vision_api_key for the Google one — and both refuse
     * at exit 2 with the word `keyrack` in the verdict. so the key name is the
     * only observable that says WHICH credential the run was short of, and a
     * caller sent to fill the wrong vault slot is no better off than one given
     * no remedy at all.
     */
    const readKeyArg = [
      'key=""',
      'prev=""',
      'for a in "$@"; do',
      '  if [ "$prev" = "--key" ]; then key="$a"; fi',
      '  prev="$a"',
      'done',
    ];
    const rhxBody = ((): string[] => {
      if (input.keyrack === 'dies')
        return [
          ...readKeyArg,
          'echo "vault sealed: no grant for $key"',
          'exit 1',
        ];
      if (input.keyrack === 'no-secret') return [`echo '{"grant":{"key":{}}}'`];
      return [`echo '{"grant":{"key":{"secret":"fake-key-for-test"}}}'`];
    })();
    fs.writeFileSync(rhxStub, ['#!/bin/bash', ...rhxBody, ''].join('\n'));
    fs.chmodSync(rhxStub, '755');

    const docFetchBody = ((): string[] => {
      if (input.docFetch === 'network-fails') return ['  exit 1'];
      if (input.docFetch === 'empty-body') return ['  : > "$out"', '  exit 0'];
      return ['  printf %s "%PDF-1.4" > "$out"', '  exit 0'];
    })();

    const curlStub = path.join(bin, 'curl');
    fs.writeFileSync(
      curlStub,
      [
        '#!/bin/bash',
        '# branch on -o: that flag marks the DOCUMENT fetch. every other call',
        '# in this harness reads a cache file, so this arm is the whole live',
        '# surface.',
        'out=""',
        'prev=""',
        'for a in "$@"; do',
        '  if [ "$prev" = "-o" ]; then out="$a"; fi',
        '  prev="$a"',
        'done',
        'if [ -n "$out" ]; then',
        ...docFetchBody,
        'fi',
        "cat <<'JSON'",
        '{"applicationNumberText":"11111111"}',
        input.httpCode ?? '200',
        'JSON',
        '',
      ].join('\n'),
    );
    fs.chmodSync(curlStub, '755');

    return { bin };
  };

  /** the one prosecution document genCachedPatent plants, by its cache stem */
  const DOC_STEM = '1.event.2025-11-24.non-final-rejection';

  /**
   * .what = a cache dir filled just enough to carry a run all the way to the
   *         prosecution document loop, with no live call ahead of it.
   *
   * .why  = the three refusals inside that loop are the deepest reachable arms
   *         in this skill. every phase ahead of them wants a credential or the
   *         network, so each is answered from a cache file here rather than
   *         from a stub — which leaves the document fetch as the ONLY curl
   *         call the run makes.
   *
   * what each file buys:
   *
   *   0.overview.meta.json  — phase 1 takes its cache branch (:971), so
   *     fetch_metadata never runs. ⛔ it carries NO grantDocumentMetaData on
   *     purpose: extract_document_uri (:363) returns 1 without one, and that
   *     return skips phases 2 and 3 whole.
   *
   *   0.overview.docs.json  — phase 4 takes its cache branch (:1012), so
   *     fetch_document_list never runs. CTNF sits outside the application-doc
   *     set at :650, so the entry falls to fetch_prosecution_documents.
   *
   *   the document file — ⛔ THE SUBTLE ONE, and it is a SWITCH.
   *
   *     the pre-scan at :685-691 reads the cache dir and raises TWO separate
   *     flags, then :697-702 spends them in order:
   *
   *       .pdf absent  -> needs_uspto_key   -> check_api_key
   *       .md  absent  -> needs_vision_key  -> check_vision_api_key
   *
   *     both run BEFORE the fetch loop, so whichever file is left out decides
   *     which credential guard the run meets — and therefore which refusals
   *     are reachable at all. `doc` picks that:
   *
   *       'md'  (default) — plants the transcript, leaves the .pdf out.
   *                         vision is satisfied, the FETCH stays live. this is
   *                         what [case13] needs.
   *       'pdf'           — plants the document, leaves the transcript out.
   *                         uspto is satisfied, and the run refuses inside
   *                         check_vision_api_key. this is what [case14] needs,
   *                         and it makes ZERO curl calls.
   *       'none'          — plants NEITHER half, so BOTH pre-scan flags raise
   *                         and the fetch AND the transcribe step both stay
   *                         live. [case13][t2] needs this: :785 sits behind
   *                         the `.md`-absent branch at :778, so any harness
   *                         that plants the transcript can never reach it.
   *
   * ⚠️ the temp dir MUST be git-initialized. CACHE_BASE is derived from
   *    `git rev-parse --show-toplevel` (:47), which walks UP — so a temp dir
   *    with no repo of its own resolves to the REAL one and the run would
   *    write into this repo's cache.
   */
  const genCachedPatent = (input: {
    tempDir: string;
    /** which half of the document pair to plant; see the switch above */
    doc?: 'md' | 'pdf' | 'none';
  }): { cacheDir: string } => {
    const cacheDir = path.join(
      input.tempDir,
      '.agent',
      '.cache',
      'patents',
      '19399196',
    );
    fs.mkdirSync(cacheDir, { recursive: true });

    fs.writeFileSync(
      path.join(cacheDir, '0.overview.meta.json'),
      JSON.stringify({
        patentFileWrapperDataBag: [
          {
            applicationMetaData: {
              inventionTitle: 'a fixture, not a patent',
              filingDate: '2025-01-01',
              firstInventorName: 'Eagle Of Rhight',
            },
          },
        ],
      }),
    );

    fs.writeFileSync(
      path.join(cacheDir, '0.overview.docs.json'),
      JSON.stringify({
        documentBag: [
          {
            documentCode: 'CTNF',
            officialDate: '2025-11-24T00:00:00',
            downloadOptionBag: [
              {
                mimeTypeIdentifier: 'PDF',
                downloadUrl: 'https://fake.invalid/doc.pdf',
              },
            ],
          },
        ],
      }),
    );

    // plant at most ONE half of the pair; the absent half picks the guard
    if (input.doc === 'pdf')
      fs.writeFileSync(path.join(cacheDir, `${DOC_STEM}.pdf`), '%PDF-1.4\n');
    else if (input.doc !== 'none')
      fs.writeFileSync(
        path.join(cacheDir, `${DOC_STEM}.md`),
        '# a transcript that is already on disk\n',
      );

    return { cacheDir };
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

    // live fetch + OCR transcription
    beforeAll(() => {
      requireUsptoKey();
      requireOcrCreds();
    });

    // use isolated temp directory to ensure fresh fetch (no stale cache)
    const tempDir = genTempDir({
      slug: 'fetch-live-api',
      git: true,
    });

    const cacheDir = path.join(
      tempDir,
      '.agent',
      '.cache',
      'patents',
      knownExid,
    );
    const metaPath = path.join(cacheDir, '0.overview.meta.json');

    // USPTO sometimes serves corrupted PDFs - retry to handle transient issues
    when.repeatably({
      attempts: 3,
      criteria: process.env.CI ? 'SOME' : 'EVERY',
    })('[t0] fetch is called with valid USPTO exid', () => {
      then('patent is fetched from live API', () => {
        // fresh fetch requires metadata + doc + prosecution docs + OCR
        const result = runFetch({
          cwd: tempDir,
          fetchArgs: ['--exid', knownExid],
          timeout: 600000, // 10 minutes for full fetch + OCR
        });

        // failloud: throw with full context if skill fails
        if (result.exitCode !== 0) {
          throw new Error(
            [
              `patent.priors.fetch failed with exit code ${result.exitCode}`,
              '',
              'stderr:',
              result.stderr || '(empty)',
              '',
              'stdout:',
              result.stdout || '(empty)',
            ].join('\n'),
          );
        }
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

  given('[case5] valid exid but patent not found (LIVE API)', () => {
    // CRITICAL: this test MUST hit the live USPTO API to get a real 404
    // .note = no OCR here — a 404 never reaches a document to transcribe
    beforeAll(() => requireUsptoKey());

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
  });

  given('[case6] unknown argument', () => {
    when('[t0] fetch is called with invalid flag', () => {
      const result = useBeforeAll(async () =>
        runFetch({
          fetchArgs: ['--invalid-flag', 'value'],
        }),
      );

      then('error is returned', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown argument');
        expect(result.stderr).toMatchSnapshot();
      });

      then('⭐ it names the OPTION, and is not a DIFFERENT refusal', () => {
        // .why = `unknown argument` alone is a LOOSE TOKEN. it discriminates a
        //        SILENT DROP (the `*)` arm replaced by `shift`) but NOT a
        //        MISNAMED REFUSAL — replace `$1` with any fixed string and the
        //        assertion above stays GREEN over a message that sends the
        //        caller hunting for the wrong flag.
        //
        // ⛔ and the exit code separates none of them here: this skill has
        //    THREE refusals at exit 2 — this one, the `--cache` else branch,
        //    and the absent-exid guard. so the MESSAGE is the only observable
        //    that says WHICH arm answered.
        expect(result.stderr).toContain('--invalid-flag');
        expect(result.stderr).not.toContain('exid required');
        expect(result.stderr).not.toContain('unknown --cache option');
      });
    });
  });

  given('[case7] --cache skip bypasses cache (LIVE API)', () => {
    // CRITICAL: this test verifies --cache skip forces a fresh API call
    const knownExid = '19399196';

    // ⛔ HERMETIC. this case used to derive its cache dir from
    //    `git rev-parse --show-toplevel` and write a marker into the REAL
    //    repo's .agent/.cache/. three problems, none of which showed up as a
    //    red test:
    //      1. it mutated shared state outside any temp dir, so two concurrent
    //         runs raced on one marker file
    //      2. it left a fully-fetched live patent cache behind in the
    //         developer's tree after every run
    //      3. it shelled out to git on the host to find a path
    //    a temp dir gives the same proof with none of the three. see
    //    rule.require.hermetic-tests.
    const tempDir = genTempDir({
      slug: 'fetch-cache-skip',
      git: true,
    });

    const cacheDir = path.join(
      tempDir,
      '.agent',
      '.cache',
      'patents',
      knownExid,
    );
    const metaPath = path.join(cacheDir, '0.overview.meta.json');

    // pre-populate cache with marker data
    // .note = the credential guards run FIRST, so an absent key fails before
    //         any filesystem work rather than after a half-built fixture
    beforeAll(() => {
      requireUsptoKey();
      requireOcrCreds();
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(
        metaPath,
        JSON.stringify({ marker: 'stale-cache-data' }),
      );
    });

    when('[t0] fetch is called with --cache skip', () => {
      then('cache is overwritten with fresh data (proves cache bypass)', () => {
        // --cache skip refetches everything: metadata + doc + prosecution docs
        // this can take > 2 minutes; allow long timeout and just verify cache got updated
        const result = runFetch({
          cwd: tempDir,
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
      });
    });
  });

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
          const cacheDir = path.join(
            tempDir,
            '.agent',
            '.cache',
            'patents',
            knownExid,
          );

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

  /**
   * .what = the arg-parse arms no other case reaches
   *
   * .why  = an ARM WALK of patent.priors.fetch.sh:55-100 found THREE arms with
   *         zero coverage anywhere in this file: the `-h` alias (case1 passes
   *         `--help` only), the rhachet passthrough, and the ENTIRE `--cache`
   *         else branch — a refusal with its own two-line message that no test
   *         has ever reached. each is a line every invocation runs past, so a
   *         line-coverage report scores the block at 100%.
   *
   * ⛔ THE EXIT CODE SEPARATES NONE OF THEM. this skill refuses at exit 2 in
   *    THREE places — the `*)` catch-all, the `--cache` else, and the
   *    absent-exid guard — so `expect(exitCode).toBe(2)` cannot say which arm
   *    answered. a dead `--cache` arm falls to `*)` and refuses at the SAME
   *    code under a message naming the wrong flag. only the MESSAGE tells
   *    them apart, which is why every case below asserts one and EXCLUDES the
   *    other two.
   *
   * ⚠️ hermetic by construction. every arm here refuses during parse, before
   *    a credential is read or a request is made, so these hold while
   *    USPTO_ODP_API_KEY is unfilled and the LIVE cases above are red.
   *
   * ⚠️ this is [case10], not [case9] — `[case9]` is taken by the given.skip'd
   *    uncached flow above, whose label is invisible in a normal run because
   *    a skipped block prints no `given` line. a label collision fails no
   *    test; it just makes two blocks indistinguishable in a report.
   */
  given('[case10] the arg-parse arms', () => {
    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () => runFetch({ fetchArgs: ['-h'] }));

      then('it prints usage and exits clean', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage');
        expect(result.stdout).toContain('--exid');
      });

      then('⭐ it is NOT refused as an unknown argument', () => {
        // ⛔ drop `-h` from the `--help|-h` arm and `-h` falls to `*)`, which
        //    REFUSES — so a help request exits 2 under `unknown argument: -h`.
        //    the exit-code assertion above catches that only because help is
        //    the one arm exiting 0; on every OTHER dead arm the codes match.
        expect(result.stderr).not.toContain('unknown argument');
      });
    });

    when('[t1] rhachet passes --skill, --repo and --role', () => {
      const result = useBeforeAll(async () =>
        runFetch({
          fetchArgs: [
            '--skill',
            'patent.priors.fetch',
            '--repo',
            'rhight',
            '--role',
            'patenter',
            '--exid',
            'US7654321B2',
          ],
        }),
      );

      then('⭐ it validates the EXID, not a flag value', () => {
        // .why = the passthrough must consume BOTH tokens. a `shift` typo
        //        leaves the VALUE on the queue, so `patent.priors.fetch`
        //        becomes the next `$1` and lands on `*)` — the skill reports
        //        ITS OWN NAME as a bad flag. reaching validate_exid at all
        //        proves all six tokens were consumed in pairs.
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('invalid');
        expect(result.stderr).toContain('application number');
      });

      then('it does NOT read a flag value as an argument', () => {
        expect(result.stderr).not.toContain('unknown argument');
        expect(result.stderr).not.toContain('exid required');
      });
    });

    when('[t2] --cache is given a value other than skip', () => {
      const result = useBeforeAll(async () =>
        runFetch({ fetchArgs: ['--exid', '19399196', '--cache', 'bogus'] }),
      );

      then('it blocks', () => {
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the BAD VALUE and the valid one', () => {
        // ⛔ this whole else branch had zero coverage. its two lines are the
        //    only guidance a caller gets, and a `*)` fall-through would refuse
        //    at the same exit 2 while naming `--cache` instead of `bogus` —
        //    which sends them to check the flag rather than its value.
        expect(result.stderr).toContain('bogus');
        expect(result.stderr).toContain('valid options: skip');
        expect(result.stderr).not.toContain('unknown argument');
      });

      /**
       * ⛔ THE VERDICT IS THE ONLY LINE THAT SAYS WHICH FLAG. the remedy
       *    beneath it reads `valid options: skip` and never mentions
       *    `--cache`, so the flag name lives in the verdict alone — and no
       *    assertion above reaches it. `bogus` is the interpolated hole and
       *    `valid options: skip` is the remedy; neither can say which flag
       *    was rejected.
       *
       *    the plausible defect is a copy-paste. this skill takes `--exid`
       *    too, and a second validated flag drafted from this arm leaves
       *    `unknown --exid option: bogus` here. every extant assertion in
       *    [t2] stays GREEN — `bogus` present, `valid options: skip`
       *    present, `unknown argument` absent — while a caller who passed
       *    both flags is sent to check the wrong one.
       *
       * ⚠️ SPLIT from the assertions above on purpose. jest halts a `then`
       *    at its first red, so a clamp co-located with them could never be
       *    measured alone.
       */
      then('⭐ and the verdict names the FLAG that was rejected', () => {
        expect(result.stderr).toContain('unknown --cache option');
      });

      then('⭐ it refuses BEFORE it fetches', () => {
        // .why = the refusal must precede the network, or an operator who
        //        typo'd the cache flag still spends an API call. an absent
        //        credential would print a keyrack failure here instead.
        expect(result.stdout).not.toContain('fetched');
        expect(result.stderr).not.toContain('keyrack');
      });
    });

    when('[t3] --cache is given with no value at all', () => {
      const result = useBeforeAll(async () =>
        runFetch({ fetchArgs: ['--exid', '19399196', '--cache'] }),
      );

      then('it blocks rather than treat the absent value as skip', () => {
        // .why = `${2:-}` is the empty string at the end of the queue, so this
        //        takes the SAME else branch as [t2] — but from a different
        //        input class. a `${2}` without the `:-` default would abort on
        //        `set -u` instead, at exit 1 with no message.
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('valid options: skip');
      });
    });
  });

  /**
   * .what = the three refusal arms of `fetch_metadata`, none of which any
   *         case in this file reached.
   *
   * .why  = a MESSAGE walk found three refusals behind an http code, and TWO
   *         of them exit 1 while the third exits 2 — which is also the code
   *         every arg-parse refusal above uses. so an assertion on the exit
   *         code cannot tell one from another. the MESSAGE is the only
   *         observable that discriminates (leak 6,
   *         `rule.require.assertions-that-discriminate`).
   *
   * ⛔ AND THE REMEDY HALF WAS SWALLOWED — fixed 2026-09-04. main() calls
   *    `metadata=$(fetch_metadata)` at :968, so the whole function runs in a
   *    COMMAND SUBSTITUTION and every plain `echo` in it was captured into
   *    `$metadata` and discarded. only `print_blocked`, which writes to
   *    stderr, escaped. so a caller who hit a 404 was told the patent was
   *    absent and never told which application number the skill had looked
   *    for; a caller who hit a 500 was told "API error" with no status code.
   *
   *    this is the SECOND instance of that defect — the sibling skill
   *    patent.priors.search carried the identical shape in `search_uspto`,
   *    fixed the same day. two instances in two skills make it a CLASS, and
   *    the tell is the same both times: the function's success path returns
   *    its payload on stdout, so stdout was never available to talk on.
   *
   *    the cure is `>&2` on each remedy line. the clamps below read STDERR,
   *    so each reddens if its `>&2` is dropped, while the verdict half —
   *    already on stderr via `print_blocked` — stays green.
   *
   * ⚠️ hermetic by construction. `curl` and `rhx` are both shadowed, and
   *    USPTO_ODP_API_KEY is REMOVED from the child env so `check_api_key`
   *    cannot return early at :134. these hold whether or not that
   *    credential is ever filled, which is what lets them bite today while
   *    every LIVE case in this file is red on task #21.
   */
  given('[case11] the fetch_metadata refusal arms', () => {
    when('[t0] the API answers 404', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-meta-404', git: true });
        const api = genFakeApi({ tempDir, httpCode: '404' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          noApiKey: true,
        });
      });

      then('it exits 2 — a CONSTRAINT, not a malfunction', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS the patent was not found', () => {
        expect(scene.stderr).toContain('patent not found');
      });

      then('⭐ and it is NOT read as either exit-1 sibling', () => {
        // ⛔ 404 is the only arm of the three that exits 2, so the code alone
        //    looks like it discriminates here — until you notice every
        //    arg-parse refusal in [case10] exits 2 as well. the two
        //    exclusions are what separate this arm from its own neighbours.
        expect(scene.stderr).not.toContain('rate limited');
        expect(scene.stderr).not.toContain('API error');
      });

      then('⭐ and the REMEDY reaches the caller — on STDERR', () => {
        // ⛔ this is the swallow. drop the `>&2` and the exit code stays 2,
        //    `patent not found` stays on stderr via print_blocked, and the
        //    one line that names WHICH number was looked for vanishes into
        //    $metadata. every assertion above stays green.
        expect(scene.stderr).toContain('19399196');
        expect(scene.stderr).toContain('does not exist');
      });
    });

    when('[t1] the API answers 429', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-meta-429', git: true });
        const api = genFakeApi({ tempDir, httpCode: '429' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          noApiKey: true,
        });
      });

      then('it exits 1 — a MALFUNCTION', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ it SAYS the caller was rate limited', () => {
        expect(scene.stderr).toContain('rate limited');
      });

      then('⭐ and it is NOT read as the generic http arm', () => {
        // ⛔ `*)` catches every code this arm does not, and exits 1 too. so
        //    a deleted `429)` label sends a rate limit to the generic arm at
        //    the SAME exit code, telling an operator to inspect a status
        //    code rather than to wait.
        expect(scene.stderr).not.toContain('API error');
      });

      then('⭐ and the REMEDY reaches the caller — on STDERR', () => {
        // the swallow's twin; see the note on [t0].
        expect(scene.stderr).toContain(
          'USPTO API rate limit exceeded. please wait and retry.',
        );
      });
    });

    when('[t2] the API answers an unhandled code', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-meta-500', git: true });
        const api = genFakeApi({ tempDir, httpCode: '500' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          noApiKey: true,
        });
      });

      then('it exits 1 — a MALFUNCTION', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ it SAYS the API errored', () => {
        expect(scene.stderr).toContain('API error');
      });

      then('⭐ and it is NOT read as either named sibling', () => {
        expect(scene.stderr).not.toContain('patent not found');
        expect(scene.stderr).not.toContain('rate limited');
      });

      then('⭐ the STATUS CODE reaches the caller — on STDERR', () => {
        // ⛔ the sharpest of the three. `print_blocked "API error"` carries no
        //    code at all, so with the `>&2` dropped an operator sees a bare
        //    `API error` and cannot tell a 500 from a 502 from a proxy's 403.
        //    the whole diagnostic value of this arm is in the swallowed half.
        expect(scene.stderr).toContain('status: 500');
      });

      then('⭐ and the RESPONSE BODY reaches the caller — on STDERR', () => {
        expect(scene.stderr).toContain('response:');
        expect(scene.stderr).toContain('applicationNumberText');
      });
    });
  });

  /**
   * .what = the two keyrack refusals in `check_api_key`.
   *
   * .why  = both exit 2, so the exit code cannot tell them apart — nor from
   *         the arg-parse refusals in [case10], nor from the 404 arm in
   *         [case11]. that is leak 6 at width FOUR across one skill.
   *
   * ⚠️ THESE ARE PINS, NOT CLAMPS, on the stream.
   *
   *    `check_api_key` writes its remedy to STDOUT while its verdict goes to
   *    stderr. that is odd, and its own neighbour disagrees with it —
   *    `check_vision_api_key`, 30 lines below, uses `>&2` on every remedy
   *    line. but the five call sites of `check_api_key` (:584, :689, :966,
   *    :982, :1008) are ALL plain statements, never a command substitution,
   *    so the remedy does reach the caller. odd ergonomics, functional.
   *
   *    so these read STDOUT deliberately. they pin what the skill does today
   *    and go red the day someone aligns the two functions — at which point
   *    the fix is to move the assertion, not to revert the alignment.
   */
  given('[case12] the check_api_key keyrack refusals', () => {
    when('[t0] keyrack itself fails', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-kr-dies', git: true });
        const api = genFakeApi({ tempDir, keyrack: 'dies' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          noApiKey: true,
        });
      });

      then('it exits 2 — a CONSTRAINT the caller must clear', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS keyrack failed', () => {
        expect(scene.stderr).toContain('keyrack failed');
      });

      then('⭐ and it is NOT read as the no-secret sibling', () => {
        // ⛔ both refusals exit 2 and both name keyrack. only the verb
        //    separates "the vault would not answer" from "the vault answered
        //    with a blank" — and they send the caller to different fixes.
        expect(scene.stderr).not.toContain('returned no secret');
      });

      then("⭐ the VAULT'S OWN words reach the caller — on STDOUT", () => {
        // ⚠️ a PIN. see the block note above: this remedy is on stdout today,
        //    unlike its neighbour check_vision_api_key.
        expect(scene.stdout).toContain('vault sealed');
      });
    });

    when('[t1] keyrack answers with no secret in the grant', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-kr-blank', git: true });
        const api = genFakeApi({ tempDir, keyrack: 'no-secret' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          noApiKey: true,
        });
      });

      then('it exits 2 — a CONSTRAINT the caller must clear', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS the grant carried no secret', () => {
        expect(scene.stderr).toContain('keyrack returned no secret');
      });

      then('⭐ and it is NOT read as a keyrack transport failure', () => {
        // ⛔ the inverse of [t0]'s exclusion. `rhx` EXITED ZERO here, so the
        //    `||` arm never fired; a guard that only checked the exit status
        //    would sail past a blank grant and hand an empty key to curl.
        expect(scene.stderr).not.toContain('keyrack failed');
      });

      then('⭐ the GRANT ITSELF reaches the caller — on STDOUT', () => {
        // ⚠️ a PIN, per the block note. and the echoed grant is the whole
        //    point of this arm: it is what lets a human see the key slot is
        //    present but unfilled, rather than guess at it.
        expect(scene.stdout).toContain('response:');
        expect(scene.stdout).toContain('grant');
      });
    });
  });

  /**
   * .what = the FILE-RELAY refusals inside fetch_prosecution_documents.
   *
   * ⭐ A NEW SHAPE — the site that HOLDS the literal is not the site that
   *    PRINTS it, and neither one alone is both.
   *
   *    each document fetch runs in a `( ... ) &` subshell (:748) whose stdout
   *    belongs to the caller, so a refusal there cannot just print: the loop
   *    must still `wait` for its peers and report them in order. so the job
   *    writes its verdict into a status FILE (:764, :771, :785) and exits,
   *    and phase 2 reads that file back and prints it at :823:
   *
   *        print_blocked "$error_msg: $doc_name"
   *
   *    that print site carries NO literal of its own. so a sweep for "a
   *    refusal whose message no assertion reads" names :764 and :771 — the
   *    WRITE sites — while the only observable a clamp can read is :823.
   *    point a clamp at the write site and there is no output to read; point
   *    it at the print site and there is no literal to name.
   *
   *    the cure is to assert the RELAYED text at the phase-2 output, and to
   *    assert the doc name beside it — which proves the two halves were
   *    JOINED, rather than that either survived alone.
   *
   * .why  = leak 6. both arms exit 1, as do the 429 and `*)` arms of
   *         [case11], so the exit code discriminates none of the four. only
   *         the message separates a network failure from a zero-byte answer,
   *         and the two send a caller to different fixes.
   *
   * ⚠️ :771 is the higher-value of the two. it is the ONLY guard between a
   *    caller and a zero-byte PDF cached as though it were a document —
   *    the defect class of task #46.
   */
  given('[case13] the FILE-RELAY refusals in the document loop', () => {
    when('[t0] the document fetch fails at the network', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-doc-net', git: true });
        const cache = genCachedPatent({ tempDir });
        const api = genFakeApi({ tempDir, docFetch: 'network-fails' });
        return {
          ...runFetch({
            fetchArgs: ['--exid', '19399196'],
            cwd: tempDir,
            binFirst: api.bin,
            noApiKey: true,
          }),
          cacheDir: cache.cacheDir,
        };
      });

      then('it exits 1 — a MALFUNCTION', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ the RELAYED literal reaches the caller', () => {
        // ⛔ written at :764, read back at :811, printed at :823. no single
        //    site both holds this string and emits it.
        expect(scene.stderr).toContain('fetch failed (network)');
      });

      then('⭐ and it is NOT read as the zero-byte twin', () => {
        // the two arms are 7 lines apart, both exit 1, and both write into
        // the same status file. only the parenthetical tells them apart.
        expect(scene.stderr).not.toContain('empty response');
      });

      then(
        '⭐ and the two halves were JOINED — the doc name rides along',
        () => {
          // :823 composes `$error_msg: $doc_name`. this assertion is what
          // separates "the relay worked" from "one half of it did".
          expect(scene.stderr).toContain(`${DOC_STEM}.pdf`);
        },
      );
    });

    when('[t1] the document fetch answers with a zero-byte body', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'fetch-doc-empty',
          git: true,
        });
        const cache = genCachedPatent({ tempDir });
        const api = genFakeApi({ tempDir, docFetch: 'empty-body' });
        return {
          ...runFetch({
            fetchArgs: ['--exid', '19399196'],
            cwd: tempDir,
            binFirst: api.bin,
            noApiKey: true,
          }),
          cacheDir: cache.cacheDir,
        };
      });

      then('it exits 1 — a MALFUNCTION', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ the RELAYED literal reaches the caller', () => {
        expect(scene.stderr).toContain('fetch failed (empty response)');
      });

      then('⭐ and it is NOT read as the network twin', () => {
        // ⛔ the inverse of [t0]'s exclusion. curl EXITED ZERO here, so the
        //    `if !` at :761 never fired; a guard that only read the exit
        //    status would cache the zero-byte answer as a document.
        expect(scene.stderr).not.toContain('(network)');
      });

      then(
        '⭐ and the two halves were JOINED — the doc name rides along',
        () => {
          expect(scene.stderr).toContain(`${DOC_STEM}.pdf`);
        },
      );

      then(
        '⭐ and the zero-byte file is REMOVED, never left in the cache',
        () => {
          // ⛔ THE ONE THAT CARRIES THE WEIGHT. :772 removes the stub, so a
          //    later run re-fetches rather than reports it `cached`. drop that
          //    `rm -f` and the skill caches a zero-byte PDF under a name that
          //    promises a document — the shape task #46 records.
          expect(
            fs.existsSync(path.join(scene.cacheDir, `${DOC_STEM}.pdf`)),
          ).toBe(false);
        },
      );
    });

    /**
     * ⭐ THE THIRD WRITE SITE — :785, and the one the docblock above names
     *    without a clamp beside it.
     *
     *    the two arms above answer for the FETCH. this one answers for the
     *    TRANSCRIBE, and it is a different verdict about a different phase:
     *    the document arrived intact and the OCR leaf could not read it. a
     *    caller sent to debug the network by a fetch message would look at
     *    the wrong half of the pipeline.
     *
     * ⛔ IT SITS BEHIND A BRANCH NO OTHER CASE CAN OPEN. :778 short-circuits
     *    to `cached` whenever the `.md` is already on disk, and every prior
     *    harness in this file plants that transcript to keep the fetch live.
     *    so `doc: 'none'` is not a convenience — it is the only way in.
     *
     * ⭐ AND THE HARNESS IS HERMETIC BY ACCIDENT OF THE SAME STUB. the OCR
     *    leaf resolves a credential through `rhx` and then trades it for an
     *    access token through `curl` — and both are already shadowed here.
     *    the leaf therefore dies inside the fakebin, with no network at all.
     *    which sub-failure it dies of does not matter to this case: the arm
     *    under test is the parent's `|| { ... }`, whose literal is fixed.
     */
    when('[t2] the OCR leaf refuses after the document arrives', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-doc-ocr', git: true });
        const cache = genCachedPatent({ tempDir, doc: 'none' });
        const api = genFakeApi({ tempDir });
        return {
          ...runFetch({
            fetchArgs: ['--exid', '19399196'],
            cwd: tempDir,
            binFirst: api.bin,
            noApiKey: true,
            // ⚠️ REQUIRED. check_vision_api_key returns at :178 on this
            //    variable alone, so a developer with keyrack unlocked would
            //    otherwise take a different path into the leaf than CI does.
            noVisionCreds: true,
          }),
          cacheDir: cache.cacheDir,
        };
      });

      then('it exits 1 — a MALFUNCTION', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ the RELAYED literal reaches the caller', () => {
        // ⛔ the whole point of this case. `transcribe failed` appears
        //    NOWHERE else in this repo's tests — grep-proven 2026-09-04 —
        //    so before this assertion the site could be deleted whole and
        //    every case in the file stayed green.
        //
        // ⭐ AND IT WAS RED ON ITS FIRST RUN, over a REAL defect: phase 2
        //    pulled the field with a greedy `.*error:`, which matched the
        //    `parse error:` inside the relayed payload and deleted this
        //    verdict outright. see the note at :813 of the skill.
        expect(scene.stderr).toContain('transcribe failed');
      });

      then('⭐ the phase-2 fields say FETCHED, then FAILED', () => {
        // ⛔ this pair is what proves `doc: 'none'` did its job. with the
        //    transcript planted, :778 short-circuits to `cached`, the arm
        //    under test is never entered, and the run SUCCEEDS instead.
        //
        // ⚠️ MEASURED 2026-09-04 by exactly that probe. the report read:
        //
        //        ├─ retrieval: fetched
        //        └─ transcription: cached
        //
        //    under `🦅 got one,` at exit 0 — the reachability failure, in
        //    the skill's own words.
        //
        // 🚩 AND IT REFUTED THIS COMMENT'S FIRST DRAFT, which claimed the
        //    other assertions here "still passed" while only this pair went
        //    red. they did not: FOUR of the five reddened. the exit code,
        //    the relayed literal, and the doc name all read a refusal that
        //    no longer happens.
        //
        // ⭐ EXACTLY ONE SURVIVED — `NOT read as either FETCH twin`, the
        //    lone EXCLUSION. a run that emits no refusal at all satisfies
        //    every `not.toContain` trivially, so an exclusion is green in
        //    both the fixed and the unreachable worlds. that is why the
        //    positives sit in their own `then`s: a co-located exclusion
        //    would have been carried by them and never measured.
        //
        //    the pair also separates this case from [t0]/[t1], where it is
        //    retrieval itself that failed.
        expect(scene.stdout).toContain('retrieval: fetched');
        expect(scene.stdout).toContain('transcription: failed');
      });

      then('⭐ and it is NOT read as either FETCH twin', () => {
        // the three arms are 20 lines apart and all three exit 1 into the
        // same status file. only the verdict separates a dead network from
        // a zero-byte answer from a document the OCR could not read.
        expect(scene.stderr).not.toContain('fetch failed');
      });

      then(
        '⭐ and the two halves were JOINED — the doc name rides along',
        () => {
          expect(scene.stderr).toContain(`${DOC_STEM}.pdf`);
        },
      );
    });
  });

  /**
   * .what = the two check_vision_api_key keyrack refusals (:198, :210).
   *
   * ⭐ REACHED BY A SWITCH, not by a flag. the pre-scan at :685-691 reads the
   *    cache dir and raises two independent flags, which :697-702 spends in
   *    order:
   *
   *        .pdf absent  ->  needs_uspto_key   ->  check_api_key
   *        .md  absent  ->  needs_vision_key  ->  check_vision_api_key
   *
   *    both run BEFORE the fetch loop, so WHICHEVER HALF OF THE PAIR IS LEFT
   *    OUT OF THE FIXTURE decides which credential guard the run meets. these
   *    cases plant the `.pdf` and omit the `.md`, which is the only shape that
   *    reaches the vision arms — and it makes zero curl calls.
   *
   * ⛔ THE NEIGHBOUR'S VERDICT IS A SUBSTRING OF THIS ONE.
   *
   *        check_api_key        -> "keyrack failed"
   *        check_vision_api_key -> "vision API keyrack failed"
   *
   *    so `not.toContain('keyrack failed')` can never separate them, and
   *    [case12]'s positive would be satisfied by EITHER function's refusal.
   *    the discriminator has to be a string only one of them can emit — the
   *    KEY NAME the stub echoes back, per genFakeApi's note. `usptoKey: true`
   *    then guarantees only one guard refuses per run.
   *
   * .why  = leak 6. both arms exit 2, as do both of [case12]'s and every
   *         arg-parse arm of [case10], so the exit code discriminates none of
   *         them. and the two arms send a caller to DIFFERENT fixes — one to
   *         `keyrack unlock` (the vault is sealed, the caller can open it) and
   *         one to `keyrack fill` (the slot is empty, a HUMAN must fill it).
   */
  given('[case14] the check_vision_api_key keyrack refusals', () => {
    when('[t0] keyrack itself fails for the vision credential', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'fetch-vis-dies', git: true });
        genCachedPatent({ tempDir, doc: 'pdf' });
        const api = genFakeApi({ tempDir, keyrack: 'dies' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          usptoKey: true,
          noVisionCreds: true,
        });
      });

      then('it exits 2 — a CONSTRAINT the caller must clear', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS the VISION keyrack failed', () => {
        expect(scene.stderr).toContain('vision API keyrack failed');
      });

      then('⭐ and it is NOT read as the empty-slot twin', () => {
        // both arms exit 2 and both name keyrack. only the verb separates
        // "the vault would not answer" from "the vault answered with a
        // blank", and they route to different fixes.
        expect(scene.stderr).not.toContain('not found in keyrack');
      });

      then('⭐ and the CREDENTIAL it was short of is named', () => {
        // ⛔ THE CROSS-FUNCTION DISCRIMINATOR. the stub echoes the `--key` it
        //    was handed, so this is the one observable that says WHICH vault
        //    slot to go fill. a caller sent to the USPTO slot for an OCR
        //    failure is no better off than one given no remedy at all.
        expect(scene.stderr).toContain(
          'GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS',
        );
      });

      then('⭐ and the USPTO guard is NOT the one at fault', () => {
        // the inverse of the assertion above. `usptoKey: true` pins that
        // credential present, so check_api_key returns at :134 and never
        // reaches the stub — if this key name appears, the isolation broke
        // and every exclusion in this block reads the wrong function.
        expect(scene.stderr).not.toContain('USPTO_ODP_API_KEY');
      });

      then('⭐ the remedy reaches the caller — on STDERR', () => {
        // ⚠️ note the stream. this function sends every remedy line to
        //    stderr; its neighbour check_api_key sends the same kind of line
        //    to STDOUT (see [case12]'s two PINs). the disagreement is real
        //    and is flagged for a human rather than silently harmonized.
        expect(scene.stderr).toContain(
          'rhx keyrack unlock --owner ehmpath --env test',
        );
      });
    });

    when('[t1] keyrack answers with no secret in the grant', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'fetch-vis-blank',
          git: true,
        });
        genCachedPatent({ tempDir, doc: 'pdf' });
        const api = genFakeApi({ tempDir, keyrack: 'no-secret' });
        return runFetch({
          fetchArgs: ['--exid', '19399196'],
          cwd: tempDir,
          binFirst: api.bin,
          usptoKey: true,
          noVisionCreds: true,
        });
      });

      then('it exits 2 — a CONSTRAINT the caller must clear', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS the key was not in the vault', () => {
        expect(scene.stderr).toContain('vision API key not found in keyrack');
      });

      then('⭐ and it is NOT read as a keyrack transport failure', () => {
        // ⛔ the inverse of [t0]'s exclusion. `rhx` EXITED ZERO here, so the
        //    `||` arm never fired; a guard that only read the exit status
        //    would sail past a blank grant and write an empty credentials
        //    file for the OCR call to fail on later, far from the cause.
        expect(scene.stderr).not.toContain('vision API keyrack failed');
      });

      then('⭐ the remedy names the HUMAN step, not a self-serve one', () => {
        // ⛔ the whole reason these two arms must stay apart. [t0] can be
        //    cleared by the caller with `unlock`; this one cannot — the slot
        //    is empty and only a human with fill rights can populate it.
        expect(scene.stderr).toContain(
          'ask a human to run: rhx keyrack fill --owner ehmpath',
        );
      });
    });
  });

  /**
   * .what = the LAST refusal in the document loop — the arm that fires when a
   *         job left no status file at all.
   *
   * ⭐ THE OTHER HALF OF THE FILE-RELAY. [case13] proves a verdict WRITTEN by
   *    a subshell reaches the caller. this proves what the loop does when the
   *    subshell dies BEFORE it writes one, and the two are separate arms of
   *    one `if`:
   *
   *        if [[ -f "$status_file" ]]; then   ... :823, the relay
   *        else                               ... :837, this arm
   *
   *    the skill's own comment calls it `(should not happen after wait)`, and
   *    that is precisely why it earns a clamp: an arm nobody expects to reach
   *    is an arm nobody has watched emit.
   *
   * .the route = a READ-ONLY cache dir.
   *
   *    the job's first act is a write INTO that dir (:758):
   *
   *        echo "$doc_entry" | jq '.' > "$json_path"
   *
   *    `$json_path` is `${CACHE_DIR}/1.event.<date>.<slug>.json`, so a dir the
   *    process cannot write kills the redirect, `set -e` kills the subshell,
   *    and no status file is ever laid down. that is not a contrivance — a
   *    read-only mount, a dir owned by another user, and a full disk each
   *    produce it.
   *
   * ⚠️ `doc: 'md'` is decisive here (the genCachedPatent default). it leaves
   *    the .pdf out, so the loop takes its FETCH branch at :756 and reaches
   *    the write. under `doc: 'pdf'` the branch above returns `cached` and the
   *    write never happens, so the arm is unreachable.
   *
   * .why  = leak 6. this arm exits 1, as do BOTH FILE-RELAY arms of [case13]
   *         and the 429 and `*)` arms of [case11] — five refusals, one exit
   *         code. only the verdict says which of them fired.
   */
  given(
    '[case15] the DEAD-JOB refusal — a job that left no status file',
    () => {
      when('[t0] the cache dir refuses writes, so the job dies early', () => {
        const scene = useBeforeAll(async () => {
          const tempDir = await genTempDir({
            slug: 'fetch-job-dead',
            git: true,
          });
          const cache = genCachedPatent({ tempDir });
          const api = genFakeApi({ tempDir });

          // ⛔ 0o555 is the narrowest change that kills :758. every cache READ
          //    above it still succeeds, so the run still reaches the loop.
          fs.chmodSync(cache.cacheDir, 0o555);
          const out = runFetch({
            fetchArgs: ['--exid', '19399196'],
            cwd: tempDir,
            binFirst: api.bin,
            noApiKey: true,
          });
          // restore, or the temp-dir teardown cannot remove what it planted
          fs.chmodSync(cache.cacheDir, 0o755);
          return out;
        });

        then('it exits 1 — a MALFUNCTION', () => {
          expect(scene.exitCode).toBe(1);
        });

        then('⭐ the `else` arm is the one that was entered', () => {
          // the positive control. this line is emitted ONLY here (:835), so
          // without it a red below could mean the run refused somewhere else
          // and never reached :837 at all.
          expect(scene.stdout).toContain('retrieval: unknown');
        });

        then('⭐ the verdict names a DEAD JOB', () => {
          expect(scene.stderr).toContain('job failed');
        });

        then('⭐ and it is NOT read as a FILE-RELAY refusal', () => {
          // :823 and :837 sit 14 lines apart, both exit 1, and both compose
          // `<verdict>: $doc_name`, so a merge of the two is the tidy-up a
          // reader reaches for.
          //
          // ⚠️ MEASURED, and the answer was not the one predicted. the merge
          //    `print_blocked "$error_msg: $doc_name"` does NOT print an empty
          //    reason — `error_msg` is never assigned on this branch, so `set
          //    -u` kills the run first and the caller gets exit 1 with NO
          //    refusal at all. so this exclusion is a belt on the verdict
          //    positive above; it is the DOC-NAME clamp below that catches the
          //    merge, because a dead run emits neither half.
          expect(scene.stderr).not.toContain('fetch failed');
        });

        then('⭐ and the doc name rides along', () => {
          // `doc_names+=(...)` runs BEFORE the subshell (:744), so phase 2 still
          // knows which document died even though the job left no file.
          //
          // ⚠️ SPLIT from the verdict on purpose, and each was proven to bite
          //    ALONE: drop `$doc_name` from :837 and this reds while the
          //    verdict stays GREEN (measured 59/12, one new red).
          expect(scene.stderr).toContain(`${DOC_STEM}.pdf`);
        });
      });
    },
  );
});
