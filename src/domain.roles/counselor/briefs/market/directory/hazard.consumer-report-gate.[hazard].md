# hazard.consumer-report-gate

> **recommendation disclaimer.** this recommendation is offered to the best of our knowledge, based
> on the information found in research — it carries **no guarantee of success or outcome**, and it must
> be reviewed by a licensed professional (attorney / CPA / licensed advisor) against your own real
> scenario and current law before any reliance. it is groundwork for that review, not a substitute
> for it.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## .what

a public directory page about a **natural person** becomes a **consumer report** the moment a reader
is expected to use it for an eligibility decision — and once it does, there is **no lawful form** for
it as an open public page.

the hazard is that this transition happens **without any change to the page**. the same rows, the
same words, the same badges. what changes is who reads it and why.

three properties make it dangerous:

1. **the trigger is the reader's use, not the publisher's intent** — § 1681a(d)(1) captures a report *"used or
   expected to be used"* for eligibility.
2. **the transition is invisible** — no new field appears; the page does not know it has become a
   regulated instrument.
3. **the destination is not a stricter mode** — § 1681b(a) permits a consumer report *"under the
   following circumstances **and no other**"*, and an open page satisfies none of them.

> ⚠️⚠️ **this brief is FEDERAL-ONLY, and that is not sufficient.** two of the five swept states —
> **IN** (Ind. Code ch. 24-4-18) and **TX** (Tex. Bus. & Com. ch. 109) — regulate the publisher with
> **no consumer-report gate at all**, so their triggers sit **below** FCRA's. ⛔ **one can be outside
> FCRA and still inside them, and their remedies are expressly cumulative with FCRA's.** read
> *"the `[research]` row was run"* section near the end before you rely on the gate analysis here.

## .why

`[observed]` **15 U.S.C. § 1681a(d)(1):** a consumer report is any communication of information

> *"bearing on a consumer's credit worthiness, credit standing, credit capacity, character, general
> reputation, personal characteristics, or mode of living **which is used or expected to be used or
> collected in whole or in part for the purpose of serving as a factor in establishing the consumer's
> eligibility for**…"* credit, insurance, **employment**, or other authorized purposes.

⭐ **"character, general reputation, personal characteristics"** covers exactly what a directory
publishes. the definition does not need financial data — a license history and a civil record sit
squarely inside the described content. **the only thing that keeps a directory outside is the purpose
clause.**

## ⚠️ the gate is a wall, not a dial

`[observed]` **§ 1681b(a):** a consumer reporting agency may furnish a consumer report *"under the
following circumstances **and no other**."*

`[inferred]` the enumerated circumstances all presuppose an identified user with a certified
permissible purpose at the time the report is furnished. **an open public page has no user to certify
and no purpose to determine.** so a page that crosses the gate does not become a regulated directory
— it becomes a publication with no lawful form, and the whole apparatus arrives with it: § 1681e(b)
accuracy procedures, § 1681c time bars, dispute duties, and adverse-action notice.

⚠️ **note the dispute duty is the one item on that list that binds OUTSIDE the gate too** — TX
§§ 109.003–109.004 impose a channel duty with no consumer-report trigger. so it is not a price paid
to cross; it is owed either way. ⭐ **canonical: `rule.require.dispute-channel.[rule].md`.**

> **§ 230 is a shield you can lose. FCRA is a room you cannot be in.**

## the crossings — ranked by how quietly they happen

| how the gate gets crossed | how visible | `[tag]` |
|---|---|---|
| an **employer or staffing platform** becomes a known user segment | ⛔ invisible — no product change at all | `[inferred]` |
| **marketing copy** invites a screening use — "check your next hire" | ⚠️ visible, and easy to ship by accident | `[inferred]` |
| an **API or bulk export** is sold to a user who screens | ⚠️ visible at deal time, invisible thereafter | `[inferred]` |
| a **lender or insurer** uses the page to price a risk | ⛔ invisible | `[inferred]` |
| a **GC vets a sub as an employee** rather than as a contractor | ⛔ invisible, and common | `[observed]` on the distinction — § 1681a(h) |

`[observed]` **§ 1681a(h)** narrows the employment branch: *"employment purposes"* means a report
used *"for the purpose of evaluating a consumer for employment, promotion, reassignment or retention
**as an employee**."*

`[inferred]` a homeowner who hires an independent contractor sits outside it. a general contractor
who takes on a sub **as an employee** sits inside. **the same page, two readers, two regimes** — and
an open page cannot see which one reads it.

## ⭐ subject grain closes the gate entirely

`[observed]` **§ 1681a(c): "The term 'consumer' means an individual."**

