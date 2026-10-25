import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, when } from 'test-fns';

/**
 * BLOCKER: USPTO_ODP_API_KEY required for live API tests
 *
 * get a key at: https://data.uspto.gov
 * then: rhx keyrack fill (or export USPTO_ODP_API_KEY=your_key)
 */
describe('patent.priors.search.sh', () => {
  const scriptPath = path.join(__dirname, 'patent.priors.search.sh');

  /**
   * ⛔ the credential guard is SCOPED to the LIVE cases, deliberately.
   *
   * it used to sit in a suite-level beforeAll, which failed all ten cases
   * when the key was absent — among them the five (help, arg validation,
   * query-length bounds) that never touch the network. those five are the
   * cheapest, fastest feedback in the file, and a key nobody has grounds
   * them for no reason.
   *
   * this is NOT a conditional skip (see rule.forbid.test-skip): every LIVE
   * case still throws loudly the moment the key is absent. the guard simply
   * stopped assertion of a dependency that is not real.
   */
  const requireUsptoKey = (): void => {
    if (!process.env.USPTO_ODP_API_KEY)
      throw new Error(
        'USPTO_ODP_API_KEY required for this LIVE case. get a key at https://data.uspto.gov, then: rhx keyrack unlock --owner ehmpath --env test',
      );
  };

  const runSearch = (input: {
    searchArgs: string[];
    binFirst?: string;
  }): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...input.searchArgs], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000, // 60s timeout for API calls
      env: input.binFirst
        ? {
            ...process.env,
            PATH: `${input.binFirst}:${process.env.PATH ?? ''}`,
          }
        : process.env, // explicitly pass env for API key
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  /**
   * .what = a PATH-first bin dir that shadows `rhx` and `curl`, so the skill
   *         runs its FULL pipeline with no credential and no network.
   *
   * .why  = every flag that shapes the REQUEST — `--limit`, `--since`,
   *         `--until` — is observable only in the url handed to `curl`. the
   *         LIVE cases in this file cannot see it (they assert on rendered
   *         patents), and they are red today anyway while USPTO_ODP_API_KEY
   *         is unfilled. so the arm walk below is hermetic on purpose: it
   *         must be able to bite while that credential is still absent.
   *
   * the `curl` stub records the url into `urlLog` and answers the exact shape
   * `search_uspto` parses — a one-line body, then the http code on its own
   * line, because the skill runs `curl -w "\n%{http_code}"` and then splits
   * with `tail -n1` / `sed '$d'`.
   */
  const genFakeApi = (input: {
    tempDir: string;
    /** the http code the stub answers with; default 200 */
    httpCode?: string;
    /** when true, `curl` itself exits non-zero — the TRANSPORT failure arm */
    curlDies?: boolean;
    /** the `rhx keyrack get` stub's behavior; default a valid grant */
    keyrack?: 'ok' | 'dies' | 'no-secret';
  }): { bin: string; urlLog: string } => {
    const bin = path.join(input.tempDir, '.fakebin');
    fs.mkdirSync(bin, { recursive: true });
    const urlLog = path.join(input.tempDir, 'url.log');

    const rhxStub = path.join(bin, 'rhx');
    const rhxBody = ((): string[] => {
      if (input.keyrack === 'dies')
        return [
          'echo "vault sealed: no grant for USPTO_ODP_API_KEY"',
          'exit 1',
        ];
      if (input.keyrack === 'no-secret') return [`echo '{"grant":{"key":{}}}'`];
      return [`echo '{"grant":{"key":{"secret":"fake-key-for-test"}}}'`];
    })();
    fs.writeFileSync(rhxStub, ['#!/bin/bash', ...rhxBody, ''].join('\n'));
    fs.chmodSync(rhxStub, '755');

    const curlStub = path.join(bin, 'curl');
    fs.writeFileSync(
      curlStub,
      [
        '#!/bin/bash',
        'for a in "$@"; do',
        '  case "$a" in',
        `    https://*) printf '%s' "$a" > ${urlLog} ;;`,
        '  esac',
        'done',
        ...(input.curlDies
          ? ['exit 7']
          : [
              "cat <<'JSON'",
              '{"count":1,"patentFileWrapperDataBag":[{"applicationNumber":"11111111","applicationMetaData":{"inventionTitle":"wireless transceiver rig"}}]}',
              input.httpCode ?? '200',
              'JSON',
            ]),
        '',
      ].join('\n'),
    );
    fs.chmodSync(curlStub, '755');

    // ⚠️ `sleep` is shimmed to a no-op. the retry loop waits 2s + 4s (transport
    //    and generic arms) or 5s + 5s (the 429 arm) before it refuses, which
    //    would put three of these cases near the 60s spawn timeout for no
    //    signal at all. the DELAY is not under test; the REFUSAL is.
    const sleepStub = path.join(bin, 'sleep');
    fs.writeFileSync(sleepStub, '#!/bin/bash\nexit 0\n');
    fs.chmodSync(sleepStub, '755');

    return { bin, urlLog };
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
      const result = useBeforeAll(async () =>
        runSearch({ searchArgs: ['--query', 'ab'] }),
      );

      then('error is returned', () => {
        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('too short');
        expect(result.stderr).toMatchSnapshot();
      });

      then('⭐ and the REMEDY reaches the caller — on STDOUT', () => {
        // .why = `too short` states the verdict. it does not state the BOUND,
        //        so a caller who reads only that line has to guess whether 3
        //        characters suffice or 30 do. the bound is the one actionable
        //        fact this refusal carries.
        //
        // ⛔ and the two halves ride DIFFERENT STREAMS. `print_blocked` writes
        //    the verdict to stderr while the plain `echo` beneath it writes
        //    this line to stdout — so the assertion above, which reads stderr
        //    alone, is structurally unable to see it. delete the echo and it
        //    stays GREEN over a refusal that names no bound at all.
        expect(result.stdout).toContain('query must be at least 3 characters');
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
    beforeAll(() => requireUsptoKey());

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
      const result = useBeforeAll(async () =>
        runSearch({ searchArgs: ['--query', 'a'.repeat(1001)] }),
      );

      then('error is returned', () => {
        // error messages go to stderr
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('too long');
        expect(result.stderr).toMatchSnapshot();
      });

      then('⭐ and the CAP reaches the caller — on STDOUT', () => {
        // .why = the twin of [case2]. `too long` is a verdict; the cap is the
        //        fact a caller acts on, and it lives on the other stream.
        //
        // ⛔ and the two bounds are the SWAP shape: an arm that printed the
        //    floor here would still say `too long` on stderr, at exit 2, so
        //    every extant assertion holds. the exclusion below is what tells
        //    the two arms apart.
        expect(result.stdout).toContain('query must be under 1000 characters');
      });

      then(
        '⭐ and it is not the FLOOR message — the arms are not swapped',
        () => {
          expect(result.stdout).not.toContain('at least 3 characters');
        },
      );
    });
  });

  given('[case6] vague query with few keywords (LIVE API)', () => {
    beforeAll(() => requireUsptoKey());

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
      const result = useBeforeAll(async () =>
        runSearch({ searchArgs: ['--invalid-flag', 'value'] }),
      );

      then('error is returned', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('unknown argument');
        expect(result.stderr).toMatchSnapshot();
      });

      then('⭐ it names the OPTION, not an absent --query', () => {
        // .why = `unknown argument` alone is a LOOSE TOKEN. it discriminates a
        //        SILENT DROP (the `*)` arm replaced by `shift`) but NOT a
        //        MISNAMED REFUSAL — replace `$1` with any fixed string and the
        //        assertion above stays GREEN over a message that sends the
        //        caller hunting for the wrong flag.
        //
        // ⛔ and this skill's `*)` REFUSES, so a dead arm cannot fall silent —
        //    it lands here instead, naming the value the caller actually typed.
        //    that makes the NAME the only observable that tells the two apart.
        expect(result.stderr).toContain('--invalid-flag');
        expect(result.stderr).not.toContain('query required');
      });
    });
  });

  // multi-domain tests: prove search works across different patent categories
  // IMPORTANT: use technical patent terminology, not consumer terms
  // see blueprint: USPTO API returns OR matches, patent titles use technical terms

  given('[case8] fastener driver search (LIVE API)', () => {
    beforeAll(() => requireUsptoKey());

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
    beforeAll(() => requireUsptoKey());

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
    beforeAll(() => requireUsptoKey());

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

  /**
   * .what = the arg-parse arms no other case reaches
   *
   * .why  = an ARM WALK of patent.priors.search.sh:30-81 found FIVE arms with
   *         zero coverage: the `-h` alias, the rhachet passthrough, `--since`,
   *         `--until`, and — least obviously — `--limit`, which THREE cases
   *         pass and NONE assert on. every one is a line each invocation runs
   *         past, so a line-coverage report scores the block at 100%.
   *
   * ⛔ THE REPORT ECHO IS NOT EVIDENCE ABOUT THE ACT. `emit_results` at :284
   *    re-prints `--limit N --since D --until D` from the SAME variables the
   *    parser set, so a `toContain('--limit 7')` is satisfied by a skill that
   *    parsed the flag perfectly and then never reached the url builder. the
   *    only observable that separates the two is the URL handed to `curl` at
   *    :147-155 — which is why these cases shim the network rather than
   *    assert on the header.
   *
   * ⚠️ hermetic ON PURPOSE. the LIVE cases above are red today while
   *    USPTO_ODP_API_KEY is unfilled, so a clamp that needed the credential
   *    could not bite until that lands. these four run with no key and no
   *    network, and hold whatever the credential does.
   */
  given('[case11] the arg-parse arms', () => {
    when('[t0] the -h alias is used', () => {
      const result = useBeforeAll(async () =>
        runSearch({ searchArgs: ['-h'] }),
      );

      then('it prints usage and exits clean', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage');
        expect(result.stdout).toContain('--query');
      });

      then('⭐ it is NOT refused as an unknown argument', () => {
        // .why = drop `-h` from `--help|-h` and it falls to the refusing `*)`,
        //        so a HELP REQUEST is rejected as `unknown argument: -h` at
        //        exit 2. the assertion above catches that via the exit code —
        //        this one names the misdiagnosis, so the red says WHY.
        expect(result.stderr).not.toContain('unknown argument');
      });
    });

    when('[t1] rhachet passes --skill, --repo and --role', () => {
      const result = useBeforeAll(async () =>
        runSearch({
          searchArgs: [
            '--skill',
            'patent.priors.search',
            '--repo',
            'rhight',
            '--role',
            'patenter',
            '--query',
            'ab',
          ],
        }),
      );

      then('it validates the QUERY, not the flag value', () => {
        // .why = the run must reach `validate_query` — which proves all three
        //        rhachet flags were consumed WITH their values and the parser
        //        moved on. no credential is touched: the length guard refuses
        //        before `check_api_key`.
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('too short');
      });

      then('⭐ it does NOT read a flag value as an argument', () => {
        // .why = `shift 2` -> `shift` on this arm leaves the VALUE at the head
        //        of the queue, so the next loop lands on `*)` and refuses with
        //        `unknown argument: patent.priors.search` — the skill's own
        //        name, reported as a bad flag.
        expect(result.stderr).not.toContain('unknown argument');
      });
    });

    when('[t2] --limit is given', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'patent-priors-search-limit',
        });
        const api = genFakeApi({ tempDir });
        const got = runSearch({
          searchArgs: ['--query', 'wireless transceiver rig', '--limit', '7'],
          binFirst: api.bin,
        });
        return { got, url: fs.readFileSync(api.urlLog, 'utf-8') };
      });

      then('the report states the limit it was handed', () => {
        expect(scene.got.exitCode).toBe(0);
        expect(scene.got.stdout).toContain('--limit 7');
      });

      then('⭐ the REQUEST carries the limit, not the default', () => {
        // ⛔ the assertion above is satisfied by a skill that parsed `--limit`
        //    and then built its url from a hardcoded 20 — because the header
        //    is rendered from PAGE_LIMIT too. this is the only assertion in
        //    the file that reads the value where it does work.
        expect(scene.url).toContain('pagination.limit=7');
        expect(scene.url).not.toContain('pagination.limit=20');
      });
    });

    when('[t3] --since and --until are given', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'patent-priors-search-dates',
        });
        const api = genFakeApi({ tempDir });
        const got = runSearch({
          searchArgs: [
            '--query',
            'wireless transceiver rig',
            '--since',
            '2020-01-01',
            '--until',
            '2021-12-31',
          ],
          binFirst: api.bin,
        });
        return { got, url: fs.readFileSync(api.urlLog, 'utf-8') };
      });

      then('the report states both dates', () => {
        expect(scene.got.exitCode).toBe(0);
        expect(scene.got.stdout).toContain('--since 2020-01-01');
        expect(scene.got.stdout).toContain('--until 2021-12-31');
      });

      then('⭐ each date reaches its OWN query parameter', () => {
        // ⛔ the two arms are adjacent, identically shaped, and differ only in
        //    which variable feeds which parameter — the SWAP shape. a bare
        //    presence check on each date passes under the swap, because both
        //    dates are still in the url. only the PAIRS discriminate.
        expect(scene.url).toContain('publicationDateStart=2020-01-01');
        expect(scene.url).toContain('publicationDateEnd=2021-12-31');
      });

      then(
        '⭐ the cross-pair is ABSENT — a swap does not read as clean',
        () => {
          expect(scene.url).not.toContain('publicationDateStart=2021-12-31');
          expect(scene.url).not.toContain('publicationDateEnd=2020-01-01');
        },
      );
    });
  });

  /**
   * .what = the four refusal arms of `search_uspto`, none of which any case
   *         in this file reaches.
   *
   * .why  = a MESSAGE walk of patent.priors.search.sh found four refusals
   *         behind `curl`, and THREE of them exit 1. so an assertion on the
   *         exit code cannot tell one from another — nor from the generic
   *         bash abort. the MESSAGE is the only observable that discriminates
   *         (leak 6, `rule.require.assertions-that-discriminate`).
   *
   * ⛔ AND THE REMEDY HALF WAS SWALLOWED — fixed 2026-09-04. main() calls
   *    `response=$(search_uspto)` at :427, so the whole function runs in a
   *    COMMAND SUBSTITUTION and every plain `echo` in it was captured into
   *    `$response` and discarded. only `print_blocked`, which writes to
   *    stderr, escaped. so a caller who hit a 401 was told authentication
   *    failed and was never handed the url that fixes it.
   *
   *    the cure is `>&2` on each remedy line, which also puts both halves of
   *    every refusal on ONE stream. the four clamps below read STDERR, so
   *    each reddens if its `>&2` is dropped, while the verdict half — already
   *    on stderr via `print_blocked` — stays green.
   *
   * ⚠️ `sleep` is shimmed to a no-op by genFakeApi. three of these arms sit
   *    behind `max_retries=3` with a 2s/4s or 5s/5s wait, which would put
   *    them near the 60s spawn timeout for no signal at all.
   */
  given('[case12] the refusals behind curl', () => {
    when('[t0] the transport itself fails, every attempt', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'patent-priors-search-curl-dies',
        });
        const api = genFakeApi({ tempDir, curlDies: true });
        return runSearch({
          searchArgs: ['--query', 'wireless transceiver rig'],
          binFirst: api.bin,
        });
      });

      then('it exits 1 — a MALFUNCTION, not a constraint', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ it SAYS the API was unreachable', () => {
        // .why = this arm shares exit 1 with the 429 arm and the generic-http
        //        arm, twenty lines apart in one function. the code tells the
        //        three apart from each other not at all, and from a bare
        //        `set -e` abort not at all either.
        expect(scene.stderr).toContain('API unavailable');
      });

      then('⭐ and it is NOT one of its two exit-1 siblings', () => {
        expect(scene.stderr).not.toContain('rate limited');
        expect(scene.stderr).not.toContain('API error: HTTP');
      });

      then('⭐ and the REMEDY reaches the caller — on STDERR', () => {
        // ⛔ THE SWALLOW, and why `>&2` carries the whole weight here. main()
        //    calls `response=$(search_uspto)`, so this function runs in a
        //    COMMAND SUBSTITUTION — a plain `echo` lands in $response and is
        //    discarded. measured absent before the fix: the caller was told
        //    the API is down and not one word about what to do.
        //
        // ⚠️ so the STREAM is the assertion. drop the `>&2` and this reddens
        //    while the verdict assertion above stays GREEN, because
        //    `print_blocked` was already on stderr and never moved.
        expect(scene.stderr).toContain(
          'check network connection and try again',
        );
      });
    });

    when('[t1] the API answers 429, every attempt', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'patent-priors-search-429' });
        const api = genFakeApi({ tempDir, httpCode: '429' });
        return runSearch({
          searchArgs: ['--query', 'wireless transceiver rig'],
          binFirst: api.bin,
        });
      });

      then('it exits 1', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ it SAYS the caller was rate limited', () => {
        expect(scene.stderr).toContain('rate limited');
      });

      then('⭐ and it is NOT read as an unreachable API', () => {
        // ⛔ these two arms are the ones a human acts on DIFFERENTLY: one says
        //    wait a moment, the other says check the network. same exit code.
        expect(scene.stderr).not.toContain('API unavailable');
      });

      then('⭐ and the REMEDY reaches the caller — on STDERR', () => {
        // the swallow's twin; see the note on [t0].
        expect(scene.stderr).toContain('try again in a few seconds');
      });
    });

    when('[t2] the API answers 401', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'patent-priors-search-401' });
        const api = genFakeApi({ tempDir, httpCode: '401' });
        return runSearch({
          searchArgs: ['--query', 'wireless transceiver rig'],
          binFirst: api.bin,
        });
      });

      then(
        '⭐ it exits 2 — a CONSTRAINT, and the only arm here that does',
        () => {
          // .why = the one arm in this function the caller can actually fix. the
          //        exit code IS a discriminator here, uniquely — which is why
          //        the message clamps below matter less for triage and more for
          //        the remedy they carry.
          expect(scene.exitCode).toBe(2);
        },
      );

      then('⭐ it names AUTHENTICATION and the code it got', () => {
        expect(scene.stderr).toContain('API authentication failed');
        expect(scene.stderr).toContain('401');
      });

      then('⭐ and it is not read as a generic http error', () => {
        expect(scene.stderr).not.toContain('API error: HTTP');
      });

      then(
        '⭐ BOTH remedy lines reach the caller — the sharpest of the four',
        () => {
          // ⛔ the two most actionable lines in the whole skill: verify the key,
          //    and the url to get one. before the `>&2` fix both were echoed to
          //    stdout inside the command substitution and discarded — so a
          //    caller with no key was told authentication failed and was NEVER
          //    handed the url that fixes it.
          expect(scene.stderr).toContain('verify USPTO_ODP_API_KEY is valid');
          expect(scene.stderr).toContain('https://data.uspto.gov');
        },
      );
    });

    when('[t3] the API answers 500, every attempt', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({ slug: 'patent-priors-search-500' });
        const api = genFakeApi({ tempDir, httpCode: '500' });
        return runSearch({
          searchArgs: ['--query', 'wireless transceiver rig'],
          binFirst: api.bin,
        });
      });

      then('it exits 1', () => {
        expect(scene.exitCode).toBe(1);
      });

      then('⭐ it names the CODE it actually got', () => {
        // .why = this arm's whole value is the http code. `API error: HTTP`
        //        with the code dropped tells a human less than the raw curl
        //        would have, and no exit code can carry it.
        expect(scene.stderr).toContain('API error: HTTP 500');
      });

      then('⭐ and it is neither of its two exit-1 siblings', () => {
        expect(scene.stderr).not.toContain('API unavailable');
        expect(scene.stderr).not.toContain('rate limited');
      });
    });
  });

  /**
   * .what = the two keyrack refusals, which no case reaches.
   *
   * .why  = both are THIN — `echo "$keyrack_json"` is pure interpolation, so
   *         the only assertable literal is the `print_blocked` half. and the
   *         two refuse at the SAME exit code on ADJACENT branches of one
   *         function, so the code discriminates neither.
   *
   * ⭐ these run BEFORE any network call, and the `rhx` stub is what makes
   *    them reachable with no vault and no credential.
   */
  given('[case13] the keyrack refusals', () => {
    when('[t0] the vault call itself fails', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'patent-priors-search-vault-dies',
        });
        const api = genFakeApi({ tempDir, keyrack: 'dies' });
        return runSearch({
          searchArgs: ['--query', 'wireless transceiver rig'],
          binFirst: api.bin,
        });
      });

      then('it exits 2 — a CONSTRAINT the caller can fix', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS the vault call failed', () => {
        expect(scene.stderr).toContain('keyrack failed');
      });

      then(
        '⭐ and NOT that a secret came back empty — the arms are adjacent',
        () => {
          // ⛔ the two branches are eight lines apart, both exit 2, both print a
          //    blocked banner. a caller who reads only the code cannot tell an
          //    UNREACHABLE vault from an EMPTY grant, and the two have different
          //    remedies.
          expect(scene.stderr).not.toContain('no secret');
        },
      );

      then('⭐ the vault DIAGNOSTIC is relayed, not dropped', () => {
        // ⛔ THIN MESSAGE: `echo "$keyrack_json"` carries no literal of its
        //    own, so the only way to clamp it is through a value the stub
        //    plants. delete the echo and this is the only assertion that
        //    reddens.
        //
        // ⭐ and note the STREAM: check_api_key is called from main() at :424
        //    directly, NOT inside a command substitution — so unlike the four
        //    arms in [case12], this echo DOES reach the caller.
        expect(scene.stdout).toContain('vault sealed');
      });
    });

    when('[t1] the vault answers with no secret in the grant', () => {
      const scene = useBeforeAll(async () => {
        const tempDir = await genTempDir({
          slug: 'patent-priors-search-vault-empty',
        });
        const api = genFakeApi({ tempDir, keyrack: 'no-secret' });
        return runSearch({
          searchArgs: ['--query', 'wireless transceiver rig'],
          binFirst: api.bin,
        });
      });

      then('it exits 2', () => {
        expect(scene.exitCode).toBe(2);
      });

      then('⭐ it SAYS the grant carried no secret', () => {
        expect(scene.stderr).toContain('no secret');
      });

      then('⭐ and NOT that the vault call failed — the vault answered', () => {
        expect(scene.stderr).not.toContain('keyrack failed');
      });

      then('⭐ and the run never reached the network', () => {
        // .why = the guard's whole job is to refuse BEFORE a request goes out
        //        with an empty `X-Api-Key`. the curl stub in this scene would
        //        have answered 200, so a reached-network run would exit 0 —
        //        which makes the ABSENCE of a report the discriminator.
        expect(scene.stdout).not.toContain('patent.priors.search --query');
      });
    });
  });
});
