# rule.forbid.reproduce-a-supplied-form

> **when an agency supplies a form, FILL THE AGENCY'S FILE. never rebuild it.**

a reproduction is a new document that resembles an official one. the agency's
own artifact — the PDF, the DOCX, the portal field set — is the only thing that
carries their layout, their revision stamp, their field names, and their
fillable widgets. a rebuild carries none of it and looks, to the clerk who
receives it, like a stranger's document.

## .why — a reproduction is WRONG IN A DIRECTION NO GUARD CATCHES

the defect is not that the text drifts. a careful rebuild can match the agency's
prose word for word and **still be the wrong artifact**:

| what the agency's file carries | what a rebuild carries |
|---|---|
| their typography, margins, rule positions | yours |
| the **revision stamp** (`rev. 08/2023`) baked into the page | a stamp you typed, which is a claim |
| **AcroForm widgets** a clerk's software can read | flat text |
| page-count the fee schedule is priced against | whatever your renderer produced |
| every element they did **not** think to describe | ⛔ none of it |

⇒ so a fidelity check against the extracted *text* passes while the *document*
is wrong. that is the exact shape of a guard that cannot fail.

### the measured case

a Delaware **Certificate for Revival of Charter** was rendered as HTML from a
`pdftotext` extract of the agency's form. the url was earned by nav, the live
PDF was byte-identical, and a guard asserted **23 fragments** of Delaware's own
bytes in the output. every check passed; the artifact was still a rebuild.

the agency's file was a **fillable AcroForm** the whole time:

```
AcroForm  1   /Widget  26   /FT/Tx  26   XFA  0
```

26 named text fields — `street`, `in the City of`, `County of`, `Zip Code`,
`Incorporation date`, `day entity went void`, `signature of authorized officer`
— each a slot the rebuild reinvented in CSS.

and the rebuild had **silently diverged** in three places nobody had named:

| divergence | whose |
|---|---|
| `— President` appended to the caption `Authorized Officer` | ⛔ invented |
| a footer line with the fee and the revision stamp | ⛔ invented |
| article 1's second blank (*"and, if different, the name under which…"*) | ⛔ omitted |

⭐ **none of the three is visible to a text-fidelity assert**, because two are
additions and one is an omission of a blank. a fragment-match guard can only
see what it was told to look for.

🎯 and the human caught it in one sentence — *"what you rendered is totally
different than what is found here"* — by the one method the tooling never ran:
**he opened the agency's file and looked at it.**

## .the rule

| the agency supplies… | you must |
|---|---|
| a **fillable** PDF (AcroForm / XFA) | fill the fields, in their file |
| a **flat** PDF | print it, complete it by hand or by overlay **on their page** |
| a DOCX / RTF template | fill their file |
| a **portal form** | use the portal |
| ⛔ **no file at all** — none is published | a drafted document is correct. this rule does not fire |

the last row is the only licence to author. § 312(d) prescribes contents and the
Division's own instruction sheet says *"if you need to add additional
information permitted by statute **you may draft a new document**"* — so a
rebuild is lawful. it is still the wrong move whenever their file would serve,
because lawful and correct are different questions.

## .the test — asked BEFORE any renderer is opened

> **"does the agency ship a file for this?"**

and then, immediately:

> **"have I OPENED it?"**

the second question is the one that gets skipped. a `pdftotext` dump answers
*what does it say*, and says **naught** about what it is — fillable or flat, one
page or three, which fields exist, what the layout looks like to a human.

⇒ **the first move on any agency form is a RENDER, not an extract.** one
`pdf.render --page N` and one look settles it in seconds.

## ⚠️ the seduction — a rebuild is genuinely nicer to build

- a renderer takes arguments; a PDF form takes a field-name map you must discover
- a rebuild is diffable, testable, snapshot-able; a filled PDF is a binary
- a rebuild lets you add a provenance footer, a nicer signature, a tighter layout
- **each of those improvements is a divergence from the document the clerk expects**

⇒ **the filing is the deliverable; the skill is not.**

## ⛔ THE PACKET IS NOT THE DOCUMENT

an agency ships one file. that file is usually **not** one document.

the Delaware revival form is 3 pages and only the last is filed:

| page | what it is | widgets |
|---|---|---:|
| 1 | their cover letter, addressed to the filer | **0** |
| 2 | "Special Instructions" — *"This form is to be used as a Template only."* | **0** |
| 3 | the certificate | **15** |

