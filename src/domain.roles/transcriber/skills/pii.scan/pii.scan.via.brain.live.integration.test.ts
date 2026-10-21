import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = a LIVE brain call, so the `rhx review` invocation is proven
 * .why  = the sibling harness suite stubs the reviewer, so it proves the
 *         wiring around the call and never the call itself. that gap is
 *         not academic — every flag below is one a stub accepts and a
 *         real reviewer does not:
 *
 *           1. `--focus`. an API brain has NO FILESYSTEM. under
 *              `--focus pull` the reviewer is handed paths and told to
 *              read them, so it grades a diff it never saw and returns
 *              an ordinary `0 blockers`. the gate reports clear skies
 *              over an unexamined diff. so this skill pins `push`.
 *           2. `--refs`. an API brain boots none of the role's briefs,
 *              so the practice rules must arrive as refs on the command
 *              line. drop them and the reviewer still answers, still
 *              parses, still exits 0 — it simply grades with no rules
 *              about what counts as PII here.
 *
 *         both defects are invisible to a stubbed suite and silent in
 *         production. so this file asks a real brain.
 *
 * .note = what is under test is the INVOCATION, not the judgment. the
 *         assertion is that a verdict came back READABLE — never that a
 *         particular brain reached a particular conclusion, which would
 *         be a coin flip dressed as a clamp.
 *
 *         one brain, the cheapest, on a tiny diff. the harness suite
 *         covers the argv contract and the failure modes.
 *
 * 🚩 observed 2026-08-30 — a TRANSIENT, and the reason the skill now
 *    retries once. the very first run of this file returned no numeric
 *    verdict on both cases; the identical invocation then passed on the
 *    next two runs, 6/6, with no change to the call. the cause was
 *    never pinned down.
 *
 *    that matters more here than a flake normally would: an unreadable
 *    verdict BLOCKS, so a transient blocks a clean tree for a reason
 *    the human cannot act on — and a gate that blocks clean commits is
 *    a gate that gets bypassed. hence one bounded retry in the skill,
 *    which changes the verdict not at all against a real outage.
 *
 *    ⚠️ so if this file ever goes red, do NOT reach for the retry
 *       count. read the `no numeric verdict` evidence the skill now
 *       prints, and find the cause.
 */

/** a live brain call is slow; the jest default of 5s would always lose */
jest.setTimeout(300_000);

const scriptPath = path.join(__dirname, 'pii.scan.via.brain.sh');
const regexPath = path.join(__dirname, 'pii.scan.via.regex.sh');
const repoTop = path.join(__dirname, '..', '..', '..', '..', '..');

const UTF8 = 'utf-8' as const;

/**
 * the cheapest API brain. the point is the call, not the coverage.
 *
 * ⛔ AN API BRAIN (`○` in `rhx review --help`), NEVER A REPL BRAIN (`↻`).
 *    a repl brain re-introduces the cwd jail this skill moved off, and
 *    the whole swap would be undone by this one string.
 *
 * ⚠️ and it is a SLUG, never a model id. the prior value here was
 *    `claude-haiku-4-5-20251001` — an `rhx enroll` argument, which
 *    `rhx review --brain` does not accept.
 */
const BRAIN = 'anthropic/claude/haiku';

