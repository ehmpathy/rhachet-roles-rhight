# rule.require.consent-provenance-record

## .what

**REQUIRE** a consent record that is **per-number**, **append-only**, **self-authenticating**, and
**retained past the claim window** — and that a named human can testify how it works.

`ref.tcpa-consent-elements` states what the record must **contain**. `hazard.unprovable-consent-record`
states the four ways it becomes unproducible. this brief is the third question those two leave open:
**what does a record have to be, operationally, to survive contact with a court?**

> **recommendation disclaimer.** this recommendation is offered to the best of our knowledge, based on the information found in research — it carries **no guarantee of success or outcome**, and it must be reviewed by a licensed professional (attorney / CPA / licensed advisor) against your own real scenario and current law before any reliance. it is groundwork for that review, not a substitute for it.

> **not legal advice.** informational groundwork for counsel to validate. this brief is **federal
> only** — states impose their own record and retention duties, and those are not addressed here.

---

## .why — ⭐ the two failures the regulation does not warn you about

the regulation is a **contents** specification. it says what a compliant record holds. it is silent on
the two questions a court actually asked when real records were put in front of it, and **both were
lost on grounds no schema review would catch.**

### ⭐ 1. a record is not evidence until it is *admissible*

in `Thomas v. Abercrombie & Fitch` (E.D. Mich. 2018), a party's own carrier records were attacked as

> "woefully short of admissible evidence"

because they

> "did not contain a certification from a representative of AT & T as required by Fed. R. Evid.
> 803(6)(D) to show that business record are admissible."

the court stated the governing limit plainly:

> "The Court cannot consider evidence at summary judgment that a jury could not consider at trial."

⭐ **so a record can satisfy `§ 64.1200(f)(9)` in every element and still be worth none of it**,
because the Federal Rules of Evidence — not the FCC's regulation — decide whether a court may look at
it. a compliance program that tracks only the regulation's contents list has verified half the
requirement.

⚠️ **this decision cuts both ways, and the honest read matters.** the *plaintiff's* records were the
inadmissible ones. but the disposition went **against the sender anyway**: the court held the
defendants' evidence

> "insufficient to show that defendants made the necessary disclosures to plaintiff regarding
> transmission of future marketing text messages, or that plaintiff gave her prior express written
> consent to receive future marketing text messages from defendants. Accordingly, summary judgment is
> denied to defendants on plaintiff's TCPA claim."

**both sides' records failed, on different grounds.** the plaintiff's for form, the sender's for
substance. that is the clearest available demonstration that these are two independent tests.

### ⭐ 2. a database nobody can explain proves none of what it holds

in `United States v. Dish Network` (C.D. Ill. 2017), a real lead system was put in evidence and
failed for reasons that have no counterpart in any compliance checklist:

> "Dish presented very little competent evidence on how the Lead Tracking System was formulated or
> how calling lists were derived from the Lead Tracking System."

> "Dish presented no testimony from any representative of Database Marketing or anyone else who had
> pe[rsonal] … knowledge to testify regarding the operation of the Lead Tracking System"

and the substantive result:

> "The Court finds that Dish failed to prove that the Lead Tracking System consisted of contact
> information for the individuals who inquired about Dish Network programming. Rather, the sparse
> evidence in these two emails seems to indicate that the Lead Tracking System included the contact
> information for **anybody who came in contact with Dish for almost any reason** and provided contact
> information."

⭐ **that is the per-number defect of `(f)(9)`, proven in a courtroom.** a system that cannot separate
*who authorized contact* from *who merely touched the business* holds no consent record at all — it
holds a mailing list. and the proof failed a second time for want of **a witness**: a record with no
custodian who can explain it is a file, not testimony.

---

## the requirements

each row states what to require and the provision or decision it answers to. the **left** column is
the design duty; the **right** column is the authority it traces to.

