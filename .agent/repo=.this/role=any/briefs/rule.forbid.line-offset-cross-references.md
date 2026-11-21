# rule.forbid.line-offset-cross-references

## .what

never point at a place in a document with a **line count** or a **line number**.

| ⛔ never | ✅ always |
|---|---|
| `76 lines earlier` | `` under `.the internal affairs doctrine` `` |
| `~280 lines below` | `in the Florida section` |
| `70 LINES ABOVE` | `` under `.annual costs` `` |
| `read line 145 again` | `the final sentence of the note above` |
| `` `0.gather.position.yield.md` line 43 `` | `` its `additional info` table `` |

a **section name** is edit-proof and a reader can act on it with a search. an
offset ceases to describe the file the moment either end moves.

## .why — this is WRONG BY CONSTRUCTION, not careless

| variant | mechanism |
|---|---|
| A — the note invalidates **itself** | a correction note placed **between** its two anchors pushes them apart by its own length. measured: *"76 lines earlier"*, real distance 116 |
| B — a **sibling** edit in the same pass | measured: *"86 lines"*, true when written; by the end of the same pass, 282 |
| C — the absolute `line N` | reads as *more* precise, and **any** insertion anywhere above it breaks it |

⇒ **a measurement taken before an edit is a claim about a file that no longer
exists.**

### the measured rate

| shape | checked | wrong |
|---|---:|---:|
| prose offset (`76 lines earlier`) | 20 | **15** |
| `path:NN` | 19 | **5** |

- the prose offsets that held were short hops (≈6, ≈36, ≈58) in stable files;
  **every one over ~70 lines was wrong**, the worst off by 171 and 181
- the two worst were written with a **tilde** (`~280` → 451, `~230` → 411). a
  `~` reads as *approximate, and checked*; in practice it meant *not counted*
- every stale `path:NN` was a `.ts` docblock that pointed into a `.sh` — a
  skill grows in its **middle**. refs into `.gitignore` survive because it grows
  at its **end**

### why it is not cosmetic

these pointers sit inside **correction** and **provenance** notes — the prose a
reader trusts most because it reads as already-audited. a wrong offset sends
the reader to unrelated text (`local out_dir`, `</style>`) and discredits the
one paragraph that must be believed.

> **the correction paragraph is the LEAST-audited prose in any file, because it
> reads as already-audited.** it should be the most.

a **currently-correct** `path:NN` is still a defect: `` `.gitignore` ignores
`.scratch` `` is complete without the `:26`. the number adds no information and
carries the full fragility.

## ✅ the cure — an edit-proof anchor, never a re-pointed number

| 👎 | 👍 |
|----|----|
| `` `doc.letterhead.sh:910` `` | `` the `} >"$INTO"` redirect that closes the emit block `` |
| `` `pdf.transcribe.sh:249` `` | `` the awk needle in the optical arm of `transcribe_page` `` |
| `` `assemble.1120.sh:362` `` | `` the printf whose args run `$1, tag, inc, ded, ti, nol, carry` `` |

⚠️ **verify the anchor, not only the target** — a cure can quote a string from
the wrong file, the same defect inside its own fix.

### ⛔ a TEMPLATE is the worst site of all

a pointer inside a **fenced template** is copied into every artifact written
from it. sort sweep hits by blast radius: a template first, then prose, then a
one-off.

## ⚠️ the sweep — a matcher is a scope claim

this class escapes any single matcher. run all five, over `src` **and**
`.agent`, and **read** every hit:

