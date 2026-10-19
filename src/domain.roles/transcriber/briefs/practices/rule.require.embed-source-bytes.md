# rule.require.embed-source-bytes

## .what

every quotation ships with **the bytes it was taken from**, committed beside the brief that quotes it:

```
briefs/<topic>/refs/pulledAt=2026-08-30.de-title8-sc03-registered-agent.txt
briefs/<topic>/refs/effectiveAt=2023-08-01.de-revival-void-form.pdf
```

a url in a provenance table is a **pointer**. the pointer is not enough — the artifact travels with the claim.

## .why

> **a `.gov` url rots, and the claim outlives its evidence.**

a url answers on the day it is written; a claim in a published package lasts years.

| what happens to the pointer | what the reader gets |
|---|---|
| the page moves | a 404, and no way to tell a dead link from a bad claim |
| the page is **re-issued** | different text at the same url — the quote now reads as fabricated |
| the publisher blocks automation | a re-pull that may suspend the reader's own access |

the last is the sharpest: one of this repo's own pulls warns that *automated access may suspend the account* — so a url-only brief asks the reader to take a risk to verify a quote we already had on disk.

## ⛔ THE CURE IS PROMOTION, NEVER A DECLARED GAP

a brief that says *"the source bytes for this quote are not in this repo"* is **honest and useless** — the reader is still empty-handed.

- measured: an npm-published brief reported **11 live quote defects**, every one a **correct quote** — its four agency pulls sat in an ignored `.probe/`, so the brief shipped with **none** of its evidence and the census saw none either
- ⇒ when a quote's source is gitignored, **move the bytes into the published `refs/` tree**. do not write a paragraph about the gap

### 🎯 the whole test is one command

```sh
git check-ignore -v <the source file>
```

a hit means the evidence does not ship.

## ⭐ THE CLUSTER-COUNT DISCRIMINATOR — a free read on a wall of red

a quote census full of `NOT-IN-SOURCE` verdicts has two causes that look identical: the quotes were altered, or the tool was never handed the sources. count the **hosts** the defects cluster under:

| the defects sit under… | the cause |
|---|---|
| **one** source / host | an omitted `--from`. the sources exist; you did not pass them |
| **many** hosts | the sources really are absent. promote them |

- measured at **61:1** on one page — 62 reported defects, 61 of them the tool's own absent input. the first read of a wall of red is *check the source set*, never *the author fabricated this*
- second discriminator: **if the defect list equals the gaps the artifact already declares**, it is an input problem. a fabrication cannot know your source set

## .the stamp is a CLAIM about the bytes

| stamp | asserts | corroborated by |
|---|---|---|
| `pulledAt=YYYY-MM-DD` | *we retrieved these bytes on this date* | the act of retrieval. no line inside the document can confirm it |
| `effectiveAt=YYYY-MM-DD` | *the artifact took effect on this date* | ⛔ **the artifact itself** — read it off the page |

- measured: a subchapter pull stamped `effectiveAt=2025-01-01`, a date nowhere on the artifact — the Delaware Code states its vintage as a chain of session laws (§ 132's last is `85 Del. Laws, c. 48, § 6`), never an effective date. renamed `pulledAt=`
- measured: a form stamped `2024` whose own header reads **`Form 1120 (2025)`**

**read the stamp OFF the artifact, or do not make the claim.** `source.promote` refuses an `effectiveAt=` destination whose year appears nowhere in the promoted bytes.

## ⚠️ SLICE FOR SIZE, NEVER FOR RELEVANCE

a slice exists for bulk — a `textContent` read of a modern docs page returns a quarter megabyte against ~12 KB of prose, because a hydration payload rides along. it is **not** a cut down to the section that answers your question: per `rule.require.bhrowser-citations`, when adjacent provisions qualify a rule, the unit of retrieval is the **container**.

- measured: a slice of 8 Del. C. § 132 alone answers *"who is our registered agent?"* — and omits **§ 136, four sections later**, where an agent may resign from a corporation that is **already void**, with notice only to *"its address last known to the registered agent."*
- ⛔ a missed slice marker must **refuse**, never fall through. a fall-through emits the whole document under a filename that promises a section — a filename that **lies about its own bytes**

## .the three guards, and what each one cannot do

| guard | proves |
|---|---|
| `source.promote` | the bytes reached the **published** tree, sliced faithfully |
| `publish.set` `[case3]` | the published tree reached **`dist/`**, so npm carries it |
| `quote.verify` | every block quote **matches** the bytes now beside it |

⚠️ three different questions; each is silent about the other two. measured: `dist/` once shipped **41 compiled playbooks** and **zero** of the 37 `.txt`/`.pdf`/`.json` payloads they produce — `tsc` compiles `.ts` by default and `rsync` ships only its allowlist — so twelve briefs pointed at absent files in the published package.

## ⛔ WHAT THIS DOES NOT PROVE — that the PULL was any good

a blocked page, a soft 404, and a collapsed slug all promote cleanly and all look like evidence. the byte-count check, the body read, and the size-collision check belong **upstream, at the pull** — see `rule.require.bhrowser-citations`.

embedded bytes make a claim **checkable**. they do not make it **true**.

## .enforcement

- a quotation whose source bytes are gitignored, or absent from the repo = **blocker**
- a declared gap written **instead of** a promotion, where the bytes are on disk = **blocker**
- an `effectiveAt=` stamp not read off the artifact = **blocker**
- a slice cut for relevance rather than size, where the container carries a
  provision that qualifies the one you kept = **blocker**
- a missed slice marker that falls through to the whole document = **blocker**
- a `refs/` payload committed but absent from the published package = **blocker**
- a source file with no `pulledAt=` or `effectiveAt=` stamp = **nitpick**

## .see also

- `source.promote` — the skill; slices with a refusal guard, checks the stamp,
  and exits 2 on a partial promotion
- `quote.verify` — proves the quotes match the bytes this rule puts beside them
- `rule.forbid.hand-transcription` — the root: the deterministic extract is the
  artifact of record. this rule says that artifact must **travel with the claim**
- `rule.require.bhrowser-citations` — how the bytes are pulled, and every way a
  pull can pass its guards and still be the wrong document
- `rule.forbid.guessed-urls` — how the url is earned before any of this
- `publish.set` `[case3]` — the test that makes `refs/` payloads reach `dist/`