| # | require | traces to |
|---|---------|-----------|
| 1 | ⭐ **key the record to the NUMBER** — the row's identity is the phone number authorized, not the person or account | `§ 64.1200(f)(9)`: *"the telephone number to which the signatory authorizes"*; `Dish` (a system that captured all contacts failed) |
| 2 | **store the disclosure text actually displayed, versioned** — the exact words on screen at capture, not a pointer to current terms | `(f)(9)` requires the non-condition disclosure; `Thomas` (defendants' proof of *"the necessary disclosures"* was held insufficient) |
| 3 | **append-only** — a consent event is never updated or deleted, only superseded | the affirmative-defense posture: the artifact is evidence of a past act, not current state |
| 4 | ⭐ **make it self-authenticating** — capture the custodian attestation at the source, not at litigation | `Fed. R. Evid. 803(6)(D)`, applied in `Thomas` |
| 5 | ⭐ **name a custodian who can explain the system** — a human with personal knowledge of how records are made and lists derived | `Dish`: *"no testimony from any representative … who had pe[rsonal] knowledge"* |
| 6 | **retain past the claim window** — see the floor table below | `§ 1658(a)` (4 yrs, inferred); `§ 64.1200(d)(6)` (5 yrs, express) |
| 7 | **ingest revocation from every channel** — not one designated route | `§ 64.1200(a)(10)`: a caller *"may not designate an exclusive means"* |
| 8 | **measure the revocation clock** — ten business days is a deadline, so it is a metric with an alarm, not a service level | `(a)(10)`: *"a reasonable time not to exceed ten business days from receipt"* |
| 9 | **hold the artifact yourself** — a vendor may also hold it; you may not rely on that alone | `§ 64.1200(d)(3)`: the entity on whose behalf the call is made *"will be liable"* |

### the retention floor

⚠️ the two records have **different sources and different durations**, so a single retention policy
satisfies neither cleanly.

| record | source of the floor | duration |
|--------|--------------------|----------|
| suppression / do-not-call request | `§ 64.1200(d)(6)` — an express regulatory duty | **5 years** |
| consent record | ⚠️ **no express federal retention rule found** — the practical floor is the claim window | **4 years** from accrual, per `§ 1658(a)` |

⭐ **five is the simpler single floor**, because it is the longer of the two and the only one that is
a rule rather than an inference. ⚠️ but note what that choice is: a **design convenience**, not a
legal requirement. no federal paragraph found in this research states a consent-retention period.

---

## severity

**blocker where consent was required; not applicable where it was not.**

whether consent was required at all turns on purpose, dialer, and number type — see
`define.boundary.when-consent-is-required-at-all`, which is the brief that belongs first in the read
order. `Facebook v. Duguid` narrowed what counts as an automatic telephone dialing system, so a
manually dialed live call may sit outside `§ 227(b)` and this record duty with it.

where consent **was** required, the defect is not partial. the burden sits on the sender, so a record
that cannot be produced — or cannot be admitted — does not weaken the defense; it removes it. and
`§ 227(b)(3)` prices the failure per message with no stated aggregate cap, so **a systemic record
defect is not one failure, it is one failure per send**. see `ref.tcpa-exposure-tracks`.

⚠️ **none of the nine requirements is retro-fittable.** a number never captured cannot be recovered, a
destroyed record cannot be restored, a custodian who left cannot testify, and a revocation the system
never recognized already happened. every one of them is a build-time decision.

---

## ⚠️ what this brief does NOT settle

- **it is not the do-not-call program.** `§ 227(c)(5)` names a defense of *"reasonable practices and
  procedures"* with **no consent element at all** — a separate record, on a separate track, that a
  perfect consent record does not answer. `Dish` records that the safe harbours are narrower than
  they look: *"The TSR safe harbor applied to Internal List Calls and Registry Calls. The FCC Rule
  safe harbor only applied to Registry Calls."* that program is its own subject.
- **it prescribes no schema, vendor, or storage technology.** the nine requirements are properties a
  record must have; the shapes that carry them are a business decision.

## the honest gap

- 🔶 **two of the four case-law facets searched returned no decisions.** a CourtListener sweep across
  four facets returned decisions on the **burden at summary judgment** and on **per-number
  mismatch**, and **NO-DECISION-FOUND** on both *"screenshot / web-form capture"* and *"vendor lead
  certification"*. ⚠️ **read those as null results, not as proof of absence** — the search terms may
  have missed them. so requirement #2 (versioned disclosure text) and the vendor half of #9 rest on
  the regulation's text plus `Dish`, **not** on a decision squarely about a screenshot or a lead
  certificate.
- ⚠️ **`Thomas` and `Dish` are district-court decisions**, persuasive rather than binding, and
  `Dish`'s companion 2014 opinion was *"vacated in part on reconsideration, 80 F.Supp.3d 917 (C.D.
  Ill. 2015)"* — the passages quoted here are from the 2017 opinion.
- ⚠️ **`Fed. R. Evid. 803(6)(D)` was read as applied in `Thomas`, not from the rule text itself.**
  the certification requirement is quoted as the court described it.
- **`(d)(3)`'s own subject is the suppression record.** whether the same non-delegation principle
  reaches consent records is not settled by that text; requirement #9 is framed conservatively for
  that reason.
