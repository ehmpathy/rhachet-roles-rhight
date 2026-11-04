# rule.require.audit-guards-by-input-type

## .what

when you audit a guard — a gate, a validator, a scanner, a lint — enumerate the
**input types it can receive**, not only the outcomes it can produce.

a test matrix built from outcomes ("blocked · allowed · malfunctioned") can be
exhaustive and still leave a whole class of input unexamined, because every case
in it was drawn from one unstated mental model of what the input looks like.

## .why

outcomes are what the guard *emits*, so they are easy to name — and outcome
coverage feels like completeness. but a guard fails in one of two ways:

| failure | visible in an outcome matrix? |
|---|---|
| it produced the **wrong verdict** on an input it examined | ✅ yes |
| it **never examined** the input at all | ⛔ **no** |

the second prints the same green as a pass. only a walk of the input space finds
it.

## .how — the audit

write down the guard's input space *before* you read its tests. then check each
axis against the cases that exist.

⚠️ walk each axis in **both directions**: *"is there an input the guard would
wave through?"* and *"is there one it would wrongly REFUSE?"* a guard that blocks
valid work gets disabled — which costs the whole guarantee, not one case.

| axis | ask |
|---|---|
| **encode** | text · binary · mixed · empty · huge |
| **shape** | one file · a directory · a symlink · a rename · a deletion |
| **origin** | tracked · untracked · staged · ignored · generated |
| **path** | in-repo · a neighbor of an ignored dir · a dotfile · a nested dot-dir |
| **absence** | the input is absent · unreadable · zero-length |
| **letter-case** | UPPER · lower · Title · mIxEd — **for every literal-match half**, and separately for the MUTE that clears it |
| **invocation** | the flags the guard runs with — see below |
| **output** | caps, truncations, summaries, masks — where an examined input becomes an unread one |

⚠️ the letter-case row looks cosmetic and is not: a literal matcher and its
allowlist are two independent decisions about case, and the failure is silent in
**both** directions. run the row against the matcher and the mute **separately**.

a gap on any axis is a candidate `[caseN]`. a guard that *deliberately* excludes
an axis must **say so in a case**, not in a comment.

## .the rule

| you are... | you must |
|---|---|
| about to add a case to a guard's test | state which **input-type** axis it covers |
| about to claim a guard's limits are documented | show a case per excluded axis, not a comment |
| face to face with an unexamined input class | add the case **first**, watch it go red, then fix |

## ⚠️ a comment is not a documented limit

a limit asserted by an **executable case** (e.g. a case that asserts
`--no-verify` does commit) cannot rot — if the behavior changes, the case fails.
a limit recorded only in prose drifts silently the moment the code moves.

> if a limit is real, it is testable. if it is testable and untested, it is not
> documented — it is merely mentioned.

## 🚩 the measured cases

### encode — a binary the scanner never opened

`check.pii.guarantee.integration.test.ts` measured the guarantee in **commit
objects**, not exit codes, and documented its own limit as a case. its inline
claim — *"no ACCIDENTAL commit, on every default path"* — was false: a staged
PNG that held a real EIN and officer name would have committed on the default
path, because the scanner skips every binary in silence. all five cases wrote a
`.md` file.

| layer | input types covered |
|---|---|
| the pre-commit hook | text only |
| the hook's own test | text only |
| the guarantee test (5 cases) | text only |
| the CI backstop | text only |

⇒ **four layers, one shared assumption — the signature of an input-type gap: it
does not look like a bug in any one file.**

the fix: `[case6]` stages a binary and asserts it **commits** (the current
behavior, so the boundary is checkable); the `[case5]` comment now reads *"no
accidental commit **OF A TEXT FILE**"*; the scanner prints `binary N` as **NOT
scanned**; the `--via brain` prompt enumerates binary paths to the reviewer.
⚠️ the prompt makes examination *likely*; the case makes the boundary
*checkable*. bank the second.

### encode, per page — a count that cannot see content

`doc.sign` rasterizes the signed page and carries the others through. its guard:

```sh
OUT_PAGES="$(pdfinfo "$INTO" | awk '/^Pages:/ { print $2 }')"
if [[ "$OUT_PAGES" != "$PAGES" ]]; then
```

