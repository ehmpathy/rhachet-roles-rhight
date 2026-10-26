# rule.require.assertions-that-discriminate

## .what

every assertion must be able to tell its own `then`-string apart from that
string's **negation**. read the `then`-string as a specification, then ask:

> **if the code did the OPPOSITE of what this sentence claims, would this
> assertion go red?**

if no, the assertion is decorative. it reports green over the defect it was
written to catch.

this sharpens `rule.require.clamp-edge-cases`: a clamp must bite under the
un-fixed defect. this rule names the **seven ways an assertion turns out unable
to bite even when the fixture is right** — each measured in this repo:

| leak | skill | the assertion could not see |
|---|---|---|
| 1 | `doc.pseudonymize` | the wrong **label** on a real hit |
| 2 | `statement.tally` | the wrong **group** — a personal card read as corporate |
| 3 | `assemble.1120` | the wrong **cell** — a $1,203 loss read as taxable income |
| 4 | `pdf.redact` | **any defect whatsoever** — the channel it reads is ERASED before the step under test |
| 5 | `pdf.transcribe` · `doc.letterhead` | **any defect whatsoever** — there IS no assertion. two shapes: a branch no case reaches, and an output every case runs and none reads |
| 6 | `pdf.transcribe` (dispatcher) | the **guard never ran** — its exit code COINCIDES with the one the dependency emits unaided |
| 7 | `audit.refusal.messages` | **any defect in how the skill is REACHED** — the harness bypasses the property. 38 green tests over a skill that exits **126** |

⚠️ the count is a floor, never a closed set — each leak was found by a sweep for
the one before it. when you add a leak, grep this file for its own arithmetic.

### three kinds, and only the first is about needles

| kind | leaks | the fix |
|---|---|---|
| an **ambiguous needle** | 1 · 2 · 3 · 6 | choose a better needle — the `.the rule` table below |
| a **dead channel** | 4 · 7 | ⛔ no needle can help. read a **different observable** |
| a **dead branch** or a **dead output** | 5 | ⛔ there is no assertion to fix — **write one**. the two shapes need **two different sweeps** |

- leak 6's needle is a **number**, which reads as exact — it is ambiguous because
  two different causes emit it
- leak 4 and leak 5 are twins pointed opposite ways: an assertion with a dead
  channel, and a live channel with no assertion. neither is reachable from a
  read of the assertions
- leak 7's dead channel is **the way the suite reaches the skill** — answerable
  only from the harness, never from the skill

## .why

a toothless clamp is worse than an absent one: its `then`-string tells every
later reader the property is covered — a gap with a sign that says "no gap
here." no instance below looks wrong on review; only a deliberate revert
exposes them.

## 🚩 leak 1 — the needle is in the report's OWN VOCABULARY

`doc.pseudonymize --verify` asserted `toContain('[content]')`. the fix was
reverted and the suite **stayed green**: the leak was reported as `[wrap]` (the
wrong label, which sends the human to the wrong cure), but the same commit had
added a **legend** to the exit line:

```
[content] = a re-run may fix · [path] + [wrap] = fix the source
```

so `toContain('[content]')` matched on **any** hit, on **any** channel, forever.

```ts
// 🚫 matches the legend, on every channel, forever
expect(result.stdout).toContain('[content]');

// ✅ the row, and the exclusion that carries the real discrimination
expect(result.stdout).toMatch(/└─ \[content\]\s+\S*deed\.md/);
expect(result.stdout).not.toMatch(/└─ \[wrap\]/);
```

the `not.toMatch` half carries the weight — presence alone cannot tell a
**correct** report from a **mislabeled** one.

| the needle also appears in… | example |
|---|---|
| a legend or key at the foot of a report | `[content] = … · [wrap] = …` |
| a `--help` block echoed on a constraint exit | `usage: --account ID` |
| an error message that lists the valid options | `expected one of: draft, final` |
| the input echoed back in a header | `card: 1-00007` |

⇒ **a token in a report's own vocabulary is not evidence about a hit.** anchor
on the structure the report uses for hits — the tree glyph, the row prefix, the
file path.

## 🚩 leak 2 — the claim is a RELATION, the assertions are a SET

`statement.tally` `[case8][t0]` claimed *"it names each card and the statements
beneath IT"* — a **relation**, and the whole actionable output. it asserted four
independent presence checks:

```ts
expect(result.stdout).toContain('1-00007');
expect(result.stdout).toContain('2023-06-corp.md');
expect(result.stdout).toContain('6-44000');
expect(result.stdout).toContain('2023-06-personal.md');
```

drop `print_account_block`'s group condition (`$1 == a`) and every statement
lists under every card — the personal statement shown under the corporate card.
measured: **47 passed, 0 failed**.

```ts
// the two correct pairs
expect(result.stdout).toMatch(/1-00007\n[ ]+· 2023-06-corp\.md/);
expect(result.stdout).toMatch(/6-44000\n[ ]+· 2023-06-personal\.md/);
// ⭐ the discriminators — a cross-pair IS the defect
expect(result.stdout).not.toMatch(/1-00007\n[ ]+· 2023-06-personal\.md/);
expect(result.stdout).not.toMatch(/6-44000\n[ ]+· 2023-06-corp\.md/);
```

⚠️ `[ ]+`, never `\s+`: `\s` matches a newline, so a statement three rows down
would satisfy a pair it does not belong to.

## 🚩 leak 3 — the REPORT renders that shape TWICE, so the needle is ambiguous

the needle appears twice **as data**, in two cells the report formats alike. a
5-site cluster in `assemble.1120`, every site bound for a federal Form 1120.

### 3a — two COLUMNS with the same format

```sh
printf "| %s%s | %s | %s | **$%.2f** | $%.2f | **$%.2f** |\n", \
  $1, tag, inc, ded, ti, nol, carry
#                        ^^ taxable income (30)   ^^ NOL cumulative
```

the `then` *"a loss year reports zero taxable income **and** names the NOL"*
asserted two bare tokens. swap `ti` and `carry` and the row is

    | 2023 | $200.00 | $1403.00 | **$-1203.00** | $-1203.00 | **$0.00** |

⛔ both assertions still pass, over a **$1,203 loss reported as taxable income**
(measured: the revert was run and jest printed that row).

```ts
expect(result.stdout).toContain(
  '| 2023 | $200.00 | $1403.00 | **$0.00** | $-1203.00 | **$-1203.00** |',
);
// ⭐ the discriminator — the column SWAP is the defect
expect(result.stdout).not.toContain('| **$-1203.00** | $-1203.00 |');
```

### 3b — two SECTIONS with the same row shape

the capital-assets table (awk `$3`) and the unclassified-charges table (awk
`$12`) both emit `| <year> | $<amount> |`. each `then` said *"in **its own**
section"* and asserted header and amount as independent whole-report
`toContain`s. swap the two headers and both pass — while the sections exist to
hold those amounts OUT of line 27.

⇒ **slice the section, then search inside it** (the idiom
`rule.require.bhrowser-citations` uses for a statute):

```ts
const section = sliceSection({ of: result.stdout, from: 'line 20 — capital assets' });
expect(section).not.toEqual('');            // ⭐ positive control: the header exists
expect(section).toContain('| 2023 | $2000.00 |');
expect(section).not.toContain('$77.00');    // ⭐ the cross-pair
```

⚠️ **the slice must REFUSE on a missed start marker**, never fall through to the
whole report. and because the decisive assertion is an *absence*, the
`not.toEqual('')` control is mandatory: an empty slice satisfies every exclusion.

## 🚩 leak 4 — the assertion reads a channel the OPERATION ERASES

the only leak **no fixture and no needle can repair**. `pdf.redact` — a
security skill:

```
1. pdftoppm  -> rasterize every page   # ⬅️ DESTROYS THE TEXT LAYER, HERE
2. pdftotext -bbox -> locate the boxes
3. paint_box -> paint the boxes        # ⬅️ the behavior under test
4. convert   -> reassemble
```

```ts
const text = pdfText(scene.out);
expect(text).not.toContain('666-12-3456');   // 🚫 over an EMPTY string
```

step 1 empties the channel before step 3 runs, so the assertion holds for
**every** pattern. measured: `paint_box() { return 0; }` — SSN legible in the
output — left the suite at **37 passed, 0 failed**.

`rule.require.deterministic-redaction` had already said so: *"check 1 is VACUOUS
on a redacted PDF … **the render** — that the box landed **on the value**. this
is the one that carries the weight."* the suite implemented zero of check 2.
⚠️ a rule that names a defect is **not** a guard; only a case is.