```sh
rg -n '[0-9]+ lines' src .agent                        # prose offsets (tolerates a hard wrap)
rg -n '\bline ~?[0-9]+\b' src .agent                   # ⚠️ noisy: form/statute line numbers
rg -n '`[^`]+\.[a-z]+:[0-9]+`' src .agent              # a backticked path with a line number
rg -n '`[^`]+:[0-9]+([,-][0-9]+)*`' src .agent         # range, comma, AND extension-less
rg -n '`:[0-9]+([,-][0-9]+)*`' src .agent              # the bare form
```

| trap | why the narrower matcher misses it |
|---|---|
| hard wrap — `…100 lines`↵`above.` | `\d+ lines (up\|down\|above\|below)` is line-scoped. measured: missed 5 of 20 |
| `path:NN` — `` `.gitignore:26` `` | no literal word `line` |
| **range** `check.pii.sh:68-71`, **comma** `via.textual.sh:141,145` | the pattern expects a backtick after the digits. these are the forms written when the target is a **block** — when the ref carries the most weight |
| **bare** `` `:69-70` `` | no path at all |
| extension-less `notary.find:95` | caught only because the skill name is dotted |
| a run narrower than the published matcher | measured: a matcher that named `src .agent`, run over `src` alone, left 33 candidates in `.agent` unswept |

⚠️ files whose subject **is** the forbidden form (this one) match their own
examples. read the hits.

## ✅ what is NOT this rule

- **a form or statute line number** — `Form 1120, line 26`, `Schedule L line 15`.
  these name a field in an external, versioned document, not a position in ours
- **a source-line count in a provenance note** — `208 lines that carry a dollar
  figure` is a measurement of a pulled artifact, not a pointer
- **an instrument's own output, quoted** — a `path:NN` a tool computed at run
  time, and a dated record of that run. the exemption reaches the quoted rows
  and **not** the prose beside them
- **a coordinate that indexes the excerpt directly above** — `` `:4`'s reason on
  `:6`'s exit ``, under a quoted four-row block. the referent travels with the
  sentence

### why an instrument's output is exempt — WHO COMPUTED IT

```
      ├─ src/domain.roles/transcriber/skills/pii.scan/pii.scan.sh
      │  └─ :226 no-assert · the brain mechanism was not found at:
```

| | rots? | misleads? |
|---|---|---|
| a tool's row, regenerated each run | ⛔ no — it never outlives its file | ✅ no |
| a **record** of that run, dated | ✅ yes | ⛔ no — the date says when it was true |
| a human-authored pointer in prose | ✅ yes | ✅ **yes** — it reads as current |

⇒ the discriminator is **whether a reader must leave the page** to settle what
the number names. *"`doc.pseudonymize.sh:118` is the witness"* beside a quoted
block is a human pointer into the repo, and a blocker. a gate that fires on a
tool's mandatory output must name that exemption, or the whole rule is
discarded the first time it collides with the toolchain.

## ⚠️ a YIELD is append-only — verify, do not silently rewrite

`rule.require.permanent-yields` forbids an edit-to-be-correct on a yield. so a
stale offset inside one gets **appended to**, never fixed in place.

## .enforcement

- a line offset or `line N` that points inside this repo = **blocker**
- a `path:NN` ref that points inside this repo = **blocker**, and a **checked,
  currently-correct one is still a blocker** — the number carries fragility and
  no information
- the same inside a **fenced template** = **blocker**, and fix it first — it
  reproduces itself into every artifact written from the block
- a `~`-prefixed offset presented as checked = **blocker**
- a **range** (`sh:68-71`), a **comma** (`sh:141,145`), or a **bare** (`` `:4` ``)
  ref that points inside this repo = **blocker** — and sweep for all three, since
  the first three matchers above find none of them
- a `path:NN` in an instrument's **quoted output** = ✅ **not this rule**; the
  same number in the **prose beside** that quote = **blocker**
- a bare `:NN` in prose that indexes a **row of the excerpt directly above** it =
  ✅ **not this rule** — the referent travels with the sentence. ⚠️ do not read
  the "prose beside a quote" line as reaching this; the test is whether a reader
  must leave the page
- a sweep whose run is narrower than its own published matcher = **blocker**
  (a matcher that names `src .agent` and a run that covers `src` is a scope claim
  the sweep did not honor)
- a sweep for this class that greps only line-scoped = **nitpick** (it will
  under-report by ~25%)
- a sweep for this class that greps only for the word `line` = **blocker** (it
  is blind to `path:NN`, which is the form an editor emits by default)

## .see also

- `rule.require.permanent-yields` (secretary) — why a stale offset in a yield is
  appended to rather than fixed
- `rule.require.provable-pseudonymization` (transcriber) — the same hard-wrap
  hazard, met in a value swap: *"a verification that reuses the edit's matcher
  inherits the edit's blind spot"*
- `rule.require.audit-guards-by-input-type` — the general form: a sweep's
  **matcher** is an input-space claim, and a wrapped instance is an input class
