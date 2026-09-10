# ref.tcpa-consent-elements

## .what

the **federal** elements of consent under the TCPA, quoted from the regulation and the statute that
create them. this is the reference behind the question *"what counts as proof that someone agreed to
be contacted?"*

three separate things are often collapsed into the single word "consent", and the law keeps them
apart:

1. **the standard** — for a telemarketing purpose, the regulation requires **prior express written
   consent** (PEWC), an enumerated list of elements, not a general state of agreement
2. **the burden** — consent is an **affirmative defense**, so the sender must produce it; the
   recipient never has to disprove it
3. **the expiry** — consent is revocable by **any reasonable method**, on a deadline, and a sender
   **may not** designate an exclusive channel for revocation

> **not legal advice.** informational groundwork for counsel to validate. this brief is **federal
> only** — several states impose their own, sometimes stricter, consent definitions, and those are
> not addressed here (see `the honest gap`).

---

## .why

the word *consent* carries a colloquial sense — "they said yes" — that the regulation does not use.
the text describes a **document with enumerated contents**, addressed to a named seller, bound to a
named number, and revocable on a clock the recipient controls.

the gap between those two senses is where programs fail. a company that reasons in the colloquial
sense builds a capture flow that records agreement; the regulation asks for a record that carries
seven specific elements and stays current. **so the elements have to be read as the text gives them,
one at a time, before any question about proof or exposure can be posed.**

this brief exists to be the place those elements are quoted rather than paraphrased — because a
paraphrase of `(f)(9)` is exactly what drops the per-number requirement, which is the element most
often absent from a real record.

---

## the standard — `47 C.F.R. § 64.1200(f)(9)`

the regulation defines the term rather than leaves it to argument. verbatim, from the official eCFR
(title 47 current as of 7/28/2026):

> "The term prior express written consent means an agreement, in writing, bearing the signature of
> the person called that clearly authorizes the seller to deliver or cause to be delivered to the
> person called advertisements or telemarketing messages using an automatic telephone dialing system
> or an artificial or prerecorded voice, and the telephone number to which the signatory authorizes
> such advertisements or telemarketing messages to be delivered."

with a required disclosure that the person

> "is not required to sign the agreement (directly or indirectly), or agree to enter into such an
> agreement as a condition of purchasing any property, goods, or services"

and an electronic-signature provision, so a compliant record need not be on paper.

### the elements, decomposed

| element | what the text requires |
|---------|------------------------|
| **in writing** | an agreement in writing — oral assent does not satisfy this standard |
| **signature** | *"bearing the signature of the person called"*; an e-signature qualifies |
| **clear authorization** | it must *"clearly authorize"* delivery — a general assent to be contacted is not the same as authorization of these messages |
| **the seller named** | authorization runs to *"the seller"*, so it is party-specific |
| ⭐ **the specific number** | *"the telephone number to which the signatory authorizes"* — consent attaches to **a number**, not to a person |
| **the technology** | authorization covers an *"automatic telephone dialing system or an artificial or prerecorded voice"* |
| **the non-condition disclosure** | the record must disclose that signature is not a condition of purchase |

⭐ **the per-number element is the one most often missed.** a record that proves a person agreed, but
cannot tie that agreement to the number actually dialed, does not match what the text describes.

## which purposes trigger the written standard

`§ 64.1200(a)(2)` and `(a)(3)` condition telemarketing calls on *"the prior express written consent
of the called party"*. both paragraphs are **live in the text current as of 7/28/2026** — a fact
worth a plain statement, because a 2025 vacatur is widely read to have removed the written-consent
requirement, and it did not (see `.see also`).

`(a)(3)` also carries exemption machinery a purpose-only read misses: a numerical-limit regime (no
more than three calls per consecutive 30-day period for several call classes), plus carve-outs for
emergency purposes, tax-exempt nonprofits, and HIPAA-covered "health care" messages.

## the burden — consent is an affirmative defense

`47 U.S.C. § 227(c)(5)` closes with a sentence that states who must prove what:

> "It shall be an affirmative defense in any action brought under this paragraph that the defendant
> has established and implemented, with due care, reasonable practices and procedures to effectively
> prevent telephone solicitations in violation of the regulations prescribed under this subsection."

