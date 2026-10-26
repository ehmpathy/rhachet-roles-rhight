import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, when } from 'test-fns';

/**
 * .what = verifies notary.find reports a MATCH and a MISS differently, and
 *         refuses to answer from a snapshot it cannot vouch for
 *
 * .why  = this skill answers one question — "is my RON vendor registered in
 *         this state?" — and the two answers are NOT symmetric:
 *
 *           a MATCH is a real signal.
 *           a MISS is almost no signal at all.
 *
 *         a tool that rendered a miss as "not registered" would be
 *         confidently wrong in the direction that costs a signer a valid
 *         notarization. so [case2] is the load-bearing case: a miss must
 *         exit 0, must say out loud that it is not a verdict, and must hand
 *         over the manual path.
 *
 *         [case4] is the second: a snapshot whose harvest did not match the
 *         source's own stated total produces MISSES THAT LOOK LIKE ANSWERS.
 *         the skill must block rather than answer from it.
 */
describe('notary.find.sh', () => {
  const scriptPath = path.join(__dirname, 'notary.find.sh');

  const run = (
    args: string[],
  ): { stdout: string; stderr: string; exitCode: number } => {
    const result = spawnSync('bash', [scriptPath, ...args], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exitCode: result.status ?? 1,
    };
  };

  given('[case1] a vendor the state HAS registered', () => {
    when('[t0] Proof is checked against the Florida snapshot', () => {
      const result = run(['--state', 'florida', '--vendor', 'Proof']);

      then('it succeeds', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('it names the match as registered', () => {
        expect(result.stdout).toContain('registered,');
        expect(result.stdout).toContain('match: yes');
        expect(result.stdout).toContain('Proof.com');
      });

      /**
       * .why = a registration lapses. a match that reads as permanent is a
       *        match that will be relied on a year after it stopped being
       *        true, so the age and the live url ride along with every hit.
       */
      then('it carries the snapshot age and the live url', () => {
        expect(result.stdout).toMatch(
          /snapshot: \d{4}-\d{2}-\d{2} \(\d+d old\)/,
        );
        expect(result.stdout).toContain('re-verify');
        expect(result.stdout).toContain(
          'https://online-notary.sunbiz.org/ServiceProviders',
        );
      });

      then('output matches snapshot', () => {
        // the age line moves every day, so it is masked out; the rest of
        // the tree is stable against the committed registry.
        expect(
          result.stdout.replace(/\(\d+d old/g, '(NNd old'),
        ).toMatchSnapshot();
      });
    });

    when('[t1] the search is case-insensitive and substring-based', () => {
      const upper = run(['--state', 'FLORIDA', '--vendor', 'PROOF']);
      const lower = run(['--state', 'florida', '--vendor', 'proof']);

      /**
       * .why = the registry itself is inconsistently cased — the same firm
       *        appears as both `Notarize, Inc.` and `NOTARIZE, INC.`. a
       *        case-sensitive check would miss half its own d/b/a spread.
       */
      then('the case of the query changes no result', () => {
        expect(upper.exitCode).toBe(0);
        expect(lower.exitCode).toBe(0);
        expect(upper.stdout.replace(/PROOF/g, 'proof')).toEqual(lower.stdout);
      });
    });

    when('[t2] a token that spans several d/b/a spellings is used', () => {
      const result = run(['--state', 'florida', '--vendor', 'notariz']);

      /**
       * .why = ⚠️ THE D/B/A TRAP, clamped. one firm sits in this snapshot
       *        under six distinct names, and `Proof` reaches only two of
       *        them. if this ever collapses to a couple of hits, the dedupe
       *        or the harvest has regressed and a signer would read a
       *        vendor's footprint as far smaller than it is.
       */
      then('every casing variant surfaces, not just one', () => {
        expect(result.stdout).toContain('Notarize, Inc.');
        expect(result.stdout).toContain('NOTARIZE, INC.');
        expect(result.stdout).toContain('Notarize, Inc. d/b/a Proof.com');
        expect(result.stdout).toContain('Notarize.com');
        expect(result.stdout).toContain('NOTARIZE.COM');
      });

      /**
       * .why = ⚠️ THE COUNT, which the list above does NOT clamp. the case
       *        directly above asserts the five NAMES and leaves the
       *        `names matched: N` header — the line a reader actually
       *        scans — read by no assertion at all. so a hardcoded `1`
       *        renders six names beneath a header that says one, a direct
       *        self-contradiction on the face of the report, at a fully
       *        green suite.
       *
       *        this is the "cure never reaches the instrument" shape: the
       *        list was clamped because a regression there was imagined,
       *        and the summary derived FROM that list was not.
       *
       *        asserted as a RELATION, never a literal, so it survives the
       *        next registry pull: the stated count must equal the rows
       *        actually rendered, and must exceed one. a hardcoded `1`
       *        fails on both halves.
       */
      then('the stated count equals the names it actually printed', () => {
        const stated = /names matched: (\d+)/.exec(result.stdout);
        expect(stated).not.toBeNull(); // ⭐ positive control: the line exists

        // slice the rendered block, and REFUSE on a missed marker — a
        // fall-through would count the whole report under a name that
        // promises one section.
        const lines = result.stdout.split('\n');
        const at = lines.findIndex((line) => line.includes('as registered'));
        expect(at).toBeGreaterThan(-1);
        const rest = lines.slice(at + 1);
        const end = rest.findIndex((line) => line.includes('snapshot:'));
        expect(end).toBeGreaterThan(-1);

        const rendered = rest
          .slice(0, end)
          .filter((line) => line.trim().length > 0);

        expect(rendered.length).toBe(Number(stated![1]));
        expect(rendered.length).toBeGreaterThan(1);
      });
    });
  });

  given('[case2] a vendor absent from the snapshot', () => {
    /**
     * .why = ⚠️ THE LOAD-BEARING CASE. the registry grows continuously and
     *        vendors register under a parent name, a d/b/a, or a product
     *        name, so absence from a dated snapshot proves very little. the
     *        failure this guards against is a future "simplification" that
     *        makes a miss exit non-zero or print "not registered" — either
     *        of which would talk a signer out of a vendor that is in fact
     *        registered.
     */
    when('[t0] a vendor with no rows is checked', () => {
      const result = run([
        '--state',
        'florida',
        '--vendor',
        'a vendor that is not in this registry',
      ]);

      then('it exits 0 — a miss is not a failure', () => {
        expect(result.exitCode).toBe(0);
      });

      then('it never says the vendor is unregistered', () => {
        expect(result.stdout).toContain('not in this snapshot');
        expect(result.stdout).toContain('match: none');
        expect(result.stdout).toContain(
          'this is NOT evidence the vendor is unregistered',
        );
        expect(result.stdout).not.toMatch(/\bnot registered\b/);
      });

      then('it hands over the manual path, with the View All trap', () => {
        expect(result.stdout).toContain('check by hand');
        expect(result.stdout).toContain(
          'https://online-notary.sunbiz.org/ServiceProviders',
        );
        expect(result.stdout).toContain("click 'View All'");
      });

      /**
       * .why = the name-vs-registration spread is what makes the caution
       *        land, and it is COMPUTED from the snapshot rather than typed
       *        into the prose — a hand-typed count would be stale on the
       *        next pull (rule.forbid.hand-computed-figures).
       */
      then('the spread it cites is computed, not hard-typed', () => {
        expect(result.stdout).toMatch(
          /\d+ registrations here carry only \d+ distinct names/,
        );
      });

      /**
       * .why = ⚠️ THE ASSERTION ABOVE IS SYMMETRIC, so it cannot see the one
       *        defect that matters here: a SWAP of the two variables. it
       *        matches `\d+ … \d+` either way round, and the swapped line
       *        reads `100 registrations here carry only 121 distinct names`
       *        — arithmetically impossible, and the exact INVERSE of the
       *        caution's point (many registrations collapse to few names,
       *        so keep looking under other names).
       *
       *        clamped two ways, neither of which is a literal:
       *
       *        1. the INVARIANT. the registry lists a vendor once per
       *           registration and this snapshot dedupes to names, so
       *           registrations can never be fewer than distinct names —
       *           true for any future pull, violated by the swap.
       *        2. an INDEPENDENT CHANNEL. list mode prints both figures in
       *           its own header, from the same two variables, so the two
       *           outputs must agree on which number is which.
       */
      then('each number lands in the slot that belongs to it', () => {
        const spread =
          /(\d+) registrations here carry only (\d+) distinct names/.exec(
            result.stdout,
          );
        expect(spread).not.toBeNull(); // ⭐ positive control: the line exists

        const registrations = Number(spread![1]);
        const names = Number(spread![2]);

        // 1. the invariant — a dedupe can only ever shrink a count
        expect(registrations).toBeGreaterThan(names);

        // 2. the independent channel — list mode reads the same two
        //    variables into its own header, so a swap here disagrees there
        const list = run(['--state', 'florida']);
        expect(list.stdout).toContain(`registrations: ${registrations}`);
        expect(list.stdout).toContain(`distinct names: ${names}`);
      });

      then('output matches snapshot', () => {
        expect(
          result.stdout.replace(/\(\d+d old/g, '(NNd old'),
        ).toMatchSnapshot();
      });
    });
  });

  given('[case3] the whole list, and the retail filter', () => {
    when('[t0] no vendor is named', () => {
      const result = run(['--state', 'florida']);

      then('it lists the registry with its provenance', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('registrations: 121');
        expect(result.stdout).toContain('distinct names: 100');
      });
    });

    when('[t1] the retail filter is applied', () => {
      const all = run(['--state', 'florida']);
      const retail = run(['--state', 'florida', '--retail']);

      then('it succeeds and narrows the list', () => {
        expect(retail.exitCode).toBe(0);
        expect(retail.stdout.split('\n').length).toBeLessThan(
          all.stdout.split('\n').length,
        );
      });

      /**
       * .why = the registry carries no retail/wholesale facet — most of its
       *        100 names are title and mortgage platforms with no retail
       *        path. so this list is CURATED, and the output must say so or
       *        a reader will take it for a state classification.
       */
      then('it discloses the filter is curated, not a registry facet', () => {
        expect(retail.stdout).toContain('curated, not a registry facet');
      });

      then('the retail names are the shortlist in the brief', () => {
        expect(retail.stdout).toContain('Proof.com');
        expect(retail.stdout).toContain('NotaryLive');
        expect(retail.stdout).toContain('BlueNotary');
      });

      /**
       * .why = ⚠️ the `-i` on the filter's grep is LOAD-BEARING, not a
       *        convenience. the registry records the same firm in several
       *        casings, and NOTARYCAM appears in NO casing but the upper
       *        one — so a drop of the `-i` loses six names from the retail
       *        list, including that vendor ENTIRELY.
       *
       *        a signer reads the shortlist and concludes NotaryCam is not
       *        a Florida retail option. that is exactly the direction of
       *        error the skill's own header names as the one that costs a
       *        signer a valid notarization.
       *
       *        ⛔ the three names asserted directly above CANNOT see this:
       *        every one of them is spelled in a casing the pattern matches
       *        literally, so they survive a case-sensitive filter unharmed.
       *        the case-blindness is a property of the assertion SET, not of
       *        any one line in it.
       */
      then(
        'the filter is case-insensitive, so an UPPER-only firm survives',
        () => {
          // ⭐ positive control: this firm IS registered, so its absence
          //    from the retail list could only ever be a FILTER defect —
          //    never a registry absence.
          expect(all.stdout).toContain('NOTARYCAM, INC.');
          expect(retail.stdout).toContain('NOTARYCAM, INC.');

          // and a firm the registry records in three casings keeps all three
          expect(retail.stdout).toContain('Blue Notary');
          expect(retail.stdout).toContain('BlueNotary');
          expect(retail.stdout).toContain('BLUENOTARY');
        },
      );

      /**
       * .why = ⚠️ THE TEETH on the curation claim. the first version of the
       *        filter was an unanchored `Notarize` alternative, which swept
       *        in two firms no human here has checked — `JustNotarized Inc.`
       *        and `NOTARIZE NORD`. a curated list that quietly admits
       *        strangers is worse than no filter, because its only value is
       *        the claim that someone looked.
       *
       *        both names are genuinely in the registry, so this goes red
       *        the moment the anchor is dropped.
       */
      then('firms nobody curated stay out, though they are registered', () => {
        expect(all.stdout).toContain('JustNotarized Inc.');
        expect(all.stdout).toContain('NOTARIZE NORD');
        expect(retail.stdout).not.toContain('JustNotarized');
        expect(retail.stdout).not.toContain('NOTARIZE NORD');
      });

      /**
       * .why = an omission is not a judgment. a reader who takes the retail
       *        list for a whitelist would rule out a perfectly good vendor
       *        on the strength of a curation nobody ever performed on it.
       */
      then(
        'it says an absent vendor was never checked, not disqualified',
        () => {
          expect(retail.stdout).toContain(
            'was not judged — only never checked',
          );
          expect(retail.stdout).toContain('drop --retail');
        },
      );
    });
  });

  given('[case4] a snapshot whose harvest was never verified complete', () => {
    /**
     * .why = ⛔ this is the defect the whole skill exists to prevent. the
     *        first Florida harvest returned 51 of 121 rows, exited 0, and
     *        reported a plausible number — a partial registry produces
     *        MISSES THAT LOOK LIKE ANSWERS. so the skill reads the pull's
     *        own completeness assertion and refuses rather than answer from
     *        a snapshot that cannot support a miss.
     */
    const genTempSkill = (registry: unknown): string => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notary-find-'));
      for (const file of ['notary.find.sh', 'output.sh'])
        fs.copyFileSync(path.join(__dirname, file), path.join(dir, file));
      fs.mkdirSync(path.join(dir, 'registry'));
      fs.writeFileSync(
        path.join(dir, 'registry', 'jurisdiction=usa-testland.json'),
        JSON.stringify(registry, null, 2),
      );
      return dir;
    };

    const runAt = (
      dir: string,
      args: string[],
    ): { stdout: string; stderr: string; exitCode: number } => {
      const result = spawnSync(
        'bash',
        [path.join(dir, 'notary.find.sh'), ...args],
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      );
      return {
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        exitCode: result.status ?? 1,
      };
    };

    when('[t0] the snapshot carries complete: false', () => {
      const dir = genTempSkill({
        url: 'https://example.invalid/registry',
        pulledAt: '2026-08-30T00:00:00.000Z',
        statedTotal: 121,
        harvested: 51,
        complete: false,
        uniqueNameCount: 44,
        names: ['Proof.com'],
      });
      const result = runAt(dir, ['--state', 'testland', '--vendor', 'Proof']);

      then('it blocks rather than answer', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain('INCOMPLETE');
      });

      then('it names why a miss would be unreliable', () => {
        expect(result.stderr).toContain(
          "did not match the source's own stated total",
        );
      });

      /**
       * .why = ⚠️ THE TEETH. `Proof.com` IS present in the fixture's names,
       *        so a skill that skipped the completeness check would happily
       *        print a match here. the absence of one is what proves the
       *        guard fires before the lookup.
       */
      then('it does NOT answer from the partial data', () => {
        expect(result.stdout).not.toContain('match:');
      });
    });

    when('[t1] the same snapshot is marked complete', () => {
      const dir = genTempSkill({
        url: 'https://example.invalid/registry',
        pulledAt: '2026-08-30T00:00:00.000Z',
        statedTotal: 2,
        harvested: 2,
        complete: true,
        uniqueNameCount: 2,
        names: ['Proof.com', 'NotaryLive'],
      });
      const result = runAt(dir, ['--state', 'testland', '--vendor', 'Proof']);

      then('it answers', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('match: yes');
      });
    });
  });

  given('[case5] inputs that must be refused rather than answered', () => {
    when('[t0] no state is named', () => {
      const result = run(['--vendor', 'Proof']);

      /**
       * .why = a notarization is governed by the law of the state where the
       *        ACT happens, so a stateless answer is not a smaller answer —
       *        it is a wrong one.
       */
      then('it blocks as a constraint and names the states it ships', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('--state is required');
        expect(result.stderr).toContain('florida');
      });
    });

    when('[t1] a state with no shipped registry is named', () => {
      const result = run(['--state', 'nebraska']);

      then('it blocks and lists what IS available', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain(
          'no registry shipped for state: nebraska',
        );
        expect(result.stderr).toContain('florida');
      });
    });

    when('[t2] an unknown argument is passed', () => {
      const result = run(['--state', 'florida', '--wat']);

      then('it blocks and echoes the bad argument', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain('--wat');
      });

      /**
       * ⛔ THE ECHOED ARGUMENT IS NOT THE VERDICT. `--wat` is the hole in
       *    `unknown argument: $1`, and all five refusals in this file end at
       *    `exit 1` or `exit 2`, so a token that only reads the hole cannot
       *    say WHICH refusal fired — it says only that the input was echoed.
       *
       *    the plausible defect is a tidy-up: reuse the `no registry shipped
       *    for state: $STATE` block for both arms. stderr then reads
       *    `no registry shipped for state: --wat`, at exit 2, with `--wat`
       *    present — so BOTH extant assertions stay GREEN while the human is
       *    told their STATE is unsupported and pointed at the state list,
       *    when the real cure is `--help`.
       */
      then('⭐ and the verdict names the ARGUMENT, not the state', () => {
        expect(result.stderr).toContain('unknown argument:');
      });

      /**
       * ⚠️ SPLIT ON PURPOSE, and pointed at the OTHER HALF of the message.
       *    jest halts a `then` at its first red, so two assertions in one
       *    block can never be measured apart — and these read different
       *    lines: the one above reads the VERDICT (what went wrong), this
       *    one the REMEDY (what to do), which is the half a human acts on.
       *
       *    the plausible defect is a "be more helpful" edit that points the
       *    remedy at a re-run with `--state` instead of at the usage. the
       *    verdict is untouched, so every other assertion here stays GREEN
       *    while the human is sent to repeat the exact call that failed.
       */
      then('⭐ and the remedy points at the usage', () => {
        expect(result.stderr).toContain('notary.find --help');
      });
    });
  });

  given('[case6] the help text', () => {
    when('[t0] --help is passed', () => {
      const result = run(['--help']);

      then('it succeeds and teaches the command', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--vendor');
        expect(result.stdout).toContain('--retail');
      });

      /**
       * .why = the asymmetry is the whole contract of this skill. a reader
       *        who learns it only from a miss in the wild has already had
       *        one chance to misread one.
       */
      then(
        'the asymmetry is stated in the help, not only in the output',
        () => {
          expect(result.stdout).toContain('ASYMMETRIC');
        },
      );
    });
  });

  /**
   * .what = the `--skill` / `--repo` / `--role` arm — the flags rhachet
   *         appends to EVERY skill it runs, so this arm executes on every
   *         real `rhx notary.find`
   *
   * ⛔ AND NO CASE IN THIS FILE REACHED IT. [case5][t2] exercises the `*)`
   *    refusal with `--wat`, which is the OPPOSITE arm — it proves an
   *    unknown flag IS refused, and says not one word about the three flags
   *    that must NOT be.
   *
   * ⭐ unlike a dispatcher with no `-*` arm, this skill's catch-all REFUSES
   *    at exit 2. so a dead arm here is loud rather than silent: `--skill`
   *    falls through to `*)` and every real rhachet invocation blocks with
   *    `unknown argument: --skill`, before a single registry byte is read.
   *
   * ⚠️ the `shift` / `shift 2` typo lands one step later in the same place:
   *    `shift` leaves the flag's VALUE on the line, so `notary.find` reaches
   *    `*)` and blocks as `unknown argument: notary.find`. the exit code
   *    catches both; the stderr needles tell them apart.
   */
  given('[case7] rhachet passes --skill / --repo / --role', () => {
    when('[t0] the flags are prepended to a real lookup', () => {
      const result = run([
        '--skill',
        'notary.find',
        '--repo',
        'rhight',
        '--role',
        'notary',
        '--state',
        'florida',
        '--vendor',
        'Proof',
      ]);

      then('it succeeds — the flags are consumed, not refused', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('match: yes');
      });

      /**
       * ⭐ one discriminator per defect. a dropped arm echoes the FLAG; a
       *    `shift` typo echoes its VALUE. neither can appear on a run that
       *    consumed them correctly.
       */
      then('⭐ neither the flag nor its value is echoed as unknown', () => {
        expect(result.stderr).not.toContain('--skill');
        expect(result.stderr).not.toContain('notary.find');
      });
    });
  });

  /**
   * .what = the short `-h`, which shares one `case` arm with `--help` and
   *         was reached by no case here — [case6] passes `--help` only
   */
  given('[case8] the short `-h` alias', () => {
    when('[t0] help is requested by its alias', () => {
      const result = run(['-h']);

      then('it renders the same help `--help` does', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('ASYMMETRIC');
      });

      /**
       * ⭐ the discriminator. drop `-h` from the arm and it falls to `*)`,
       *    which refuses it by name — so the alias's own token appears on
       *    stderr exactly when the alias is dead.
       */
      then('⭐ and it is not refused as an unknown argument', () => {
        expect(result.stderr).not.toContain('-h');
      });
    });
  });

  /**
   * .what = the `! command -v jq` guard — the one place this skill checks
   *         its single hard dependency
   *
   * ⛔ NO CASE REACHED IT. every other case runs on a host that has jq, so
   *    the guard sat inert through the whole suite.
   *
   * ⚠️ AND WITHOUT IT THE FAILURE IS ILLEGIBLE. `PULLED_AT="$(jq …)"` under
   *    `set -e` aborts on the assignment line, so the caller gets an empty
   *    stdout, a bare bash `command not found`, and an exit code with no fix
   *    attached to it.
   *
   * ⭐ THE PROBE NEEDS AN ALLOWLIST PATH, NOT A HIDDEN BINARY. a PATH can
   *    only ADD, never subtract, so jq is excluded by BUILDING a bin dir
   *    that links every other tool the skill reaches and omits that one.
   *
   * ⚠️ WHICH MAKES A POSITIVE CONTROL MANDATORY. an incomplete shim also
   *    produces a non-zero exit, so [t1] runs the IDENTICAL PATH with jq
   *    linked in and asserts a clean answer. without it, [t0] cannot tell a
   *    fired guard from a broken fixture.
   */
  given('[case9] jq is absent from PATH', () => {
    const TOOLS = [
      'bash',
      'dirname',
      'basename',
      'tr',
      'date',
      'grep',
      'wc',
      'cat',
      'sed',
      'awk',
    ];

    const genShimBin = (input: { withJq: boolean }): string => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notary-find-bin-'));
      const tools = input.withJq ? [...TOOLS, 'jq'] : TOOLS;
      for (const tool of tools) {
        const found = spawnSync('bash', ['-c', `command -v ${tool}`], {
          encoding: 'utf-8',
        });
        const at = (found.stdout ?? '').trim();
        if (!at) throw new Error(`fixture needs ${tool} on the ambient PATH`);
        fs.symlinkSync(at, path.join(dir, tool));
      }
      return dir;
    };

    const runWithPath = (
      bin: string,
    ): { stdout: string; stderr: string; exitCode: number } => {
      const out = spawnSync(
        'bash',
        [scriptPath, '--state', 'florida', '--vendor', 'Proof'],
        {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { PATH: bin },
        },
      );
      return {
        stdout: out.stdout ?? '',
        stderr: out.stderr ?? '',
        exitCode: out.status ?? 1,
      };
    };

    when('[t0] the skill runs on a PATH that omits jq', () => {
      const result = runWithPath(genShimBin({ withJq: false }));

      /**
       * ⭐ THE ONE ASSERTION THAT BITES. proven by probe: replace the guard
       *    with `if false; then` and this reddens at `Expected: 1, Received:
       *    127` — bash's own `command not found`.
       *
       * ⭐ and note WHY the code discriminates here, when leak 6 says it
       *    usually cannot. that leak is about a wrapper whose refusal code
       *    EQUALS the one its dependency emits unaided. here they differ: the
       *    guard exits 1, and the unguarded path exits 127. so 1-vs-127 is a
       *    real signal, where 1-vs-1 would have been none at all.
       */
      then('it blocks as a MALFUNCTION and names the fix', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain('jq is required');
        expect(result.stderr).toContain('apt-get install jq');
      });

      /**
       * 🚩 THIS EXCLUSION IS TOOTHLESS AGAINST THE DEFECT IT SITS UNDER, and
       *    was measured so: under `if false; then` it stayed GREEN while the
       *    assertion above it reddened.
       *
       *    the cause is the leak-4 shape — an assertion whose channel the
       *    defect ERASES. drop the guard and the run aborts on the first `jq`
       *    assignment under `set -e`, so stdout is EMPTY, so `not.toContain`
       *    is satisfied trivially. the absence it reads is produced BY the
       *    defect rather than prevented by the fix.
       *
       * ✅ it is kept anyway, as a regression clamp on a DIFFERENT defect: a
       *    future guard that prints a partial answer before it refuses. that
       *    is a real hazard and this is the only line that would see it.
       *
       * ⚠️ but it must never be read as evidence the guard fired. [t1] is the
       *    control that proves the shim, and the exit code above is the only
       *    assertion in this block that discriminates.
       */
      then('⭐ and it never answers from a registry it could not read', () => {
        expect(result.stdout).not.toContain('match:');
      });
    });

    when('[t1] the identical PATH, with jq linked in', () => {
      const result = runWithPath(genShimBin({ withJq: true }));

      /**
       * ⭐ THE POSITIVE CONTROL. this proves the shim carries every other
       *    tool the skill reaches, so [t0]'s exit 1 can only be the guard.
       */
      then('it answers cleanly — the shim is otherwise complete', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('match: yes');
      });
    });
  });

  /**
   * .what = the staleness fallback — the jq `// "unknown"` default for a
   *         `pulledAt` the registry never carried, and the inner `date -d`
   *         that could not parse the one it did
   *
   * ⛔ BOTH WERE DEAD. every other case runs against the committed Florida
   *    snapshot, whose date parses, so the whole fallback went unexercised.
   *
   * ⚠️ AND THE `date -d` ONE IS A `set -e` TRAP. it sits inside an `if`, so
   *    its failure is a branch rather than an abort. write it as a bare
   *    assignment and one bad date in a snapshot kills the whole answer,
   *    with an empty stdout and no reason attached. PROVEN: that rewrite
   *    reddens [t1]'s two assertions and leaves [t0] green.
   *
   * ⭐ THE TWO PATHS RENDER THE IDENTICAL AGE. both print `(unknownd old)`,
   *    so an assertion on the age alone cannot say which one fired. they are
   *    told apart by the DAY token, which is `unknown` on one and the
   *    unparsed text on the other — and it is that discriminator, not the
   *    exit code, that reddens under each probe.
   *
   * 🚩 AND ONE ARM HERE IS UNREACHABLE BY ANY ASSERTION, measured rather
   *    than argued. delete the OUTER `[[ "$PULLED_DAY" != "unknown" ]]` and
   *    the suite stays at 42/42 — because `date -d unknown` fails anyway, so
   *    the inner branch already produces the identical output. the outer
   *    guard is harmless redundancy, not a distinct behavior.
   *
   *    it is named here so a later reader does not go hunting for the case
   *    that covers it. no such case can exist: the two arms are observably
   *    the same, and a clamp that claimed otherwise would be a `then`-string
   *    asserting more than its assertion can see.
   */
  given('[case10] a snapshot whose date cannot be read', () => {
    const genTempSkill = (registry: unknown): string => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notary-find-date-'));
      for (const file of ['notary.find.sh', 'output.sh'])
        fs.copyFileSync(path.join(__dirname, file), path.join(dir, file));
      fs.mkdirSync(path.join(dir, 'registry'));
      fs.writeFileSync(
        path.join(dir, 'registry', 'jurisdiction=usa-testland.json'),
        JSON.stringify(registry, null, 2),
      );
      return dir;
    };

    const runAt = (
      dir: string,
      args: string[],
    ): { stdout: string; stderr: string; exitCode: number } => {
      const out = spawnSync(
        'bash',
        [path.join(dir, 'notary.find.sh'), ...args],
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      );
      return {
        stdout: out.stdout ?? '',
        stderr: out.stderr ?? '',
        exitCode: out.status ?? 1,
      };
    };

    const BASE = {
      url: 'https://example.invalid/registry',
      statedTotal: 2,
      harvested: 2,
      complete: true,
      uniqueNameCount: 2,
      names: ['Proof.com', 'NotaryLive'],
    };

    when('[t0] the registry carries no pulledAt at all', () => {
      const result = runAt(genTempSkill(BASE), [
        '--state',
        'testland',
        '--vendor',
        'Proof',
      ]);

      then('it still answers, rather than abort on the absent date', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('match: yes');
      });

      then('⭐ and the day token is the fallback, not a parsed date', () => {
        expect(result.stdout).toContain('snapshot: unknown (unknownd old)');
      });
    });

    when('[t1] pulledAt is present but unparseable', () => {
      const result = runAt(
        genTempSkill({ ...BASE, pulledAt: 'not-a-dateT00:00:00Z' }),
        ['--state', 'testland', '--vendor', 'Proof'],
      );

      then('it still answers, rather than abort on `date -d`', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('match: yes');
      });

      /**
       * ⭐ THE DISCRIMINATOR between the two arms. [t0] renders the day as
       *    `unknown`; this one renders the text the registry actually held,
       *    so only the age falls back. an assertion on `(unknownd old)`
       *    alone would be satisfied by either.
       */
      then(
        '⭐ the day is the unparsed text, and only the age falls back',
        () => {
          expect(result.stdout).toContain(
            'snapshot: not-a-date (unknownd old)',
          );
        },
      );
    });
  });

  /**
   * .what = the final block of LIST mode — `verify live before you buy` and
   *         the two-line manual path beneath it
   *
   * ⛔ AN OUTPUT EVERY LIST RUN EMITS AND NO ASSERTION READ. [case3][t0]
   *    reads the two counts and stops. [case2] reads the same manual-path
   *    lines, but only in MISS mode — a different branch that prints its own
   *    copy of them.
   *
   * ⚠️ so the `View All` caution could be deleted from list mode with the
   *    suite fully green. that caution is the one fact that stops a reader
   *    who opens the live registry, sees an empty table, and concludes the
   *    state has no registered providers at all.
   */
  given('[case11] the list-mode footer', () => {
    when('[t0] the whole list is printed', () => {
      const result = run(['--state', 'florida']);

      then('it ends with the live-verify footer', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('verify live before you buy');
      });

      then('⭐ and it repeats the View All trap in its own branch', () => {
        expect(result.stdout).toContain(
          'https://online-notary.sunbiz.org/ServiceProviders',
        );
        expect(result.stdout).toContain(
          "click 'View All' — the list is empty until you do",
        );
      });
    });
  });
});