⇒ to upload all three files **their own instruction sheet into the corporate
record**, and re-prices the filing against their own page rule: *"$189.00. If
the document is more than 1 page, please include $9.00 for each additional
page."*

⇒ **derive the filed pages from where the WIDGETS are** — never from a
hardcoded index, which a revision moves silently, and never from a page count,
which says naught about which page is operative.

measured: a 3-page packet was written out as the executed certificate while the
route's own checklist carried `- [ ] **the executed PDF is one page** — each
extra is +$9.00`, unticked. **a checklist a human reads at send time cannot
catch a defect a tool introduces at build time** — the guard belongs in the tool.

## ⛔ A REPEATED FIELD NAME IS A SECOND *RULE*, NOT A SECOND COPY

agency forms wrap a long blank onto a continuation line, and the two widgets
get one name with a `(2)` on the lower:

```
The name of the corporation is        x=277 y=588 w=240   <- rule 1, the short
                                                              tail after their
                                                              printed prose
The name of the corporation is (2)    x= 90 y=574 w=426   <- rule 2, the
                                                              full-width line
                                                              beneath it
```

a human fills rule 1 and spills onto rule 2 only when the value runs long. so
**a value that starts on rule 2 reads as a blank first line** — the form looks
completed and is wrong in a way a reader will not question, because a name on
the second line looks deliberate.

measured: `name` was mapped to the `(2)` widget under a code comment that
claimed the `(2)` names were the certificate's copy of fields repeated from the
instruction sheet. false — pages 1 and 2 carry zero widgets. the comment
defended a choice already made (`rule.forbid.ai-tells` add-then-defend, in code).

⚠️ **the render could not refute it** — the name sat on a rule, in their
typography. only the **census** did: 15 widgets, all on one page, each `(2)`
pair 14pt apart in y.

⇒ so overflow onto a continuation rule is a **deliberate, named input**, never
an inference, and the fill reports which rule each value landed on.

## .what a form-fill skill owes

when you do build the tool, it fills their file and it proves it did:

1. **their file, embedded** — `refs/effectiveAt=$date.$slug.pdf`, the bytes
   themselves, per `rule.require.embed-source-bytes`
2. **a re-verify playbook** — re-pull live, compare by **sha256**, so a revision
   is loud rather than silent
3. **field names read OFF the file**, never invented — and a refusal when a named
   field is absent, because an absent field means the revision moved
4. **a CENSUS mode** — every widget, its page, and its rectangle, printed
   from their bytes. a render answers *"does this look right?"*; only a census
   answers *"is this the widget I meant?"*, and the two failures above are both
   invisible to the first question
5. **a render of the output**, so the visual check is a real step with a real
   command
6. ⛔ **no additions.** no footer, no caption suffix, no omitted blank. if a field
   is empty in their form, it is empty in yours
7. ⛔ **only the operative pages.** their instruction sheet is not your filing

## .enforcement

- a rebuilt artifact where the agency supplies a fillable file = **blocker**
- a rebuilt artifact where the agency supplies **any** file = **blocker**
- a form artifact shipped with no render ever opened = **blocker**
- content **added** to an agency form (footer, caption suffix, provenance stamp)
  = **blocker** — it is a document they did not publish
- a field of the agency's form **omitted** from the output = **blocker**
- an agency's **instruction or cover pages** shipped as part of the filing = **blocker**
- the operative page chosen by a **hardcoded index** rather than derived from
  where the widgets sit = **blocker** (a revision moves it silently)
- a value placed on a **continuation rule** with its first rule left blank = **blocker**
- a **comment that justifies** a field-map choice, where a census would settle
  it = **blocker** — the justification is the tell, per `rule.forbid.ai-tells`
- a text-fidelity assert offered as evidence the artifact is correct = **nitpick**
  (it proves the prose, and says naught about the document)

## .see also

- `rule.forbid.hand-transcription` (transcriber) — the twin: never re-type a
  document's contents. this rule extends it — never re-**draw** a document either
- `rule.forbid.guessed-urls` — how the agency's file gets found, and the
  stale-revision failure that motivates the sha256 re-verify
- `rule.require.embed-source-bytes` — why their file lives beside the brief
- `pdf.render` (transcriber) — the one-command look this rule turns on
- `prove-the-harness-can-fail` — a 23-fragment assert that cannot see an
  addition or an omission is a guard that passes while blind