**3 in, 3 out stays green on a document whose every other page went blank** — a
raster page is still a page. meanwhile stdout printed *"every other page kept its
text layer"* beside a `(verified)` label on the one page it did check.

| what shipped | which axis it covers |
|---|---|
| a per-page input-vs-output text comparison | **encode**, per page |
| `[case5]` — a PATH-shimmed `gs` that rasters only the last slice | encode, with **every count intact** |
| `[case6]` — a **scanned** input, no text layer anywhere | encode: the *absence* axis |
| the warranty line now prints a counted figure, or the run refuses | — |

⭐ `[case6]` is the let-through. the natural fix — a **presence** test, *"does
each other page yield text?"* — passes every other case and **refuses every
scanned document**. only the let-through case distinguishes the right guard from
the plausible one. (proven: swap in the presence test → `[case6]` red,
`[case5]` green.)

### output — the guard EXAMINED the file, and the REPORT hid it

```
├─ hits: 105 across 9 file(s)
│  … 5 files rendered …
├─ … 45 more hit(s) not shown
│  └─ narrow the scope with --paths-with to see them
```

the one real survivor was among the 45; a sweep recorded the scope clean from the
rendered rows. `pii.scan.via.regex.sh` sets `MAX_REPORT_LINES=60` and emits

```sh
sort -t"$(printf '\t')" -k1,1 -k2,2n "$hits"      # ← PATH order, then line
…
if [[ "$shown" -ge "$MAX_REPORT_LINES" ]]; then break; fi
```

— a **path-ordered prefix**. benign collisions in `briefs/` spent the budget; the
real hit in `skills/…/.demo/…` sorted last.

> **false positives are a concealment mechanism.** a scope with hundreds of
> benign hits is a scope where a real hit is *least* likely to be printed.

the cap's own comment — *"the counts above already carry the verdict"* — is true
of the **verdict** and false of the **triage**, and triage is the job of a sweep.

⚠️ the plausible fix — sort shape-based detectors first — fails here: the buried
hit was itself a **`roster`** detector row, the same class as the collisions.

⇒ the fix is a **floor, not an order**:

| what shipped | what it does |
|---|---|
| the **floor** | every file with a hit gets ≥1 row; the rest of the budget is spent in path order on the extra rows. a file can lose its detail; a file can never lose its presence |
| the **tally** | `hits: 71 across 2 file(s) (ssn 71)` — the one line that describes every hit, rendered or not |
| the notice | now reads *"every file with a hit has a row above — no file is hidden"* |
| `[case16]` | the noise and the buried hit share **one detector**, so a detector re-sort leaves the case red. the wrong fix is ruled out by the fixture, not by a comment |
| `[case17]` | the **let-through**: a small scope must still render every row, print no notice, and carry the tally |

each clamp was proven to bite **alone**. the clamp asserts the **row**, not the
notice sentence: a revert of the loop alone leaves *"no file is hidden"* printed
over a report that hides files. a report's claim about itself is the weakest
evidence there is.

### letter-case — the guard REFUSED a value a human had cleared

`pii.scan`'s roster half matches case-**in**sensitively on purpose:

> ⚠️ matched case-INSENSITIVELY on purpose. the same corpus prints a name in
> three casings, and a case-sensitive sweep reports clean on the two it did not
> think of.

the mute beside it is an exact `awk` subscript:

```awk
if (val in allowed) next        # ⛔ case-SENSITIVE
```

so an allowlist line clears one letter-case and leaves every other form blocked.

| | the matcher | the mute | agree? |
|---|---|---|---|
| roster half | `grep -noFif` — case-**in**sensitive | awk subscript — case-**sensitive** | ⛔ **no** |
| regex detectors | `grep -noE`, no `-i` — case-sensitive | awk subscript — case-sensitive | ✅ yes |

⇒ the cure is not "case-insensitive everywhere" — the second row is correct.

> **a mute must agree with ITS OWN matcher.**

the two instruments sit in different functions and read different config files
(`.pii-map` for the match, `.pii-allow` for the mute); no rule forces them to
share semantics. widening the roster mute cannot over-clear, since its matcher
already cannot tell two case-variants apart.

