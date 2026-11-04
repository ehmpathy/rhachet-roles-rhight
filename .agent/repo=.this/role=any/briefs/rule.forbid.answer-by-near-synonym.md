# rule.forbid.answer-by-near-synonym

> **a cell that is CORRECT can settle a question it was never asked.**

when two artifacts in a domain carry near-identical names, a true answer about
one silently becomes a false answer about the other. no fact is wrong, no
citation is fabricated, and the deliverable is still wrong.

## .why — this defect is invisible to every provenance check

each guard this repo runs asks whether an answer is **well-sourced**. not one
asks whether it is an answer to **the question in front of you**:

| the guard | what it checks | does it fire here? |
|---|---|---|
| `quote.verify` | the quoted bytes are in the source | ⛔ no — the quote is real |
| the byte-count floor | the page loaded | ⛔ no |
| the soft-404 string | the page exists | ⛔ no |
| the size-collision check | the urls are distinct | ⛔ no |
| a re-pull | the source still says it | ⛔ no — it does |

⇒ **so the only detector is the NOUN itself**, read closely enough to notice
that it names a different object than the one you were asked about.

## .the measured case

a Delaware revival packet's own cover page asks for one item:

> *"For the convenience of processing your order in a timely manner, please
> include a **cover letter** with your name, address and telephone/fax number
> to enable us to contact you if necessary."*

a route file's submit table carried a column that read:

```
| pay by card/ACH | … | cover memo? ⛔ no |
```

that column is **correct**. it is also about a different document:

| the near-synonym | what it is | whose document |
|---|---|---|
| **"Filing Cover Memo" / "Document Filing Sheet"** | the Division's OWN routing form — priority squares, check number, return method | ⛔ **theirs** |
| **"cover letter"** | a letter on our letterhead with name, address, telephone | ✅ **ours** |

and the memo's own instruction sheet scopes it outright:

> *"Only use this form if sending to our office by mail or courier service and
> are paying by Check."*

⇒ so `cover memo? ⛔ no` is true for the card path and says **naught** about the
cover letter. the table answered by proxy, and the letter nearly did not get
written.

### the cure did not move sideways

the repo had already drawn this distinction, in two briefs, after a fabricated
quote said "cover letter" where the source said "Filing Cover Memo". the
correction never reached the submit file — the one artifact a human reads at
send time.

⇒ no consumer was *wrong*; each was correct about its own noun, so no re-grep of
the corrected term would have found them.

## .the test — asked of the NOUN, before the answer

> **"is the item this cell names the item I was asked about?"**

and then, immediately:

> **"who authored the document each noun names?"**

⭐ **authorship is the sharpest discriminator available**, because near-synonyms
in a filings domain almost always straddle it: one is the agency's instrument
and one is yours. `cover memo` is theirs; `cover letter` is ours. two words
apart, opposite owners, opposite rules — `rule.forbid.reproduce-a-supplied-form`
governs the first and expressly does not reach the second.

## .the shapes

| smell | example |
|---|---|
| two nouns apart by **one word** | cover letter · cover **memo** |
| a noun that appears in **both** an agency form and your own drafted document | *certificate*, *statement*, *notice*, *report* |
| a ⛔/✅ column authored for a **channel** question and reused for a **content** question | the case above |
| a correction whose diff touched only files that **define** the term | the sideways-cure failure |

## .the practice

1. when a correction distinguishes two near-synonyms, **grep the other one
   too**. the corrected term finds the files that were wrong; only its **twin**
   finds the files that were right about the wrong question.
2. give the two nouns **separate rows**, never one row with a shared verdict. a
   shared row is what makes the proxy-answer possible.
3. state the **author** in the row. `⛔ no (theirs, check path only)` cannot be
   misread as an answer about our letter.
4. when a procedural page is open for one question, **read the whole page** —
   the same pull that settled this also yielded a filed-document precondition
   nobody had asked it for.

## .enforcement

- a question settled by a cell whose noun names a different artifact = **blocker**
- a correction that distinguishes two near-synonyms, with no sweep of the
  **twin** term = **blocker** (the cure has not moved sideways)
- two near-synonyms that share one verdict row = **blocker**
- a ⛔/✅ verdict with no author named, where both parties author a document of
  that name = **nitpick**

## .see also

- `rule.forbid.reproduce-a-supplied-form` — governs **their** form and expressly
  not ours; the authorship line above is what routes between them
- `rule.require.bhrowser-citations` — the provenance guards this defect walks
  past
- `rule.require.verify-upstream-before-you-author` — the adjacent failure: an
  upstream fact that moved. here the fact never moved; the **question** did