### the cure is a DIFFERENT CHANNEL — pixels

two bands 320pt apart, measured by mean brightness:

| clamp | assertion | proven to bite under |
|---|---|---|
| positive control | both **source** bands have ink | a page-height bug that made all 4 bands pure white |
| the value | `outSsn < srcSsn - 0.05` | `paint_box() { return 0; }` → 39/1 |
| the discriminator | `\|outCtl - srcCtl\| < 0.01` | a box over-padded 320pt downward → 39/1, **the value clamp still GREEN** |

- the band comes from the fixture's own PostScript coordinates, **not** from
  `pdftotext -bbox` — the instrument the skill uses. a verification that reuses
  the edit's matcher inherits the edit's blind spot
  (`rule.require.provable-pseudonymization`)
- the positive control is mandatory: an **unrendered** band is pure white, so
  *"no ink here"* and *"the redaction worked"* are the same number. measured: a
  hardcoded 792pt page height put all four bands at exactly `1.0`, and the
  control caught it

## 🚩 leak 5 — a whole BRANCH no assertion reaches, and a COMMENT that says it is covered

the mirror of leak 4: the channel is fine and **no assertion looks at it**. the
defect is legible only from the *absence* of a case.

`pdf.transcribe`'s `transcribe_page()` has two arms. the optical one — the
`awk '/^## Page /{ seen = 1; next } seen { print }'` that closes
`transcribe_page` — was exercised by no case in any of three test files.

### what made it invisible: the comment said it was covered elsewhere

> "the OCR call itself is covered by `pdf.transcribe.via.optical.integration.test.ts`"

true of the **leaf**, false of the **boundary**: the named file sets
`skillPath = path.join(__dirname, 'pdf.transcribe.via.optical.sh')` and runs the
leaf directly. the dispatcher's read of what the leaf hands back — the seam —
was covered by neither.

> a scope note is a claim about a **file**. coverage is a property of a
> **boundary**. (`rule.require.verify-guarantees-comments-assert`)

### the defect is the CONSISTENCY FIX

| leaf | emits | dispatcher strips with |
|---|---|---|
| `via.textual.sh` — its `printf "%s## page %d\n\n%s"` | `## page N` — lower | `sed '/^## page /d'` |
| `via.optical.sh` — its `all_text+="## Page $page_num"` | `## Page N` — **upper** | `awk '/^## Page /{ seen = 1; next } seen { print }'` |

lower the awk needle for tidiness and it matches no line: an **empty body for
every OCR'd page, at exit 0** — the failure the skill exists to prevent.
measured: **58 passed, 0 failed**.

### the clamp, and what made it hermetic

- **a directory COPY, not a PATH shim** — the dispatcher resolves both leaves by
  absolute path off its own `BASH_SOURCE` (`VIA_TEXTUAL=`, `VIA_OPTICAL=`), so
  there is no env seam. the copy carries the dispatcher, `output.sh`, the
  textual leaf, and a stub for the optical leaf that honors its stdout contract
- **the cache cannot substitute for a stub** — `via.optical.sh` sets
  `CACHE_SKIP=true` in its `--page` arm, and the dispatcher always passes
  `--page`

