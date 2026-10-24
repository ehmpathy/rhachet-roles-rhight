# rule.require.provable-pseudonymization

## .what

never swap identifiers out of a document by hand. always swap them with `doc.pseudonymize`, from a map, and always prove the result with `--verify` before it reaches a commit.

the third rule in a family; each forbids a different hand operation on a document, and each fails silently:

| the operation | the hand version corrupts | the rule |
|---------------|---------------------------|----------|
| read a document | the values | `rule.forbid.hand-transcription` |
| mask a value | the mask lands in the wrong place | `rule.require.deterministic-redaction` |
| **swap an identity** | **a variant survives** | **this rule** |

## .why a hand swap is a defect

a swap by eye is a search you cannot audit. it fails in five ways, each of which looks like success:

| what a hand swap misses | worked example |
|-------------------------|----------------|
| a **second letter case** | the charter says `ACMEWIDGET, INC.`, the body says `Acmewidget, Inc.`, the filename says `acmewidget` |
| an **unformatted variant** | the EIN prints as `99-0001234` on one page and `990001234` on another |
| a **derived value** | the IRS assigns a 4-letter *name control* from the entity name. swap the entity and `ACME` still sits on page 3 |
| the **path** | the body is clean and the file is called `deed.jane-doe.md` |
| a **hard wrap** | an address block splits across a line break, so no line-scoped matcher reaches it — the swap AND the verify both miss it (see below) |

- measured: a 9-document corpus needed 27 pairs to come clean. an entity-name swap alone would have left the derived IRS name control, three DocuSign envelope ids, both EIN formats, and two of the nine filenames
- a hand swap **has no failure signal**: a botched redaction leaves a visible gap; a botched swap leaves a document that reads perfectly and names a real person on page 3

## ⚠️ the hazard the skill exists for: SUBSTRING COLLISION

a map that carries a value and its own prefix corrupts the longer one if applied shortest-first:

```
map:  ACMEWIDGET -> NORTHWIND
      ACME       -> NORT

shortest-first:  ACMEWIDGET  ->  NORTWIDGET      🚫 neither real nor synthetic
longest-first:   ACMEWIDGET  ->  NORTHWIND       ✅
```

`NORTWIDGET` is the worst outcome because **no verify pass will flag it** — the real value is gone, so a survivor search comes back clean while the document is quietly wrong. `doc.pseudonymize` sorts the map longest-real-first, always; that order is the correctness property, clamped by `[case1]` of the integration test.

## ⚠️ the second hazard: a HARD WRAP defeats BOTH halves at once

the swap is `perl -pe` (body wrapped in `while(<>)`), so a pattern can never span a newline; `--verify` used `grep`, line-scoped for the same reason.

> **a verification that reuses the edit's matcher inherits the edit's blind
> spot, and always reports clean.**

so a mapped value that hard-wraps survives the swap **and** verifies clean:

```
Address:  1200 Sandpine Harbor Way,
          Suite 400
```

not exotic: multi-word values (entity name, person name, addresses) are on the swap list, and the corpus is OCR transcripts where a form's address block wraps as a matter of course.

- **the fix is a second matcher.** `--verify` also collapses every whitespace run to one space, searches the collapsed copy, and reports any hit under a distinct **`[wrap]`** channel — same shape as the length-stable normalization in `rule.require.bhrowser-citations`
- ⛔ **detect only.** the collapsed copy has lost the line structure, so no edit may be written back through it — a reflow of a legal transcript is its own defect. a `[wrap]` hit means the swap never landed; the cure is in the **source document**, not a re-run
- clamped by `[case10]` (a wrapped value must report `survivors`) and `[case11]` (a correctly-swapped corpus must still verify clean — the looser matcher must not cry wolf)

## ⚠️ the third hazard: an ABORT used to publish the real document

if `doc.pseudonymize` copied each source into the **publish** directory and swapped it in place, then for the width of the swap loop that directory held a byte-for-byte copy of the real document under the pseudonymized filename. an abort there reads as a partial success:

| file | state after an abort at file N |
|------|-------------------------------|
| 1 … N-1 | ✅ correctly swapped |
| **N** | ⛔ **the real document** |
| N+1 … | absent |

the synthetic marker is written *after* the swap, so file N carries no caution — and **the likeliest trigger needs no bug**: an operator who interrupts a long run.

✅ the swap runs on a temp file and lands with a single `mv`, so an abort leaves file N **absent** rather than **real** — the safe, detectable direction. `perl` is checked up front, since an absent `perl` was the dependency failure that produced exactly this abort.

## .the rule

| you want to... | do this |
|----------------|---------|
| publish a real document as an example | `doc.pseudonymize --mode apply`, then `--verify` |
| swap one name "just this once" | write the pair into the map and run the skill |
| check your own swap | `--verify`. an eyeball is not a check |
| publish the source PDF | **do not.** see below |

### 📄 transcripts only — never the source PDF

a PDF carries identifiers in three places, and the skill reaches one:

| channel | swept by a text swap? |
|---------|----------------------|
| the text layer | ✅ |
| the **pixels** | ❌ |
| the **metadata** — author, producer, creation date, original filename | ❌ |

publish the transcript; keep the source local.

## ⛔ the map is the RE-IDENTIFICATION KEY

the map maps every synthetic value back to its real one. commit it and every pseudonymized artifact becomes reversible in one step — strictly worse than a corpus never swapped, because the artifacts now *look* safe.

- the map is gitignored, and `doc.pseudonymize` **refuses to run** against a map that git tracks or does not ignore. do not route around it
- the map never goes into a handoff, a paste, or a message

## 🎯 do NOT over-scrub

a published real document is valuable because it shows what a real one looks like. scrub past the identifiers and you delete exactly that.

| swap it | keep it |
|---------|---------|
| entity name, person name | share counts, par value, authorized totals |
| SSN, EIN, ITIN | statutory language, form numbers, section headings |
| home and business addresses | the date sequence of the transaction |
| state file / registry numbers | the incorporation service and registered-agent boilerplate |
| envelope and audit-trail ids | whatever a reader must see to learn the shape |

a state **file number** goes, because it indexes a public registry that returns the real entity. the **share count** stays, because it is the whole lesson.

## .the marker is not optional

every output carries a conspicuous synthetic-document notice on its first line. without it, a pseudonymized charter is indistinguishable from a real one, and someone downstream will cite it as a record of an entity that does not exist.

## 🚩 confirm the SKILL is current before you trust its verdict

`--verify` is only as good as the build behind it. measured: `--verify` returned `survivors: 0` on a corpus whose filenames still carried a real name — `dist/`, which the role resolves skills through, held a build from before the path check existed. the tell: two independent guarantees failed in one run; one broken assertion is a bug, two at once is usually version skew. when a verify result surprises you, confirm which copy executed before you hunt for a logic error.

## .enforcement

- a hand swap of an identifier in a document = **blocker**
- a pseudonymized artifact committed without a passed `--verify` = **blocker**
- a map that git tracks, or that is not ignored = **blocker**
- a source PDF published because its transcript verified clean = **blocker**
- an output without the synthetic-document marker = **blocker**
- a swap that removes statutory text, share counts, or form structure = **nitpick**

## .see also

- `rule.forbid.hand-transcription` — never re-type a document
- `rule.require.deterministic-redaction` — never hand-draw a mask
- `rule.require.collision-checked-pseudonyms` — pick the synthetic names this
  swaps *to*; our default example corp, and why a near-variant is a hazard
- `doc.pseudonymize` — the skill, and `[case1]` of its test, which clamps the
  longest-first property
- `pii.scan` — the pre-commit backstop that catches what a swap missed
