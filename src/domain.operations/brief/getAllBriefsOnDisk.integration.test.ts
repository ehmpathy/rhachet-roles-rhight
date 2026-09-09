import { given, then, useThen, when } from 'test-fns';

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { BriefIntegrityCheckSlug } from '../../domain.objects/brief/BriefIntegrityDefect';
import { getOneBriefIntegrityReport } from './getAllBriefsOnDisk';

/**
 * .what = the roles directory, from this file
 */
const ROOT_OF_ROLES = join(__dirname, '../../domain.roles');

/**
 * ⚠️ .two limits of this gate, both OBSERVED in a run rather than assumed —
 *    stated here so no reader over-trusts what it catches.
 *
 * 1. THE SNAPSHOT DOES NOT BLOCK. `test:integration` builds its flags with
 *    `$([ -n $RESNAP ] && echo '--updateSnapshot')`. unquoted and unset,
 *    `[ -n ]` is a one-arg test on the string "-n", which is non-empty, so
 *    it is ALWAYS true — a run with no `--resnap` still reported
 *    "1 snapshot updated". so the snapshot gives a reviewer a visible diff;
 *    it does not fail a build. ⭐ every claim that must HOLD is therefore an
 *    explicit expect() above, never a snapshot.
 *
 * 2. AN EDIT TO A BRIEF ALONE MAY NOT RE-RUN THIS. the same script adds
 *    `--changedSince=main`, and markdown briefs sit in no javascript
 *    dependency graph, so jest cannot know a brief changed. this gate is
 *    reliable on a full/THOROUGH run and on any change to its own sources.
 *    ⬜ a pre-commit hook keyed to `briefs/**\/*.md` is the fix, and is
 *    not built here.
 */

/**
 * .what = checks that must read ZERO on every brief, legacy or new
 * .why = these two are CORRECTNESS, never convention. a brief that
 *        falsifies its own attestation, or that names a file the triage
 *        withheld, is wrong on the day it was written — there is no era in
 *        which it was acceptable, so there is no debt to grandfather.
 */
const CHECKS_ZERO_TOLERANCE: BriefIntegrityCheckSlug[] = [
  'fullsun-names-non-fullsun',
  'absence-claim-falsified-exact',

  // ⭐ a withheld brief on a path that ships is not withheld. there is no
  // legacy era for this one either: the tag and the packaged tree have
  // always contradicted each other, so a count above zero is a live
  // disclosure rather than debt.
  //
  // ⚠️ this check was ADDED after the two above, and its first run proved
  // limit 1 below is real rather than theoretical — it found 3 genuine
  // defects and the gate stayed GREEN, because a new slug lands only in
  // the snapshot and the snapshot does not block. the slug had to be
  // named HERE before it could fail anything. ⛔ so an added check is not
  // enforced by its own existence: add it to a list, or it watches
  // silently.
  'non-fullsun-in-published-path',
];

/**
 * .what = the count each remaining check read on 2026-08-01
 * .why = ⚠️ THIS IS DEBT ON RECORD, NEVER AN ALLOWANCE. the corpus predates
 *        these conventions, so a zero-assertion today would only be
 *        satisfied by a filter that excludes the corpus — which is the very
 *        defect this suite exists to end. so the bar is a RATCHET: the
 *        count may fall, never rise. each number that reaches 0 should be
 *        promoted into CHECKS_ZERO_TOLERANCE and deleted from here.
 */
const CAP_OF_LEGACY_DEBT: Record<string, number> = {
  'see-also-target-absent': 18,
  // ⚠️ 147, not 146. the one deliberate addition is an artifact that declares
  // it makes no independent factual claim and inherits its citations from the
  // brief it splits from — the exception `rule.require.seven-distinct-citations`
  // states for navigation and remainder artifacts. the check counts numbered
  // source entries and cannot read that declaration, so a legitimate file lands
  // here rather than in a defect.
  // ⛔ do NOT raise this to absorb a real shortfall. a ratchet bumped on every
  // failure is not a ratchet. each raise owes a reason on this line.
  'sources-below-seven': 147,
  'not-advice-callout-absent': 144,
  'date-researched-absent': 81,
  'publishability-tag-absent': 142,
  'source-anchor-unreferenced': 31,
};

