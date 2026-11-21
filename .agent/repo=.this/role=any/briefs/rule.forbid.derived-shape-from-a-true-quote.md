# rule.forbid.derived-shape-from-a-true-quote

> **a true quote about a WHOLE licenses no claim about its PARTS. when you build
> a table, a field list, or a sequence out of one sentence, the sentence must
> assert that shape — never merely permit it.**

the defect: a correctly-quoted source sentence is used as the warrant for a
**structural** claim it does not make. every provenance guard passes, because
the quote is real and the citation is right. only the **inference step** is
wrong, and the inference step is the one part no tool reads.

## .why it survives every check this repo runs

| the guard | what it checks | does it fire? |
|---|---|---|
| `quote.verify` | the quoted bytes are in the source | ⛔ no — the quote is verbatim |
| the byte-count floor | the page loaded | ⛔ no |
| the soft-404 string | the page exists | ⛔ no |
| a re-pull | the source still says it | ⛔ no — it does |
| a reviewer's read | the claim has a citation | ⛔ no — it has a good one |

⇒ **the citation is what makes it look checked.** an unsourced table invites
doubt; a sourced one closes the question, and the sourced one is where this
defect lives.

## .the measured case

a revival route derived a field-by-field upload table from one Division
sentence:

> *"The system will create the cover memo using the information entered at the
> time of the upload."*

the derivation, stated outright in the file:

> *"⇒ **the memo's fields ARE the upload form's fields**, because the memo is
> the memo the upload generates."*

the table was then filled with the **paper** memo's fields — priority, entity
name, file number, certified copies, good standing, apostille — and labelled
`🟡 derived, not observed`.

**a walk of the form refuted it four ways:**

| the derived claim | the observed form |
|---|---|
| entity name + file number on the form | ⛔ absent from page 1 |
| certified copies / good standing / apostille | ⛔ absent from page 1 |
| one priority choice, priced by the fee row | ⭐ the tier carries its **own 7:00pm receipt cutoff**, stated only on the form |
| one file per request | ⭐ the control is **plural** |

the source sentence is true. it promises the memo is *generated from* what you
enter. it promises **no page-for-page
correspondence**, no field set, and no order — and the table claimed all three.

## .the test — asked of the INFERENCE, never of the quote

> **does the sentence ASSERT this shape, or merely fail to contradict it?**

asserts it → the derivation holds · fails to contradict it → you have a
**hypothesis**, and it must be labelled one · you cannot tell → it is the second
case.

then the sharper one:

> **what would I see if the shape were wrong, and would this quote still be
> true?**

⇒ if the quote survives the shape's refutation, the quote never carried the
shape. that is the whole rule, and it is a one-line check.

## .the shapes

| smell | why it is this defect |
|---|---|
| a sentence about **generation** read as a claim about **layout** | the measured case |
| a sentence about a **whole** read as a claim about each **part** | *"the packet contains X"* → *"page 2 contains X"* |
| a sentence about a **category** read as a claim about a **member** | *"expedite is available"* → *"expedite costs $Y"* |
| a `⇒` or *"because"* that introduces a **table** | the strongest cue — a table has a cardinality, and a sentence rarely states one |
| a derived artifact that carries a **verbatim citation** | the citation is warranted for the quote and is silently borrowed by the structure |

⇒ the `⇒` before a table is the free detector. a table commits to a field set,
an order, and a count; when one sentence feeds it, ask which of those three the
sentence stated.

## .the practice

1. **label the hypothesis in every cell**, not only above the table — a reader
   who scrolls to a row reads an unhedged cell as a fact.
2. **name the observation that would settle it** — *"one walk of the form"*. an
   unfalsifiable derivation stays unwalked forever.
3. **keep the derived table after it is refuted, with the refutation beside
   it.** it is the only artifact that can teach **how** the inference failed.
4. **sweep the consumers** — a derived table is copied into checklists and
   walkthroughs. the refutation must reach every one, or the cure did not move
   sideways (`rule.forbid.answer-by-near-synonym`).

## .the bound

this does **not** forbid derivation. a route cannot wait on an observation for
every claim, and a labelled hypothesis is worth far more than an absent one.

what it forbids is a derivation that **presents as an observation** — an
unhedged table, a cell with no `🟡`, a `⇒` that reads as an entailment where it
is a guess.

## .enforcement

- a structural claim (a field set, an order, a count) derived from a sentence
  that asserts none of them, presented unhedged = **blocker**
- a derived table whose hedge sits only in its preamble, so its rows read as
  observed = **blocker**
- a derivation with no named observation that would settle it = **blocker**
- a refuted derivation deleted rather than kept beside its refutation =
  **nitpick** (the lesson goes with it)

## .see also

- `rule.forbid.answer-by-near-synonym` — the adjacent defect: the quote is true
  and answers a **different question**. here it answers the right question and
  carries a **weaker claim** than the structure built on it
- `rule.require.bhrowser-citations` — the provenance guards this walks past
- `rule.require.verify-upstream-before-you-author` — the third case: the fact
  **moved**. here it never moved and was never enough
- `rule.require.permanent-yields` (secretary) — why the refuted table stays