⭐ **two consequences follow from the affirmative-defense posture, and they point in opposite
directions:**

- the **sender** carries the production burden. a plaintiff need not show consent was absent; the
  sender must show it was present, for that number, at that time
- on the do-not-call track the statute names a **defense with no consent element at all** — a
  documented, exercised program of *"reasonable practices and procedures"* is itself pleadable

## the expiry — `47 C.F.R. § 64.1200(a)(10)`

consent is not permanent, and the recipient controls its end. revocation may be made by

> "any reasonable method to clearly express a desire not to receive further calls or text messages"

with the reply keywords *"stop"*, *"quit"*, *"end"*, *"revoke"*, *"opt out"*, *"cancel"*, and
*"unsubscribe"* reasonable per se. the duty and its deadline, verbatim:

> "All requests to revoke prior express consent or prior express written consent made in any
> reasonable manner must be honored within a reasonable time not to exceed ten business days from
> receipt of such request."

⭐ **and the paragraph forecloses the obvious workaround:**

> "Callers or senders of text messages … may not designate an exclusive means to request revocation
> of consent."

so a program that recognizes only a literal `STOP`, or routes revocation solely through a web form,
does not match what the text describes — regardless of how clearly that channel is disclosed.

⚠️ **the duty is not confined to the autodialer regime.** `(a)(10)` applies to calls under
*"paragraphs (a)(1) through (3) **and (c)(2)**"*, so it reaches the do-not-call track too.

### when the revocation duty began

the duty's start date is not the date of the order that created it. `89 FR 15756` (Mar. 5, 2024)
created the paragraph, but its own **DATES** section says, verbatim:

> "Amendatory instruction 2 (adding 47 CFR 64.1200(a)(12)) is effective April 4, 2024, and amendatory
> instruction 3 (revising 47 CFR 64.1200(a)(9)(i)(F) and (d)(3) and adding 47 CFR 64.1200(a)(10) and
> (11)) is delayed indefinitely."

the delay was lifted by a later notice, `89 FR 82518` (Oct. 11, 2024), *"Final rule; announcement of
effective dates"*:

> "The effective date for the amendments to 47 CFR 64.1200(a)(9)(i)(F) and (d)(3) and the addition of
> 47 CFR 64.1200(a)(10) and (11), published March 5, 2024, at 89 FR 15756 is **April 11, 2025**."

⚠️ **the sequence matters for any retrospective question.** the ten-business-day duty is live from
**2025-04-11**, not from the date of the 2024 order.

## a related date, for the element list itself

