import { spawnSync } from 'child_process';
import * as fs from 'fs';
import { UnexpectedCodePathError } from 'helpful-errors';
import * as os from 'os';
import * as path from 'path';
import { given, then, useBeforeAll, when } from 'test-fns';

/**
 * .what = integration tests for the HARNESS of the brain mechanism
 * .why  = this layer is PROBABILISTIC and it BLOCKS, which is a
 *         dangerous pair. so the tests clamp the properties that make
 *         it safe at a gate, rather than the brains' judgment:
 *
 *           1. a reviewer that could not run is a MALFUNCTION (exit 1),
 *              never a clean pass. "the check did not run" and "the
 *              check found no PII" must never look alike.
 *           2. an absent rubric blocks rather than grades against no
 *              rules and returns a vacuous 0/0.
 *           3. an empty scope is genuinely clean, so the gate does not
 *              block a commit that touches only deletions.
 *
 * .note = no test HERE asks a real brain. a brain call is slow, costs
 *         money, and returns a different answer each run — three
 *         properties that have no place in a suite that must be able to
 *         go red for one reason only.
 *
 *         but a harness proven only against its own error paths is a
 *         harness nobody has watched succeed, so the live invocation is
 *         clamped separately, in
 *         pii.scan.via.brain.live.integration.test.ts — targeted by
 *         `BRAIN_LIVE=true`, never on a ci push.
 */

const scriptPath = path.join(__dirname, 'pii.scan.via.brain.sh');

const UTF8 = 'utf-8' as const;

/**
 * .what = mask the two values that differ run to run in a skill stdout
 * .why  = a snapshot must go red for a change in what the skill SAYS,
 *         never for the pid in the fake's log dir or the temp dir path
 */
const asStdoutStable = (stdout: string): string =>
  stdout
    .replace(/fake\.\d+/g, 'fake.<pid>')
    .replace(
      new RegExp(
        os.tmpdir().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\s]*',
        'g',
      ),
      '<tmp>',
    );

/**
 * .what = a shell single-quote literal
 * .why  = a path or key spliced into a generated script must never expand,
 *         whatever `$`, backtick, or quote it holds
 */
