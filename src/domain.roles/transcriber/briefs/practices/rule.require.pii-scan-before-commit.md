# rule.require.pii-scan-before-commit

## .what

no commit may capture PII. run `pii.scan` **before** the commit object exists — from the pre-commit hook and from any agent commit path — and treat the CI check as an incident detector, never as the guard.

the repo-scale sibling of `rule.forbid.hand-transcription` and `rule.require.deterministic-redaction`: those govern one document; this governs the whole tree.

## .why the gate must fire BEFORE the commit

a commit is the irreversible boundary, and the cost of a leak steps across it:

| when it is caught | the fix |
|-------------------|---------|
| in the work tree | edit a file |
| in a local commit | rewrite one commit |
| after a push | **there is no fix.** see below |
| after a clone or a fork | the value is gone; assume it is public forever |

## ⛔ CI is an INCIDENT DETECTOR, not a backstop

*"rewrite history, force-push"* does not work. once a commit reaches a GitHub PR, the value sits where a force-push cannot reach:

| copy | can you retract it? |
|------|--------------------|
| `refs/pull/N/head` | ❌ the SHA stays reachable after a force-push; only GitHub Support can purge it |
| **watcher email**, with the diff inline | ❌ already delivered, to inboxes you do not control |
| CI logs, caches, artifacts | ❌ retained on their own schedule |
| forks and clones | ❌ |

the only remedy after a push is to **rotate the identifier** — and the values that matter most cannot be rotated. an SSN is issued once; a date of birth is a fact; a home address changes only if the person moves.

> a CI check that fails on a PR does not tell you to start the repair. it tells
> you to start the notice.

keep the CI check — but it is not a second layer of prevention.

## .the layers

every layer that prevents must fire **before** the push; each after it only detects:

| layer | fires | catches | prevents? |
|-------|-------|---------|-----------|
| `pii.scan` | on demand | the atom the rest call | — |
| `pii.review` | on demand | what has no fixed shape | — |
| husky `pre-commit` | before the commit object | a human who types `git commit` | ✅ |
| the agent commit path | before the commit object | every agent commit | ✅ |
| **`pre-push`** | before it leaves the machine | a `--no-verify` commit, a value that predates the gate, a rebase that reintroduced one | ✅ |
| CI, against the branch diff | on the PR | whatever bypassed all of the above | ❌ **detector only** |

### ⚠️ `pre-push` is OPTIONAL, and the trade is real

`--no-verify` is **per-boundary**, so `pre-push` still meets a forced commit before it leaves the machine. but it guards only against a *deliberate* bypass, and charges on **every** push:

| what pre-push adds | what it costs |
|--------------------|---------------|
| catches a `--no-verify` commit while still local | a full re-scan on every push of a branch **already scanned at each commit that built it** |
| catches a value that predates the gate | a brain-layer round trip, or an offline push that blocks |

CI also catches the deliberate bypass while the branch is still rewritable. **this repo runs commit-only, on purpose** — recorded so the next reader does not "fix" it. adopt pre-push when the gate must survive an *untrusted* committer; skip it when the gate exists to stop an accident.

## 🚩 a gate must not sit behind a guard that opts itself out

`.husky/pre-commit` opens with a husky-availability check: if `_/husky.sh` is absent it prints a skip notice and exits 0. correct for a lint or format hook, which cannot run without `node_modules`; wrong for the PII gate below it. `_/husky.sh` is absent on exactly one machine — a fresh clone that never ran `npm install`, where someone is **least oriented** — and every test ran where husky was installed.

the fix is placement:

```sh
# the PII gate runs FIRST, and OUTSIDE the guard
. "$(dirname -- "$0")/check.pii.sh"

if [ ! -f "$(dirname -- "$0")/_/husky.sh" ]; then
  echo "🟡 husky not available, the rest of the chain is skipped"
  exit 0
fi
```

that placement is legitimate only because the gate needs **sh, bash, and git** — no husky, no `node_modules`, no build. defend that constraint: the moment the gate needs a build, it can no longer sit above the guard.

> a gate whose availability check can disable it is not a gate. it is a
> preference.

## ✅ state the guarantee HONESTLY, and clamp every row

no hook survives a human who passes `--no-verify`, and to claim otherwise would be a failhide. the guarantee is:

> **no ACCIDENTAL commit, on every default path, with the bypass deliberate and
> loud, and CI red at the PR while the branch is still rewritable.**

test it on the **artifact**, never on an exit code — an exit code is a claim about a shell; the guarantee is a claim about git's object store.

| the path | commit object? |
|----------|:---:|
| PII staged, husky installed | ❌ blocked |
| PII staged, **husky runtime absent** | ❌ blocked |
| clean staged set, husky runtime absent | ✅ commits |
| clean staged set, husky installed | ✅ commits |
| PII, `--no-verify` | ✅ commits — **the documented limit** |