`89 FR 5098` (Jan. 26, 2024) amended `(f)(9)` — the prior-express-written-consent definition quoted
above. its `DATES` section (the Federal Register's own label for it), verbatim:

> "the amendment to 47 CFR 64.1200(f)(9), in instruction 6, … effective January 27, 2025"

the Eleventh Circuit vacated the relevant part of that order on **January 24, 2025** — three days
before that amendment's own effective date. so the amended text never operated, and the element list
in force is the one quoted at the head of this brief.

---

## the honest gap

- **state law is not addressed here.** several states define consent themselves, sometimes more
  strictly and sometimes they reach media the federal definition does not — Florida's
  `§ 501.059(1)(g)`, for instance, expressly covers *"text message, or voicemail transmission"*.
  ⚠️ **that Florida line is an illustration, not a survey** — it was read only for the point it
  illustrates. **the survey now exists elsewhere**: `ref.mini-tcpa-five-state` carries the five-state
  matrix on both the consent and the penalty dimension, and ⭐ its result bears directly on this
  brief — **California requires a consent this brief's elements cannot produce**, because `§ 2874`
  demands a live operator on the call rather than a record in an archive. (Indiana states a
  live-operator route too, but as an **alternative** to consent, so a valid written record still
  reaches Indiana.)
  **a sender's actual standard is the strictest that applies in a served state, which may not be the
  federal one — and may not be Florida's either.** 🔶 that survey is **statutory text only**; no case
  law was read in any of the five, and states outside the baseline remain unexamined.
- **what a compliant record looks like operationally is not addressed.** the *elements* are law; a
  schema, a retention period, and a chain of custody are design, and they belong in a separate brief.
- **the retention period is not addressed here** — a record that expires before the claim window
  closes cannot be produced when it is needed. the window and its two divergent floors are covered in
  `hazard.unprovable-consent-record`.
- **who must hold the record** where a lead generator captured it is not addressed here;
  `§ 64.1200(d)(3)` is quoted and analyzed in `hazard.unprovable-consent-record`.
- **no case law on what satisfies these elements was read.** the text states the elements; how courts
  have applied them to real records is a separate question and is **not** answered here.

## key takeaways

| question | answer |
|----------|--------|
| is oral agreement enough for a telemarketing call? | the regulation describes *"an agreement, in writing, bearing the signature of the person called"* |
| does consent attach to a person or a number? | ⭐ **a number** — the text requires *"the telephone number to which the signatory authorizes"* |
| does an e-signature qualify? | the paragraph carries an electronic-signature provision |
| who must prove consent? | the **sender** — it is an affirmative defense |
| did the 2025 vacatur remove the written-consent standard? | `(a)(2)` and `(a)(3)` still condition telemarketing on prior express **written** consent in the text current as of 7/28/2026 |
| how long to honor a revocation? | *"a reasonable time not to exceed ten business days from receipt"* |
| can a sender require a specific opt-out channel? | the paragraph says a caller *"may not designate an exclusive means"* |
| since when has the revocation duty been live? | **2025-04-11**, per `89 FR 82518` |
| is this the whole standard? | no — state definitions stack on top and are **not** covered here |

## .publishability

☀️ **fullsun** (share) — a read of published federal primary law: one codified regulation, one
statute, three Federal Register documents, and two published federal opinions. no client identity, no
client-specific mechanic, no design choice settled, **neutral both-sides voice**. the subject
throughout is the documents, not a party.

triaged per `rule.require.publishability-triage`; authored in neutral legal voice per
`rule.require.fullsun-facts-not-tactics`.

## .see also

- `define.what-the-2025-vacatur-did-and-did-not-do.[lesson].md` (why the written-consent baseline
  survived the vacatur)
- `define.boundary.formation-not-customer-status-is-the-axis.[lesson].md` (whether claims aggregate)
- `hazard.unprovable-consent-record.[hazard].md` (the record that must carry these elements, and the
  four ways it becomes unproducible)
- `ref.tcpa-exposure-tracks.[ref].md` (what a failure of these elements is worth, on three tracks)
- `../../../../insurer/briefs/hazard.either-question-can-defeat-gl-coverage-of-a-tcpa-claim.[hazard].md`
  (whether a CGL answers the claim)

## .sources

1. [47 C.F.R. § 64.1200 — (f)(9) PEWC elements, (a)(2)/(3) written-consent baseline, (a)(10) revocation (eCFR, official; title 47 current as of 7/28/2026)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200)
2. [47 U.S.C. § 227 — incl. § 227(c)(5) affirmative defense (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
3. [89 FR 5098 (Jan. 26, 2024, FCC doc 2023-28832) — DATES: the (f)(9) amendment effective January 27, 2025](https://www.federalregister.gov/documents/2024/01/26/2023-28832/targeting-and-eliminating-unlawful-text-messages)
4. [89 FR 15756 (Mar. 5, 2024, FCC doc 2024-04587) — the revocation Report and Order; DATES: instruction 3 delayed indefinitely](https://www.federalregister.gov/documents/2024/03/05/2024-04587/strengthening-the-ability-of-consumers-to-stop-robocalls)
5. [89 FR 82518 (Oct. 11, 2024, FCC doc 2024-23605) — announcement of effective dates; (a)(10) effective April 11, 2025](https://www.federalregister.gov/documents/2024/10/11/2024-23605/strengthening-the-ability-of-consumers-to-stop-robocalls)
6. [Insurance Marketing Coalition Ltd. v. FCC, No. 24-10277 (11th Cir. Jan. 24, 2025) — full published opinion](https://media.ca11.uscourts.gov/opinions/pub/files/202410277.pdf)
7. [Facebook, Inc. v. Duguid, No. 19-511 (U.S. Apr. 1, 2021) — slip opinion](https://www.supremecourt.gov/opinions/20pdf/19-511_p86b.pdf)

## .date researched

2026-07-30