so at **entity grain the hazard does not exist.** a report about a company is not a consumer report
whatever the reader intends. this is the strongest single argument for entity grain as the subject of
record — it does not mitigate the hazard, it **removes** it.

⚠️ **but the person-grain leak paths carry the hazard back in.** the qualifier's license, the sole
proprietor, the DBA — each is person data on an entity profile, and each is a row an employer could
use to screen. see `define.boundary.entity-grain-vs-person-grain`.

## .the mitigations

`[inferred]`, in order of strength:

1. ⭐ **entity grain as the subject of record** — the only structural answer. it removes rather than
   reduces.
2. **person-grain data only by the person's opt-in** — consent does not cure FCRA (see below), but a
   consent flow creates a record of purpose and narrows what person data exists to be misused.
3. **terms that refuse the use** — prohibit employment, credit, and insurance screening expressly.
4. **design that refuses the use** — no bulk export, no screening-shaped API, no "run a check on"
   affordance.
5. **evidence that refuses the use** — marketing copy, sales collateral, and support macros all
   consistent with 3 and 4. `[inferred]` a terms clause contradicted by a landing page is worth
   little.

⛔ **what does NOT mitigate it:**

- **the subject's consent.** `[observed]` § 1681a(d)(1) keys on the **purpose the report is used
  for**, not on whether the subject agreed. a consumer's written authorization is what a CRA must
  *obtain* for employment purposes — it is not an exemption from being one.

  ⭐ **cited, not re-derived** — the verbatim § 1681b(b)(1) text and the structural argument that
  closes this live in the brief that owns it:

  > **`define.boundary.consent-cures-privacy-not-fcra.[lesson].md`**

- **a disclaimer alone.** the test is *"used or expected to be used"*; a disclaimer contradicted by
  known use does not control.
- **§ 230.** it shields a provider from others' content, not from a regulatory classification of the
  provider's own publication.

## .the test

> **"is there any known or reasonably expected reader who uses this page to decide whether a person
> gets a job, a loan, insurance, or a lease?"**

- no, and the subject is an entity → the gate cannot be crossed
- no, and the subject is a person → outside, **but this is a standing discipline, re-tested at every
  scope change**
- yes → the page has no lawful form; stop and reshape it

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this body of
> law is not tripped. the convention is declared in `hazard._.catalogue` § *the convention*; the
> original mandates live in `rule.*` files. **a `[hazard]` that enforces is checkable, not normative.**

- person-grain profile data marketed toward, or knowingly used for, employment / credit / insurance
  screening = **blocker** (§ 1681b(a) leaves no lawful form)
- a bulk export or screening-shaped API over person-grain data = **blocker**
- reliance on the subject's consent as the FCRA answer = **blocker** (it addresses privacy, not the
  purpose gate)
- ⭐ **the refusal is three obligations, not one — each is independently a blocker.** the vision
  demands *"refuse this use in terms, in design, and in evidence, not merely disclaim it"*, and a
  single line about contradiction lets two of the three live only in prose:
  - **terms** — no clause that expressly prohibits employment / credit / insurance screening use =
    **blocker**
  - **design** — a bulk export, a screening-shaped API, a *"run a check on"* affordance, or any
    surface that makes the screening use the convenient one = **blocker**, *whatever the terms say*
  - **evidence** — marketing copy, sales collateral, support macros, or a sales motion that invites
    the screening use = **blocker**, *whatever the terms say*
- a terms clause that refuses screening use, contradicted by marketing or product affordances =
  **blocker** — the composite failure, and the most likely one

⚠️ **why all three hold the same severity rather than terms alone.** the gate at § 1681a(d)(1) turns
on what a report is *"used or expected to be used"* for, and a court reads expectation from
**conduct**. so terms are the weakest of the three evidentially and the cheapest of the three to
write — exactly the shape that invites a checklist reader to satisfy one and call the row done.
**the affordance and the sales motion are what a plaintiff will point at.**
- ⭐⭐ **the phrase "background check" as a product label, feature name, or marketing promise =
  blocker.** the gate at § 1681a(d)(1) turns on whether a report is *"used or expected to be used"*
  for an eligibility purpose — and **a product name is the cheapest possible evidence of
  expectation.** a directory that calls its own surface a background check has authored the
  plaintiff's exhibit: it need not be shown that any user screened anyone, only that the publisher
  said this is what the product is for
- ⚠️ any near-synonym that carries the same expectation — *"screening"*, *"vetting"*, *"pre-hire
  check"*, *"we check them so you don't have to"* = **blocker** on the same ground. the rule is
  about the **expectation the words create**, not about one banned string