the last row is asserted, not omitted: an undocumented limit is one people discover by accident.

```ts
// the assertion that carries the weight. a non-zero exit could come from
// any hook in the chain, or from a shell error; only the object count says
// whether the value actually crossed the boundary.
expect(countCommitsPastSeed({ work })).toBe(0);
```

- ⚠️ the fresh-clone row needs a **guard on its own fixture** — assert `_/husky.sh` really is absent, or the case passes for the wrong reason
- dogfood it (`rule.require.clamp-edge-cases`): move the gate back below the guard, watch those rows go red, restore

## .two kinds of check, and the sequence that makes the pair safe

a regex answers *does this text match this shape?* — and structurally cannot answer:

1. **is this value real, or synthetic?** `666-12-3456` and a live SSN have the same shape. only a reader can tell them apart.
2. **do these harmless facts, together, name one person?** `{ZIP, gender, DOB}` is reported to uniquely identify a large majority of the US population, and not one of the three is PII on its own.

so the gate runs a deterministic pass, then a probabilistic one. a non-deterministic verdict on a blocking gate is normally a defect; the sequence makes it safe:

> **`pii.scan` runs FIRST and its exit 2 is final. `pii.review` runs only on a
> set already called clean, so it can only ADD a block, never subtract one.**

a brain that wrongly says "clean" is just the prior baseline; a brain that says "leak" is pure upside. reverse the order — let a reviewer overrule a deterministic hit — and you have built a failhide at the worst possible spot.

- **several brains, in parallel, unioned.** they miss differently; any blocker from any reviewer blocks. not a majority vote: a false negative is permanent, a false positive costs thirty seconds
- **an unreachable brain is a MALFUNCTION, not a pass.** a locked keyrack must never silently downgrade the gate to one layer. the cost — no offline commits — is the correct trade at a boundary with no remedy

### the closed-world half

for the values that matter most, do not ask a brain. *"is there a person's name here?"* needs judgment; *"is THIS person's name here?"* is a literal match. `pii.scan --roster` reads the `doc.pseudonymize` map's left column, so every name, address, and derived value in the map is caught exactly, offline, with no new regex — and every future map entry joins the gate for free.

⛔ the roster is the re-identification key. it is gitignored, and the scan refuses to run against one that git tracks.

## ⚠️ the BARE form is the one that hides

IRS Form SS-4 field 7b stores the responsible party's SSN **with no dashes**. a `[0-9]{3}-[0-9]{2}-[0-9]{4}` pattern misses a bare nine-digit run, reports a clean scan, and the clean scan is believed. so every numeric detector must match the formatted **and** the bare form.

the cleanup repeated the lesson: a find-and-replace for the dashed form left the **space-separated** form untouched.

> verify with a **different matcher** than the one you edited with. a sweep
> that reuses its own pattern always reports success.

## ⚠️ a separator in the wrong PLACE is a different number

an optional dash is not the fix: `[0-9]{3}-?[0-9]{2}-?[0-9]{4}` also matches a ZIP+4, and every address becomes a hit. **false positives are how a scanner dies** — a report that flags an agency's published phone number on every run trains its readers to skip it. a detector matches either the properly-formatted shape or the bare run — never a half-separated one.

## ⚠️ test the gate through the REAL invocation path

a hook test that calls the hook directly tests its contents under *your* shell, not the hook.

- measured: `check.pii.sh` located its scanner with `${BASH_SOURCE[0]}`. six tests invoked it as `bash check.pii.sh` and passed. but `pre-commit` is `#!/bin/sh`, `/bin/sh` was **dash**, and husky re-execs the chain under `sh -e` — where `${BASH_SOURCE[0]}` is a **`Bad substitution`**, the path came out empty, and the hook reported *"the scanner was not found."* the gate **blocked every commit**, **never scanned once**, and was **100% green** in its own suite
- a gate that blocks clean commits is disabled within a day, so the safe direction is not safe for long
- a second defect hid behind it: under `sh -e`, a **bare** failed command aborts the shell before the verdict prints. it needed `bash "$SCANNER" --staged || status=$?` to survive errexit

so the clamp drives the real entry point:

```ts
// core.hooksPath aims at the REAL .husky, so this exercises the production
// hook files and the production shell, against a throwaway index
spawnSync('git', ['-c', `core.hooksPath=${huskyDir}`, 'commit', '-m', 'test'],
  { cwd: tempRepo });
```

and asserts **both** directions — a dirty commit blocked *and a clean commit allowed*. the dash defect was invisible to the dirty case alone.

> assert the **verdict**, not merely a non-zero exit. a chain that aborts for
> its own reason — a shell error, an absent binary — is indistinguishable from a
> gate that works, if all you check is the exit code.