const asShellLiteral = (value: string): string =>
  `'${value.replace(/'/g, `'\\''`)}'`;

/**
 * .what = run the skill under bash and capture its streams
 * .why  = exit 1 is the malfunction verdict these cases assert on, so a
 *         run that never started (spawn failure, signal kill) must throw,
 *         never default to 1 and read as a verdict
 */
/** under the 90s jest hook timeout, so a hung run fails as a named spawn timeout */
const SKILL_SPAWN_TIMEOUT_MS = 80_000;

const runSkill = (input: {
  args: string[];
  cwd: string;
  /** prepended to PATH — see genRhxThatCapturesTheArgv */
  binFirst?: string;
  /** replaces PATH whole — see genPathWoutTool */
  pathOnly?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const pathForRun =
    input.pathOnly ??
    (input.binFirst
      ? `${input.binFirst}:${process.env.PATH ?? ''}`
      : process.env.PATH);
  const result = spawnSync('bash', [scriptPath, ...input.args], {
    encoding: UTF8,
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PATH: pathForRun },
    timeout: SKILL_SPAWN_TIMEOUT_MS,
  });

  // a run that produced no exit status produced no verdict
  if (result.error || result.status === null)
    throw new UnexpectedCodePathError('the skill run produced no exit status', {
      args: input.args,
      timeoutMs: SKILL_SPAWN_TIMEOUT_MS,
      error: result.error?.message ?? null,
      signal: result.signal,
    });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status,
  };
};

/**
 * .what = a PATH dir that mirrors the host PATH, one symlink per tool,
 *         minus one tool
 * .why  = a host that lacks one tool, while bash, git, and every coreutil
 *         the skill calls still resolve
 */
const genPathWoutTool = (input: {
  dir: string;
  tool: string;
}): { dir: string } => {
  // an absent PATH would build an empty mirror and lack every tool, not one
  const hostPath = process.env.PATH;
  if (!hostPath)
    throw new UnexpectedCodePathError('no PATH to mirror', {
      tool: input.tool,
    });

  fs.mkdirSync(input.dir, { recursive: true });
  const entries = hostPath
    .split(':')
    .filter((from) =>
      fs.statSync(from, { throwIfNoEntry: false })?.isDirectory(),
    );
  for (const from of entries) {
    for (const name of fs.readdirSync(from)) {
      // first PATH entry wins, as in a real lookup; lstat sees a dangling link
      const at = path.join(input.dir, name);
      const taken = fs.lstatSync(at, { throwIfNoEntry: false });
      if (name !== input.tool && !taken)
        fs.symlinkSync(path.join(from, name), at);
    }
  }

  // the mirror must hold bash and lack the tool, or the case tests aught else
  if (!fs.lstatSync(path.join(input.dir, 'bash'), { throwIfNoEntry: false }))
    throw new UnexpectedCodePathError('the PATH mirror lacks bash', {
      dir: input.dir,
    });
  if (fs.lstatSync(path.join(input.dir, input.tool), { throwIfNoEntry: false }))
    throw new UnexpectedCodePathError('the PATH mirror still holds the tool', {
      dir: input.dir,
      tool: input.tool,
    });

  return { dir: input.dir };
};

const genTempRepo = (input: {
  files: Record<string, string>;
  /** raw bytes, for fixtures that must NOT be text — see [case8] */
  binaries?: Record<string, Buffer>;
  /** link path → target, e.g. a dir symlink — see [case32] */
  symlinks?: Record<string, string>;
  stage?: string[];
}): { dir: string } => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pii-review-'));

  // run git in the fixture; a git that never ran names that, not a git error
  const git = (gitInput: { args: string[] }): void => {
    const res = spawnSync('git', gitInput.args, { cwd: dir, encoding: UTF8 });
    if (res.error)
      throw new UnexpectedCodePathError('git could not be run', {
        args: gitInput.args,
        error: res.error.message,
      });
    if (res.status !== 0)
      throw new UnexpectedCodePathError('git failed in the fixture', {
        args: gitInput.args,
        status: res.status,
        stderr: res.stderr,
      });
  };

  git({ args: ['init', '--quiet'] });
  git({ args: ['config', 'user.email', 'test@example.com'] });
  git({ args: ['config', 'user.name', 'test'] });

  for (const [rel, content] of Object.entries(input.files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  for (const [rel, bytes] of Object.entries(input.binaries ?? {})) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, bytes);
  }

  for (const [rel, target] of Object.entries(input.symlinks ?? {}))
    fs.symlinkSync(target, path.join(dir, rel));

  if (input.stage?.length) git({ args: ['add', ...input.stage] });

  return { dir };
};

/**
 * .what = the body of a fake `rhx review`, shared by every fake below
 *
 * .why  = the skill reads FOUR things off a review, and a fake that
 *         supplies fewer than four exercises a path production never
 *         takes:
 *           1. the argv        — so a case can assert which flags went out
 *           2. the `--output`  — the report body lives in that FILE, and
 *              the skill copies it out; stdout carries only counts
 *           3. the `logs:`     — the sole discriminator between a clean
 *              pass and a SKIPPED review, which print identical counts
 *           4. the verdict json at `<logs>/output.response.json` — the
 *              ONLY place the skill reads its counts from. the stdout
 *              summary is printed for realism, never trusted
 *
 * ⚠️ `withLogs: false` impersonates a skip. `rhx review` skips when its
 *    rules glob matches zero files, and prints the same
 *    `0 blockers / 0 nitpicks`, exit 0, as a clean pass — so the skip
 *    guard cannot be clamped without a fake that can omit that one line.
 *
 * ⚠️ the log dir is unique per fake process (`fake.$$`), the way real
 *    `rhx review` names its dir `<iso-ms>.<pid>.<uuid>`. several
 *    `--brain` reviewers run in parallel, and a shared dir would hand
 *    one reviewer another's verdict.
 *
 * .note = `verdictJson` overrides the json written: `null` writes none
 *         (the absent case), a string writes those exact bytes (the
 *         unparseable and non-array cases). `stdoutAhead` echoes lines
 *         before the summary, the way `rhx review` echoes staged paths.
 *
 * .mock = the `rhx review` boundary — the brain call, behind a fake
 *         `rhx` on PATH that writes the reviewer json a real review writes
 * .why  = a brain call bills the api, takes minutes, and answers
 *         differently each run. ci runs this suite on every push, and a
 *         safety guard's real brain belongs at commit, not in ci (bulletin
 *         live-brain-tests-three-tiers)
 * .real = the gate itself, at every commit, on the real brain; and
 *         pii.scan.via.brain.live.integration.test.ts, targeted by
 *         `BRAIN_LIVE=true`, before a change to the argv or brain lands
 *
 * ⚠️ the fake is PREPENDED to the real PATH, never substituted for it.
 *    a stripped PATH drops the interpreter and every coreutil the skill
 *    calls, and the failure it produces — empty stdout, exit 1 — reads
 *    exactly like a skill that blocked without a message.
 */
const asFakeReviewBody = (input: {
  captureAt: string;
  reportBody: string;
  blockers: number;
  nitpicks: number;
  /** omit the `logs:` line, to impersonate a skipped review */
  withLogs?: boolean;
  /** the verdict json bytes; null = write no json; absent = derived from the counts */
  verdictJson?: string | null;
  /** lines echoed to stdout ahead of the summary, e.g. a staged path */
  stdoutAhead?: string[];
  /**
   * do what `rhx review` does by default: drop route paperwork, dreams,
   * and lockfiles from scope, and refuse a scope left empty — unless
   * `--polluters keep` was passed
   */
  emulatePolluterDrop?: boolean;
  /** print this refusal and exit 2 with no logs, as `rhx review` does */
  refusal?: string;
  /** lines printed under the refusal header */
  refusalBody?: string[];
  /** the verdict json filename, to impersonate an upstream rename */
  verdictName?: string;
  /** write the prompt, the answer, and the metrics beside the json, as upstream does */
  withPrompt?: boolean;
}): string[] => {
  const verdictJson =
    input.verdictJson !== undefined
      ? input.verdictJson
      : JSON.stringify({
          done: true,
          blockers: Array.from({ length: input.blockers }, (_, i) => ({
            rule: 'rule.forbid.pii-in-a-diff.md',
            title: `fake blocker ${i + 1}`,
          })),
          nitpicks: Array.from({ length: input.nitpicks }, (_, i) => ({
            rule: 'rule.forbid.pii-in-a-diff.md',
            title: `fake nitpick ${i + 1}`,
          })),
        });
  return [
    '#!/usr/bin/env bash',
    `printf '%s\\n' "$@" > ${asShellLiteral(input.captureAt)}`,
    `echo x >> ${asShellLiteral(`${input.captureAt}.calls`)}`,
    ...(input.refusal
      ? [
          `echo ${asShellLiteral(`✋ ConstraintError: ${input.refusal}`)}`,
          ...(input.refusalBody ?? []).map(
            (line) => `echo ${asShellLiteral(line)}`,
          ),
          'exit 2',
        ]
      : []),
    ...(input.emulatePolluterDrop
      ? [
          'keep=""; prevp=""',
          'for a in "$@"; do',
          '  if [[ "$prevp" == "--polluters" && "$a" == "keep" ]]; then keep=1; fi',
          '  prevp="$a"',
          'done',
          `if [[ -z "$keep" ]] && ! git diff --cached --name-only | grep -qvE '^(\\.route|\\.behavior|\\.dream)/'; then`,
          '  echo "✋ ConstraintError: combined scope resolves to zero files"',
          '  exit 2',
          'fi',
        ]
      : []),
    'prev=""',
    'out=""',
    'for a in "$@"; do',
    '  if [[ "$prev" == "--output" ]]; then out="$a"; fi',
    '  prev="$a"',
    'done',
    'if [[ -n "$out" ]]; then',
    '  mkdir -p "$(dirname "$out")"',
    `  printf '%s\\n' ${asShellLiteral(input.reportBody)} > "$out"`,
    'fi',
    'logdir=".log/bhrain/review/fake.$$"',
    ...(input.withLogs === false
      ? []
      : [
          'mkdir -p "$logdir"',
          ...(input.withPrompt
            ? [
                'echo "a staged diff" > "$logdir/input.prompt.md"',
                'echo "a staged diff" > "$logdir/input.prompt.head.md"',
                'echo "{}" > "$logdir/metrics.realized.json"',
                'echo "a staged diff" > "$logdir/input.future.md"',
              ]
            : []),
          // a run that wrote no json wrote no answer either; an answer
          // beside an absent json is the rename [case29] pins
          ...(input.withPrompt && verdictJson !== null
            ? ['echo "an answer" > "$logdir/output.review.md"']
            : []),
          ...(verdictJson === null
            ? []
            : [
                `cat > "$logdir/"${asShellLiteral(input.verdictName ?? 'output.response.json')} <<'FAKE_VERDICT_JSON'`,
                verdictJson,
                'FAKE_VERDICT_JSON',
              ]),
        ]),
    ...(input.stdoutAhead ?? []).map(
      (line) => `printf '%s\\n' ${asShellLiteral(line)}`,
    ),
    'echo "🔍 review"',
    ...(input.withLogs === false ? [] : ['echo "   ├─ logs: $logdir"']),
    'echo "   ├─ review: $out"',
    'echo "   └─ summary"',
    `echo "      ├─ ${input.blockers} blockers"`,
    `echo "      └─ ${input.nitpicks} nitpicks"`,
  ];
};

/**
 * .what = a fake `rhx` that records the ARGV it was called with
 *
 * .why  = the swap to `rhx review` moved every input off the prompt and
 *         onto the command line. no `-p` is passed at all, so the prior
 *         capture — the value after `-p` — records an empty string on
 *         every run, and every assertion built on it would pass
 *         vacuously.
 *
 *         the argv is now the whole contract: `--rules`, `--refs`,
 *         `--diffs`, `--brain`, `--focus`, `--goal`, `--output`. each is
 *         load-bearing, and each is invisible unless the fake keeps it.
 *
 * .mock = the `rhx review` boundary, via asFakeReviewBody
 * .why  = a real brain call bills the api, is slow, and answers
 *         differently each run
 * .real = the gate at commit; the live suite under `BRAIN_LIVE=true`
 */
const genRhxThatCapturesTheArgv = (input: {
  dir: string;
}): { bin: string; captureAt: string; readArgv: () => string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });
  const captureAt = path.join(input.dir, '.argv.txt');

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    asFakeReviewBody({
      captureAt,
      reportBody: 'no hits',
      blockers: 0,
      nitpicks: 0,
    }).join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  return {
    bin,
    captureAt,
    readArgv: (): string =>
      fs.existsSync(captureAt) ? fs.readFileSync(captureAt, UTF8) : '',
  };
};

/**
 * .what = a fake `rhx` that answers with a NON-ZERO verdict
 *
 * .why  = `genRhxThatCapturesTheArgv` hardcodes `0 blockers`, so every
 *         apply-path case built on it lands on the CLEAN branch. that
 *         left the hit branch — the one this whole skill exists to
 *         produce — with no case that reaches it at all.
 *
 * ⚠️ the marker goes into the `--output` FILE, never stdout. `rhx review`
 *    puts what it found in that file and prints only counts and paths, so
 *    a fake that echoed the body to stdout would clamp a copy-out the
 *    skill no longer performs.
 *
 * .mock = the `rhx review` boundary, via asFakeReviewBody
 * .why  = a real brain call bills the api, is slow, and answers
 *         differently each run
 * .real = the gate at commit; the live suite under `BRAIN_LIVE=true`
 */
const genRhxThatAnswers = (input: {
  dir: string;
  blockers: number;
  nitpicks: number;
  marker: string;
  /** see asFakeReviewBody: null = no json; a string = those exact bytes */
  verdictJson?: string | null;
  /** see asFakeReviewBody: lines echoed ahead of the summary */
  stdoutAhead?: string[];
  /** see asFakeReviewBody */
  emulatePolluterDrop?: boolean;
  /** see asFakeReviewBody */
  refusal?: string;
  /** see asFakeReviewBody */
  verdictName?: string;
  /** see asFakeReviewBody */
  refusalBody?: string[];
  withPrompt?: boolean;
}): { bin: string; readCalls: () => number } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    asFakeReviewBody({
      captureAt: path.join(input.dir, '.argv.txt'),
      reportBody: input.marker,
      blockers: input.blockers,
      nitpicks: input.nitpicks,
      verdictJson: input.verdictJson,
      stdoutAhead: input.stdoutAhead,
      emulatePolluterDrop: input.emulatePolluterDrop,
      refusal: input.refusal,
      verdictName: input.verdictName,
      refusalBody: input.refusalBody,
      withPrompt: input.withPrompt,
    }).join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  // a fresh count per fake, since cases share one repo dir
  const callsAt = path.join(input.dir, '.argv.txt.calls');
  fs.rmSync(callsAt, { force: true });
  return {
    bin,
    readCalls: () =>
      fs.existsSync(callsAt)
        ? fs.readFileSync(callsAt, UTF8).trim().split('\n').length
        : 0,
  };
};

/**
 * .what = a fake `rhx` that answers DIFFERENTLY per `--brain`
 *
 * .why  = the union in `main` folds one verdict per reviewer. a fake
 *         that answers every brain alike can never show a block that
 *         outranks a clean and a malfunction in the same run.
 *
 * .note = each brain gets its own fake body at `.fakebin/rhx.<slug>`, and
 *         `rhx` dispatches on the `--brain` value.
 * .mock = the `rhx review` boundary, via asFakeReviewBody
 * .why  = a real brain call bills the api, is slow, and answers
 *         differently each run
 * .real = the gate at commit; the live suite under `BRAIN_LIVE=true`
 */
const genRhxThatAnswersPerBrain = (input: {
  dir: string;
  byBrain: Record<
    string,
    { blockers: number; nitpicks: number; verdictJson?: string | null }
  >;
}): { bin: string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });

  const arms = Object.entries(input.byBrain).map(([brain, answer], index) => {
    // the index keeps the slug injective: `fake/a` and `fake.a` never share a file
    const slug = `${index}-${brain.replace(/[^a-z0-9]+/gi, '-')}`;
    const at = path.join(bin, `rhx.${slug}`);
    fs.writeFileSync(
      at,
      asFakeReviewBody({
        captureAt: path.join(input.dir, `.argv.${slug}.txt`),
        reportBody: `REPORT-OF-${slug}`,
        blockers: answer.blockers,
        nitpicks: answer.nitpicks,
        verdictJson: answer.verdictJson,
      }).join('\n'),
    );
    fs.chmodSync(at, '755');
    return `  ${asShellLiteral(brain)}) exec ${asShellLiteral(at)} "$@" ;;`;
  });

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    [
      '#!/usr/bin/env bash',
      'prev=""',
      'brain=""',
      'for a in "$@"; do',
      '  if [[ "$prev" == "--brain" ]]; then brain="$a"; fi',
      '  prev="$a"',
      'done',
      'case "$brain" in',
      ...arms,
      '  *) echo "💥 MalfunctionError: fake rhx has no arm for brain $brain" >&2; exit 1 ;;',
      'esac',
    ].join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  return { bin };
};

/**
 * .what = a fake `rhx` that SKIPS — zero counts, exit 0, and no logs
 *
 * .why  = `rhx review` skips when its rules glob matches zero files, and
 *         a skip prints `0 blockers / 0 nitpicks` at exit 0 — byte for
 *         byte what a CLEAN pass prints. so a skip would read as a green
 *         gate over a diff no brain ever graded, which is the exact
 *         failhide this whole skill exists to refuse.
 *
 * ⛔ THE ONE DIFFERENCE IS THE `logs:` LINE, and this fake exists to
 *    prove the skill reads it. a skip writes no log artifacts, so it
 *    advertises none; the `review:` line is NOT usable, because a skip
 *    writes that file and its presence proves naught.
 *
 * .mock = the `rhx review` boundary, via asFakeReviewBody
 * .why  = a real brain call bills the api, is slow, and answers
 *         differently each run
 * .real = the gate at commit; the live suite under `BRAIN_LIVE=true`
 */
const genRhxThatSkips = (input: { dir: string }): { bin: string } => {
  const bin = path.join(input.dir, '.fakebin');
  fs.mkdirSync(bin, { recursive: true });

  fs.writeFileSync(
    path.join(bin, 'rhx'),
    asFakeReviewBody({
      captureAt: path.join(input.dir, '.argv.txt'),
      reportBody: '',
      blockers: 0,
      nitpicks: 0,
      withLogs: false,
    }).join('\n'),
  );
  fs.chmodSync(path.join(bin, 'rhx'), '755');

  return { bin };
};

describe('pii.scan.via.brain.sh', () => {
  given('[case1] a staged file, in plan mode', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] planned', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'plan'],
          cwd: repo.dir,
        }),
      );

      then('it exits 0 and asks no brain', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      then('it names the reviewer it WOULD ask', () => {
        // ONE by default. a union of three catches more and costs three
        // times the latency and spend at EVERY commit, and `--brain` is
        // repeatable — so the union is one flag away when a tree wants it
        expect(result.stdout).toContain('brains');
        expect(result.stdout).toContain('anthropic/claude/haiku');
      });

      then('the default reviewer is haiku, never a pricier model', () => {
        // the gate's spend bound (under $0.50 per run) holds only at
        // haiku's price: opus estimated $0.89 for one 118k-token attempt
        expect(result.stdout).not.toContain('anthropic/claude/opus');
        expect(result.stdout).not.toContain('anthropic/claude/sonnet');
      });

      then('it names the briefs it WOULD hand the reviewer', () => {
        // ⛔ the API brain boots none of the role's briefs, so they must
        //    arrive as --refs. an absent refs branch here is the tell
        //    that the reviewer would grade with no practice rules at all
        expect(result.stdout).toContain('refs');
      });

      then('the stdout of the plan matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case2] a staged scope with no files', () => {
    // an empty scope is genuinely clean. to block here would block
    // every commit that touches only deletions — and a gate that
    // blocks a clean commit gets disabled within a day
    const repo = useBeforeAll(async () =>
      genTempRepo({ files: { 'untracked.md': 'not staged' } }),
    );

    when('[t0] reviewed', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs', 'since-staged'], cwd: repo.dir }),
      );

      then('it exits 0 without a brain call', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('no review needed');
      });
    });
  });

  given('[case3] a rubric that cannot be found', () => {
    // ⚠️ the quiet catastrophe. a reviewer handed no rules grades
    //    against an empty rubric and returns a clean 0/0 — a silent
    //    pass at the one boundary where a miss is unrecoverable
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed with a bogus rubric path', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--rubric',
            '/tmp/does-not-exist.md',
          ],
          cwd: repo.dir,
        }),
      );

      then('it exits 1 (malfunction), NOT 0', () => {
        // assert the EXACT code. "non-zero" cannot tell a gate that
        // refused to run apart from one that found PII, and the two
        // send a human down completely different paths
        if (result.exitCode !== 1) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('rubric not found');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case4] a brain that cannot be reached', () => {
    // THE case this file exists for. a reviewer that cannot run must
    // never read as a reviewer that found no PII — per
    // contract.reviewer-output, an unreadable verdict is a
    // malfunction, and a malfunction blocks
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed against a brain slug that does not exist', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'nope/not/a/real/brain'],
          cwd: repo.dir,
        }),
      );

      then('it exits 1 (malfunction), never 0', () => {
        if (result.exitCode === 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
      });

      then('it says the diff was never examined', () => {
        // the distinction is load-bearing: to report a leak that was
        // never detected sends someone hunting a value that may not
        // be there, and teaches them to distrust the gate
        //
        // ⚠️ this assertion is also what tells a CRASH apart from the
        //    malfunction branch. both exit 1, so the exit code alone
        //    cannot distinguish "the gate reported it could not run"
        //    from "the gate fell over" — only the verdict text can
        if (!result.stdout.includes('never actually examined')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', JSON.stringify(result.stdout));
          console.log('PROOF: stderr:', JSON.stringify(result.stderr));
        }
        expect(result.stdout).toContain('never actually examined');
      });

      then('it does NOT claim the diff is clean', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      /**
       * ⭐ the MALFUNCTION HEADER — the verdict line, as opposed to the body
       *    line above it. the MESSAGE walk graded `:661` `no-assert` on the
       *    longest literal adjacent to that exit, and the grade held up: of
       *    the six lines this branch prints, exactly ONE was read.
       */
      then('⭐ it renders the MALFUNCTION verdict', () => {
        expect(result.stdout).toContain('the review could not run');
      });

      /**
       * ⭐ THE REMEDY. a block with no cause is a block a human cannot
       *    clear, and a gate nobody can clear gets bypassed
       *    (`rule.require.errors-name-the-fix`).
       *
       * ⚠️ in this throwaway repo `rhx review` cannot find its own skill
       *    (no linked `.agent/`), so it REFUSES at exit 2. the remedy that
       *    fits is the quoted refusal and its own tip, never a keyrack
       *    step. the keyrack remedy, with its commands, is pinned where its
       *    cause occurs: `[case18][t2]`, a log dir with no verdict json.
       */
      then(
        '⭐ and it names the FIX: the refusal, quoted, with its hint',
        () => {
          expect(result.stdout).toContain(
            'cause: rhx review refused: no skill "review" found',
          );
          expect(result.stdout).toContain('rhx review refused its input');
        },
      );

      then(
        '⭐ and it keeps a first step for a cause a human cannot place',
        () => {
          expect(result.stdout).toContain('if the cause above is unclear');
          expect(result.stdout).toContain('most often: keyrack is locked');
          expect(result.stdout).toContain(
            'rhx keyrack unlock --owner ehmpath --env prep',
          );
        },
      );
    });
  });

  given('[case5] no scope given', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called bare', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: [], cwd: repo.dir }),
      );

      then('it exits 2 and names the fix', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--diffs since-staged');
      });

      then("it offers `rhx review`'s vocabulary, not a private one", () => {
        // one canonical word per concept. a caller who learned the
        // reviewer's flags must not have to learn a second set here
        expect(result.stdout).not.toContain('--staged');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case6] the skill invoked for help', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called with --help', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--help'], cwd: repo.dir }),
      );

      then('it exits 0 and explains why a brain is here at all', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('pii.scan --via brain');
        expect(result.stdout).toContain('can only ADD blocks');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case7] an unknown option', () => {
    const repo = useBeforeAll(async () => genTempRepo({ files: {} }));

    when('[t0] called with a bad flag', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--nope'],
          cwd: repo.dir,
        }),
      );

      then('it exits 2 with a constraint message', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unknown option');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case8] a staged BINARY, which no upstream check can read', () => {
    // ⛔ THE case this change exists for. `grep -I` refuses to open a
    //    binary, so the deterministic pass skips it; `git diff` prints
    //    one line for it that names no value. the reviewer here is the
    //    only gate left — and it cannot look at a file it was never
    //    told about.
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'notes.md': 'Dear reader,' },
        binaries: {
          'scan.png': Buffer.concat([
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            Buffer.from([0x00, 0x00, 0x00, 0x0d]),
            Buffer.from('rendered form', UTF8),
          ]),
        },
        stage: ['notes.md', 'scan.png'],
      }),
    );

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ the diff genuinely hides it — the fixture is real', () => {
        // the positive control, on the FIXTURE rather than the guard.
        // without it, a report that names the file proves little: the
        // diff might have carried the bytes all along, and there would
        // be no blindness for this change to cure.
        const diff = spawnSync('git', ['diff', '--cached'], {
          cwd: repo.dir,
          encoding: UTF8,
        });
        expect(diff.stdout).toContain('Binary files');
        expect(diff.stdout).not.toContain('rendered form');
      });

      then('it names the binary IN THE REPORT, by path', () => {
        // ⛔ THE SUBJECT MOVED, and the move is the whole point of the
        //    swap. the prior form put the path in a PROMPT and told the
        //    reviewer to open it. an API brain has no filesystem, so
        //    that instruction is one it CANNOT obey — and an
        //    unfulfillable instruction at a gate is worse than an absent
        //    one, because it reads like coverage.
        //
        //    what replaces it is deterministic: the skill counts them
        //    itself, names each one, and prints the remedy. a prompt
        //    makes examination LIKELY; a counter makes blindness VISIBLE.
        if (!result.stdout.includes('scan.png')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.stdout).toContain('scan.png');
      });

      then('it says plainly that NO pass has looked inside', () => {
        // the path alone is not enough. a human handed a filename with
        // no claim about it assumes some layer read it — which is the
        // exact assumption this branch exists to refuse
        expect(result.stdout).toContain('unread');
        expect(result.stdout).toContain('no pass has looked inside these');
      });

      then('it names the remedy, as a runnable command', () => {
        // a gate that reports a gap and no way to close it is a gate a
        // human learns to scroll past
        expect(result.stdout).toContain('rhx pdf.transcribe');
      });

      then('it does NOT name the text file in that branch', () => {
        // notes.md reaches the reviewer through the diff already. to
        // list it here would dilute the one list whose whole value is
        // that it is short
        const branch = result.stdout.slice(result.stdout.indexOf('unread'));
        expect(branch).not.toContain('notes.md');
      });

      then('⭐ it does NOT block — a staged binary is ordinary', () => {
        // a gate that refuses every staged PDF is a gate that gets
        // bypassed within a day, and a bypassed gate catches none of
        // what it was built to catch
        expect(result.exitCode).toBe(0);
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case9] a staged set that is all text', () => {
    // the negative control. a section that prints on every run is
    // noise, and noise trains a reader to skim past the one run where
    // it mattered
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'notes.md': 'Dear reader,' },
        stage: ['notes.md'],
      }),
    );

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('a review DID run — the positive control for this case', () => {
        // without it, a fake that was never invoked would satisfy the
        // assertion below for the wrong reason: an absent branch proves
        // silence, never that the run reached the point of printing it
        const argv = fake.readArgv();
        expect(argv).toContain('review');
        expect(argv).toContain('--diffs');
      });

      then('the report shows no unread branch at all', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('clear skies');
        expect(result.stdout).not.toContain('unread');
      });
    });
  });

  /**
   * .what = the arg-parse arms no case in this file ever reached
   *
   * .why  = `parse_args` (pii.scan.via.brain.sh:159) has ELEVEN arms.
   *         SIX were covered — `--help` by [case6], `--diffs`, `--brain`,
   *         `--rubric`, `--mode` and `-*)` by [case7]. the `-h` alias, the
   *         rhachet passthrough and the BARE-token catch-all had none.
   *
   * ⚠️ every assertion below reads the MESSAGE, never the exit code. this
   *    skill refuses at exit 2 from SEVEN sites — the two catch-alls, four
   *    guards in `validate`, and the hit verdict at :633 — so a
   *    fall-through from one arm to another is wholly invisible to
   *    `expect(exitCode).toBe(2)`.
   *
   * ⚠️ each positive sits in its own `then`, apart from its discriminator.
   *    jest halts a `then` at its first red, so an exclusion co-located
   *    with a positive can never be measured on its own.
   */
  given('[case10] the arg-parse arms with no prior case', () => {
    when('[t0] the -h alias is used', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: {} }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['-h'], cwd: repo.dir }),
      );

      then('it exits 0 and renders the usage block', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('pii.scan --via brain');
        expect(result.stdout).toContain('--help, -h');
      });

      // ⭐ the discriminator. a dead `-h` falls to the `-*)` catch-all,
      //    which refuses at the SAME exit 2 as six other sites — so only
      //    the absence of that message tells the two apart.
      then('⭐ it does NOT fall through to the unknown-option arm', () => {
        expect(result.stdout).not.toContain('unknown option');
      });
    });

    when('[t1] rhachet passes --repo, --skill and --role', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      // ⚠️ ORDER IS LOAD-BEARING. under a `shift` defect the parser halts
      //    at the FIRST stray token, so only the value of the FIRST
      //    passthrough flag can ever leak. `--repo` leads, and its value
      //    is the needle.
      //
      // ⚠️ and `bhrain` is chosen because the plan report echoes the
      //    scope, the rubric basename, the roles and the brain slugs — a
      //    needle drawn from any of those would redden on CORRECT
      //    behavior. `bhrain` appears in none of them.
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--repo',
            'bhrain',
            '--skill',
            'pii.scan',
            '--role',
            'transcriber',
            '--diffs',
            'since-staged',
            '--mode',
            'plan',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it plans, rather than refuse', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      then('⭐ it does NOT read a flag VALUE as an argument', () => {
        expect(result.stdout).not.toContain('bhrain');
      });
    });

    when('[t2] a bare token is passed', () => {
      const repo = useBeforeAll(async () => genTempRepo({ files: {} }));
      const result = useBeforeAll(async () =>
        runSkill({ args: ['ledger.md'], cwd: repo.dir }),
      );

      then('it names the token on the unexpected-argument arm', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('unexpected argument: ledger.md');
      });

      // ⭐ the two catch-alls differ ONLY by message — `-*)` says "unknown
      //    option", `*)` says "unexpected argument", and both exit 2. so a
      //    merge of the two is invisible to [case7], which passes a
      //    dash-prefixed token and would stay GREEN under it.
      then('⭐ it is NOT reported as an unknown OPTION', () => {
        expect(result.stdout).not.toContain('unknown option');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = the flags the DISPATCHER forwards, which this leaf accepts
   *         and drops
   *
   * .why  = `pii.scan.sh` hands every scope flag to both layers, so this
   *         leaf must swallow five it has no use for
   *         (pii.scan.via.brain.sh:185). drop one from that alternation
   *         and it falls to `-*)` — so the gate refuses, at exit 2, every
   *         invocation the dispatcher makes with a roster or an allowlist.
   *         the whole second layer stops, and it stops by REFUSAL, which
   *         at a pre-commit gate blocks every commit.
   *
   * ⚠️ the five sit on ONE alternation line, so a defect in it is a defect
   *    in all five and one case reaches them together. what a single case
   *    CANNOT do is name which one broke — hence the two exclusions below,
   *    which separate a dropped FLAG from a mis-shifted VALUE.
   */
  given('[case11] the flags forwarded by the dispatcher', () => {
    when('[t0] all five accept-and-drop flags are passed', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--paths-with',
            'src/**',
            '--paths-wout',
            'vendor',
            '--join',
            'union',
            '--allow',
            '.my-allow',
            '--roster',
            '.my-map',
            '--mode',
            'plan',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it plans, rather than refuse a flag it was handed', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      // ⭐ a flag dropped from the alternation lands on `-*)`
      then('⭐ no flag fell to the unknown-option arm', () => {
        expect(result.stdout).not.toContain('unknown option');
      });

      // ⭐ a `shift` where `shift 2` is meant leaves the VALUE as a bare
      //    token, which lands on `*)` — a different message, the same
      //    exit code
      then('⭐ no VALUE fell to the unexpected-argument arm', () => {
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });

    when('[t1] --lockfiles is passed AHEAD of another flag', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      // ⚠️ POSITION IS LOAD-BEARING, and it is the INVERSE of the regex
      //    suite's choice. there `--lockfiles` changes the file set, so it
      //    goes LAST to isolate its effect. here it does no work at all —
      //    it is accepted and dropped — so acceptance is the ONLY
      //    observable, and a `shift 2` defect can be seen only if there is
      //    a next token for it to swallow. so it LEADS: under `shift 2` it
      //    eats `--diffs`, and `since-staged` is left as a bare token.
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--lockfiles', '--diffs', 'since-staged', '--mode', 'plan'],
          cwd: repo.dir,
        }),
      );

      then('⭐ it plans, rather than swallow the flag behind it', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('plan — no brain was asked');
      });

      then('⭐ the flag behind it was NOT read as an argument', () => {
        expect(result.stdout).not.toContain('unexpected argument');
      });
    });
  });

  /**
   * .what = the value-guards in `validate` (pii.scan.via.brain.sh:223)
   *
   * .why  = four of the seven exit-2 sites live here and only ONE was
   *         covered ([case5], the absent scope). the rest are
   *         distinguishable from each other by their MESSAGE alone.
   *
   * ⛔ and the harm of a dead value-guard is never a wrong refusal. it is
   *    one of two silent failures, and they are DIFFERENT failures:
   *
   *      --diffs  an unvalidated value matches no arm of `collect_files`,
   *               which has no `*)`. so it emits no path, the file count
   *               is zero, and the gate reports `clear skies · no review
   *               needed` — the exact "never opened, reported as read"
   *               failure this skill exists to prevent.
   *
   *      --mode   an unvalidated value is not `plan`, so control falls
   *               past the plan branch into APPLY. a typo does not refuse
   *               — it asks a paid brain that the operator deliberately
   *               asked it not to ask.
   */
  given('[case12] the value-guards with no prior case', () => {
    when('[t0] --diffs carries a near-miss value', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs', 'since-stage'], cwd: repo.dir }),
      );

      then('it names the value set it accepts', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(
          '--diffs must be since-staged, since-commit, or since-main',
        );
      });

      // ⭐ the harm. a file IS staged, so a dead guard does not merely
      //    accept a bad value — it reports the scope empty and clean.
      then('⭐ it does NOT report clean over a scope it never built', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      then('⭐ it is NOT reported as an absent scope', () => {
        // [case5]'s message, from the guard immediately above this one
        expect(result.stdout).not.toContain('needs a scope');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] --mode carries a typo', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      // ⚠️ the fake `rhx` is here as a COST CEILING, not as the subject.
      //    under a dead guard this invocation reaches the apply path and
      //    asks a real brain — slow, paid, and non-deterministic. the
      //    fake bounds that, and doubles as the instrument for the
      //    assertion below.
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'paln'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it names the pair it accepts', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('--mode must be plan or apply');
      });

      // ⭐ THE HARM, MEASURED AT THE SOURCE. every other clamp in this file
      //    reads the report; this one reads whether a brain was invoked at
      //    all. a dead guard turns a typo into a paid call, and the report
      //    it then prints is a perfectly ordinary clean one.
      then('⭐ no brain was asked', () => {
        expect(fake.readArgv()).toEqual('');
      });

      then('⭐ it does NOT report clean', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = --roles, the flag the swap to `rhx review` REMOVED
   *
   * .why  = an enrolled clone booted roles; an API brain boots none of
   *         them, so the flag has no target and was deleted from the
   *         surface. the hazard is what a REMOVED flag does next — and
   *         the two exits are not equally safe:
   *
   *           accepted and dropped -> the operator believes they narrowed
   *                                   the reviewer, the run proceeds, and
   *                                   the report is an ordinary clean one
   *           refused              -> exit 2, and they read the help
   *
   *         the first is a silent behavior change at a gate whose whole
   *         job is to refuse silence. so the clamp is on the REFUSAL,
   *         never merely on the flag's absence from the report.
   *
   * ⚠️ this case USED to assert the flag worked. it now asserts the flag
   *    is gone, and that inversion is deliberate: the prior assertion is
   *    exactly the one a half-done swap would leave green.
   */
  given('[case13] the removed --roles flag', () => {
    when('[t0] an operator sends it out of habit', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'letter.md': 'Dear reader,' },
          stage: ['letter.md'],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--roles',
            'reviewer,notary',
            '--mode',
            'plan',
          ],
          cwd: repo.dir,
        }),
      );

      then('⭐ it is REFUSED, never silently dropped', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.exitCode).toBe(2);
      });

      then('the refusal names the flag it rejected', () => {
        expect(result.stdout).toContain('--roles');
      });

      then('⭐ it does NOT proceed to a report', () => {
        // the harm, stated. a run that accepted the flag and reviewed
        // anyway prints a perfectly ordinary plan, and the operator
        // never learns the reviewer was never narrowed
        expect(result.stdout).not.toContain('heres the plan');
        expect(result.stdout).not.toContain('clear skies');
      });
    });
  });

  /**
   * ⭐ the TWIN of [case23] in pii.scan.via.regex.integration.test.ts, and it
   *    had ZERO coverage here. the MESSAGE walk found it on the
   *    `rev-parse --is-inside-work-tree` guard in
   *    `pii.scan.via.brain.sh`, graded `no-assert`.
   *
   *    both leaves derive their whole scope from git — `--diffs` resolves to a
   *    `git diff` — so outside a work tree there is no scope to build. each
   *    refuses up front rather than let the run reach a scope it cannot
   *    derive.
   *
   * ⚠️ the fixture is a BARE mkdtemp, deliberately not `genTempRepo`. that
   *    helper opens with `git init`, so it would satisfy the very precondition
   *    this case exists to remove.
   *
   * ⚠️ `--diffs since-staged` is passed on purpose. the git check is FIRST in
   *    `validate()`, so a bare invocation would be refused by the scope guard
   *    below it and the probe would measure the wrong arm.
   */
  given('[case14] a directory that is NOT a git work tree', () => {
    const bare = useBeforeAll(async () => ({
      dir: fs.mkdtempSync(path.join(os.tmpdir(), 'pii-review-nogit-')),
    }));

    when('[t0] the reviewer is invoked there', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'plan'],
          cwd: bare.dir,
        }),
      );

      then('it refuses at exit 2 — a CONSTRAINT, not a malfunction', () => {
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ SPLIT from the exit-code clamp above, per the discipline this walk
       *    holds throughout: jest halts a `then` at its first red, so two
       *    clamps in one block can never be measured apart.
       *
       *    MEASURED 2026-09-04, guard deleted from `validate()`:
       *      exit code = 129   (NOT 2 — no reason reaches the caller)
       *      stdout    = ""    (empty)
       *    both clamps went red, 37/2.
       *
       * ⭐ 129, where the REGEX leaf's identical guard falls through to 128.
       *    two twin skills, the same guard, the same fixture, two different
       *    codes — which is the leak-6 lesson stated as a measurement: the
       *    exit-code clamp's teeth are a property of what lies DOWNSTREAM,
       *    not of the guard. neither number is a fact about the refusal, and
       *    the day one of them lands on 2 the code clamp goes green over a
       *    run that never checked the precondition.
       *
       * ⚠️ and the split earns more here than at the regex leaf. this skill
       *    spends MONEY — an `--mode apply` arm past `validate` is a paid
       *    brain call — so a guard that never fires is not merely a wrong
       *    verdict, it is a wrong verdict with a bill attached.
       */
      then('⭐ and it NAMES the reason', () => {
        expect(result.stdout).toContain('not inside a git work tree');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = the HIT verdict — pii.scan.via.brain.sh:612-633
   *
   * ⛔ THE BRANCH THIS SKILL EXISTS TO PRODUCE, AND NO CASE REACHED IT.
   *
   *    every apply-path case in this file goes through
   *    `genRhxThatCapturesTheArgv`, whose fake answers `0 blockers` —
   *    hardcoded, in its shared body. so `totalBlockers` was zero on every
   *    run, and the whole `-gt 0` arm was dead: the `hold up — a brain saw
   *    PII` header, the per-reviewer 🚨 line, the UNION rule, the report
   *    copy, and `exit 2`.
   *
   * ⭐ the MESSAGE walk graded `:633` **thin-msg**, which is a WEAKER claim
   *    than the truth. the sweep can only see that the longest literal
   *    adjacent to an exit is short; it cannot see that no case reaches the
   *    branch at all. so a `thin-msg` grade is a PROMPT to open the site —
   *    and opened, this one is leak 5, not leak 6.
   *
   * ⛔ and the extant discriminators cannot stand in for this. three cases
   *    assert `not.toContain('clear skies')`, which is satisfied by ANY
   *    output that is not the clean header — an empty stdout, a crash, a
   *    truncated report. an exclusion cannot tell "the blocked verdict
   *    rendered" from "no verdict rendered at all".
   */
  given('[case15] a reviewer that answers with BLOCKERS', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed under a fake that reports a hit', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 2,
          nitpicks: 1,
          marker: 'VERDICT-BODY-MARKER',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it blocks at exit 2', () => {
        expect(result.exitCode).toBe(2);
      });

      /**
       * ⭐ the verdict itself. SPLIT from the exit code above, because the
       *    two fail apart: `main`'s clean tail also exits 0 and the
       *    malfunction tail exits 1, so a swap of the two headers moves no
       *    exit code at all.
       */
      then('⭐ it renders the HIT verdict', () => {
        expect(result.stdout).toContain('hold up — a brain saw PII');
      });

      /**
       * ⭐ the per-reviewer line, from the `blockers -gt 0` arm at :604.
       *    its ✅ twin sits two lines below at :606 and is byte-adjacent in
       *    the source, so a swap of the two arms is a one-line edit that
       *    labels a hit `clean` while the header above still says `hold up`.
       */
      then('⭐ it names the reviewer that saw it, with its counts', () => {
        expect(result.stdout).toContain(
          '🚨 fake/one — 2 blocker(s), 1 nitpick(s)',
        );
      });

      then('⭐ it states the UNION rule', () => {
        // ⛔ the rule a human must know to act: one blocker from one
        //    reviewer blocks, whatever the other two said. without it the
        //    tree reads as a tally to weigh rather than a gate that closed
        expect(result.stdout).toContain(
          'results are UNIONED: any blocker from any reviewer blocks',
        );
      });

      /**
       * ⭐ the report copy — the only clamp here that reads DISK rather than
       *    stdout. the reviewer's own reply IS the report (see
       *    run_one_reviewer), so a `cp` that silently no-ops leaves the
       *    human with a tree that points at a file that was never written.
       *    the `|| true` on that line makes the failure silent by design.
       */
      then("⭐ the report lands on disk, with the reviewer's own words", () => {
        const at = path.join(repo.dir, '.pii-review.fake-one.md');
        expect(fs.existsSync(at)).toBe(true);
        expect(fs.readFileSync(at, UTF8)).toContain('VERDICT-BODY-MARKER');
      });

      then('⭐ and it is NOT the clean verdict', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      /**
       * ⭐ the discriminator that the three extant `clear skies` exclusions
       *    cannot supply. a hit and a malfunction BOTH block, so the two are
       *    separated by their text alone — and they send a human down
       *    completely different paths: one hunts a value, the other unlocks
       *    a keyrack.
       */
      then('⭐ nor the MALFUNCTION verdict', () => {
        expect(result.stdout).not.toContain('the review could not run');
        expect(result.stdout).not.toContain('never actually examined');
      });
    });
  });

  /**
   * .what = the `rhx review` argv — the whole contract of the swap
   *
   * ⛔ EVERY FLAG BELOW IS LOAD-BEARING, AND TWO ARE SET TO THE VALUE
   *    THAT IS ALREADY THE DEFAULT. that redundancy is the point: an
   *    upstream default that moves must not silently change what this
   *    gate does, and only an assertion on the argv can prove the flag
   *    was actually sent rather than merely relied upon.
   *
   * ⚠️ none of these is visible in the report. a run with `--focus pull`
   *    against an API brain grades a diff it never read and prints an
   *    ordinary `clear skies` — so no stdout clamp can reach this.
   */
  given('[case16] the flags handed to rhx review', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it calls `review`, never `enroll`', () => {
        // ⛔ the swap itself. `rhx enroll claude` spawns a clone with a
        //    cwd jail, and twice that jail turned a clean tree into a
        //    blocked commit
        const argv = fake.readArgv();
        if (!argv.includes('review')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: argv:', JSON.stringify(argv));
        }
        expect(argv).toContain('review');
        expect(argv).not.toContain('enroll');
      });

      then('it hands over the rubric, as --rules', () => {
        const argv = fake.readArgv();
        expect(argv).toContain('--rules');
        expect(argv).toContain('rule.forbid.pii-in-a-diff.md');
      });

      then("⭐ it hands over the role's briefs, as --refs", () => {
        // ⛔ an enrolled clone BOOTED these. an API brain boots none of
        //    them, so a swap that dropped this flag would hand the
        //    reviewer a rubric and no practice rules behind it — and
        //    print a report indistinguishable from a correct run
        const argv = fake.readArgv();
        expect(argv).toContain('--refs');

        // where the role ships practice rules, they are the refs. where it
        // ships none, the skill falls back to its own rubric, since
        // `rhx review` refuses a refs glob that matches zero files
        const practicesDir = path.join(
          __dirname,
          '..',
          '..',
          'briefs',
          'practices',
        );
        const practicesShipped =
          fs.existsSync(practicesDir) &&
          fs.readdirSync(practicesDir).some((f) => /^rule\..*\.md$/.test(f));
        expect(argv).toContain(
          practicesShipped ? 'briefs/practices' : 'pii.scan/rubric',
        );
      });

      then('it pins the brain it was told to ask', () => {
        const argv = fake.readArgv();
        expect(argv).toContain('--brain');
        expect(argv).toContain('fake/one');
      });

      then('⭐ it PUSHES the diff — an API brain cannot pull one', () => {
        // `pull` hands the brain paths and expects it to open them. an
        // API brain has no tools to do that, so it would grade a diff it
        // never read — and answer, confidently, `0 blockers`
        expect(fake.readArgv()).toContain('push');
      });

      then('⭐ it asks for EXHAUSTIVE, never a sample', () => {
        // a representative sample of leaks is not a gate. one missed SSN
        // is the whole failure, and it cannot be rotated after a push
        expect(fake.readArgv()).toContain('exhaustive');
      });

      then(
        '⭐ it KEEPS route paperwork, dreams, and lockfiles in scope',
        () => {
          // the default drops them, so a commit of only such paths would
          // review naught and block, and a mixed one would hide them
          expect(fake.readArgv()).toContain('--polluters\nkeep');
        },
      );

      then(
        '⭐ it cuts lockfiles from scope — names and hashes, ~90k tokens',
        () => {
          const argv = fake.readArgv();
          expect(argv).toContain('--paths-wout\n**/pnpm-lock.yaml');
          expect(argv).toContain('--paths-wout\n**/package-lock.json');
          expect(argv).toContain('--paths-wout\n**/yarn.lock');
        },
      );

      then('⛔ it NEVER passes --partition — one run writes one json', () => {
        // the verdict read takes the LAST logs line. a partitioned run
        // prints one per partition, so the earlier ones would go unread
        expect(fake.readArgv()).not.toContain('--partition');
      });

      then('⛔ it NEVER passes --optional', () => {
        // ⛔ `--optional rules` turns a zero-match rules glob into
        //    `0 blockers / 0 nitpicks`, exit 0 — the exact failhide this
        //    gate exists to stop. `validate()` already refuses an absent
        //    rubric, so the flag buys nothing and costs the guarantee
        expect(fake.readArgv()).not.toContain('--optional');
      });
    });
  });

  /**
   * .what = a SKIPPED review, scored as a MALFUNCTION
   *
   * ⛔ A SKIP AND A CLEAN PASS PRINT THE SAME TWO LINES. `rhx review`
   *    skips when its rules glob matches zero files, and emits
   *    `0 blockers / 0 nitpicks` at exit 0 — byte for byte what a clean
   *    pass emits. so the count parser CANNOT tell them apart, and a skip
   *    would read as a green gate over a diff no brain ever graded.
   *
   * ⭐ the one discriminator is the `logs:` line. a skip writes no log
   *    artifacts, so it advertises none.
   *
   * ⚠️ the `review:` line is NOT usable, and that is the trap. a skip
   *    DOES write its --output file, so the presence of that line proves
   *    naught — a guard built on it would pass a skip.
   */
  given('[case17] a review that SKIPS', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the reviewer reports zero counts with no logs', () => {
      const fake = useBeforeAll(async () => genRhxThatSkips({ dir: repo.dir }));

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it does NOT report clean', () => {
        // THE assertion of this case. the fake prints `0 blockers` and
        // `0 nitpicks` at exit 0, so a skill that read only the counts
        // would land here on the clean tail
        if (result.stdout.includes('clear skies')) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
        }
        expect(result.stdout).not.toContain('clear skies');
      });

      then('it blocks, as a malfunction', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('the review could not run');
      });

      then(
        '⭐ its cause line names the absent logs line, skip or crash',
        () => {
          expect(result.stdout).toContain(
            'cause: no logs: line — the review skipped, or crashed before it wrote logs',
          );
        },
      );

      then('⭐ it says the diff was never examined', () => {
        // a human handed `0 blockers` and an exit 1 cannot tell a broken
        // reviewer from a broken skill. the words are the whole remedy
        expect(result.stdout).toContain('never actually examined');
      });

      then('⭐ and it is NOT the hit verdict', () => {
        // a hit and a malfunction both block, and they send a human down
        // completely different paths: one hunts a value in a diff, the
        // other repairs a reviewer that did not run
        expect(result.stdout).not.toContain('hold up — a brain saw PII');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = the verdict comes from the reviewer JSON, never from stdout
   *
   * ⛔ THE CLAMP FOR ehmpathy/rhachet-roles-rhight#52.
   *
   *    the prior parse took the FIRST `blocker…<digit>` match across raw
   *    `rhx review` stdout. `rhx review` echoes staged paths ahead of its
   *    summary, so a staged `blocker/5.briefs.short.md` read as 5 blockers
   *    over a clean review — and blocked a clean commit — while
   *    `blocker/0…` ahead of a real `2 blockers` read as 0 and let a leak
   *    through. the fake below prints exactly that stdout; the json is the
   *    truth, and the skill must follow it in both directions.
   *
   * ⚠️ revert the cure (the stdout regex back in run_one_reviewer) and
   *    [t0] goes red: it reads 5 and exits 2. [t1] goes red too: it reads
   *    0 and exits 0 over a real hit. [t2] goes red: it reads the stray
   *    `0 blockers` summary and exits 0 over a review with no verdict.
   */
  given('[case18] a staged path whose digit competes with the verdict', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] path blocker/5.x.md in stdout, json clean', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: JSON.stringify({ blockers: [], nitpicks: [] }),
          stdoutAhead: ['   ├─ targets: blocker/5.x.md'],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it reads 0 blockers off the json and passes at exit 0', () => {
        if (result.exitCode !== 0) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(0);
      });

      then('⭐ it renders the clean verdict, 0 nitpicks', () => {
        expect(result.stdout).toContain('clear skies');
        expect(result.stdout).toContain('✅ fake/one — clean (0 nitpick(s))');
      });

      then('it does NOT read the path digit as a count', () => {
        expect(result.stdout).not.toContain('5 blocker(s)');
      });

      then('the stdout of the clean run matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] path blocker/0.x.md in stdout, json with 2 blockers', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 2,
          nitpicks: 0,
          marker: 'two hits',
          stdoutAhead: ['   ├─ targets: blocker/0.x.md'],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it reads 2 blockers off the json and blocks at exit 2', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      then('⭐ it names the reviewer with the json count', () => {
        expect(result.stdout).toContain(
          '🚨 fake/one — 2 blocker(s), 0 nitpick(s)',
        );
      });

      then('the stdout of the block matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t2] logs line present, json absent', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: null,
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it is a MALFUNCTION at exit 1, never a clean 0/0', () => {
        if (result.exitCode !== 1) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(1);
      });

      then('⭐ its cause line names the absent json', () => {
        expect(result.stdout).toMatch(
          /cause: no verdict json at \.log\/bhrain\/review\/fake\.\d+\/output\.response\.json/,
        );
        expect(result.stdout).toContain(
          'rhx keyrack unlock --owner ehmpath --env prep',
        );
        expect(result.stdout).toContain(
          'rhx keyrack set --owner ehmpath --key FAKE_API_KEY --env prep',
        );
      });

      then('it does NOT claim the diff is clean', () => {
        expect(result.stdout).not.toContain('clear skies');
      });

      then('the stdout of the malfunction matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = a json that parses badly, or parses to the wrong shape
   *
   * ⛔ BOTH MUST FAIL CLOSED, each with its own cause.
   *
   *    an unparseable file is a run that died mid-write. a non-array
   *    `.blockers` is an upstream reshape — and the dangerous one, because
   *    `jq '.blockers | length'` on null is 0. the type check must run
   *    BEFORE the count, or a reshaped json reads as a clean review.
   */
  given('[case19] a verdict json the skill cannot trust', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the json is truncated mid-write', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: '{"done": true, "blockers": [',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it is a MALFUNCTION at exit 1', () => {
        expect(result.exitCode).toBe(1);
      });

      then('⭐ its cause line says the json is unparseable', () => {
        expect(result.stdout).toContain('cause: verdict json unparseable at');
      });

      then('it retries once — a truncated write may not recur', () => {
        expect(fake.readCalls()).toBe(2);
      });

      then(
        'the stdout of the unparseable malfunction matches its snapshot',
        () => {
          expect(result.stdout).not.toContain('clear skies');
          expect(result.exitCode).toBe(1);
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        },
      );
    });

    when('[t1] .blockers is null and .nitpicks is absent', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: JSON.stringify({ done: true, blockers: null }),
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it is a MALFUNCTION at exit 1 — null never reads as 0', () => {
        expect(result.exitCode).toBe(1);
      });

      then('it asks once — a json written whole and misshaped recurs', () => {
        expect(fake.readCalls()).toBe(1);
      });

      then('⭐ its cause line says the arrays are absent', () => {
        expect(result.stdout).toContain(
          'cause: verdict json .blockers is null, not an array; .nitpicks is absent, at',
        );
      });

      then(
        'it never claims the diff is clean, and its stdout matches the snapshot of a null field',
        () => {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).not.toContain('clear skies');
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        },
      );
    });

    when('[t2] the json is a bare null', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: 'null',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then(
        '⭐ it is a MALFUNCTION at exit 1, named as a shape fault, not a parse fault',
        () => {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).toContain(
            'cause: verdict json is null, not an object, at',
          );
        },
      );

      then(
        'it never claims the diff is clean, and its stdout matches the snapshot of a bare null',
        () => {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).not.toContain('clear skies');
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        },
      );
    });

    when('[t3] .blockers is a number', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: JSON.stringify({
            done: true,
            blockers: 2,
            nitpicks: [],
          }),
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it is a MALFUNCTION at exit 1, not a count of 2', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          'cause: verdict json .blockers is number, not an array, at',
        );
      });

      then(
        'it never claims the diff is clean, and its stdout matches the snapshot of a number field',
        () => {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).not.toContain('clear skies');
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        },
      );
    });
  });

  /**
   * .what = many reviewers, each read off its own json, folded in order
   *
   * ⛔ ONE BLOCK BLOCKS, whatever the others said. a block outranks a
   *    malfunction, and a malfunction outranks a pass. each reviewer runs
   *    its own `rhx review` in parallel, so each must read its OWN json —
   *    a shared dir would hand one reviewer another's verdict.
   */
  given('[case20] three reviewers that disagree', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] a blocks, b is clean, c wrote no json', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswersPerBrain({
          dir: repo.dir,
          byBrain: {
            'fake/a': { blockers: 1, nitpicks: 0 },
            'fake/b': { blockers: 0, nitpicks: 2 },
            'fake/c': { blockers: 0, nitpicks: 0, verdictJson: null },
          },
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--brain',
            'fake/a',
            '--brain',
            'fake/b',
            '--brain',
            'fake/c',
          ],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it blocks at exit 2', () => {
        if (result.exitCode !== 2) {
          console.log('PROOF: exitCode:', result.exitCode);
          console.log('PROOF: stdout:', result.stdout);
          console.log('PROOF: stderr:', result.stderr);
        }
        expect(result.exitCode).toBe(2);
      });

      then('⭐ each reviewer shows its own verdict', () => {
        expect(result.stdout).toContain(
          '🚨 fake/a — 1 blocker(s), 0 nitpick(s)',
        );
        expect(result.stdout).toContain('✅ fake/b — clean (2 nitpick(s))');
        expect(result.stdout).toContain('💥 fake/c — verdict unreadable');
      });

      then('it states the UNION rule', () => {
        expect(result.stdout).toContain(
          'results are UNIONED: any blocker from any reviewer blocks',
        );
      });

      then('the stdout of the mixed block matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] a is clean, b wrote no json', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswersPerBrain({
          dir: repo.dir,
          byBrain: {
            'fake/a': { blockers: 0, nitpicks: 0 },
            'fake/b': { blockers: 0, nitpicks: 0, verdictJson: null },
          },
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--brain',
            'fake/a',
            '--brain',
            'fake/b',
          ],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then(
        '⭐ it is a MALFUNCTION at exit 1 — a clean never vouches for an unread verdict',
        () => {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).not.toContain('clear skies');
        },
      );

      then(
        '⭐ it lists both reviewers, and the unread one names its cause',
        () => {
          expect(result.stdout).toContain('✅ fake/a — clean (0 nitpick(s))');
          expect(result.stdout).toContain('💥 fake/b — verdict unreadable');
          expect(result.stdout).toContain('cause: no verdict json at');
        },
      );

      then(
        'the stdout of the clean-plus-malfunction matches its snapshot',
        () => {
          expect(result.exitCode).toBe(1);
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        },
      );
    });
  });

  /**
   * .what = one dropped verdict does not speak for the whole check
   *
   * ⚠️ the gate retries an unread verdict once. a fake that writes NO json
   *    on its first call and a clean json on its second proves the retry
   *    reads the SECOND run's own json — and that a recovered retry passes
   *    rather than carry the first attempt's malfunction forward.
   */
  given('[case21] a review whose first attempt wrote no verdict', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the retry writes a clean json', () => {
      const fake = useBeforeAll(async () => {
        const bin = path.join(repo.dir, '.fakebin');
        fs.mkdirSync(bin, { recursive: true });
        // a fake of the rhx review boundary: see the .note on asFakeReviewBody
        const body = (verdictJson: string | null): string =>
          asFakeReviewBody({
            captureAt: path.join(repo.dir, '.argv.txt'),
            reportBody: 'no hits',
            blockers: 0,
            nitpicks: 0,
            verdictJson,
          }).join('\n');
        fs.writeFileSync(path.join(bin, 'rhx.first'), body(null));
        fs.writeFileSync(
          path.join(bin, 'rhx.second'),
          body(JSON.stringify({ blockers: [], nitpicks: [] })),
        );
        fs.chmodSync(path.join(bin, 'rhx.first'), '755');
        fs.chmodSync(path.join(bin, 'rhx.second'), '755');
        const countAt = path.join(repo.dir, '.calls');
        fs.writeFileSync(
          path.join(bin, 'rhx'),
          [
            '#!/usr/bin/env bash',
            `echo x >> ${asShellLiteral(countAt)}`,
            `if [[ "$(wc -l < ${asShellLiteral(countAt)})" -le 1 ]]; then exec ${asShellLiteral(`${bin}/rhx.first`)} "$@"; fi`,
            `exec ${asShellLiteral(`${bin}/rhx.second`)} "$@"`,
          ].join('\n'),
        );
        fs.chmodSync(path.join(bin, 'rhx'), '755');
        return { bin, countAt };
      });

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it passes at exit 0 on the recovered retry', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('✅ fake/one — clean (0 nitpick(s))');
      });

      then('⭐ the first attempt leaves no trace of a malfunction', () => {
        expect(result.stdout).not.toContain('verdict unreadable');
        expect(result.stdout).not.toContain('cause:');
      });

      then('the stdout of the recovered retry matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });

      then('it asked the reviewer exactly twice', () => {
        expect(
          fs.readFileSync(fake.countAt, UTF8).trim().split('\n'),
        ).toHaveLength(2);
      });
    });
  });

  /**
   * .what = a host with no jq fails fast, and says so
   *
   * ⚠️ every verdict read goes through jq. absent jq, each read would fail
   *    as "verdict json unparseable" — closed, but under a false cause. the
   *    PATH below mirrors the host's, one symlink per tool, minus jq, so
   *    bash, git, and every coreutil the skill calls still resolve.
   */
  given('[case22] a host with no jq on PATH', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the skill runs in its default mode, apply', () => {
      const pathWoutJq = useBeforeAll(async () =>
        genPathWoutTool({
          dir: path.join(repo.dir, '.path-wout-jq'),
          tool: 'jq',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          pathOnly: pathWoutJq.dir,
        }),
      );

      then('⭐ it blocks at exit 1, before any review runs', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).not.toContain('pii.review');
        expect(result.stdout).not.toContain('fake/one —');
      });

      then('⭐ it names jq as the absent tool', () => {
        expect(result.stdout).toContain('jq not found');
      });

      then('the stdout of the jq precondition matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case33] a host with no rhx on PATH', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the skill runs in its default mode, apply', () => {
      const pathWoutRhx = useBeforeAll(async () =>
        genPathWoutTool({
          dir: path.join(repo.dir, '.path-wout-rhx'),
          tool: 'rhx',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          pathOnly: pathWoutRhx.dir,
        }),
      );

      then('⭐ it blocks at exit 1 and names rhx, not the keyrack', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain('rhx not found');
        expect(result.stdout).not.toContain('keyrack');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case34] a review that refuses for an absent brain key', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the brain is the default provider, anthropic', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          refusal:
            'ANTHROPIC_API_KEY not found in keyrack (owner ehmpath, env prep)',
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--brain',
            'anthropic/claude/haiku',
          ],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it blocks at exit 1 and asks once', () => {
        expect(result.exitCode).toBe(1);
        expect(fake.readCalls()).toBe(1);
      });

      then(
        '⭐ it quotes the refusal and names the key the provider reads',
        () => {
          expect(result.stdout).toContain(
            'rhx review refused: ANTHROPIC_API_KEY not found in keyrack',
          );
          expect(result.stdout).toContain(
            'rhx keyrack set --owner ehmpath --key ANTHROPIC_API_KEY --env prep',
          );
        },
      );

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] the brain is an openrouter slug', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          refusal:
            'OPENROUTER_API_KEY not found in keyrack (owner ehmpath, env prep)',
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: [
            '--diffs',
            'since-staged',
            '--brain',
            'openrouter/deepseek/flash',
          ],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it names OPENROUTER_API_KEY in the fill command', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          'rhx keyrack set --owner ehmpath --key OPENROUTER_API_KEY --env prep',
        );
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = only the LAST `├─ logs: ` line points at the verdict
   *
   * ⛔ the json path is itself read off stdout, so a staged path that
   *    echoes as `├─ logs: <dir>` is this same defect one level down. the
   *    skill reads the last such line — the one `rhx review` prints in its
   *    closing summary, after every echoed path. both directions: a stale
   *    blocker ahead of a clean verdict must not block, and a stale clean
   *    ahead of a real leak must not pass.
   */
  given('[case23] an echoed logs line ahead of the real one', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    /**
     * .what = write a verdict json at a dir no real run owns
     * .why  = the decoy an echoed `├─ logs: ` line points at
     */
    const genStaleVerdict = (input: { blockers: number }): string => {
      const rel = `.stale-${input.blockers}`;
      fs.mkdirSync(path.join(repo.dir, rel), { recursive: true });
      fs.writeFileSync(
        path.join(repo.dir, rel, 'output.response.json'),
        JSON.stringify({
          done: true,
          blockers: Array.from({ length: input.blockers }, (_, i) => ({
            title: `stale blocker ${i + 1}`,
          })),
          nitpicks: [],
        }),
      );
      return rel;
    };

    when(
      '[t0] the echoed line points at 3 blockers, the real verdict is clean',
      () => {
        const fake = useBeforeAll(async () =>
          genRhxThatAnswers({
            dir: repo.dir,
            blockers: 0,
            nitpicks: 0,
            marker: 'no hits',
            stdoutAhead: [`   ├─ logs: ${genStaleVerdict({ blockers: 3 })}`],
          }),
        );

        const result = useBeforeAll(async () =>
          runSkill({
            args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
            cwd: repo.dir,
            binFirst: fake.bin,
          }),
        );

        then('⭐ it passes at exit 0 — the echoed dir never speaks', () => {
          expect(result.exitCode).toBe(0);
          expect(result.stdout).toContain('✅ fake/one — clean (0 nitpick(s))');
          expect(result.stdout).not.toContain('🚨');
        });

        then(
          'the stdout of the stale-blocker echo matches its snapshot',
          () => {
            expect(result.exitCode).toBe(0);
            expect(asStdoutStable(result.stdout)).toMatchSnapshot();
          },
        );
      },
    );

    when(
      '[t1] the echoed line points at a clean verdict, the real one has 2 blockers',
      () => {
        const fake = useBeforeAll(async () =>
          genRhxThatAnswers({
            dir: repo.dir,
            blockers: 2,
            nitpicks: 0,
            marker: 'two hits',
            stdoutAhead: [`   ├─ logs: ${genStaleVerdict({ blockers: 0 })}`],
          }),
        );

        const result = useBeforeAll(async () =>
          runSkill({
            args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
            cwd: repo.dir,
            binFirst: fake.bin,
          }),
        );

        then(
          '⭐ it blocks at exit 2 — a stale clean never lets a leak through',
          () => {
            expect(result.exitCode).toBe(2);
            expect(result.stdout).toContain(
              '🚨 fake/one — 2 blocker(s), 0 nitpick(s)',
            );
            expect(result.stdout).not.toContain('✅ fake/one — clean');
          },
        );

        then('the stdout of the stale-clean echo matches its snapshot', () => {
          expect(result.exitCode).toBe(2);
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        });
      },
    );
  });
  /**
   * .what = a flag that takes a value, given none, blocks with its name
   *
   * ⚠️ `shift 2` past the last argument dies under `set -e` with empty
   *    stdout and exit 1 — the shape of a malfunction, with no cause.
   */
  given('[case24] a flag that takes a value, given none', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] --diffs is the last argument', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs'], cwd: repo.dir }),
      );

      then('⭐ it blocks at exit 2 and names the flag', () => {
        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain(
          '✋ ConstraintError: --diffs needs a value. run --help for the values it takes',
        );
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] --diffs is followed by another flag', () => {
      const result = useBeforeAll(async () =>
        runSkill({ args: ['--diffs', '--brain', 'fake/one'], cwd: repo.dir }),
      );

      then(
        '⭐ it blocks at exit 2 rather than read the flag as the value',
        () => {
          expect(result.exitCode).toBe(2);
          expect(result.stdout).toContain(
            '✋ ConstraintError: --diffs needs a value. run --help for the values it takes',
          );
        },
      );

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(2);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });
  /**
   * .what = each upstream literal this gate reads, pinned against the
   *         installed rhachet-roles-bhrain
   * .why  = a rename upstream fails the gate closed on every commit in
   *         the org; here it fails one test, before a release ships it
   */
  given('[case25] the reviewer contract of the installed bhrain', () => {
    const repoTop = path.resolve(__dirname, '../../../../..');
    const distOf = (rel: string): string =>
      fs.readFileSync(
        path.join(repoTop, 'node_modules/rhachet-roles-bhrain/dist', rel),
        UTF8,
      );
    const skillText = fs.readFileSync(scriptPath, UTF8);

    when('[t0] the skill constants are read beside the bhrain sources', () => {
      then(
        '⭐ bhrain prints the logs line behind the anchor the skill reads',
        () => {
          expect(skillText).toContain(`ANCHOR_OF_LOGS_LINE='├─ logs: '`);
          expect(
            distOf('domain.operations/review/genReviewOutputStdout.js'),
          ).toContain('├─ logs: ${');
        },
      );

      then('⭐ bhrain names the verdict json as the skill expects', () => {
        expect(skillText).toContain(
          `NAME_OF_VERDICT_JSON='output.response.json'`,
        );
        expect(
          distOf('domain.operations/review/asRunArtifactPath.js'),
        ).toContain(`response: 'output.response.json'`);
      });

      then(
        '⭐ bhrain refuses an empty scope with the words the skill matches',
        () => {
          expect(skillText).toContain(
            `REFUSAL_OF_ZERO_SCOPE='combined scope resolves to zero files'`,
          );
          expect(
            distOf('domain.operations/review/getOneReviewScope.js'),
          ).toContain('combined scope resolves to zero files');
        },
      );

      then(
        '⭐ each artifact the prune keeps is still one bhrain writes',
        () => {
          const names = Object.values(
            // the map is not on the package's exports, so it is read by path
            require(
              path.join(
                repoTop,
                'node_modules/rhachet-roles-bhrain/dist/domain.operations/review/asRunArtifactPath.js',
              ),
            ).NAME_OF_RUN_ARTIFACT,
          );
          const kept = (
            skillText.match(/^ARTIFACTS_OF_FIGURES=\(([^)]*)\)/m)?.[1] ?? ''
          )
            .split(/\s+/)
            .filter((word) => word.length > 0)
            .map((word) => word.replace(/'/g, ''));
          expect(kept.length).toBeGreaterThan(0);
          for (const name of kept) expect(names).toContain(name);
          expect(kept).toContain('metrics.realized.json');
        },
      );

      then('⭐ bhrain still takes the two scope flags the skill passes', () => {
        const help = distOf('contract/cli/review.js');
        expect(skillText).toContain('--polluters keep');
        expect(help).toContain('--polluters <mode>');
        expect(help).toContain('--paths-wout <glob>');
      });

      then(
        '⭐ bhrain refuses an overflow with the words the skill matches',
        () => {
          expect(skillText).toContain(
            `REFUSAL_OF_OVERFLOW='prompt exceeds 75% of context window'`,
          );
          expect(
            distOf('domain.operations/review/ReviewOverflowRefusedError.js'),
          ).toContain(`'prompt exceeds 75% of context window'`);
        },
      );
    });
  });

  /**
   * .what = the commit this wish exists for: a route file whose path
   *         holds a digit, staged alone
   *
   * ⛔ `rhx review` drops route paperwork from scope by default. staged
   *    alone, the scope is empty, the review refuses with no logs line,
   *    and a clean commit blocks as a malfunction. the fake below drops
   *    as `rhx review` does, unless the skill passes `--polluters keep`.
   */
  given(
    '[case26] a route file staged alone, its path digit beside the word blocker',
    () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: {
            '.route/v2026_10_23.pr41-green/blocker/5.briefs.short.md':
              'brief notes',
          },
          stage: ['.route/v2026_10_23.pr41-green/blocker/5.briefs.short.md'],
        }),
      );

      when('[t0] the reviewer finds it clean', () => {
        const fake = useBeforeAll(async () =>
          genRhxThatAnswers({
            dir: repo.dir,
            blockers: 0,
            nitpicks: 0,
            marker: 'no hits',
            emulatePolluterDrop: true,
            stdoutAhead: [
              '   │  .route/v2026_10_23.pr41-green/blocker/5.briefs.short.md',
            ],
          }),
        );

        const result = useBeforeAll(async () =>
          runSkill({
            args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
            cwd: repo.dir,
            binFirst: fake.bin,
          }),
        );

        then(
          '⭐ it passes at exit 0 — the route file is reviewed, not dropped',
          () => {
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain(
              '✅ fake/one — clean (0 nitpick(s))',
            );
          },
        );

        then('the stdout of the route-file commit matches its snapshot', () => {
          expect(result.exitCode).toBe(0);
          expect(asStdoutStable(result.stdout)).toMatchSnapshot();
        });
      });
    },
  );

  /**
   * .what = a refusal no second ask can change is named, asked once,
   *         and answered with the fix that fits it
   */
  given('[case27] a review that refuses an empty scope', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] rhx review refuses with no logs line', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'unused',
          refusal: 'combined scope resolves to zero files',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it blocks at exit 1 and names the dropped scope', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          'cause: rhx review dropped every staged path from its scope',
        );
      });

      then('⭐ it asks once — a second ask returns the same refusal', () => {
        expect(fake.readCalls()).toBe(1);
      });

      then('⭐ its hint fits the cause, not a locked keyrack', () => {
        expect(result.stdout).toContain('a new upstream filter');
        expect(result.stdout).not.toContain('rhx keyrack unlock');
      });

      then('the stdout of the empty-scope refusal matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case28] a review that refuses an overflow', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] rhx review refuses with no logs line', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'unused',
          refusal: 'prompt exceeds 75% of context window',
          refusalBody: [
            '   ├─ 111.4% of 200,000 tokens',
            '   ├─ target mass by directory — 869.1k chars over 25 directories',
            '   │  ├─  41.4%    359.4k chars  1 file    vendor/big.json',
            '   │  ├─  24.0%    208.7k chars  5 files   src/domain.roles/transcriber',
            '   ├─ lever — partition what the rubric grades, cut what it does not',
            "   │  ├─ --partition 'src=src/**'",
          ],
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then(
        '⭐ it blocks at exit 1, asks once, and says to split the commit',
        () => {
          expect(result.exitCode).toBe(1);
          expect(result.stdout).toContain(
            'cause: the staged diff overflows the review brain',
          );
          expect(fake.readCalls()).toBe(1);
          expect(result.stdout).toContain('split them into separate commits');
          expect(result.stdout).not.toContain('rhx keyrack unlock');
        },
      );

      then(
        '⭐ it shows the window share and the heaviest dirs, not the partition lever',
        () => {
          expect(result.stdout).toContain('111.4% of 200,000 tokens');
          expect(result.stdout).toContain('vendor/big.json');
          expect(result.stdout).not.toContain('--partition');
        },
      );

      then('the stdout of the overflow refusal matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });
  /**
   * .what = a verdict json written under a name the gate does not read
   * .why  = an upstream rename and a run that died before it wrote both
   *         leave no `output.response.json`; the log dir listing in the
   *         cause tells the two apart
   */
  given('[case29] a log dir whose verdict json was renamed upstream', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] rhx review writes output.verdict.json', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictName: 'output.verdict.json',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it blocks at exit 1 and names what the log dir holds', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          '(the log dir holds: output.verdict.json)',
        );
      });

      then(
        '⭐ it asks once and names the contract change — a rename recurs',
        () => {
          expect(fake.readCalls()).toBe(1);
          expect(result.stdout).toContain("rhx review's");
          expect(result.stdout).not.toContain('rhx keyrack unlock');
        },
      );

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = a refusal the skill holds no name for
   * .why  = the exit code, not a list of known headlines, marks a refusal.
   *         an unlisted one (a renamed flag, say) is asked once and quoted,
   *         never read as a locked keyrack
   */
  given('[case30] a review that refuses with an unlisted header', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] rhx review exits 2 on an unknown flag', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'unused',
          refusal: 'unknown option --polluters',
        }),
      );

      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it blocks at exit 1, quotes the header, and asks once', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          'cause: rhx review refused: unknown option --polluters',
        );
        expect(fake.readCalls()).toBe(1);
      });

      then(
        '⭐ its hint says the input was refused, not that a key is locked',
        () => {
          expect(result.stdout).toContain('rhx review refused its input');
          // the fitted key hint claims the key is the cause; it stays out.
          // only the conditional first step for an unplaced cause appears
          expect(result.stdout).not.toContain('so unlock prep and retry');
          expect(result.stdout).toContain('if the cause above is unclear');
        },
      );

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = the review log dir, after the verdict is read
   * .why  = the log dir holds the prompt, which holds the staged diff; a
   *         clean read removes it, and a malfunction keeps it for the cause
   */
  given('[case31] the review log dir after the read', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );
    const logRoot = (): string => path.join(repo.dir, '.log/bhrain/review');
    const listLogFiles = (): string[] =>
      fs.existsSync(logRoot())
        ? fs
            .readdirSync(logRoot())
            .flatMap((dir) =>
              fs
                .readdirSync(path.join(logRoot(), dir))
                .map((f) => `${dir}/${f}`),
            )
        : [];
    const listByName = (name: string): string[] =>
      listLogFiles().filter((f) => f.endsWith(`/${name}`));
    // the four content artifacts upstream writes today, plus one it might
    // add later; each must go, since only the figures are kept
    const CONTENT = [
      'input.prompt.md',
      'input.prompt.head.md',
      'output.response.json',
      'output.review.md',
      'input.future.md',
    ];

    when('[t0] the verdict reads clean', () => {
      const fake = useBeforeAll(async () => {
        fs.rmSync(logRoot(), { recursive: true, force: true });
        return genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          withPrompt: true,
        });
      });
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it passes and leaves no copy of the prompt behind', () => {
        expect(result.exitCode).toBe(0);
        for (const name of CONTENT) expect(listByName(name)).toEqual([]);
      });

      then('⭐ it keeps the metrics upstream meters spend from', () => {
        expect(result.exitCode).toBe(0);
        expect(listByName('metrics.realized.json')).toHaveLength(1);
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] the verdict json is absent', () => {
      const fake = useBeforeAll(async () => {
        fs.rmSync(logRoot(), { recursive: true, force: true });
        return genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          verdictJson: null,
          withPrompt: true,
        });
      });
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it keeps each prompt, for the cause', () => {
        expect(result.exitCode).toBe(1);
        expect(listByName('input.prompt.md')).toHaveLength(2);
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when(
      '[t2] the first attempt writes no json and the retry reads clean',
      () => {
        const fake = useBeforeAll(async () => {
          fs.rmSync(logRoot(), { recursive: true, force: true });
          const bin = path.join(repo.dir, '.fakebin.retry');
          fs.mkdirSync(bin, { recursive: true });
          // a fake of the rhx review boundary: see the .note on asFakeReviewBody
          const body = (verdictJson: string | null): string =>
            asFakeReviewBody({
              captureAt: path.join(repo.dir, '.argv.txt'),
              reportBody: 'no hits',
              blockers: 0,
              nitpicks: 0,
              verdictJson,
              withPrompt: true,
            }).join('\n');
          fs.writeFileSync(path.join(bin, 'rhx.first'), body(null));
          fs.writeFileSync(
            path.join(bin, 'rhx.second'),
            body(JSON.stringify({ blockers: [], nitpicks: [] })),
          );
          fs.chmodSync(path.join(bin, 'rhx.first'), '755');
          fs.chmodSync(path.join(bin, 'rhx.second'), '755');
          const countAt = path.join(repo.dir, '.calls.retry');
          fs.rmSync(countAt, { force: true });
          fs.writeFileSync(
            path.join(bin, 'rhx'),
            [
              '#!/usr/bin/env bash',
              `echo x >> ${asShellLiteral(countAt)}`,
              `if [[ "$(wc -l < ${asShellLiteral(countAt)})" -le 1 ]]; then exec ${asShellLiteral(`${bin}/rhx.first`)} "$@"; fi`,
              `exec ${asShellLiteral(`${bin}/rhx.second`)} "$@"`,
            ].join('\n'),
          );
          fs.chmodSync(path.join(bin, 'rhx'), '755');
          return { bin };
        });
        const result = useBeforeAll(async () =>
          runSkill({
            args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
            cwd: repo.dir,
            binFirst: fake.bin,
          }),
        );

        then('⭐ neither attempt leaves a prompt behind', () => {
          expect(result.exitCode).toBe(0);
          expect(listByName('metrics.realized.json')).toHaveLength(2);
          for (const name of CONTENT) expect(listByName(name)).toEqual([]);
        });
      },
    );
  });

  given('[case35] a report a prior block left behind', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: {
          'letter.md': 'Dear reader,',
          '.pii-review.fake-one.md': 'a stale report that quotes a value',
        },
        stage: ['letter.md'],
      }),
    );

    when('[t0] the next scan reads clean', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it passes and removes the stale report', () => {
        expect(result.exitCode).toBe(0);
        expect(
          fs.existsSync(path.join(repo.dir, '.pii-review.fake-one.md')),
        ).toBe(false);
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case36] the skill run from a subdir of the repo', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,', 'sub/notes.md': 'notes' },
        binaries: {
          'scan.pdf': Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff]),
        },
        stage: ['letter.md', 'scan.pdf'],
      }),
    );

    when('[t0] the plan is asked from sub/', () => {
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--mode', 'plan'],
          cwd: path.join(repo.dir, 'sub'),
        }),
      );

      then(
        '⭐ it reads the staged paths from the repo top, binary included',
        () => {
          expect(result.exitCode).toBe(0);
          expect(result.stdout).toContain('files: 2');
          expect(result.stdout).toContain('unread: 1');
          expect(result.stdout).toContain('· scan.pdf');
        },
      );

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case37] a review that crashes with a stack trace', () => {
    const repo = useBeforeAll(async () =>
      genTempRepo({
        files: { 'letter.md': 'Dear reader,' },
        stage: ['letter.md'],
      }),
    );

    when('[t0] rhx review dies before it writes logs', () => {
      // a fake of the rhx review boundary: see the .note on asFakeReviewBody
      const fake = useBeforeAll(async () => {
        const bin = path.join(repo.dir, '.fakebin.crash');
        fs.mkdirSync(bin, { recursive: true });
        fs.writeFileSync(
          path.join(bin, 'rhx'),
          [
            '#!/usr/bin/env bash',
            'echo "Error: Could not resolve authentication method."',
            ...Array.from(
              { length: 14 },
              (_, i) =>
                `echo "    at frame${i} (/node_modules/.pnpm/sdk/index.js:${i}:1)"`,
            ),
            'echo "}"',
            'echo ""',
            'echo "Node.js v24.0.0"',
            'exit 1',
          ].join('\n'),
        );
        fs.chmodSync(path.join(bin, 'rhx'), '755');
        return { bin };
      });
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ the evidence shows the error line, not the stack', () => {
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toContain(
          'Error: Could not resolve authentication method.',
        );
        expect(result.stdout).not.toContain('    at frame');
        expect(result.stdout).not.toContain('Node.js v24');
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(1);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  given('[case32] a staged set that `rhx review` would cut whole', () => {
    when('[t0] only a lockfile is staged', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'pnpm-lock.yaml': 'lockfileVersion: 9.0' },
          stage: ['pnpm-lock.yaml'],
        }),
      );
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          refusal: 'combined scope resolves to zero files',
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it passes, names the cut path, and asks no brain', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('files: 0 — no review needed');
        expect(result.stdout).toContain(
          'skipped: 1 (lockfile 1) — never sent to the brain',
        );
        expect(result.stdout).toContain('· pnpm-lock.yaml');
        expect(fake.readCalls()).toBe(0);
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t1] only a dir symlink is staged', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: { 'real/letter.md': 'Dear reader,' },
          symlinks: { door: 'real' },
          stage: ['door'],
        }),
      );
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
          refusal: 'combined scope resolves to zero files',
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('⭐ it passes and names the dir it cut', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('skipped: 1 (dir 1)');
        expect(result.stdout).toContain('· door');
        expect(fake.readCalls()).toBe(0);
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t2] a lockfile is staged beside a letter', () => {
      const repo = useBeforeAll(async () =>
        genTempRepo({
          files: {
            'pnpm-lock.yaml': 'lockfileVersion: 9.0',
            'letter.md': 'Dear reader,',
          },
          stage: ['pnpm-lock.yaml', 'letter.md'],
        }),
      );
      const fake = useBeforeAll(async () =>
        genRhxThatAnswers({
          dir: repo.dir,
          blockers: 0,
          nitpicks: 0,
          marker: 'no hits',
        }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('it reviews the letter and names the lockfile it cut', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('files: 1');
        expect(result.stdout).toContain('skipped: 1 (lockfile 1)');
        expect(fake.readCalls()).toBe(1);
      });

      then('the stdout matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });

  /**
   * .what = a staged rename whose edit adds new content
   * .why  = `--diff-filter` must carry `R`: under `ACM` git lists a rename
   *         as neither added nor modified, so the moved file drops out of
   *         the file list and its new content is never scanned
   */
  given('[case38] a staged rename whose edit adds a value', () => {
    const repo = useBeforeAll(async () => {
      const made = genTempRepo({
        files: { 'staged.md': 'line of plain prose\n'.repeat(20) },
        stage: ['staged.md'],
      });
      // a fixture step that git refused fails here, named
      const git = (args: string[]): string => {
        const res = spawnSync('git', args, { cwd: made.dir, encoding: UTF8 });
        if (res.status !== 0)
          throw new UnexpectedCodePathError(
            `git ${args[0]} failed in the fixture`,
            {
              args,
              status: res.status,
              stderr: res.stderr,
            },
          );
        return res.stdout;
      };
      git([
        '-c',
        'core.hooksPath=/dev/null',
        'commit',
        '--quiet',
        '-m',
        'seed',
      ]);
      git(['mv', 'staged.md', 'moved.md']);
      fs.appendFileSync(
        path.join(made.dir, 'moved.md'),
        '\nnew notes, added in the move\n',
      );
      git(['add', 'moved.md']);
      return { ...made, status: git(['diff', '--cached', '--name-status']) };
    });

    when('[t0] reviewed', () => {
      const fake = useBeforeAll(async () =>
        genRhxThatCapturesTheArgv({ dir: repo.dir }),
      );
      const result = useBeforeAll(async () =>
        runSkill({
          args: ['--diffs', 'since-staged', '--brain', 'fake/one'],
          cwd: repo.dir,
          binFirst: fake.bin,
        }),
      );

      then('the fixture is a rename, as git reports it', () => {
        expect(repo.status).toMatch(/^R\d+\tstaged\.md\tmoved\.md/m);
      });

      then('⭐ the renamed file is in scope, so the brain is asked', () => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('files: 1');
        expect(fake.readArgv()).toContain('--diffs');
      });

      then('the output a caller reads matches its snapshot', () => {
        expect(result.exitCode).toBe(0);
        expect(asStdoutStable(result.stdout)).toMatchSnapshot();
      });
    });
  });
});
