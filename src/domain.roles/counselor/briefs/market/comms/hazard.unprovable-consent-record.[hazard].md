# hazard.unprovable-consent-record

## .what

under the TCPA, consent is an **affirmative defense**. the sender carries the production burden, so a
sender who cannot produce a record — for **that number**, at **that time**, in **that form** — is in
the same position as a sender who never had consent at all.

*"how is consent proved?"* is the common formulation, and the answer is a reframe: **the law does
not ask whether a person agreed. it asks what a party can put in front of a court.** the standard's
elements live in `ref.tcpa-consent-elements`; this brief is about the **record** that carries them,
and the four ways a record that once existed becomes unproducible.

> **not legal advice.** informational groundwork for counsel to validate. this brief is **federal
> only** — states impose their own record and retention duties, and those are not addressed here
> (see `the honest gap`).

---

## .why

three federal provisions, read together, put the whole weight on the sender's records:

| the provision | what it does |
|---------------|--------------|
| `47 U.S.C. § 227(c)(5)` | makes reasonable practices and procedures an **affirmative defense** — a matter the defendant pleads and proves |
| `47 C.F.R. § 64.1200(f)(9)` | defines what the consent record must **contain** — in writing, signed, per-number, with disclosures |
| `47 C.F.R. § 64.1200(d)(3)` | ⭐ says the liability **does not delegate** where a third party holds the record |

⭐ **the asymmetry is the point.** a plaintiff pleads that a call was made to their number. they do
not have to prove consent was absent. the sender has to prove it was present — which means the
sender's evidentiary position is fixed years earlier, at the moment of capture, by a system nobody
designed for litigation.

---

## the four ways a record becomes unproducible

each is a distinct failure with a distinct legal cause. a program can pass three and fail the fourth.

### 1. the record does not name the number

`§ 64.1200(f)(9)` requires, verbatim, *"the telephone number to which the signatory authorizes such
advertisements or telemarketing messages to be delivered."*

so a record that proves a **person** agreed does not, on its own, match what the text describes. the
regulation ties the authorization to a **number**, and ties that number to the **signatory** — so a
record whose subject is a person, an account, or an address rather than a number is a record about a
different fact than the one `(f)(9)` names. ⬜ **no decision was read on how tight a court requires
that tie to be**, so how much distance the text tolerates is unresearched here.

### 2. the record expired before the claim did

the TCPA states no limitations period of its own, so a claim runs on the federal catch-all,
`28 U.S.C. § 1658(a)`:

> "Except as otherwise provided by law, a civil action arising under an Act of Congress enacted after
> the date of the enactment of this section may not be commenced later than **4 years** after the
> cause of action accrues."

⚠️ **the statutory text is quoted; that it governs a TCPA claim is an inference** — `§ 1658` reaches
Acts enacted after 1990-12-01 and the TCPA was enacted in 1991, so it qualifies on the statute's own
terms, but the first clause *"except as otherwise provided by law"* leaves room and **no decision was
read**. treat the number as a practical floor, not a settled rule.

⭐ **a separate, express regulatory floor sits beside it, and it is longer.**
`§ 64.1200(d)(6)` requires a **do-not-call request** to be recorded and honored, and that record
retained for **five years**. so a program that sets one retention policy for both records will
satisfy neither cleanly — the two duties have different sources, different durations, and different
subjects.

| the record | source of the floor | duration |
|------------|--------------------|----------|
| suppression / do-not-call request | `§ 64.1200(d)(6)` — an express regulatory duty | **5 years** |
| consent record | ⚠️ **no express federal retention rule found**; the practical floor is the claim window | **4 years**, from accrual |

⚠️ **note the shape of that table.** the suppression floor is a **rule**. the consent floor is an
**inference from the limitations period** — no federal paragraph found in this research says how long
a consent record must be kept. a record destroyed on a shorter schedule is not a rule violation; it
is simply an affirmative defense the sender can no longer plead.

### 3. the record is held by someone else

`§ 64.1200(d)(3)` addresses the lead-generation and vendor case directly:

> "If such requests are recorded or maintained by a party other than the person or entity on whose
> behalf the call is made, the person or entity on whose behalf the call is made **will be liable**
> for any failures to honor."

⭐ **the record may be delegated; the liability may not.** a vendor's assurance that its leads are
compliant is a contractual promise between the vendor and the sender. it is not the artifact a court
asks for, and it does not move the burden.