- ⭐ **state law is not addressed here, and the five-state matrix that now exists names a case these
  nine properties cannot cover.** `ref.mini-tcpa-five-state` records that **two of the five states
  accept a live-operator consent obtained mid-call** — Indiana as an alternative, California as the
  condition itself. **every property below presumes there is a record to design.** where the state's
  standard is a spoken question on the call, the design problem is not provenance of an artifact but
  **evidence that the operator asked**, which is a different artifact with different properties and
  is **not specified here**. 🔶 the matrix is statutory text only, so **all five states remain
  unexamined on the record question specifically**. a sender's actual duty is the strictest that
  applies in a served state.
- **no decision was read on how long a consent record must be kept.** the 4-year figure is derived
  from `§ 1658(a)`, whose application to the TCPA was itself not confirmed against a decision.

## key takeaways

| question | answer |
|----------|--------|
| what is the record keyed to? | ⭐ **the number** — `(f)(9)`, and `Dish` shows a contact-keyed system that failed on exactly this |
| is a compliant record enough? | ⭐ **no** — it must also be **admissible**; `Thomas`: a court *"cannot consider evidence at summary judgment that a jury could not consider at trial"* |
| what made records inadmissible there? | the absence of a custodian certification under `Fed. R. Evid. 803(6)(D)` |
| what else did a real system fail on? | ⭐ **no witness with personal knowledge** of how it worked — a record with no custodian is a file, not testimony |
| why did the lead database fail substantively? | it held *"anybody who came in contact … for almost any reason"* rather than people who authorized contact |
| how long to retain? | **5 years** is the simpler single floor — but that is a design convenience; only the *suppression* 5-year duty is an express rule |
| may we require one opt-out channel? | **no** — a caller *"may not designate an exclusive means"* |
| does this record defend a do-not-call claim? | ⭐ **no** — `§ 227(c)(5)` is a separate defense with no consent element; a separate program answers it |
| can any of this be added after a claim? | **no** — all nine are build-time decisions |

## .publishability

☀️ **fullsun** (share) — generic public law; each of the nine requirements traces to a cited
authority, and the brief prescribes no schema, vendor, or storage technology — no client identity, no
client-specific mechanic, no design choice settled. triaged per `rule.require.publishability-triage`;
authored in neutral legal voice per `rule.require.fullsun-facts-not-tactics`.

## .see also

- `define.boundary.when-consent-is-required-at-all.[lesson].md` (was consent required at all — read first)
- `ref.tcpa-consent-elements.[ref].md` (what the record must contain — the standard this implements)
- `hazard.unprovable-consent-record.[hazard].md` (the four ways a record becomes unproducible)
- `ref.tcpa-exposure-tracks.[ref].md` (what an unproducible record is worth, per message)
- `_taxonomy/_.glossary.[summary].md` (the index that orders these briefs)

## .sources

1. [47 C.F.R. § 64.1200 — (f)(9) per-number element and non-condition disclosure, (a)(10) revocation and the exclusive-means bar, (d)(3) third-party records, (d)(6) five-year suppression retention (eCFR, official; title 47 current as of 7/28/2026)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200)
2. [47 U.S.C. § 227 — § 227(b)(3) per-violation damages; § 227(c)(5) the affirmative defense with no consent element (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
3. [28 U.S.C. § 1658 — the federal catch-all four-year limitations period (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title28-section1658&num=0&edition=prelim)
4. [Thomas v. Abercrombie & Fitch Co., 301 F. Supp. 3d 749 (E.D. Mich. 2018) — admissibility of records at summary judgment; Fed. R. Evid. 803(6)(D) certification; summary judgment vacated and denied to defendants](https://www.courtlistener.com/opinion/7329426/thomas-v-abercrombie-fitch-co/)
5. [United States v. Dish Network LLC, 256 F. Supp. 3d 810 (C.D. Ill. 2017) — the Lead Tracking System failure, the personal-knowledge gap, and the safe-harbor scope limits; judgment for plaintiffs on ten counts](https://www.courtlistener.com/opinion/7325900/united-states-v-dish-network-llc/)
6. [89 FR 15756 (Mar. 5, 2024, FCC doc 2024-04587) — the revocation Report and Order](https://www.federalregister.gov/documents/2024/03/05/2024-04587/strengthening-the-ability-of-consumers-to-stop-robocalls)
7. [89 FR 82518 (Oct. 11, 2024, FCC doc 2024-23605) — announcement of effective dates; (a)(10) effective April 11, 2025](https://www.federalregister.gov/documents/2024/10/11/2024-23605/strengthening-the-ability-of-consumers-to-stop-robocalls)
8. [Facebook, Inc. v. Duguid, No. 19-511 (U.S. Apr. 1, 2021) — slip opinion; cited for the scope condition in `severity`](https://www.supremecourt.gov/opinions/20pdf/19-511_p86b.pdf)

## .date researched

2026-07-31