const run = (input: {
  executable: string;
  args: string[];
  cwd: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync('bash', [input.executable, ...input.args], {
    encoding: UTF8,
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
};

const runSkill = (input: {
  args: string[];
  cwd: string;
}): { stdout: string; stderr: string; exitCode: number } =>
  run({ executable: scriptPath, args: input.args, cwd: input.cwd });

/** the deterministic layer, on the same scope — the control for [case1] */
const runRegex = (input: {
  args: string[];
  cwd: string;
}): { stdout: string; stderr: string; exitCode: number } =>
  run({ executable: regexPath, args: input.args, cwd: input.cwd });

/**
 * .what = a throwaway git repo that `rhx` can still look roles up from
 * .why  = the git scope must be a real, isolated index — the skill reads
 *         `git diff --cached`, so a fixture that shared this repo's
 *         index would scope the review to whatever happened to be staged
 *         at the time, which is neither hermetic nor repeatable.
 *
 *         but a role lookup is CWD-relative, and a bare temp dir has no
 *         `.agent/`. so the fixture links the real one in. that is
 *         faithful rather than a shortcut: in production the hook runs
 *         with cwd at a repo top-level that has exactly this layout.
 *
 * ⛔ AND THAT LAYOUT IS THREE ENTRIES, NOT ONE. see `LAYOUT` below. each
 *    was found the same way: the suite went red, the skill reported
 *    `💥 verdict unreadable`, and the cause was a link the fixture never
 *    made.
 *
 *    ⚠️ the failure did NOT read as a setup defect, in any of the three
 *       cases. `💥 verdict unreadable` is the RIGHT behavior for an
 *       unreadable verdict and is indistinguishable from a real outage.
 *       so a fixture one symlink short of production produces a red
 *       suite that accuses the skill.
 *
 * 🚩 observed — this comment ASSERTED the `node_modules` link
 *    and the code MADE ONLY the `.agent` one. so the paragraph above was
 *    a correct diagnosis of a defect that was never cured, three lines
 *    above the code that still carried it — and every run since died
 *    with ERR_MODULE_NOT_FOUND.
 *
 *    ⭐ that is why the layout is now a NAMED LIST rather than a run of
 *       `symlinkSync` calls. prose beside code cannot bind it; a list the
 *       loop consumes can only be wrong by omission, and an omission
 *       fails loudly on the next entry rather than silently on this one.
 */
/**
 * .what = the entries of a repo top-level that `rhx review` reads
 * .why  = each one, absent, kills the call in a different place
 */
const LAYOUT = [
  /** role lookup is cwd-relative, and a bare temp dir has no `.agent/` */
  '.agent',
  /**
   * `rhx review` resolves its brain package by an ESM import rooted at
   * the cwd, so no `node_modules` = ERR_MODULE_NOT_FOUND, before a brain
   * is ever reached
   */
  'node_modules',
  /**
   * rhachet discovers which brains are INSTALLED from the cwd's
   * dependency list. absent it, the registry is empty and the call dies
   * with `"available": { "atoms": [], "repls": [] }` — which names the
   * brain you asked for and does not say why it found none.
   */
  'package.json',
] as const;
const genTempRepo = (input: {
  files: Record<string, string>;
}): {
  dir: string;
} => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-brain-live-'));

  const git = (args: string[]): void => {
    const res = spawnSync('git', args, { cwd: dir, encoding: UTF8 });
    if (res.status !== 0) {
      throw new Error(`git ${args.join(' ')} failed: ${res.stderr}`);
    }
  };

  git(['init', '--quiet']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'user.name', 'test']);

  for (const rel of LAYOUT) {
    fs.symlinkSync(path.join(repoTop, rel), path.join(dir, rel));
  }

  for (const [rel, content] of Object.entries(input.files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  git(['add', '--all', '--', ...Object.keys(input.files)]);

  return { dir };
};

describe('pii.scan.via.brain.sh — LIVE', () => {
  // ⚠️ a locked keyrack is a BLOCKER, never a skip. a suite that quietly
  //    skips its only live case reports green while the one thing it
  //    exists to prove goes untested — which is the same failhide shape
  //    this whole gate was built to prevent.
  beforeAll(() => {
    const res = spawnSync('rhx', ['keyrack', 'status', '--owner', 'ehmpath'], {
      encoding: UTF8,
      cwd: repoTop,
    });
    if (res.status !== 0) {
      throw new Error(
        'a live brain call needs credentials. run: rhx keyrack unlock --owner ehmpath --env test',
      );
    }
  });

  given('[case1] a staged diff that carries a name and a home address', () => {
    // ⚠️ every value here is SYNTHETIC — invented for this fixture, and
    //    matched by no roster. it has to look real to a reader, because
    //    "is this value real or a fixture?" is exactly the judgment a
    //    regex cannot make and a brain can.
    //
    //    and no detector fires on it: no SSN, no EIN, no ITIN, no phone,
    //    and the street line carries no unit word. so the deterministic
    //    pass would call this clean, which is why the second layer is
    //    here at all.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'client.md': [
            '# client intake',
            '',
            'Marcy Delacroix-Whitfield, born 1974-03-11, lives at',
            '4417 Harrowgate Terrace, Bloomington, Indiana.',
            '',
            'She asked us to keep the file under her maiden name.',
            '',
          ].join('\n'),
        },
      }),
    );

    when('[t0] a real brain is asked', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', BRAIN],
          cwd: repo.dir,
        }),
      );

      then('the invocation SUCCEEDED — no malfunction', () => {
        // THE assertion of this file. exit 1 is the malfunction path,
        // and every way `rhx enroll` can be called wrong — wrong flag
        // shape, a role that cannot be found, an absent credential —
        // lands there.
        if (result.exitCode === 1) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).not.toBe(1);
      });

      then('the verdict came back READABLE', () => {
        // per contract.reviewer-output, an unparsed verdict is a
        // malfunction. 💥 is how this skill renders one, so its absence
        // proves the brain both ran AND honored the count contract —
        // which is what the `reviewer` role in --roles buys.
        if (result.stdout.includes('💥')) {
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.stdout).not.toContain('💥');
        expect(result.stdout).not.toContain('verdict unreadable');
      });

      then('the brain that was asked is named in the report', () => {
        // proves the verdict is attributed to the brain requested,
        // rather than to a default that silently replaced it.
        //
        // ⚠️ THIS IS A WEAKER CLAIM THAN IT READS, and it grew weaker
        //    with the swap to `rhx review`. that command's own stdout
        //    never names a brain — `genReviewOutputStdout` emits counts
        //    and paths only — so the string below comes from THIS
        //    skill's verdict tree, which echoes what it asked for.
        //
        //    so it proves the skill did not lose the pin between its
        //    argv and its report. it does NOT prove the brain honored
        //    it. that hazard is upstream's: the claude-agent-sdk
        //    silently SUBSTITUTES a model it does not know rather than
        //    refuse it, and it is flagged in
        //    ehmpathy/rhachet-brains-anthropic#32.
        expect(result.stdout).toContain(BRAIN);
      });

      then('the report does not echo a value it found', () => {
        // a gate that prints what it catches turns every CI log into a
        // second copy of the leak. the name is the one value here that
        // a reviewer would most plausibly quote back
        expect(result.stdout).not.toContain('Delacroix-Whitfield');
        expect(result.stdout).not.toContain('4417 Harrowgate');
      });

      // ── the DISCRIMINATION pair ────────────────────────────────────
      //
      // ⚠️ the two assertions below only mean something TOGETHER, and
      //    neither is worth much alone.
      //
      //    the file's other cases prove the reviewer RAN and answered
      //    readably. that is a necessary check and a weak one: a
      //    reviewer wired to a constant would satisfy every one of
      //    them. what none of them show is that this layer earns its
      //    place — that it catches something the deterministic pass
      //    structurally cannot.
      //
      //    so: the same staged set, through both layers. the regex must
      //    call it CLEAN and the brain must BLOCK it. that delta is the
      //    entire value proposition of a second layer, and it is the
      //    one property that would vanish silently if the reviewer were
      //    ever reduced to a stub.
      then('the DETERMINISTIC layer calls this same set clean', () => {
        // no SSN, no EIN, no ITIN, no phone, and the street line has no
        // unit word — so every detector correctly declines. this is the
        // control: it proves the brain is the ONLY layer that can see
        // this, rather than merely agreeing with a regex that already
        // caught it.
        const control = runRegex({
          args: ['--diffs', 'since-staged'],
          cwd: repo.dir,
        });
        if (control.exitCode !== 0) {
          console.log('PROOF: regex exitCode:', control.exitCode);
          console.log('PROOF: regex stdout:', control.stdout);
        }
        expect(control.exitCode).toBe(0);
      });

      then('and the BRAIN blocks it — the delta the layer exists for', () => {
        // exit 2 is the constraint path: a reviewer reported a blocker.
        //
        // ⚠️ this IS a judgment assertion, which the note at the top of
        //    this file warns against — deliberately, and only here. the
        //    caution is aimed at MARGINAL calls, where a clamp on a
        //    verdict is a coin flip dressed as a test. a full name plus
        //    an exact birth date plus an exact street address is not
        //    marginal; if a reviewer waves that through, the layer is
        //    not working and this SHOULD go red.
        if (result.exitCode !== 2) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('🚨');
      });
    });
  });

  given('[case2] a staged diff with no personal data at all', () => {
    // the control. without it, case1 would pass just as well against a
    // reviewer that blocks unconditionally — and a gate that blocks
    // every commit is disabled within a day.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'readme.md': [
            '# tide tables',
            '',
            'Swell arrives on a six-hour cycle. The reef breaks left',
            'when the period is over twelve seconds.',
            '',
          ].join('\n'),
        },
      }),
    );

    when('[t0] a real brain is asked', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', BRAIN],
          cwd: repo.dir,
        }),
      );

      then('it exits 0 — clean, and not a malfunction either', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('the reviewer is reported as clean, with a read verdict', () => {
        expect(result.stdout).toContain('✅');
        expect(result.stdout).not.toContain('💥');
      });
    });
  });
});
