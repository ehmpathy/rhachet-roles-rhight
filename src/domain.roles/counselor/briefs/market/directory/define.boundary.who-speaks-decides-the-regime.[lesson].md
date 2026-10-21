# define.boundary — who speaks decides the regime

> **not legal advice.** informational only; consult a licensed attorney. every claim is tagged
> `[observed]` (quoted from a captured source), `[inferred]` (reasoning over those sources), or
> `[unverified]` (not yet sourced).

## .what

two different statutes decide what a directory may say, and **neither one turns on the sensitivity
of the fact.** both turn on something about the *speaker* and the *use*:

- **§ 230** asks *who authored the words* — and shields you only for someone else's.
- **FCRA** asks *what the reader is expected to do with them* — and captures you only for eligibility
  decisions.

so the same sentence about the same contractor can be protected, unregulated, or unlawful — decided
entirely by facts that live outside the sentence.

## .why this is the first thing to get right

the intuitive model is that sensitive facts are risky and mundane facts are safe. **that model is
wrong in both directions.** a criminal record republished by a neutral conduit can be protected; a
bland list of license statuses can become a regulated consumer report the moment an employer uses it
to screen a hire.

> **the risk lives in the framing and the audience, not in the fact.**

## .the two questions, in order

### question 1 — who authored it? (§ 230)

`[observed]` **47 U.S.C. § 230(c)(1):** *"No provider or user of an interactive computer service
shall be treated as the publisher or speaker of any information provided by **another information
content provider**."*

`[observed]` **§ 230(f)(3):** *"The term 'information content provider' means any person or entity
that is responsible, **in whole or in part**, for the creation or development of information provided
through the Internet…"*

⭐ **"in whole or in part" is the phrase that decides it.** the shield covers what someone else wrote.
it does not cover what the platform writes *about* what someone else wrote.

| what appears on the page | who authored it | § 230 |
|---|---|---|
| a customer's review, verbatim | the customer | ✅ shielded |
| a court record, reproduced | the court | ✅ shielded `[inferred]` |
| a license status, mirrored from the registry | the state | ✅ shielded `[inferred]` |
| **a summary** of those reviews | ⛔ **the platform** | ⛔ not shielded |
| **a badge** that asserts a status | ⛔ **the platform** | ⛔ not shielded |
| **a label** — "hazard", "risk", "red flag" | ⛔ **the platform** | ⛔ not shielded |

`[inferred]` **every badge a directory renders is its own speech.** the badge is the product, so the
product is precisely the part § 230 does not protect. a directory that believes itself shielded
because its underlying data came from elsewhere has misread the seam.

⚠️ **and § 230 does not reach every claim even where it applies.** `[observed]` § 230(e)(2): *"Nothing
in this section shall be construed to limit or expand any law pertaining to **intellectual
property**."*

⭐ **that carve-out is not academic — it names the two layers a badge most plausibly triggers**, so
the statutes it lets through are set out here rather than left as a category:

| what survives § 230 | authority | owner brief |
|---|---|---|
| **false association** — confusion as to *affiliation* or *approval* | `[observed]` 15 U.S.C. § 1125(a)(1)(A) — liability for a designation *"likely to cause confusion … as to the affiliation, connection, or association of such person with another person, or as to the origin, sponsorship, or approval of his or her goods, services, or commercial activities"* | `hazard.badge-implies-endorsement` |
| **right of publicity** — the person-grain analogue | `[observed]` Fla. Stat. § 540.08(1) bars use of *"any natural person"*'s name *"for purposes of trade or for any commercial or advertising purpose"*; `[observed]` N.Y. Civ. Rights Law § 51 reaches a name used *"for advertising purposes or for the purposes of trade"* | `hazard.unclaimed-profile-right-of-publicity` |

⛔ **so the shield is grain-split in the opposite direction from FCRA, and that inversion is the
finding.** FCRA falls away at entity grain and bites at person grain. the § 230(e)(2) carve-out does
the reverse: at **entity** grain it lets **trademark** through, at **person** grain it lets **ROP**
through. **there is no grain at which the carve-out is empty** — a directory that reaches for § 230
against a badge claim is wrong on both tracks, for different reasons.