⚠️ **a let-through assertion of absence needs a positive control.** `[case18][t1]`
asserts exit 0; a matcher that never saw the second form satisfies that equally.
`[t0]` runs the same fixture with **no allowlist** and pins
`hits: 2 across 1 file(s) (roster 2)`. clamped by `[case18]` of
`src/domain.roles/transcriber/skills/pii.scan/pii.scan.via.regex.integration.test.ts`.

⚠️ check a precedent against its values before you cite it: an allowlist pair
commented *"two casings"* differed by **abbreviation** too (`North` → `N`), so it
was not evidence of this defect.

## ⚠️ the guard's own INVOCATION is an input axis too

an opt-in flag is a hazard because its absence is invisible in the output:

```sh
rhx pii.scan --paths-with 'src/domain.roles/registrator/**' --via regex
#   └─ 🦅 clear skies · files: 58 · hits: 0

rhx pii.scan --paths-with '…' --via regex --roster .pii-map
#   └─ ✋ blocked   · files: 58 · hits: 105 across 9 file(s)
```

`validate()` in `pii.scan.via.regex.sh` closes with
`[[ -z "$ROSTER_FILE" ]] && return 0`, so with no `--roster` the whole
closed-world half is skipped — with the **same glyph, file count, and `hits: 0`**
a clean scan prints. nine scopes were recorded ✅ that way.

> **audit a guard the way the ENFORCING path invokes it — never the way its
> `--help` example does.** `pii.scan --help` leads with `--diffs since-staged`
> and no roster; the `ROSTER_ARG` block in `check.pii.sh` passes it.

- diff your hand-run command against the hook, the CI job, or whatever enforces
  it, before you trust it
- when a number moves the way you hoped, read the mechanism before you record it
- where a flag toggles a whole mechanism, the guard should **name the mechanisms
  it ran** in its report

this is `rule.forbid.failhide` one level up: *half the guard never ran and said
clean*.

## .enforcement

- a guard test whose cases all share one input encode, with no stated reason = **blocker**
- a guard with no case for an input it must **let through** = **blocker**
  (a guard that refuses valid work gets disabled, which costs the whole guarantee)
- a "documented limits" section whose limits are prose rather than cases = **blocker**
- an unexamined input class repaired with no clamp case = **blocker**
  (`rule.require.clamp-edge-cases`)
- an input-type axis excluded on purpose with no note of why = **nitpick**
- a hand-run audit whose flags differ from the enforcing path's, reported as
  coverage = **blocker**
- a scope recorded as **triaged** from a report that printed a truncation
  notice = **blocker**
  (the notice names the remedy — `narrow the scope` — and an unheeded remedy is
  an unread report, not a clean one)
- a guard whose detail is capped, where the cap can hide **every** row for a
  file the header counted = **blocker**
  (a floor of one row per file is cheap and makes a file un-hideable)
- a guard whose report cannot distinguish "every mechanism ran and found none"
  from "one mechanism was disabled" = **nitpick**
- a **mute** whose case semantics differ from the **matcher** it clears =
  **blocker** (in either direction — the mute must agree with its own matcher,
  never with the other half of the same guard)
- a let-through case whose assertion is an **absence**, with no positive control
  proving the guard was pointed at the input = **blocker**

## .see also

- `rule.require.clamp-edge-cases` (mechanic) — once you have the class, the
  repair and its proof are one artifact. this rule is how you get the class
- `rule.forbid.failhide` (mechanic) — the failure mode an outcome matrix cannot
  see: never examined, printed as clean
- `rule.forbid.hand-transcription` (transcriber) — the same defect in a
  different guard: "empty at exit 0 reads as *those pages are blank* rather than
  *those pages were never examined*"
- `rule.require.snap-review-on-skill-change` — the companion question, asked of a
  guard that is disabled rather than blind: *what did it write instead of a
  failure?*
- `rule.require.collision-checked-pseudonyms` (transcriber) — the same audit run
  on a guard's **inputs from a config file**: a roster guarded for LENGTH but not
  WORD-BOUNDEDNESS turns an ordinary word into a repo-wide blocker (measured:
  hundreds of false blocks from one map entry)