## ⚠️ a brain reviewer is SANDBOXED — hand it no path it cannot reach

the second layer enrolls a clone confined to its **cwd**. on a path outside that boundary it does not error — it **stops to ask permission** mid-answer, before the final count lines. the verdict parses as unreadable, which this gate correctly scores a **MALFUNCTION and blocks on** — so a clean tree becomes a blocked commit for a reason the human cannot act on.

measured, from both sides of the boundary:

| what sat outside the sandbox | what the reviewer said | cost |
|------------------------------|------------------------|------|
| the **report path** — a `mktemp -d` scratch dir | *"can you grant access to write to `/tmp/tmp.…`"* | the clean control went red |
| the **rubric path** — an absolute path under the installed role | *"May I use tools to read the rubric… or paste the rubric content here?"* | the clean control went red again |

the fix is not a wider sandbox:

- **the reviewer writes no files.** its stdout IS the report — the skill already captures it
- **the rubric is inlined into the prompt**, read from disk each run. it cannot fail to arrive, and it still tracks the file

⚠️ **only the clean control caught the absent rubric.** a diff with an obvious name and street address lets a reviewer reach a verdict *without the rules*, so the dirty case passed throughout — one marginal diff from a grade against no rubric at all.

### ⛔ forbid the WRITE, never the tools

a reviewer told to use no tools refuses the job outright, correctly — a review of a diff it may not read is not a review.

> the line is **write**, not **tools**. it must still read the diff and the
> files in scope.

## .the allowlist is by VALUE, never by file

a file-scoped mute blinds that file forever, including against the next value pasted into it. a value-scoped entry costs one deliberate, reviewable line per number. every entry needs a stated reason; an entry with no reason is indistinguishable from a leak someone silenced.

```
# SSA has never issued a 666 prefix — permanently synthetic
666-12-3456
```

⚠️ **synthetic fixtures only.** a real identifier must never be a test fixture — the incident behind this rule was a hardcoded test value, unnoticed because tests are read for logic, not content.

## .the report must not become the leak

`pii.scan` prints a masked form (`123-**-****`), never the matched value. a scanner that echoes what it finds turns every CI log, scrollback, and pasted bug report into a second copy. consequence: you cannot allowlist from the report alone — open the file at the line. that friction is intended.

## .scratch and handoff files are in scope

a note that *describes* a PII incident *carries* the values it is about. session handoffs, notes in flight, and raw source pulls are among the most concentrated PII in a repo, and easy to forget because they feel like ephemera. keep them in an ignored directory: an untracked file is one `git add -A` from a commit; an ignored one is not.

## .enforcement

- a commit that captures PII = **blocker**
- a numeric detector that matches only the formatted form = **blocker**
- a real identifier used as a test fixture = **blocker**
- a scanner that prints the full matched value = **blocker**
- an allowlist entry with no stated reason = **blocker**
- a commit gate verified only by direct invocation, never through a real
  `git commit` = **blocker**
- a gate test that asserts a non-zero exit rather than the verdict = **blocker**
- a gate test that asserts a verdict but never the **artifact** — that no commit
  object exists = **blocker**
- a PII gate placed below an availability check that can disable it = **blocker**
- a PII gate that needs a build, `node_modules`, or a linked registry to run =
  **blocker** (it can no longer sit above the guard)
- a guarantee stated without its bypass rows asserted = **blocker**
- a brain reviewer handed a path outside its sandbox — to read OR to write =
  **blocker** (it stops to ask, and a clean tree is scored a malfunction)
- a brain-layer suite with no CLEAN control = **blocker** (the dirty case passes
  on an obvious fixture even when the rubric never arrived)
- a brain-layer suite that proves the reviewer RAN but never that it
  **discriminates** — the same set called clean by the regex and blocked by the
  brain = **blocker** (a reviewer wired to a constant satisfies every other row)
- a `pre-push` gate added or dropped with no recorded reason = **nitpick**
- a file-scoped mute where a value-scoped entry would serve = **nitpick**

## .see also

- `pii.scan` — the skill
- `rule.require.accrue-pii-detectors` — how the gate learns a new class
- `rule.require.deterministic-redaction` — how to redact a document once found
- `rule.forbid.hand-transcription` — why the scan must be deterministic
- `rule.forbid.auth-escalation-disclosures` — what a clean scan still ships: dates, balances, and call recaps that pass a support agent's verification
- `rule.forbid.financial-position-disclosures` — what a clean scan also ships: profit, loss, spend, and the originator's return status
- `howto.redteam-before-publish` + `rhx publish.redteam` — the per-release red team: index vs worktree, history, dist, transform, oracles, and the blind-review prompt