### question 2 — what is the reader expected to do with it? (FCRA)

`[observed]` **15 U.S.C. § 1681a(d)(1):** a consumer report is a communication *"bearing on a
consumer's credit worthiness, credit standing, credit capacity, character, general reputation,
personal characteristics, or mode of living **which is used or expected to be used or collected in
whole or in part for the purpose of serving as a factor in establishing the consumer's eligibility
for**…"* credit, insurance, **employment**, or other authorized purposes.

⭐ **the trigger is "used or expected to be used."** not published, not sold, not labelled — *used*.
the same page becomes a consumer report in the hands of a reader who uses it for an eligibility
decision, and the publisher's intent is not the test.

| the reader | what they do with it | regime |
|---|---|---|
| a homeowner picks a contractor | a purchase decision | ✅ outside FCRA `[inferred]` |
| a GC vets a sub **as an employee** | an employment decision | ⛔ inside FCRA |
| a lender or insurer prices a risk | an eligibility decision | ⛔ inside FCRA |

`[observed]` **§ 1681a(h)** narrows the employment branch usefully: *"employment purposes"* means a
report used *"for the purpose of evaluating a consumer for employment, promotion, reassignment or
retention **as an employee**."* `[inferred]` a homeowner who hires an independent contractor is
likely outside it; a general contractor who takes on a sub **as an employee** is likely inside.
**same page, two readers, two regimes.**

## ⭐ .the gate that is not a mode

being "inside FCRA" is not a stricter setting. `[observed]` **§ 1681b(a)** permits a consumer
reporting agency to furnish a consumer report *"under the following circumstances **and no other**."*

⭐⭐ **and the impossibility is `[observed]`, not `[inferred]` — § 1681e(a) states the mechanism.**
§ 1681b(a)'s *"and no other"* reaches the same conclusion, but only as an inference. **§ 1681e(a) is
more direct than that inference, and it names three acts an anonymous page cannot perform:**

> `[observed]` **§ 1681e(a):** *"These procedures shall require that prospective users of the
> information **identify themselves**, **certify the purposes** for which the information is sought,
> and certify that the information will be used for no other purpose. Every consumer reporting agency
> shall make a reasonable effort to **verify the identity of a new prospective user** … **prior to**
> furnishing such user a consumer report."*

| what § 1681e(a) demands | can an open public page do it? |
|---|---|
| the user identifies themselves | ⛔ no — the reader is anonymous |
| the user certifies a permissible purpose | ⛔ no — there is no point at which a certification could be taken |
| the agency verifies that identity **before** furnishment | ⛔ no — publication precedes any reader |

⛔ **so a page that crosses the gate does not become a regulated page. it becomes a page that cannot
lawfully exist in that form** — and the machinery arrives with it: `[observed]` § 1681e(b)'s
*"reasonable procedures to assure **maximum possible accuracy** of the information concerning the
individual about whom the report relates"*; `[observed]` § 1681c(a)(2)'s clock on *"Civil suits, civil
judgments, and records of arrest"*; and `[observed]` § 1681k(a)(2)'s standard that a public-record item
is up to date only where *"the **current public record status** of the item at the time of the report
is reported."*

⭐ **the sequence is what forecloses the form, not the substance.** every other FCRA duty is something
a diligent publisher could choose to satisfy. § 1681e(a) demands an act **prior to** furnishment, from
a reader who does not exist until after publication — so it is unsatisfiable by any amount of care.
**a compliance budget cannot buy it.**

> **§ 230 is a shield you can lose. FCRA is a room you cannot be in.**

## ⚠️ .subject grain gates question 2 entirely

`[observed]` **§ 1681a(c): "The term 'consumer' means an individual."**

so at **entity grain** question 2 does not arise — a report about a company is not a consumer report
regardless of the reader's purpose. question 1 (§ 230) still applies, because it turns on authorship
rather than on who the subject is.