describe('getAllBriefIntegrityDefects', () => {
  given('[case1] every brief in the repo', () => {
    when('[t0] the integrity suite runs over it', () => {
      const report = useThen('the suite completes', async () =>
        getOneBriefIntegrityReport({ root: ROOT_OF_ROLES }),
      );

      const countByCheck = useThen('the defects tally by check', async () => {
        const counted: Record<string, number> = {};
        for (const defect of report.defects)
          counted[defect.check] = (counted[defect.check] ?? 0) + 1;
        return counted;
      });

      then(
        'the corpus was actually reached — a suite that reads no file passes forever',
        () => {
          // ⭐ the root cause this whole suite answers: the peer rubrics were
          // globbed to '**/*.{ts,sh}' against a markdown deliverable, so they
          // reported 0/0 "approved" every round while they read no brief at
          // all. a check that cannot reach its subject passes forever, and
          // its passes carry no information. so assert the REACH, never only
          // the result.
          //
          // ⛔ the reach must be MEASURED FROM THE SET THAT WAS READ. an
          // earlier form of this assertion derived it from the defects
          // (`Object.keys(countByCheck).length > 0`), which cannot separate
          // an unreached corpus from a clean one — both give zero — and so
          // could never fail for the reason it named. that is the very
          // defect this file exists to catch, committed inside its own clamp.
          expect(report.briefsReached).toBeGreaterThan(100);
        },
      );

      then('clean briefs were read, not only defective ones', () => {
        // ⭐ THE DISCRIMINATOR. if reach were derived from the defects, these
        // two numbers would be equal by construction. that they differ is the
        // proof that briefs which hold NO defect were still opened and graded
        // — the one fact a defect-derived count can never establish.
        const briefsWithDefects = new Set(
          report.defects.map((defect) => defect.path),
        ).size;
        expect(report.briefsReached).toBeGreaterThan(briefsWithDefects);
      });

      then(
        'no brief falsifies its own attestation, or names a withheld file',
        () => {
          for (const check of CHECKS_ZERO_TOLERANCE)
            expect({ check, count: countByCheck[check] ?? 0 }).toEqual({
              check,
              count: 0,
            });
        },
      );

      then('no legacy check has risen above its recorded debt', () => {
        for (const [check, cap] of Object.entries(CAP_OF_LEGACY_DEBT)) {
          const count = countByCheck[check] ?? 0;
          expect({ check, rose: count > cap }).toEqual({
            check,
            rose: false,
          });
        }
      });

      then(
        'the full tally is snapshotted, so any change surfaces in a diff',
        () => {
          expect(countByCheck).toMatchSnapshot();
        },
      );
    });
  });

  given('[case2] an empty directory', () => {
    when('[t0] the suite runs over it', () => {
      const emptyReport = useThen(
        'the suite completes with no briefs to read',
        async () => {
          const dir = mkdtempSync(join(tmpdir(), 'briefs-integrity-empty-'));
          return getOneBriefIntegrityReport({ root: dir });
        },
      );

      then('it reaches zero briefs and finds zero defects', () => {
        // the empty-scope edge: a root with no briefs must not crash and must
        // report an honest zero, never an absent field a caller could misread.
        expect(emptyReport.briefsReached).toEqual(0);
        expect(emptyReport.defects).toEqual([]);
      });

      then('the empty-scope report shape is snapshotted', () => {
        // the report shape carries no root field, so an empty run is fully
        // deterministic — the zero / [] baseline a caller can diff against.
        expect(emptyReport).toMatchSnapshot();
      });
    });
  });

  given('[case3] markdown that sits outside any briefs/ directory', () => {
    when('[t0] the suite runs over it', () => {
      const outsideReport = useThen(
        'the suite completes without reach of the stray file',
        async () => {
          const dir = mkdtempSync(join(tmpdir(), 'briefs-integrity-outside-'));
          mkdirSync(join(dir, 'notes'));
          writeFileSync(
            join(dir, 'notes', 'scratch.md'),
            '# scratch\n\nnot a brief\n',
            'utf8',
          );
          return getOneBriefIntegrityReport({ root: dir });
        },
      );

      then('a .md outside a briefs/ segment is not reached', () => {
        // the reach boundary: only files under a '/briefs/' path are briefs,
        // so a stray markdown file stays invisible to the suite — proven, so a
        // later change to the path filter cannot silently widen the reach.
        expect(outsideReport.briefsReached).toEqual(0);
        expect(outsideReport.defects).toEqual([]);
      });
    });
  });
});