| clamp | proven to bite under |
|---|---|
| positive control — the **textual** pages still transcribe through the copy | a broken copy (without it, an absent body could mean a bad fixture) |
| the OCR page **BODY** reaches the transcript | the casing flip → 63/**2** |
| the leaf's **banner** does NOT reach the transcript | ⭐ `sed '/^## Page /d'` → 64/**1**, and the body clamp stayed **GREEN** |
| each page carries the marker for the route it **ACTUALLY** took | a hardcoded marker — see below |

the banner clamp rules out the plausible wrong fix: `sed '/^## Page /d'`
mirrors the textual arm, keeps the body, and lets the leaf's whole banner in.
only an **exclusion** tells the two apart.

### a uniform fixture cannot test a per-item property

```ts
expect(markers).toEqual(['<!-- via: textual -->', '<!-- via: textual -->']);
```

on an **all-textual** fixture, a renderer that hardcodes `textual` passes. the
mixed set `['textual','optical','textual']` is the first assertion that can see
a wrong marker.

> if every row of your input takes the same path, an assertion over the output
> rows is a claim about the count, whatever its `then`-string says.

### two shapes, two sweeps

`doc.letterhead` — a skill that produces sworn legal instruments — carried both:

| shape | the site | does an arm walk find it? |
|---|---|---|
| an **unreached arm** | `--body`, an arg-parse case no test ever passed | ✅ yes |
| an **unobserved output** | `emit_body_paragraphs`, a function **every case RAN** | ⛔ **no** |

`emit_body_paragraphs` sits on the straight path, run by all 26 cases, so
*"which case reaches this line?"* answers **"all of them"**. it had zero
assertions (53 `toContain` hits, none on body text). replace its loop with `:`
and the document renders letterhead, title, signature block, and a **full
Florida notarial certificate with no statement in it** — **26 passed, 0
failed**. line coverage scores it 100%.

```
the ARM walk    -> for each BRANCH, which case REACHES it?
the OUTPUT walk -> for each OUTPUT the skill emits, which assertion READS it?
```

⚠️ leak 3 sits inside the output walk: `<p class="body">` is rendered by two
sites (the capacity lead sentence and the body loop), so the clamp splits on the
gate between them (a jurat demo → 2 paragraphs; an acknowledgment demo → 3).

⚠️ **trace printf args by hand** — arg order need not match column order:

```sh
echo "| year | 1a gross receipts | 1b returns | 1c net | 26 stripe fees |"
printf "| %s | $%s | $%s | **$%s** | $%s |\n", $1, $2, $3, $5, $4
#                                                          ^^  ^^ out of order
```

in `stripe.tally.sh`, `$5` feeds 1c and `$4` feeds 26. the site count tells you
a bare token is ambiguous; only the arg trace tells you which cell it names.

## 🚩 leak 6 — the EXIT CODE coincides, so the assertion cannot see a DEAD GUARD

```sh
get_page_count() {
  PAGE_COUNT="$(pdfinfo "$PDF_PATH" 2>/dev/null | awk '/^Pages:/ { print $2 }')"
  if [[ -z "$PAGE_COUNT" ]]; then
    print_blocked "could not read page count — is this a valid PDF? $PDF_PATH"
    exit 1
  fi
}
```

⛔ **the guard is UNREACHABLE.** under `set -e` + `pipefail` the assignment
inherits the pipeline's status and the shell aborts before the `if`. the caller
gets empty stdout, empty stderr, and a bare exit code.

poppler exits **1** on an unreadable file — the code this arm means to return:

| assertion | under the dead guard |
|---|---|
| `expect(outcome.exitCode).toBe(1)` | ⛔ **GREEN** |
| `expect(outcome.stdout).toContain('could not read page count')` | ✅ red |

```
✓ then: exit code is 1 — a MALFUNCTION, not a constraint (1 ms)
✕ then: it says the page count could not be read (3 ms)
```

the cure — consume the status so control reaches the guard, and assert the
**message**:

```sh
local info
info="$(pdfinfo "$PDF_PATH" 2>/dev/null)" || info=""
PAGE_COUNT="$(printf '%s\n' "$info" | awk '/^Pages:/ { print $2 }')"
```

> **for each refusal arm, ask: what does the underlying tool exit with, unaided,
> on this same input?** where the two coincide, the MESSAGE is the only
> observable that separates *"the guard ran and refused"* from *"the guard never
> ran."*

a wrapper conventionally adopts its dependency's codes, so the coincidence is
the **normal** case. the shape reaches past exit codes: a handler that returns
`404` where its upstream already 404s, a parser that returns `null` on `null`
input — **anywhere a guard's output equals the value it would have had without
the guard.**

### the IDIOM is the defect; the COINCIDENCE only decides who can see it

```sh
rg -n '^\s*[A-Za-z_]+="\$\([^)]*\|[^)]*\)"' src --glob '*.sh'
```

| site | the arm returns | poppler returns | the code… |
|---|---|---|---|
| `pdf.transcribe.sh` — page count | **1** | 1 | ⛔ **coincides** — green over a dead guard |
| `pdf.render.sh` — page count | **1** | 1 | ⛔ **coincides** — measured: exit clamp ✓, message clamp ✕ over `""` |
| `doc.sign.sh` — the input `--pdf` | **2** | 1 | ✅ differs — a code clamp *would* have caught it |
| `doc.sign.sh` — the output post-condition | **1** | 1 | ⛔ **coincides** |

- fix on the **idiom**; row 3 is unreachable too
- row 4 first: a post-condition on the skill's own output, so the abort left an
  unvouched PDF on disk
- a proven clamp on one arm says none of the arm beside it — the sweep unit is
  the idiom, per file

### the COROLLARY — a guard whose absence emits OUTPUT, not a failure

| tool dropped from `check_tools` | what the unguarded run does |
|---|---|
| `pdfinfo` | refuses at **exit 1** with *"could not read page count — is this a valid PDF?"* — a misdiagnosis that blames the document |
| `pdftotext` | ⛔ **no refusal at all, exit 0** — a full transcript whose every page is marked `<!-- via: optical -->` with an **empty body** |

`page_has_text` ends in `|| true`, which swallows the shell's `127`, so every
page is classified image-only. an exclusion on refusal prose
(`not.toContain('is this a valid PDF')`) was **GREEN** under that defect.

⇒ **assert what the defect PRODUCES** — the per-page route marker proves the run
reached transcription:

```ts
expect(outcome.stdout).not.toContain('via: optical');
expect(outcome.stdout).not.toContain('## page 1');
```

⚠️ the unguarded failure mode cannot be extrapolated from a neighbor skill —
predicted twice, wrong both times. narrow the guard **one tool at a time** and
read what each run emits.

## 🚩 leak 7 — the HARNESS reaches the skill by a route that BYPASSES the property

`audit.refusal.messages` shipped with **38 green tests**; its first real run:

```
$ rhx audit.refusal.messages
exit 126 — Permission denied
```

the file was `100644`; its peers `100755`. every case ran
`spawnSync('bash', [scriptPath, ...args])` — an interpreter reads a readable
file and never consults `+x`. `rhx` **execs**, so the kernel refuses first.

| the route | consults `+x`? |
|---|---|
| `spawnSync('bash', [path])` — the harness | ⛔ **no** |
| `rhx <skill>` — every real caller | ✅ yes |

the cure is a different observable, as in leak 4:

```ts
then('⭐ it carries the executable bit — no spawn-through-bash case can see this', () => {
  const mode = fs.statSync(scriptPath).mode;
  // eslint-disable-next-line no-bitwise
  expect(mode & 0o111).not.toBe(0);
});
```

proven to bite: `chmod -x` → **38/1, exactly this clamp**; `chmod +x` → **39/0**.

### a positive control satisfied by the WRONG CAUSE

```ts
// 🚫 the value is a PROXY
const mode = useThen('it is readable', () => fs.statSync(scriptPath).mode);
expect(mode & 0o111).not.toBe(0);
```

`useThen` returns a proxy; a bitwise op coerces it to `NaN`, and
`NaN & 0o111 === 0` — red on a file that **is** executable, before and after the
chmod. **never wrap a PRIMITIVE in a lazy accessor when the assertion COERCES
it** — a proxy survives `toBe`/`toEqual` and dies under `&`, `|`, `+`, `<`, and
template interpolation.

> a red you did not cause on purpose is a hypothesis about your clamp, never a
> result about your code. run the full revert cycle even when real-world evidence
> looks conclusive.

### the tell — does my RUNNER exercise the property?

| the harness chose | the property it cannot see |
|---|---|
| `spawnSync('bash', [path])` | the **executable bit**; the **shebang** |
| a fixed `cwd` | anything the skill resolves relative to the caller |
| `env: process.env` | behavior under a **narrowed** environment |
| a temp dir with a fixed name | path-shape assumptions (spaces, unicode, length) |
| a direct call, not through `rhx` | arg passthrough, `dist/` resolution, registry route |

the harness choice is usually correct and deliberate; the **unstated
consequence** is the defect.

## 🎯 the tells, per leak

| leak | where the tell lives | the question |
|---|---|---|
| 1 · 2 | the `then`-string | does it relate two things (*beneath*, *for*, *labeled*, *under*, *as*, *instead of*, *its own*) while the assertions never mention two things at once? |
| 3 | the **renderer** | how many places emit your needle's shape? two `**$%.2f**` in a row, or two tables of one layout, means a bare token names no cell |
| 4 | the **order of operations** | does an earlier step — rasterize, re-encode, truncate, strip, overwrite — destroy the channel you read? (a renderer count of **1** reads as "unambiguous" rather than "gone") |
| 5 | the **skill**, not the test file | which case reaches each branch arm? which assertion reads each output? a scope note that says "covered elsewhere" is a prompt — open the file and read its `skillPath` |
| 6 | the **dependency** | what does the wrapped tool exit with, unaided, on this input? |
| 7 | the **harness** | what does the runner's invocation route, cwd, env, and path shape make untestable? |

leaks 1-3 share one root: the assertion answers *"does this string appear?"*
while the `then` claims something **about structure** (a classification, a
relation, a position). a presence check cannot make a structural claim, and no
fixture fixes that.

## .the rule

| the `then`-string claims | the assertion must |
|---|---|
| a value is present, and the report renders that shape **once** | `toContain` is fine |
| a value is present, and the report renders that shape **more than once** | assert the **whole row** (or slice the section first) — a bare token names no cell |
| a value is **classified** a certain way | assert the rendered row **+** `not.toMatch` the wrong class |
| a value **relates** to another | assert **adjacency**, **+** `not.toMatch` the cross-pair |
| a value is in a particular **column or section** | assert the **full row**, or **slice**, **+** exclude the cross-pair |
| a value is **absent** | pair it with a positive control that proves the guard ran |
| a **guard refused**, where its exit code equals the one the dependency emits unaided | assert the guard's **MESSAGE** — the code discriminates none of it |
| a **guard refused**, where its absence produces **OUTPUT rather than a failure** | ⛔ exclude what the defect **PRODUCES**, never refusal prose — an exclusion on a message the defect never emits is satisfied trivially |
| a value is absent from a channel an **earlier step ERASES** | ⛔ read a **different observable**. no needle over that channel discriminates, at any fixture |
| a **per-item** property, on a fixture where every item takes the same path | ⛔ the fixture cannot express the defect. **mix the fixture** — a uniform input makes the assertion a claim about the count |
| — no assertion to fix, because the **branch has no case at all** | ⛔ start from the **skill**, not the assertions. enumerate the branch **arms** and name the case that reaches each |
| — no assertion to fix, because an **output every case runs** is unread | ⛔ the arm walk cannot see this: the answer to *"which case reaches it?"* is **all of them**. enumerate the **outputs** and name the assertion that reads each |
| a property of **how the skill is REACHED** — its mode, its shebang, its resolution through the real entrypoint | ⛔ the **runner** cannot see it. read a different observable (the file mode on disk), or invoke through the real entrypoint |

the rows marked ⛔ are not assertion fixes: the needle, the fixture, or the
runner is what cannot see the defect, or there is no assertion at all. rows are
named by their opening words, never by ordinal — an insert moves an ordinal
(`rule.forbid.line-offset-cross-references`).

in every non-trivial case: **write the negation, and confirm the assertion would
go red under it.** the cheapest way is to actually break the code and run.

## .enforcement

- an assertion whose needle also appears in the report's legend, help, or echoed
  input = **blocker** (it matches on every path; anchor on the rendered row)
- a `then`-string that claims a relation, asserted by independent presence
  checks = **blocker**
- an adjacency regex that uses `\s` where `[ ]` is meant = **blocker**
  (it spans lines, so it re-admits the defect)
- a bare token asserted against a shape the renderer emits in **more than one**
  place = **blocker** (assert the whole row, or slice the section)
- a section slice that **falls through** on a missed start marker instead of a
  refusal = **blocker** (it searches the whole report under a name that promises
  one section)
- a slice-scoped exclusion with no `not.toEqual('')` positive control = **blocker**
  (an empty slice satisfies every exclusion)
- a refusal arm asserted **only** by its exit code, where the wrapped tool exits
  the same way unaided on that input = **blocker** (the code cannot tell *"the
  guard ran and refused"* from *"the guard never ran"*; assert the message)
- a refusal arm whose exclusion names **refusal prose**, where the unguarded path
  emits **output rather than a failure** = **blocker** (the exclusion is
  satisfied trivially; exclude what the defect produces)
- an unguarded failure mode **predicted from a neighbor skill** rather than
  measured, one dependency at a time = **blocker**
- a guard placed **below** a command-substitution assignment under `set -e` +
  `pipefail` = **blocker** (the assignment inherits the pipeline's status and
  aborts before the guard; `|| fallback=""` restores control flow)
- an instance of that idiom cleared on the grounds that **its exit code already
  differs** from the wrapped tool's = **blocker** (the guard is unreachable
  either way; the coincidence predicts only whether an extant assertion could
  have seen it)
- a **file** cleared on the grounds that one of its arms carries a proven
  clamp = **blocker** (the sweep unit is the idiom, per file — one skill here
  carried two instances, one of them a post-condition on its own output)
- an assertion over a channel that an **earlier step of the same operation**
  destroys — a rasterize, a re-encode, a strip, a truncate, an overwrite =
  **blocker** (it is satisfied trivially, forever, for every needle)
- a **security** guarantee asserted only through such a channel = **blocker**
  (the guarantee reads as covered while no check runs)
- a probe that **crashes** the skill, offered as proof a clamp bites = **blocker**
  (a malfunction reddens everything and discriminates none of it; the probe must
  leave the skill working and move only the observable)
- a **branch arm** of the skill that no case in any test file reaches = **blocker**
  (there is no assertion to audit; enumerate the arms and name the case per arm)
- an **output the skill emits on every path** that no assertion in any test file
  reads = **blocker** (an arm walk reports it covered and a line-coverage report
  scores it 100%; enumerate the outputs and name the assertion per output)
- a coverage claim rested on a **branch walk alone** = **blocker** (it answers
  *"which case reaches this?"*, never *"which assertion reads this?"* — and the
  second is where a sworn document lost its statement at 26/26 green)
- a **scope note** that claims coverage lives in another file, where that file's
  `skillPath` points at a **different executable** = **blocker** (it covers the
  leaf and says nothing about the boundary — and it reads as complete)
- a **per-item** property asserted on a fixture where every item takes the same
  path = **blocker** (the assertion is a claim about the count; mix the fixture)
- a **skill executable** with no assertion on its **file mode**, where the suite
  reaches it through an interpreter (`spawnSync('bash', [path])`) = **blocker**
  (that route never consults `+x`, so a `644` file passes every case and the real
  entrypoint exits **126** before a line is parsed — measured 2026-09-03)
- a coverage claim that does not name what the **harness's own invocation route**
  bypasses = **blocker** (the runner's choices — route, cwd, env, path shape —
  are each a property no assertion in the file can reach)
- a **primitive** wrapped in a lazy accessor (`useThen`) where the assertion
  **coerces** it — a bitwise op, an arithmetic op, a comparison, a template =
  **blocker** (the proxy yields `NaN`, so the clamp goes red on correct code and
  its red proves none of what it claims; read the value inside the `then`)
- a revert that leaves the suite green, accepted without a diagnosis = **blocker**
- a clamp accepted as proven from a **real-world observation** rather than a run
  of its own revert = **blocker** (a red you did not cause on purpose is a
  hypothesis about your clamp, never a result about your code)
- a clamp landed without the negation actually run = **nitpick**

## .see also

- `rule.require.clamp-edge-cases` (mechanic) — the base rule: a clamp must go
  red under the un-fixed defect
- `rule.require.audit-guards-by-input-type` — the input-space twin. that rule
  finds the class a clamp must cover; this one makes the clamp able to see it
- `rule.forbid.failhide` (code.test) — a clamp must verify on every path
- `rule.require.one-card-per-tally` (accountant) — the guard leak 2 protects
- `rule.forbid.hand-computed-figures` (accountant) — the guard leak 3 protects;
  a toothless assertion returns the calculator to the state that rule forbids
- `rule.require.deterministic-redaction` (transcriber) — the guard leak 4
  protects, and the rule that named this exact defect in advance
- `rule.require.provable-pseudonymization` (transcriber) — the
  independent-instrument principle leak 4's fix rests on
- `rule.forbid.hand-transcription` (transcriber) — the guard leak 5 protects:
  *"an empty page is either a genuinely blank page or an OCR'd one — never an
  unexamined one."*
- `rule.require.verify-guarantees-comments-assert` — the general form of leak
  5's tell: prose about correctness is the weakest evidence
- `notary/briefs/jurats/` — what leak 5's second shape cost: a jurat certificate
  that recites *the foregoing instrument*, with no instrument to swear to
- `rule.require.bhrowser-citations` — the source of the slice idiom in 3b, and of
  its refusal-on-missed-marker