⚠️ **the paragraph's own subject is the *suppression* record, not the consent record.** whether the
same non-delegation principle reaches consent records is **not settled by this text**, and no case
was read on the point. the paragraph is cited for what it says; the parallel is flagged as an open
question, not asserted.

### 4. the record is stale — consent expired and the sender did not know

`§ 64.1200(a)(10)` makes consent revocable by *"any reasonable method to clearly express a desire not
to receive further calls or text messages"*, honored within *"a reasonable time not to exceed **ten
business days** from receipt of such request."*

and it forecloses the obvious workaround:

> "Callers or senders of text messages … may not designate an exclusive means to request revocation
> of consent."

so a valid, complete, per-number consent record can be **correct at capture and wrong at send**. a
program that recognizes only a literal `STOP`, or routes revocation solely through a web form, will
hold records it believes are live and which the regulation treats as revoked.

⚠️ **the duty is live from a specific date.** `89 FR 15756` created `(a)(10)` but delayed it
indefinitely; `89 FR 82518` set the effective date at **2025-04-11**. a retrospective question about
messages sent before that date turns on a different rule than one about messages sent after.

---

## what the statute says a defense looks like

⭐ **the sharpest find in this brief is that the record is not merely evidence — one federal track
names the *program* as the defense.** `§ 227(c)(5)` closes:

> "It shall be an affirmative defense in any action brought under this paragraph that the defendant
> has established and implemented, with due care, reasonable practices and procedures to effectively
> prevent telephone solicitations in violation of the regulations prescribed under this subsection."

and `§ 64.1200(c)(2)(i)` enumerates five standards a caller must meet to claim a related regulatory
safe harbor — the closest the regulation comes to a description of what "reasonable practices and
procedures" contains:

| # | the standard, as the paragraph frames it |
|---|------------------------------------------|
| 1 | **written procedures** to comply with the do-not-call rules |
| 2 | **trained personnel** in those procedures |
| 3 | a **recorded** internal suppression list |
| 4 | a national-registry version *"obtained … no more than **31 days** prior to the date any call is made"* |
| 5 | **purchase compliance** — use of the registry consistent with its terms |

⚠️ **this is a defense on the do-not-call track (`§ 227(c)`), and it has no consent element at all.**
it does not answer a `§ 227(b)` autodialer claim. a sender can hold flawless consent records and
still lose on `(c)`, and can hold a flawless program and still lose on `(b)`.

---

## severity

**conditional** — **outside where the message required consent in the first place**, **blocker where
it did.**

whether consent was required at all turns on the message's purpose, the dialer, and the number type
— axes this brief does not decide. `Facebook v. Duguid` narrowed what counts as an automatic
telephone dialing system, so a manually dialed live call may sit outside `§ 227(b)` entirely and the
record question with it. **that is the condition, and it is the only one.**

where consent *was* required, the hazard is not partial. the burden sits on the sender by statute, so
an unproducible record does not weaken the defense — it removes it. and none of the four failures
above is curable after a claim arrives: a number that was never captured cannot be retro-fitted, a
destroyed record cannot be restored, a vendor's file cannot be subpoenaed into the sender's own
production on the sender's timetable, and a revocation the system never recognized already happened.

⚠️ **the exposure scales with the send, not with the incident.** `§ 227(b)(3)` gives $500 per
violation with no cap, trebled at the court's discretion where the violation was willful or knowing —
so a single systemic record defect is not one failure, it is one failure per message. the three
federal tracks and their figures are set out in `ref.tcpa-exposure-tracks`.

---

## the honest gap

- **state law is not addressed here.** states impose their own consent definitions and, in some
  cases, their own record and pre-suit duties. **the five-state matrix now exists** in
  `ref.mini-tcpa-five-state` — ⭐ **and it names a hazard this brief's frame cannot express.** two of
  the five states accept a **live-operator** consent obtained mid-call, which is not a record at all:
  there is no artifact to produce, so "can you prove it?" is the wrong question in those states and
  the right question becomes "can you prove the operator asked?" **a sender's actual duty is the
  strictest that applies in a served state.**
  🔶 that matrix is **statutory text only** — no case law was read in any of the five, so **the
  record question specifically** remains unexamined at state level even now.
- **no case law on what satisfies a record was read.** the text states the elements and the burden;
  how courts have evaluated real consent records — screenshots, database rows, vendor attestations,
  audit logs — is a separate question and is **not** answered here. this is the largest gap in the
  brief.