| | § 230 — who speaks | FCRA — what the reader does |
|---|---|---|
| business entity | ✅ applies | ⛔ **cannot apply** |
| natural person | ✅ applies | ✅ applies when the purpose gate is crossed |

see `define.boundary.entity-grain-vs-person-grain` — that axis sits above this one.

## .the test

before publishing any statement on a profile, ask **both**:

1. **"did the platform write this, or is it a reproduction of someone else's words?"**
   the platform wrote it → § 230 does not shield it → it must stand on truth and accuracy alone.
2. **"is any expected reader using this to decide someone's eligibility?"**
   yes, and the subject is a person → the page cannot lawfully exist in its current form.

⚠️ a "no" to question 2 is a **standing discipline**, not a one-time design choice. it can be
falsified later by a marketing page that invites employers, a partnership with a staffing platform,
or an API customer who screens hires.

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this boundary
> is not crossed. the convention is declared in `hazard._.catalogue` § *the convention*; the original
> mandates live in `rule.*` files. **a `[lesson]` that enforces is checkable, not normative.**

- a badge, summary, or label treated as § 230-shielded content = **blocker** (it is the platform's
  own speech under § 230(f)(3))
- a conclusion-word applied to third-party data — "hazard", "risk", "red flag" — = **blocker** (it
  converts shielded reproduction into the platform's own assertion)
- a person-grain surface marketed toward, or knowingly used for, employment or lending decisions =
  **blocker** (§ 1681b(a)'s *"and no other"* leaves no lawful form)
- a claim that § 230 answers a trademark or right-of-publicity exposure = **blocker**
  (§ 230(e)(2) preserves intellectual-property law)

## .note on the five-state rule

`rule.require.five-state-baseline` is **not** triggered: this brief draws no state-law redline **of
its own**. its two load-bearing axes — § 230 authorship and the FCRA purpose gate — are federal.

⚠️ **the FL and NY statutes quoted under § 230(e)(2) are cited as EXAMPLES of what the carve-out lets
through, not as a sweep.** the full five-state right-of-publicity analysis lives in
`hazard.unclaimed-profile-right-of-publicity`, and the five-state consent-defense sweep lives in
`define.boundary.diligence-answer-vs-published-claim`. **two examples are not a baseline, and the
distinction is stated rather than left for a reviewer to infer from the count.**

⛔ **a prior version of this note read *"both authorities are federal"* while the `.sources` list
carried three state statutes.** the sentence was true of the body and false of the list — see the
padding correction under `.sources`.

the state layer these questions hand off to — false light, right of publicity, sealed-record
republication — is carried in the hazard briefs, where the sweeps are run. **stated so a reviewer can
tell a scope boundary from an omission.**

## .sources

1. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
2. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
3. [15 U.S.C. § 1681b](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim)
4. [15 U.S.C. § 1681c](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681c&num=0&edition=prelim)
5. [15 U.S.C. § 1681e](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim)
6. [15 U.S.C. § 1681k](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681k&num=0&edition=prelim)
7. [15 U.S.C. § 1125](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1125&num=0&edition=prelim)
8. [Fla. Stat. § 540.08](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html)
9. [N.Y. Civ. Rights Law § 51](https://www.nysenate.gov/legislation/laws/CVR/51)

captured via browser per `rule.require.bhrowser-citations`.

## .date researched

2026-08-02 to 2026-08-03: the capture dates of the sources listed in `.sources`, each read via browser.

## .publishability

☀️ **fullsun** (share) — statutory text and the structural distinction between two federal regimes.
no client identity, no coverage data, no applied mechanic. the analysis is derivable by anyone who
reads § 230(f)(3) beside § 1681a(d)(1); its value is that it is **correct**.

## .see also

- `_taxonomy/_.glossary.[summary].md` — the term index
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the axis above this one
- `hazard.consumer-report-gate.[hazard].md` — question 2 as a standing hazard
- `hazard.badge-implies-endorsement.[hazard].md` — the § 230(e)(2) carve-out
- `rule.require.asymmetric-disclosure.[rule].md` — why the platform's own speech is kept to favorable facts
