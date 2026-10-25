import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for quote.verify
 * .why  = this skill decides whether a published block quote is faithful
 *         to the source it cites. a fabricated quotation passes every
 *         other guard, so a detector that cannot report a defect is
 *         indistinguishable from one that found none.
 *
 * .note = [case2] and [case4] are the CLAMPS. [case2] proves the detector
 *         can go red at all; [case4] proves it survives an INDENTED block
 *         quote, the shape that a `\n>?\s*` collapse mangles into a false
 *         "never landed". without [case4] a real fabrication downgrades
 *         into a verdict a reader is trained to dismiss.
 */

const scriptPath = path.join(__dirname, 'quote.verify.sh');

const UTF8 = 'utf-8' as const;

/**
 * the source of record for every case below.
 *
 * .note = the sentence is deliberately over the 40-char fragment floor,
 *         so the default `--min` does not silently drop the fixture.
 */
const SOURCE = [
  'the tortoise shall deliver the signed instrument to the harbormaster,',
  'and upon such delivery and tender of the required fees the harbormaster',
  'shall endorse upon it the word "Logged".',
  '',
  'no fee shall be paid to the harbormaster for receiving an affidavit of',
  'extraordinary tide.',
].join('\n');

const runSkill = (input: {
  args: string[];
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

/**
 * .what = write the source plus an artifact into a throwaway dir
 * .why  = each case needs its own artifact; a temp dir keeps them hermetic
 */
const genTempPair = (input: {
  artifact: string;
  source?: string;
}): { from: string; in: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quote-verify-'));
  const from = path.join(dir, 'source.txt');
  const into = path.join(dir, 'artifact.md');
  fs.writeFileSync(from, input.source ?? SOURCE);
  fs.writeFileSync(into, input.artifact);
  return { from, in: into };
};

describe('quote.verify', () => {
  given('[case1] an artifact whose quote is faithful to the source', () => {
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '> upon such delivery and tender of the required fees the',
          '> harbormaster shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
          '',
          'so the duty to endorse is conditioned on both.',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('it reports no live defects', () => {
        expect(result.stdout).toContain('live defects: 0');
      });

      then('it verified the quote', () => {
        expect(result.stdout).toContain('verified: 1');
      });

      then('both controls hold', () => {
        expect(result.stdout).toContain(
          'CONTROL positive (source is readable): true',
        );
        expect(result.stdout).toContain(
          'CONTROL negative (absent phrase): false',
        );
      });
    });
  });

  given('[case2] an artifact whose quote was REWORDED', () => {
    // ⭐ THE CLAMP. a detector that can only report zero cannot be told
    //    from one that found zero. the word "fees" became "taxes", which
    //    is true in substance and was never written by the authority.
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '> upon such delivery and tender of the required taxes the',
          '> harbormaster shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits 2 — a constraint, a defect was found', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it names the quote NOT-IN-SOURCE', () => {
        expect(result.stdout).toContain('NOT-IN-SOURCE');
      });

      then('it counts the defect as live', () => {
        expect(result.stdout).toContain('live defects: 1');
      });

      then('it attributes the hit to its heading', () => {
        expect(result.stdout).toContain('under: the delivery rule');
      });
    });
  });

  given('[case3] a reworded quote sitting under a RETRACTION banner', () => {
    // permanent-yields demands a corrected error stay on the record, so a
    // CITATION of a defect must be told apart from an INSTANCE of one.
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '> upon such delivery and tender of the required fees the',
          '> harbormaster shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
          '',
          '## 🚩 RETRACTED — this quote was reworded, 2026-09-14',
          '',
          '> upon such delivery and tender of the required taxes the',
          '> harbormaster shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits clean — a citation is not an instance', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('it reports no live defects', () => {
        expect(result.stdout).toContain('live defects: 0');
      });

      then('it counts the retracted quote separately', () => {
        expect(result.stdout).toContain('cited in a retraction: 1');
      });
    });
  });

  given('[case4] a faithful quote INDENTED under a numbered list', () => {
    // ⭐ THE REGRESSION CLAMP for the collapse bug. markdown permits an
    //    indented block quote. under `\n>?\s*` the `>` survives the
    //    collapse and this faithful quote reads as a defect — which
    //    downgrades a real NOT-IN-SOURCE alarm into a needle-bug verdict.
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '1. deliver the instrument, and note the condition:',
          '',
          '   > upon such delivery and tender of the required fees the',
          '   > harbormaster shall endorse upon it the word "Logged".',
          '   > — Harbor Code § 1',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('the indented quote was verified, not reported absent', () => {
        expect(result.stdout).toContain('verified: 1');
        expect(result.stdout).toContain('live defects: 0');
      });
    });
  });

  given('[case5] a faithful quote carrying an ELLIPSIS elision', () => {
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '> the tortoise shall deliver the signed instrument to the',
          '> harbormaster, ... shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
          '> https://example.test/harbor-code',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits clean — an elision is legitimate', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('each fragment was checked on its own', () => {
        expect(result.stdout).toContain('verified: 2');
      });
    });
  });

  given('[case6] an explicit --needle, for a TWO-SIDED read', () => {
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '> upon such delivery and tender of the required fees the',
          '> harbormaster shall endorse upon it the word "Logged".',
        ].join('\n'),
      }),
    );

    when('[t0] the needle is in BOTH the source and the artifact', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--in',
            scene.in,
            '--needle',
            'tender of the required fees',
          ],
        }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });
    });

    when('[t1] the needle is in the SOURCE but never landed', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--in',
            scene.in,
            '--needle',
            'an affidavit of extraordinary tide',
          ],
        }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it names the miss absent-from-artifact', () => {
        expect(result.stdout).toContain('absent-from-artifact');
      });
    });

    when('[t2] the needle is in NEITHER — a two-sided miss', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--in',
            scene.in,
            '--needle',
            'the dockmaster shall refuse the instrument',
          ],
        }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it blames the needle, not the artifact', () => {
        expect(result.stdout).toContain('needle-bug');
      });
    });
  });

  given('[case7] a fragment under the --min floor', () => {
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: ['# a short one', '', '> the word "Logged".'].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('the short fragment is COUNTED, never dropped silent', () => {
        expect(result.stdout).toContain(
          'under the 40-char floor, not tested: 1',
        );
      });
    });
  });

  given('[case8] --help', () => {
    // ⭐ a surface that cannot fail loudly needs an assertion MORE than
    //    one that can: a broken help prints at exit 0 with empty stderr,
    //    so no automated signal could ever report it.
    when('[t0] help is asked for', () => {
      const result = useBeforeAll(async () => runSkill({ args: ['--help'] }));

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('it prints real usage, not a bare shebang', () => {
        expect(result.stdout).toContain('usage:');
        expect(result.stdout).toContain('--needle');
        expect(result.stdout).not.toContain('/usr/bin/env bash');
      });

      then('it prints the verdict table a reader must act on', () => {
        expect(result.stdout).toContain('NOT-IN-SOURCE');
        expect(result.stdout).toContain('absent-from-artifact');
      });

      then('it writes no stderr', () => {
        expect(result.stderr).toEqual('');
      });

      // ⚠️ the awk render is BOUNDED by a second `/^#####/` fence. lose that
      //    fence and help dumps the whole executable — at exit 0, with real
      //    usage text at the top, so every assertion above still passes. the
      //    bound needs its own check.
      then('it stops at the header fence, and does not dump the body', () => {
        expect(result.stdout).not.toContain('set -euo pipefail');
        expect(result.stdout).not.toContain('parse_args()');
      });

      then('every flag the skill accepts is named', () => {
        for (const flag of ['--from', '--in', '--needle', '--min', '--help'])
          expect(result.stdout).toContain(flag);
      });

      // ⭐ help is documentation that ships INSIDE the executable, so it rots
      //    the moment a capability lands without a header edit. this pins the
      //    newest one: a reader who never reads the source must learn from
      //    --help alone that --in takes a directory.
      then('it documents that --in may name a DIRECTORY', () => {
        expect(result.stdout).toContain('CENSUS');
        expect(result.stdout).toContain('.stone');
      });
    });
  });

  given('[case9] a refusal path', () => {
    when('[t0] --from is absent', () => {
      const result = useBeforeAll(async () => runSkill({ args: ['--in', '/tmp/x'] }));

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it names the fix', () => {
        expect(result.stdout).toContain('--from needs the source file');
      });
    });

    when('[t1] the source file does not exist', () => {
      const scene = useBeforeAll(async () => genTempPair({ artifact: '# empty' }));
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--from', '/tmp/no-such-source-zzz.txt', '--in', scene.in],
        }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it names the absent file', () => {
        expect(result.stdout).toContain('source not found');
      });
    });

    when('[t2] --min is not a number', () => {
      const scene = useBeforeAll(async () => genTempPair({ artifact: '# empty' }));
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--from', scene.from, '--in', scene.in, '--min', 'lots'],
        }),
      );

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it names the fix', () => {
        expect(result.stdout).toContain('--min needs a whole number');
      });
    });

    when('[t3] an unknown option is passed', () => {
      const result = useBeforeAll(async () => runSkill({ args: ['--sideways'] }));

      then('it exits 2', () => {
        expect(result.exitCode).toEqual(2);
      });

      then('it names the option it could not read', () => {
        expect(result.stdout).toContain('unknown option: --sideways');
      });
    });
  });

  given('[case10] an EDITORIAL block quote — a callout, not a citation', () => {
    // markdown's `>` does two jobs. only a quotation OF a source makes a claim
    // this skill can check; a callout carries no quote marks and no
    // attribution. it must be COUNTED and named, never reported as a defect
    // and never dropped silent.
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# a note to the reader',
          '',
          '> 🚨 this table once listed costs in a column headed duration, and',
          '> had no duration in it at all. corrected 2026-09-14.',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it exits clean — an aside is not a fabrication', () => {
        expect(result.exitCode).toEqual(0);
      });

      then('the aside is counted in its own bucket', () => {
        expect(result.stdout).toContain(
          'editorial asides, not citations: 1',
        );
      });

      then('it is not counted as a live defect', () => {
        expect(result.stdout).toContain('live defects: 0');
      });
    });
  });

  given('[case11] a quote held only by the SECOND source', () => {
    // ⭐ one artifact routinely cites several pulled containers. with a single
    //    --from, every quote from the other containers reads NOT-IN-SOURCE:
    //    measured at 38 false alarms on one real stone.
    const scene = useBeforeAll(async () => {
      const pair = genTempPair({
        artifact: [
          '# the second harbor',
          '',
          '> the second harbormaster shall keep a ledger of every instrument',
          '> delivered, and shall not amend it after the fact.',
          '> — Harbor Code § 2',
        ].join('\n'),
      });
      const other = path.join(path.dirname(pair.from), 'source.two.txt');
      fs.writeFileSync(
        other,
        'the second harbormaster shall keep a ledger of every instrument\ndelivered, and shall not amend it after the fact.',
      );
      return { ...pair, other };
    });

    when('[t0] only the FIRST source is supplied', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('it reports a false alarm — the clamp for the union', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('live defects: 1');
      });
    });

    when('[t1] both sources are supplied', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            scene.from,
            '--from',
            scene.other,
            '--in',
            scene.in,
          ],
        }),
      );

      then('it exits clean', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('live defects: 0');
      });

      then('each source is reported with its own byte count', () => {
        // ⚠️ a source that came back EMPTY passes every quote to its
        //    neighbours and reads as a clean run. the per-source line is
        //    what makes that visible.
        expect(result.stdout).toContain('source.txt');
        expect(result.stdout).toContain('source.two.txt');
      });
    });
  });

  given('[case12] a PROVENANCE NOTE that wraps a real citation', () => {
    // ⭐ THE DESCENT CLAMP.
    //
    // a note that RECORDS a defect is an aside — it opens with a status marker
    // and quotes a phrase as evidence ABOUT the artifact. it must not be
    // checked as a citation of a source.
    //
    // but a real quotation often lives INSIDE such a note, one `>` level down.
    // to skip the aside whole would narrow the corpus with no word of caution —
    // the exact silent-skip failure this skill exists to catch.
    //
    // ⚠️ the nested quote here is DELIBERATELY REWORDED ('dues' for the
    //    source's 'fees'). so this case can pass ONLY if the descent actually
    //    happened: drop the recursion and the nested defect goes unseen, live
    //    defects reads 0, and the suite would report green over a detector
    //    that quietly stopped short.
    const scene = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the endorsement',
          '',
          '> 🚩 **this quote was reworded until 2026-09-14.** the note above is',
          '> an aside, and makes no claim about any source. the block beneath it',
          '> does:',
          '>',
          '> > "and upon such delivery and tender of the required dues the',
          '> > harbormaster shall endorse upon it the word \'Logged\'."',
          '> >',
          '> > — Harbor Code § 1',
        ].join('\n'),
      }),
    );

    when('[t0] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('the wrapper itself is counted as an aside', () => {
        expect(result.stdout).toContain('editorial asides, not citations: 1');
      });

      then('the NESTED citation was still checked, and caught', () => {
        // this is the assertion the descent is for. it is downstream of the
        // recursion branch, so it cannot be satisfied by a skip.
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('live defects: 1');
        expect(result.stdout).toContain('NOT-IN-SOURCE');
      });

      then('the divergence is located, not merely declared', () => {
        // a bare "not in source" over a long fragment is true and
        // unactionable. the prefix search must name the character.
        expect(result.stdout).toContain('broke at char');
      });
    });
  });

  given('[case13] a source whose EXTRACTION degraded a vulgar fraction', () => {
    // ⛔ THE INVERTED CASE: here the SOURCE is the corrupted side.
    //
    // a text extractor renders `1½ percent` as `11/2 percent`. so a quote
    // that is byte-faithful to the PRINTED statute reads as a fabrication,
    // and the instinct — edit the artifact to match — would corrupt a
    // correct quotation into agreement with a degraded dump.
    //
    // the cure lives in the MATCHER and runs rich -> lossy, never back.
    const LOSSY = [
      'the tax shall bear interest at the rate of 11/2 percent for each',
      'month or portion thereof until fully paid.',
    ].join('\n');

    const scene = useBeforeAll(async () =>
      genTempPair({
        source: LOSSY,
        artifact: [
          '# the interest rate',
          '',
          '> the tax shall bear interest at the rate of 1½ percent for each',
          '> month or portion thereof until fully paid.',
          '> — Harbor Code § 5',
        ].join('\n'),
      }),
    );

    when('[t0] the fixture is inspected', () => {
      // ⭐ THE CONTROL, and it must FAIL in one direction.
      //
      // without it, [t1] below passes just as happily against a source that
      // already carried `1½` — which proves only that a faithful quote
      // matches itself, and says not one word about the normalizer.
      then('the source really is the DEGRADED form, and only that', () => {
        const raw = fs.readFileSync(scene.from, UTF8);
        expect(raw).toContain('11/2');
        expect(raw).not.toContain('1\u00bd');
      });
    });

    when('[t1] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('the faithful quote is reported as faithful', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('live defects: 0');
        expect(result.stdout).toContain('verified: 1');
      });
    });
  });

  given('[case14] a SECTION LABEL above a blank line, then the quotation', () => {
    // ⛔ THE SEAM THE FLATTENER ERASED.
    //
    // the near-universal shape of a statutory citation is a bold label on
    // its own line, a bare `>`, then the quotation inside its own `"` marks.
    // both halves are verbatim in the source. what no source ever held is
    // the JOIN — the artifact opens a `"` the statute has no mark for.
    //
    // flat() collapses a bare `>` into a space, so unless the paragraph seam
    // is cut FIRST, the two halves are tested as one string that cannot
    // match. worse, the break lands on the LABEL, which points the reader at
    // the one part that was never in doubt.
    const LABELLED = [
      // ⚠️ over the 40-char `--min` floor ON PURPOSE. at 31 chars the label
      //    is dropped as too short to test, and the case would assert
      //    `verified: 2` against a run that verified one fragment and
      //    skipped the other — a clamp that grades a fragment it never read.
      '§ 4. Endorsement upon delivery of the signed instrument.',
      '',
      'the tortoise shall deliver the signed instrument to the harbormaster,',
      'and upon such delivery and tender of the required fees the harbormaster',
      'shall endorse upon it the word "Logged".',
    ].join('\n');

    const scene = useBeforeAll(async () =>
      genTempPair({
        source: LABELLED,
        artifact: [
          '# the endorsement rule',
          '',
          '> **§ 4. Endorsement upon delivery of the signed instrument.**',
          '>',
          '> "the tortoise shall deliver the signed instrument to the',
          '> harbormaster, and upon such delivery and tender of the required',
          '> fees the harbormaster shall endorse upon it the word "Logged"."',
          '>',
          '> — Harbor Code § 4',
        ].join('\n'),
      }),
    );

    when('[t0] the fixture is inspected', () => {
      // ⭐ THE CONTROL, and it must FAIL in one direction.
      //
      // without it, [t1] passes just as happily against a source that
      // happens to hold the label and the body on ONE line — which would
      // prove only that a contiguous string matches itself, and would say
      // not one word about the paragraph seam.
      // ⚠️ DERIVED from LABELLED, never restated.
      //
      //    this control used to carry the literal `upon delivery.\n\nthe
      //    tortoise`, which was correct WHEN WRITTEN and false three lines
      //    later: the note above records that the label was lengthened past
      //    the 40-char floor, and the needle did not travel with it. the
      //    fixture was cured; the assertion ABOUT the fixture was not.
      //
      //    it rots toward a FALSE ALARM rather than a false green, which is
      //    the survivable direction — but a control nobody can satisfy is a
      //    control the next reader deletes.
      then('the source really does separate label from body by a BLANK line', () => {
        const raw = fs.readFileSync(scene.from, UTF8);
        const [label, blank, body] = LABELLED.split('\n');
        expect(blank).toEqual('');
        expect(raw).toContain([label, '', body].join('\n'));
        expect(raw).not.toContain([label, body].join(' '));
      });

      // ⭐ AND THE SECOND CONTROL: the artifact must carry the `"` that the
      // source lacks. that inserted mark is the whole reason the join fails,
      // so a fixture without it would clamp no defect at all.
      then('the artifact opens a quote mark the source has no mark for', () => {
        const raw = fs.readFileSync(scene.in, UTF8);
        expect(raw).toContain('> "the tortoise');
        expect(fs.readFileSync(scene.from, UTF8)).toContain('\nthe tortoise');
      });
    });

    when('[t1] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('both halves verify, and neither is called a fabrication', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('live defects: 0');
      });

      then('each paragraph was tested on its own, as with an ellipsis', () => {
        expect(result.stdout).toContain('verified: 2');
      });
    });
  });

  given('[case15] the SAME label seam, inline — `§ 4(a) — "the tortoise ...`', () => {
    // the one-line form of [case14]. a label, an em-dash, then the quote.
    // it breaks at char 5 — right after the section number — which is the
    // least useful place a report can point, because the section number is
    // the part a reader is most confident about.
    const LABELLED = [
      '§ 4. Endorsement upon delivery of the signed instrument.',
      '',
      'the tortoise shall deliver the signed instrument to the harbormaster,',
      'and upon such delivery and tender of the required fees the harbormaster',
      'shall endorse upon it the word "Logged".',
    ].join('\n');

    const scene = useBeforeAll(async () =>
      genTempPair({
        source: LABELLED,
        artifact: [
          '# the endorsement rule',
          '',
          '> § 4(a) — "the tortoise shall deliver the signed instrument to the',
          '> harbormaster, and upon such delivery and tender of the required',
          '> fees the harbormaster shall endorse upon it the word "Logged"."',
          '>',
          '> — Harbor Code § 4',
        ].join('\n'),
      }),
    );

    when('[t0] the fixture is inspected', () => {
      // ⭐ THE CONTROL, and it must FAIL in one direction.
      //
      // the source must NOT hold the joined string `§ 4(a) — "the tortoise`.
      // if it did, the case would pass with the seam cut or without it, and
      // would clamp no defect at all.
      then('the source holds neither the subsection label nor the em-dash join', () => {
        const raw = fs.readFileSync(scene.from, UTF8);
        expect(raw).not.toContain('§ 4(a)');
        expect(raw).not.toContain('— "the tortoise');
      });

      then('the artifact really does glue the label onto the quotation', () => {
        expect(fs.readFileSync(scene.in, UTF8)).toContain('§ 4(a) — "the tortoise');
      });
    });

    when('[t1] the artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.in] }),
      );

      then('the body verifies and the label is not read as fabricated', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('live defects: 0');
        expect(result.stdout).toContain('verified: 1');
      });

      // ⚠️ `§ 4(a)` is 6 chars, so it lands under the --min floor rather
      //    than being verified. that is the correct outcome and it is
      //    asserted HERE, so a later change that silently DROPPED the label
      //    instead of splitting it cannot pass unnoticed.
      then('the split label is reported as under the floor, never as absent', () => {
        expect(result.stdout).toContain('under the 40-char floor, not tested: 1');
      });
    });
  });

  given('[case16] the CENSUS — one --in that names a DIRECTORY of artifacts', () => {
    // .why = the loop this replaces was written by hand on every sweep. an
    //        adhoc loop is not the same measurement twice, carries no test,
    //        and a permission allowlist refuses it outright — which is where
    //        the gap was finally felt rather than reasoned about.
    //
    // ⭐ the fixture is DELIBERATELY MIXED: one clean artifact, one with a
    //    fabrication, and a `.stone` beside the `.md` so the extension pair
    //    is exercised. a set where every member is clean would pass just as
    //    well if the census read the first file twice and never opened the
    //    rest.
    const scene = useBeforeAll(async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quote-verify-census-'));
      const from = path.join(dir, 'source.txt');
      fs.writeFileSync(from, SOURCE);

      const arts = fs.mkdtempSync(path.join(os.tmpdir(), 'quote-verify-arts-'));
      const clean = path.join(arts, 'a.clean.md');
      const dirty = path.join(arts, 'b.dirty.stone');
      fs.writeFileSync(
        clean,
        [
          '# the delivery rule',
          '',
          '> upon such delivery and tender of the required fees the',
          '> harbormaster shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
        ].join('\n'),
      );
      fs.writeFileSync(
        dirty,
        [
          '# the fee rule',
          '',
          '> no fee shall be charged to the harbormaster for receipt of an',
          '> affidavit of extraordinary tide.',
          '> — Harbor Code § 2',
        ].join('\n'),
      );
      return { from, arts, clean, dirty };
    });

    when('[t0] the fixture is inspected', () => {
      // ⭐ THE CONTROL, and it must FAIL in one direction. the dirty
      //    artifact says `charged to` where the source says `paid to`. if
      //    the source happened to hold both, the census would report clean
      //    whether or not it ever opened the second file.
      then('the source holds the clean form and NOT the dirty one', () => {
        const raw = fs.readFileSync(scene.from, UTF8);
        expect(raw).toContain('no fee shall be paid to the harbormaster');
        expect(raw).not.toContain('no fee shall be charged to the harbormaster');
      });

      then('the two artifacts carry the two different extensions', () => {
        expect(scene.clean.endsWith('.md')).toEqual(true);
        expect(scene.dirty.endsWith('.stone')).toEqual(true);
      });
    });

    when('[t1] the directory is handed to a single --in', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.arts] }),
      );

      // ⛔ the decisive assertion. if the census read only the first
      //    artifact — alphabetically the CLEAN one — this reports 0 live
      //    and exit 0, which is exactly the failure a census must not have.
      then('the defect in the SECOND artifact is found', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('live defects: 1');
        expect(result.stdout).toContain('NOT-IN-SOURCE');
      });

      // ⚠️ a rollup alone cannot tell "2 files, one dirty" apart from "1 file
      //    read twice". the per-artifact row is what makes an artifact that
      //    was never opened visible as a suspect rather than a pass.
      //
      // ⛔ matched against the `artifact:` ROW, never a bare path.
      //
      //    a bare `toContain(path)` passed under a deliberate sabotage that
      //    read only the FIRST artifact — because the shell echoes `in:
      //    <path>` for every --in, so the assertion was satisfied by a file
      //    that was NAMED and never OPENED. the echo is a proxy the defect
      //    does not move, which is the one thing a clamp must not rest on.
      then('every artifact gets a CENSUS ROW, not merely an echo of its path', () => {
        const rows = result.stdout
          .split('\n')
          .filter((l) => l.includes('artifact:'));
        expect(rows.length).toEqual(2);
        expect(rows.filter((l) => l.includes(scene.clean)).length).toEqual(1);
        expect(rows.filter((l) => l.includes(scene.dirty)).length).toEqual(1);
      });

      then('the dirty artifact is the one the detail block is filed under', () => {
        const at = result.stdout.indexOf('NOT-IN-SOURCE');
        // ⛔ guard the -1. `slice(0, -1)` is nearly the WHOLE string, so on a
        //    run with no defect at all this passed on the header echo — a
        //    vacuous green that read as a located hit.
        expect(at).toBeGreaterThan(-1);
        expect(result.stdout.slice(0, at)).toContain(scene.dirty);
        expect(result.stdout.slice(0, at)).not.toContain('── ' + scene.clean);
      });
    });

    // ⭐ THE PROPERTY THAT MAKES THE CENSUS TRUSTWORTHY, asserted directly.
    //
    //    a census that re-implemented the check would drift from the
    //    single-artifact check, and the drift would surface as a file that
    //    reads clean in the census and dirty on its own. this goes red on a
    //    double-count, a skip, or a divergent reader.
    when('[t2] the same artifacts are checked one at a time', () => {
      const parts = useBeforeAll(async () => ({
        clean: runSkill({ args: ['--from', scene.from, '--in', scene.clean] }),
        dirty: runSkill({ args: ['--from', scene.from, '--in', scene.dirty] }),
      }));
      const whole = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.arts] }),
      );

      const verifiedOf = (out: string): number =>
        Number(/verified: (\d+)/.exec(out)?.[1] ?? NaN);
      const liveOf = (out: string): number =>
        Number(/live defects: (\d+)/.exec(out)?.[1] ?? NaN);

      then('the census totals equal the sum of the individual runs', () => {
        expect(verifiedOf(whole.stdout)).toEqual(
          verifiedOf(parts.clean.stdout) + verifiedOf(parts.dirty.stdout),
        );
        expect(liveOf(whole.stdout)).toEqual(
          liveOf(parts.clean.stdout) + liveOf(parts.dirty.stdout),
        );
      });

      // the control for the control: the individual runs must DISAGREE with
      // each other, or the sum above would hold under any reader at all.
      then('the two individual runs really do differ', () => {
        expect(parts.clean.exitCode).toEqual(0);
        expect(parts.dirty.exitCode).toEqual(2);
      });
    });

    // ⛔ the empty expansion must BLOCK, never pass quietly — the same
    //    guarantee --from already carries. `verified: 0` read as clean is a
    //    check that never opened a file.
    when('[t3] the directory holds no artifact of either extension', () => {
      // ⚠️ an OBJECT, not a bare string. `useBeforeAll` hands back a proxy
      //    that defers property access, so a primitive return interpolates
      //    into an arg list as `[object Object]` — which the skill then
      //    refuses as a path that does not exist. the refusal is correct and
      //    the case would have clamped the WRONG branch.
      const empty = useBeforeAll(async () => ({
        dir: fs.mkdtempSync(path.join(os.tmpdir(), 'quote-verify-empty-')),
      }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', empty.dir] }),
      );

      then('it blocks, and names the directory it could not expand', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout + result.stderr).toContain('no .md or .stone artifacts');
        expect(result.stdout + result.stderr).toContain(empty.dir);
      });

      then('it does NOT report a count that a reader could mistake for clean', () => {
        expect(result.stdout).not.toContain('verified: 0');
      });
    });

    // the no-regression clamp. a single artifact must render exactly as it
    // did before the census existed — no per-artifact row, because with one
    // file the row and the total are the same number said twice.
    when('[t4] a single artifact is checked', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', scene.clean] }),
      );

      then('no per-artifact census row is printed', () => {
        expect(result.stdout).not.toContain('artifact:');
        expect(result.stdout).toContain('verified: 1');
      });
    });

    when('[t5] --in names a path that is neither file nor directory', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', scene.from, '--in', '/tmp/zzz-no-such-artifact-zzz'] }),
      );

      then('it blocks and names the path', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout + result.stderr).toContain('artifact not found');
        expect(result.stdout + result.stderr).toContain('zzz-no-such-artifact-zzz');
      });
    });
  });

  given('[case17] a SOURCE OF RECORD that is a `.md` transcript', () => {
    // .why = `rule.forbid.hand-transcription` makes the deterministic
    //        transcript the ARTIFACT OF RECORD for a scanned document, and
    //        those land as `.md`. a `*.txt`-only expansion dropped every one
    //        of them in silence.
    //
    // ⚠️ measured on a real route: one artifact reported 17 fabrications,
    //    and TWELVE were correct, faithfully transcribed bylaws quotes whose
    //    source sat on disk un-passed. the union was short one file, and the
    //    tool said `NOT-IN-SOURCE` — the most serious verdict it has.
    //
    // ⛔ so a NOT-IN-SOURCE carries TWO causes, indistinguishable in the
    //    output: the quote was altered, or the source was never handed over.
    //    [t2] is what makes that sentence executable rather than advice.
    const s17 = useBeforeAll(async () => {
      const passage = [
        'No muster of the wardens shall proceed unless two thirds of',
        'them are present in person or by proxy lodged with the recorder.',
      ].join('\n');

      const srcMd = fs.mkdtempSync(path.join(os.tmpdir(), 'qv-src-md-'));
      fs.writeFileSync(
        path.join(srcMd, 'atlas.bylaws.transform.md'),
        ['# ATLAS BYLAWS — transcript of record', '', '2.11. Quorum At The Annual Muster', '', passage].join('\n'),
      );

      const srcTxt = fs.mkdtempSync(path.join(os.tmpdir(), 'qv-src-txt-'));
      fs.writeFileSync(
        path.join(srcTxt, 'statute.txt'),
        ['HARBOR CODE', '', 'Every vessel shall lodge its manifest with the harbormaster.'].join('\n'),
      );

      const arts = fs.mkdtempSync(path.join(os.tmpdir(), 'qv-art-17-'));
      const art = path.join(arts, 'brief.md');
      fs.writeFileSync(
        art,
        ['# the quorum rule', '', '> ' + passage.split('\n').join('\n> '), '> — Atlas Bylaws § 2.11'].join('\n'),
      );

      return { srcMd, srcTxt, art, passage };
    });

    when('[t0] the fixture is inspected', () => {
      // ⭐ the source sets must be DISJOINT by extension, or [t1] and [t2]
      //    would not isolate the expansion glob as the one input that moved.
      then('the md source dir holds no .txt, and the txt dir holds no .md', () => {
        expect(fs.readdirSync(s17.srcMd).some((f) => f.endsWith('.txt'))).toEqual(false);
        expect(fs.readdirSync(s17.srcTxt).some((f) => f.endsWith('.md'))).toEqual(false);
      });

      then('only the md source holds the quoted passage', () => {
        const md = fs.readFileSync(path.join(s17.srcMd, 'atlas.bylaws.transform.md'), UTF8);
        const txt = fs.readFileSync(path.join(s17.srcTxt, 'statute.txt'), UTF8);
        expect(md).toContain(s17.passage);
        expect(txt).not.toContain(s17.passage);
      });
    });

    // ⛔ THE CLAMP. before the glob was widened this run reported the quote
    //    as a fabrication, because the directory expanded to zero sources and
    //    the skill then blocked on an empty set — a refusal whose stated
    //    cause ("no .txt sources") named the wrong cause entirely.
    when('[t1] --from names a DIRECTORY whose only source is a .md', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', s17.srcMd, '--in', s17.art] }),
      );

      then('the transcript is read, and the quote verifies', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('verified: 1');
        expect(result.stdout).toContain('live defects: 0');
      });

      then('the md transcript is named in the source manifest', () => {
        expect(result.stdout).toContain('atlas.bylaws.transform.md');
      });
    });

    // ⛔ THE DISCRIMINATOR. same artifact, same bytes, different --from — and
    //    the verdict flips. that is the whole short-source hazard, clamped:
    //    a live defect is evidence about the SOURCE SET at least as much as
    //    it is evidence about the author.
    when('[t2] the SAME artifact is checked against a source set that lacks it', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', s17.srcTxt, '--in', s17.art] }),
      );

      then('the identical quote is now reported NOT-IN-SOURCE', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('live defects: 1');
        expect(result.stdout).toContain('NOT-IN-SOURCE');
      });
    });

    // ⛔ the hazard the wider glob opened, and the reason it is safe to open.
    when('[t3] one path is handed to BOTH --from and --in', () => {
      const self = useBeforeAll(async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qv-self-'));
        const at = path.join(dir, 'selfcite.md');
        fs.writeFileSync(
          at,
          [
            '# a claim with an invented authority',
            '',
            '> The harbormaster shall remit one third of all fees collected to',
            '> the almoner of the parish, without deduction.',
            '> — Harbor Code § 9',
          ].join('\n'),
        );
        return { dir, at };
      });

      const blocked = useBeforeAll(async () =>
        runSkill({ args: ['--from', self.dir, '--in', self.dir] }),
      );

      then('it refuses, and names the path that is both', () => {
        expect(blocked.exitCode).toEqual(2);
        expect(blocked.stdout + blocked.stderr).toContain('both a source and an artifact');
        expect(blocked.stdout + blocked.stderr).toContain('selfcite.md');
      });

      // ⛔ THE CONTROL FOR THE REFUSAL. without it, a block that fired for any
      //    reason at all would read as this guard at work. this proves the
      //    file really is fabricated — so the refusal prevented a GREEN
      //    verdict over invented text, which is the harm claimed.
      const honest = useBeforeAll(async () =>
        runSkill({ args: ['--from', s17.srcTxt, '--in', self.at] }),
      );

      then('the same file, against a real source, is a live defect', () => {
        expect(honest.exitCode).toEqual(2);
        expect(honest.stdout).toContain('live defects: 1');
      });
    });
  });

  // ⛔ THE SOURCE MANIFEST IS A GUARD, AND ITS FIGURE HAD NO ASSERTION.
  //
  //    the manifest exists so a container that came back empty or truncated
  //    cannot hide inside the union. that makes its number decisive — and
  //    until now the number was `flat(body).length`, printed under the label
  //    `chars`, which is NOT what any other tool reports for that file.
  //
  //    a reader who checked the manifest against the pull that produced the
  //    source saw a delta on EVERY row and had no way to tell a whitespace
  //    normalization from a truncated document. the guard could not be
  //    checked against the world it guards.
  given('[case18] a source whose whitespace collapses under normalization', () => {
    const s18 = useBeforeAll(async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qv-manifest-'));
      const at = path.join(dir, 'padded.txt');

      // ⚠️ the extra whitespace is the POINT. without runs that collapse, raw
      //    and flat are equal, and an assertion on either passes whichever
      //    one the code prints — a clamp that cannot fail.
      const body = [
        'The harbormaster shall keep a register of every vessel that moors',
        '',
        '',
        '        within the inner basin, and shall enter therein the name of',
        '',
        '  the master and the tonnage of the vessel.',
      ].join('\n');
      fs.writeFileSync(at, body);

      const art = path.join(dir, 'brief.md');
      fs.writeFileSync(
        art,
        [
          '# the register duty',
          '',
          '> "The harbormaster shall keep a register of every vessel that moors',
          '> within the inner basin, and shall enter therein the name of the',
          '> master and the tonnage of the vessel."',
        ].join('\n'),
      );

      return { dir, at, art, raw: body.length };
    });

    when('[t0] the fixture is measured', () => {
      // ⛔ THE CONTROL FOR THE CLAMP BELOW. if raw and flat ever coincide,
      //    the assertion on the on-disk figure would pass against the OLD
      //    code too, and would clamp naught.
      then('raw and flattened lengths genuinely differ', () => {
        const raw = fs.readFileSync(s18.at, UTF8);
        const flatLen = raw.replace(/\s+/g, ' ').trim().length;
        expect(raw.length).toBeGreaterThan(flatLen);
      });
    });

    when('[t1] the manifest is printed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--from', s18.at, '--in', s18.art] }),
      );

      // ⭐ THE CLAMP. the on-disk figure is what a pull, `wc -m`, and the
      //    ~2,000-char floor in rule.require.bhrowser-citations all speak in.
      //    revert to `body.length` and this goes red.
      then('it leads with the ON-DISK character count', () => {
        expect(result.stdout).toContain(String(s18.raw) + ' chars on disk');
      });

      then('it still reports the flattened search corpus, labelled', () => {
        expect(result.stdout).toMatch(/chars on disk · \d+ flat/);
      });

      // ⚠️ the manifest must not have cost the verdict its correctness.
      then('the quote still verifies across the collapsed whitespace', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('verified: 1');
        expect(result.stdout).toContain('live defects: 0');
      });
    });
  });

  given('[case19] --except, so an artifact can be checked against its OWN dir', () => {
    // ⭐ WHY THIS FLAG EXISTS. the correct source was UNREACHABLE by the
    //    convenient invocation. a route's comms yields are the clerk's verbatim
    //    emails — the source of record for every quote of her — and they live
    //    IN the route directory, beside the page that quotes them. so
    //    `--from route/ --in route/page.md` is both the obvious call and a
    //    REFUSED one: the expansion pulls in page.md itself and the overlap
    //    guard fires, correctly.
    //
    //    the workaround was one --from per yield. the failure mode when a caller
    //    does not write them all is not an error — it is a WALL OF RED against a
    //    correct document. measured at 61:1 on one page: 62 defects reported, 61
    //    of them the tool's own input.
    const s19 = useBeforeAll(async () =>
      genTempPair({
        artifact: [
          '# the delivery rule',
          '',
          '> upon such delivery and tender of the required fees the',
          '> harbormaster shall endorse upon it the word "Logged".',
          '> — Harbor Code § 1',
        ].join('\n'),
      }),
    );

    // ⛔ THE CONTROL THE FLAG EXISTS TO ANSWER. without --except this exact
    //    call is refused — and it must stay refused, because the overlap guard
    //    is correct. a run that no longer blocks here means --except did not
    //    add a path around the guard, it DELETED the guard.
    when('[t0] the dir is the source AND holds the artifact, with no --except', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--from', path.dirname(s19.in), '--in', s19.in],
        }),
      );

      then('it is refused — a path cannot verify against itself', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('both a source and an artifact');
      });
    });

    when('[t1] the same call names the artifact in --except', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            path.dirname(s19.in),
            '--except',
            s19.in,
            '--in',
            s19.in,
          ],
        }),
      );

      then('it runs, and the quote verifies against its neighbor source', () => {
        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toContain('verified: 1');
        expect(result.stdout).toContain('live defects: 0');
      });

      // ⚠️ the subtraction must remove the artifact and KEEP the rest. a
      //    --except that quietly dropped the whole dir would also exit 0 here,
      //    with zero quotes checked — so assert the source survived by name.
      then('the neighbor source is still in the manifest', () => {
        expect(result.stdout).toContain(s19.from);
      });

      // ⛔ A `not.toContain` IS VACUOUS AGAINST A RUN THAT PRINTED NO MANIFEST.
      //    measured: with --except neutered, this assertion went GREEN while
      //    every other one in the block went red — the run had blocked, so the
      //    manifest was absent and the artifact was trivially "not in" it.
      //
      // ⇒ so assert the SHAPE of the manifest, not an absence within it: the
      //   source set must be exactly one entry, and it must be the neighbor.
      //   that is false when the subtraction fails (two entries) and false when
      //   it over-reaches (zero entries), so it discriminates in both
      //   directions where the bare absence discriminated in neither.
      then('the source set is EXACTLY the neighbor, one entry', () => {
        const manifest = result.stdout
          .split('\n')
          .filter((l) => l.includes('from: '));
        expect(manifest.length).toEqual(1);
        expect(manifest[0]).toContain(s19.from);
      });
    });

    // ⛔ a silently-ignored exclusion is the empty-expansion defect under a
    //    second name: the caller believes the corpus was narrowed, the run says
    //    so nowhere, and the overlap guard then refuses with a message about a
    //    path the caller thought they had already removed.
    when('[t2] --except names a path that is not in the source set', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            path.dirname(s19.in),
            '--except',
            path.join(path.dirname(s19.in), 'no-such-file.md'),
            '--in',
            s19.in,
          ],
        }),
      );

      then('it blocks rather than ignore the typo', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain(
          '--except names a path that is not in the source set',
        );
      });
    });

    // ⛔ a subtraction that leaves ZERO sources reports every quote as a
    //    fabrication. that is the 61:1 failure in its purest form, so it blocks.
    when('[t3] --except removes the only source', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--from',
            s19.from,
            '--except',
            s19.from,
            '--in',
            s19.in,
          ],
        }),
      );

      then('it blocks rather than report a wall of false defects', () => {
        expect(result.exitCode).toEqual(2);
        expect(result.stdout).toContain('--except removed every source');
      });
    });
  });

});