- **the retention floor for a *consent* record is an inference**, not a rule. no federal paragraph
  found in this research states one; the 4-year figure is derived from `§ 1658(a)`, whose application
  to the TCPA was itself not confirmed against a decision.
- **`(d)(3)`'s subject is the suppression record.** its extension to consent records is flagged as
  open, not asserted.
- **what a compliant record looks like operationally is not addressed** — a schema, a capture flow, a
  chain of custody, and a retention job are **design**, and a design recommendation carries different
  publication duties than a statement of law. they belong in a separate brief under
  `rule.require.recommendation-disclaimer`.
- **individual and officer exposure is not addressed**, nor is whether an arbitration clause with a
  class waiver defeats the aggregation that makes the per-message figure large.

## key takeaways

| question | answer |
|----------|--------|
| who must prove consent? | the **sender** — it is an affirmative defense |
| does a record of the person suffice? | ⭐ **no** — the text requires *"the telephone number to which the signatory authorizes"* |
| how long must a consent record survive? | ⚠️ **no express federal rule found**; the practical floor is the claim window, ~**4 years** per `§ 1658(a)` |
| how long must a suppression record survive? | **5 years** — an express duty at `§ 64.1200(d)(6)` |
| can a vendor hold the record for us? | it may hold it; `(d)(3)` says liability for a failure to honor stays with the entity on whose behalf the call was made |
| is a vendor's compliance assurance the record? | no — it is a contract term, not the artifact a court asks for |
| can a valid record go stale? | yes — revocation by *"any reasonable method"*, honored within **ten business days** |
| may we require a specific opt-out channel? | the paragraph says a caller *"may not designate an exclusive means"* |
| is a compliance program itself a defense? | on the **do-not-call** track, yes — `§ 227(c)(5)`, with no consent element |
| does that defense answer an autodialer claim? | no — `§ 227(c)(5)` is scoped to actions under that paragraph |

## .publishability

☀️ **fullsun** (share) — generic public-law hazard; one codified regulation, one statute, one general
limitations provision, and two Federal Register documents. no client identity, no client-specific
mechanic, no design choice settled, **neutral both-sides voice**. triaged per
`rule.require.publishability-triage`; authored in neutral legal voice per
`rule.require.fullsun-facts-not-tactics`.

## .see also

- `ref.tcpa-consent-elements.[ref].md` (what the record must contain — the standard behind this hazard)
- `ref.tcpa-exposure-tracks.[ref].md` (what an unproducible record is worth, on three federal tracks)
- `define.what-the-2025-vacatur-did-and-did-not-do.[lesson].md` (why the written-consent baseline survived)
- `define.boundary.formation-not-customer-status-is-the-axis.[lesson].md` (whether claims aggregate)
- `../../../../insurer/briefs/hazard.either-question-can-defeat-gl-coverage-of-a-tcpa-claim.[hazard].md`
  (whether a CGL answers the claim once it lands)

## .sources

1. [47 C.F.R. § 64.1200 — (f)(9) per-number element, (a)(10) revocation, (c)(2)(i) safe-harbor standards, (d)(3) third-party records, (d)(6) five-year retention (eCFR, official; title 47 current as of 7/28/2026)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200)
2. [47 U.S.C. § 227 — incl. § 227(b)(3) damages and § 227(c)(5) affirmative defense (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
3. [28 U.S.C. § 1658 — the federal catch-all four-year limitations period (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title28-section1658&num=0&edition=prelim)
4. [89 FR 15756 (Mar. 5, 2024, FCC doc 2024-04587) — the revocation Report and Order; DATES: instruction 3 delayed indefinitely](https://www.federalregister.gov/documents/2024/03/05/2024-04587/strengthening-the-ability-of-consumers-to-stop-robocalls)
5. [89 FR 82518 (Oct. 11, 2024, FCC doc 2024-23605) — announcement of effective dates; (a)(10) effective April 11, 2025](https://www.federalregister.gov/documents/2024/10/11/2024-23605/strengthening-the-ability-of-consumers-to-stop-robocalls)
6. [Facebook, Inc. v. Duguid, No. 19-511 (U.S. Apr. 1, 2021) — slip opinion; cited for the scope condition in `severity`](https://www.supremecourt.gov/opinions/20pdf/19-511_p86b.pdf)
7. [Insurance Marketing Coalition Ltd. v. FCC, No. 24-10277 (11th Cir. Jan. 24, 2025) — full published opinion](https://media.ca11.uscourts.gov/opinions/pub/files/202410277.pdf)

## .date researched

2026-07-30
