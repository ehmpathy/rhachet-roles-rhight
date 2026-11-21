# rule.require.verify-upstream-before-you-author

## .what

when you trace a defect to an **upstream** dependency, check whether upstream has **already fixed it** before you write the fix, file the issue, or spec the diff.

check against a **published tag** — never a local clone, never the `dist/` in your own `node_modules`.

## .why

- `rule.require.solve-at-cause` sends you upstream; the natural next move — write the fix — is often work someone else did months ago
- the failure is a **confident, well-researched, entirely wasted** deliverable: diff, path, occurrence count, blast radius — all correct about your version, all obsolete

> a defect you can reproduce locally proves your **copy** is broken. it does not establish whether upstream still is.

measured: a task specified a declapract template fix in full (diff, path, six occurrences). the fix had shipped five months earlier; four `gh api` calls would have shown it:

| version | published | verdict |
|---|---|---|
| 0.47.35 ← installed | 2026-01-29 | ⛔ broken |
| **0.47.48** | **2026-03-11** | ✅ quoted — the real fix |
| 0.47.68 | 2026-05-07 | ✅ + explicit equality (PR #465) |
| 0.49.11 | 2026-08-21 | ✅ latest |

upstream had also shipped a rule brief and a clamp test. the ask was never "write a fix"; it was "run the upgrade."

## ⛔ the two sources that will mislead you

### 1. a local clone of the upstream repo

- it *looks* authoritative — the real repo, on `origin/main`, real content
- it holds whatever was last fetched, on whatever branch, with whatever is uncommitted — all invisible to a file read
- measured: one clone carried the **fixed** template while its `changelog.md` topped out at **0.46.14**, older than the installed 0.47.35
  - ⇒ when two files in one tree disagree about which version you face, you do not face a version at all

### 2. your own `node_modules/**/dist`

it answers *"what do I have"*, never *"has this been fixed"* — by construction it is the version you already know is broken.

## ✅ the ground truth is the PUBLISHED TAG

```sh
# what is the latest?
npm view <package> version

# what do I actually have?
cat node_modules/<package>/package.json | head -4

# is it fixed at a given published tag?  <- the decisive one
gh api --method GET -H "Accept: application/vnd.github.raw" \
  "repos/<owner>/<repo>/contents/<path>?ref=v<X.Y.Z>"
```

a tag is immutable and is what npm actually shipped.

## 🎯 bisect the tags — the first-fixed version is the useful answer

the number that changes a decision is the **smallest bump that fixes the defect**, because blast radius scales with the jump.

`npm view <package>@<version> time --json` gives every publish date, so you can map a fix commit onto a version:

```sh
gh api --method GET \
  "repos/<owner>/<repo>/commits?path=<path>&per_page=5" \
  --jq '.[] | .sha[0:8] + "  " + .commit.author.date + "  " + (.commit.message | split("\n")[0])'
```

⚠️ **confirm the boundary by a read of the two adjacent tags; never infer it from timestamps.** release automation batches, reverts, and skips.

### ⚠️ the boundary may hide TWO fixes, not one

a bisect that asks only "is it fixed?" stops at the first `true`. read the text at each step — one line often gets fixed in stages:

| version | the guard | what it fixes |
|---|---|---|
| 0.47.47 | `[ -n $RESNAP ]` | — |
| **0.47.48** | `[ -n "${RESNAP:-}" ]` | the word-split. **this is the critical one** |
| **0.47.68** | `[ "${RESNAP:-}" = "true" ]` | `RESNAP=false` no longer triggers |

stop at 0.47.48 and you fix the severe defect and keep a mild one — defensible only when you know you chose it.

## .the rule

| you found | do |
|---|---|
| a defect whose cause is upstream | check the published tags **first** |
| upstream already fixed it | ⛔ do not write a patch. **upgrade** |
| upstream has not fixed it | write it — and say which tag you checked |
| you cannot reach the tags | say so; do not treat a clone as a substitute |

either way, **name the version you checked and the date**. "upstream has not fixed this" is a claim with a timestamp.

## ⚠️ "already fixed" does NOT mean "safe to upgrade now"

the result retires the *authorship* work, not the order question. before you upgrade, ask:

- **is the tree clean?** an upgrade rewrites templated config; atop uncommitted work the two diffs cannot be separated
- **what else rides along?** ~100 releases of drift carries far more than the one fix
- **does it change test behavior?** then `rule.require.review-test-changes` applies and it is not yours to take alone

a hand patch stays defensible when the upgrade is genuinely blocked — tag it as a known-revert, since the eventual upgrade will undo it.

## .enforcement

- an upstream fix written without a published-tag check = **blocker**
- "upstream is broken" claimed from a local clone or from `node_modules/dist` = **blocker**
- a first-fixed version inferred from timestamps rather than confirmed against the two adjacent tags = **blocker**
- an upstream claim reported without the version and date checked = **nitpick**
- a bisect that reports one boundary where the text shows two = **nitpick**

## .see also

- `rule.require.solve-at-cause` (architect) — sends you upstream; this rule says what to do on arrival
- `rule.require.trust-but-verify` (mechanic) — the general form; an upstream diagnosis inherited from a prior session is its stale claim
- `rule.require.bhrowser-citations` — the same "a note is a claim with a timestamp" hazard, in a url
- `rule.require.pinned-versions` (mechanic) — why the gap opens: a pinned version drifts silently
