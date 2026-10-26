# rule.require.run-every-credential-free-gate

## .what

after any edit, run **every gate the edit could break** — not only the ones you
remembered. when one gate refuses for an environmental reason, **that refusal is
scoped to that gate**. it does not excuse the gates that need no key.

```
rhx git.repo.test --what types
rhx git.repo.test --what format
rhx git.repo.test --what lint
```

three commands, ~25 seconds, **zero credentials**. run all three.

## .why

a credential blocker reads as a *stop*, and "the suite is blocked, I'll come
back to it" quietly generalizes one gate's refusal to all of them. the
generalization is invisible: a blocked gate and a skipped gate both produce no
signal.

| gate | needs a credential? | seconds |
|------|--------------------|--------:|
| `--what types` | ⛔ no | ~17 |
| `--what format` | ⛔ no | ~2 |
| `--what lint` | ⛔ no | ~13 |
| `--what unit` | ⛔ no | ~3 ⚠️ **needs `--thorough`** |
| `--what integration` | ✅ **yes**, per role | varies |
| `--what acceptance` | ✅ **yes** | varies |

only the last two can be blocked by an absent key.

> **a blocker on ONE gate is not a blocker on ALL gates.** measured: with
> `integration` credential-blocked, `types`, `lint`, and `format` all went
> unrun across a campaign — lint and format were then red, 10 defects each, over
> the same 10 `.integration.test.ts` files. pure line-wrap, harmless one at a
> time, accumulated because no one read the gate.

## ⚠️ `--what unit` can run, exit 0, and execute zero tests

```
🐚 git.repo.test --what unit --mode apply
   ├─ status: skipped
   ├─ files: 0 (no test files changed since origin/main)
   └─ tests: 0 (no tests to run)
```

the default is `jest --changedSince origin/main`. this repo has exactly **one**
true unit test file (`asStatusEmoji.test.ts`); every other `*.test.ts` is an
`.integration.test.ts`, so the default reports `0` for nearly any branch. the
output says `skipped`; the trap is a reader who checks only the **exit code**.
measured: `--thorough` then ran `16 passed, 0 failed` in 3s.

> ⛔ **`skipped` is not `passed`.** after any broad edit, run
> `--what unit --mode apply --thorough`.

## ⚠️ format and lint can run and examine zero FILES

two independent ways to examine zero:

```
  invocation  ->  --what unit's `--changedSince origin/main`   ->  files: 0
  config      ->  biome.jsonc's `includes`                     ->  Checked 0 files
```

measured:

```
🐚 npm run test:format:biome -- .husky
   > biome format -- .husky
   Checked 0 files in 5ms. No fixes applied.

   × No files were processed in the specified paths.
   i These paths were provided but ignored:
   - .husky
```

biome names the declined path, but on stderr under a non-zero exit that reads as
an ordinary tool failure — and a whole-repo run prints no such line.

### the cause: two positive patterns, one negative

```jsonc
"includes": [
  "**/src/**/*.ts",        // ← positive
  "**/provision/**/*.ts",  // ← positive
  "!**/dist",
  … "!**/.test*"           // ← removes src/.test/** back out
]
```

| population | why | tracked files |
|---|---:|---|
| matches **no positive** — `.husky/**`, root `jest.*.ts` | outside `src/` and `provision/` | **9** |
| matches a positive, removed by `!**/.test*` | `src/.test/**` | **4** |

```
.husky/check.pii.guarantee.integration.test.ts   ⛔ guards the PII gate
.husky/check.pii.integration.test.ts             ⛔ guards the PII gate
jest.acceptance.config.ts   jest.acceptance.env.ts
jest.config.ts
jest.integration.config.ts  jest.integration.env.ts
jest.unit.config.ts         jest.unit.env.ts
src/.test/constants.ts               src/.test/genContextLogTrail.ts
src/.test/genContextStitchTrail.ts   src/.test/getContextOpenAI.ts
```

⚠️ **an enumerator is a claim**: `git ls-files -- '*.ts' ':!:src/**'
':!:provision/**'` silently excluded none of `src/`; `':(exclude)src'` is the
form that works.

### the exposure is BOUNDED — read the whole gate map

| gate | covers `.husky/*.ts`? | evidence | grade |
|------|---|---|---|
| `--what types` | ✅ yes | `tsconfig.include: ["**/*.ts"]`, and none of its 3 excludes matches | 🚩 **read from config** |
| `--what integration` | ✅ yes | `--scope 'path://.husky'` → **`matched: 2 files`**, both named | ✅ **measured** |
| `--what format` | ⛔ **no** | `Checked 0 files`, `.husky` named as ignored | ✅ **measured** |
| `--what lint` | ⛔ **no** | same `includes` as format | 🚩 **read from config** |