⭐ **this is the cheapest guardrail in the whole cluster and the easiest to lose.** it costs a word
choice and it forecloses an entire evidentiary path. it is listed here — rather than left in prose —
precisely because a marketing decision made months later, by someone who never read a hazard brief,
is exactly how it gets broken.

## .note on the five-state rule

`rule.require.five-state-baseline` is **not** triggered: FCRA is federal and this brief draws no
state-law redline. ⚠️ state analogues exist — several states have their own consumer-report and
background-screen statutes, and at all-jurisdictions scope they are un-swept. **flagged as
`[research]` rather than omitted.**

### ⚠️⚠️ the state analogues are WORSE than "analogues exist"

the sweep in `hazard.sealed-record-republication.[hazard].md` found that **two of the five states
regulate the publisher with NO consumer-report gate at all** — so their triggers sit **below** FCRA's,
and this brief's federal-only analysis is **incomplete** for them.

| state | the statute | its trigger | tag |
|---|---|---|---|
| **IN** | Ind. Code ch. 24-4-18, *"Criminal History Providers"* | a *"criminal history provider"* who delivers a *"criminal history report"* — ⛔ **no permissible-purpose element, no consumer-report element** | `[observed]` |
| **TX** | Tex. Bus. & Com. ch. 109 | a *"business entity that … publishes criminal record information"* **and** charges a fee to remove or correct — ⛔ **no consumer-report element** | `[observed]` |
| **CA** | Cal. Civ. Code § 1786.18 (ICRAA) | ✅ inside a report gate, but a **state** one, with a tighter 30-day re-verify duty than FCRA imposes | `[observed]` |

⛔⛔ **the structural consequence: a publisher can be OUTSIDE FCRA and still INSIDE these.** to stay
outside the consumer-report gate is a **complete** answer to FCRA and only a **partial** answer to
the state layer.

⭐ **and the state remedies are expressly cumulative, not alternative** — `[observed]` in each
statute's own text: Ind. Code § 24-4-18-8(b) preserves a parallel FCRA action for the individual, and
Tex. Bus. & Com. § 109.008 declares its remedies *"not exclusive."*

⭐ **cited, not re-derived** — the verbatim text of both, and their capture provenance, live in the
brief that owns the sweep:

> **`hazard.sealed-record-republication.[hazard].md`** — the primary five-state sweep

**so FCRA compliance does not discharge them, and the state statutes say so in their own text.**

⭐ **what still holds, and holds harder:** both state statutes reach only **criminal record
information about a natural person**. so the two structural answers this brief already ranked
first — ⭐ **entity grain**, and ⭐ **publish no adverse item** — close the state layer for the same
reason they close the federal one. **the correction sharpens the exposure and leaves the mitigation
order intact.**

⚠️ still `[unverified]`: whether a directory of this shape meets IN § 24-4-18-2's definition of
*"criminal history provider"*. that definition was not captured and it decides the entire Indiana cell.

## .sources

1. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
2. [15 U.S.C. § 1681b](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim)
3. [15 U.S.C. § 1681c](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681c&num=0&edition=prelim)
4. [15 U.S.C. § 1681e](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim)
5. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
6. [Ind. Code ch. 24-4-18 (*Criminal History Providers*)](https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/)
7. [Ind. Code § 24-4-18-8](https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/section-24-4-18-8/)
8. [Tex. Bus. & Com. Code ch. 109](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.109.htm)
9. [Cal. Civ. Code § 1786.18](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1786.18)
10. license status vocabulary — `src/domain.roles/licenser/briefs/industry=.all/define.what-licenses-mean.md`

captured via browser per `rule.require.bhrowser-citations`. ⚠️ the Indiana cells cite the Justia
section-grain mirror — fallback noted per `rule.require.five-state-baseline`.

## .publishability

☀️ **fullsun** (share) — statutory analysis of a federal definition, quoted verbatim. no client
identity, no coverage data, no applied mechanic.

⚠️ **one item is held back.** the *mitigation ladder* above is generic and ships here; **a given
adopter's assessment of which rung it stands on, and where that is thin**, is a plaintiff's roadmap
and belongs in a restricted artifact. per `rule.require.publishability-triage`'s clean line: *"the law
says X"* → fullsun; *"we assess our position under X as Y, and our weak spot is Z"* → 🔒 protect.

## .see also

- `define.boundary.who-speaks-decides-the-regime.[lesson].md` — the two questions, in order
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the axis that removes this hazard
- `hazard.stale-public-record-status.[hazard].md` — the accuracy duty that arrives with the gate
- `rule.require.asymmetric-disclosure.[rule].md` — what may be published while outside the gate