the two 🚩 rows are reads, not runs (`npx tsc --listFilesOnly` is outside the
approved command set) — do not promote them to ✅ without a run. what goes
unguarded is **format and lint drift only** — but on the two `.husky` files that
clamp the **PII pre-commit gate**, a security guarantee.

## ⛔ do NOT fix this by an edit to `biome.jsonc`

1. `biome.jsonc` is **declapract-managed**; the installed copy is byte-identical
   to the template at `declapract-typescript-ehmpathy@0.47.35`
2. upstream has not widened it either: the published tag **v0.49.11** carries the
   same two positive patterns, plus one added negative, `!**/.agent/.cache`
   (checked against the **published tag** via `gh api`, per
   `rule.require.verify-upstream-before-you-author`)

a local widen is churn the next declapract upgrade reverts. if the scope should
widen, that is an upstream PR against `ehmpathy/declapract-typescript-ehmpathy`.

## ⚠️ `--what lint` and `--what format` OVERLAP — read the diagnostics, not the count

| gate | runs | reports |
|------|------|---------|
| `--what format` | `biome format` | formatting only |
| `--what lint` | `biome check --diagnostic-level=error` | formatting **and** lint |

every format error is also a lint error, so two gates at `10` may be 10 problems
or 20. the diagnostic label tells you which:

```sh
rg '^src/.*\.ts \w+ ━' <the lint stderr log>
```

each line ends in the rule family that fired; all ten read `format` → one set.

## ⛔ `fix:format` is NOT format-only

```json
"fix:format:biome": "biome check --write",
"fix:format":       "npm run fix:format:biome",
"fix:lint":         "biome check --write",
"fix":              "npm run fix:format && npm run fix:lint"
```

`fix:format` and `fix:lint` are byte-identical, and `biome check --write`
applies **lint** fixes too. the genuinely narrow tool is `biome format --write`,
which no npm command exposes.

## ⭐ how to verify an autofix touched no semantics

**count the assertions before and after.** re-wrap cannot change the count; a
lint autofix can.

```sh
rg -c 'expect\(|toContain\(|toMatch\(|toBe\(' src/domain.roles \
   --glob '**/*.integration.test.ts'
```

measured: `2240` before, `2240` after, every per-file count identical. do not
rest on biome's "safe fix" tier — that is biome's judgment about its rules, not
about your clamps, whose teeth live in exact assertion text.

## .the rule

| you did | you must run |
|---------|--------------|
| edited a `.ts` under `src/` or `provision/` | `types` · `format` · `lint` |
| edited a `.ts` **elsewhere** — `.husky/`, root `jest.*`, `src/.test/` | `types` (⛔ format + lint see **zero** of these — see above) |
| edited any `.sh` | ⛔ **the skill's own test.** format + lint see no `.sh` at all (measured: `biome format` over a dir with two `.sh` and one `.ts` reports `Checked 1 file`) |
| hit a credential blocker on `integration` | ⛔ **the other gates anyway** |
| ran an autofix over test files | the assertion count, before and after |

## .enforcement

- a `.ts` edit landed with no `--what types` run = **blocker**
- a `--what integration` blocker cited as a reason to skip `types`, `format`, or
  `lint` = **blocker** (those gates need no credential)
- two gates reporting the same defect count, treated as two problems or as one,
  without a read of the diagnostic labels = **blocker**
- `npm run fix` run over test files with no before/after assertion count =
  **blocker** (it is `biome check --write`, which applies lint fixes)
- a **`Checked 0 files`** result read as a pass = **blocker** (it is the config
  twin of `files: 0` — the gate ran and examined none of your edit)
- a **widened `biome.jsonc`** landed locally = **blocker** (declapract-managed,
  and upstream at v0.49.11 has deliberately not widened it — that is an upstream
  PR, not a local edit)
- a file count published from a `git ls-files` pathspec that was never spot-
  checked = **blocker** (`':!:src/**'` silently excludes none of `src/`;
  `':(exclude)src'` is the form that works)
- `fix:format` described as format-only = **nitpick** (it is `biome check`)

## .see also

- `rule.require.snap-review-on-skill-change` — the sibling: what a *disabled*
  guard writes instead of a failure. this rule is about a guard that was never
  asked
- `rule.require.assertions-that-discriminate` — why an autofix over a clamp file
  is a semantic risk and not a cosmetic one
- `rule.prefer.internal-briefs-location` — why this brief is repo-local
