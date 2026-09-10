# define.boundary.when-consent-is-required-at-all

## .what

**the prior question.** every other brief in `comms/` presumes consent was required and asks what it
must contain, how it is proved, and what it costs to lack it. this brief asks the question those
presume: **was consent required for this call at all?**

the federal answer turns on **three axes that operate independently**, plus a set of carve-outs that
can permit contact where a consent-only read would forbid it:

| axis | the question it asks | where it lives |
|------|----------------------|----------------|
| **number** | what kind of line is dialed? | `47 C.F.R. § 64.1200(a)(1)(i)–(iii)`, `47 U.S.C. § 227(b)(1)(A)` |
| **purpose** | is this an advertisement or telemarketing, or neither? | `§ 64.1200(a)(2)`, `(a)(3)` |
| **technology** | an autodialer, an artificial or prerecorded voice, or a live manual dial? | `§ 227(b)(1)(A)`, `Facebook v. Duguid` |

⭐ **the axes are conjunctive for `§ 227(b)`, and irrelevant to `§ 227(c)`.** that second half is the
part most often missed: the do-not-call track has its own private right of action that does not care
what equipment placed the call.

> **not legal advice.** informational groundwork for counsel to validate. this brief is **federal
> only** — state mini-TCPAs draw these lines differently, sometimes more broadly, and are not
> addressed here (see `the honest gap`).

---

## .why

a company that asks *"do we have consent?"* has already assumed the answer to a question it never
posed. two failure modes follow, and they are symmetric:

- **over-fear** — the company treats every outbound call as consent-gated, and throttles or kills a
  channel it was entitled to use. a transactional message, a manually-dialed live call, an emergency
  notice, and a HIPAA-covered health-care message are each governed differently, and some are not
  reached by the consent rules at all.
- **under-fear** — the company clears the consent question, sends at volume, and is liable anyway,
  because it dialed a number on the do-not-call registry. **flawless consent records are no defense
  on the `§ 227(c)` track**, which turns on suppression practices rather than on agreement.

the subject is commonly labeled *"phone-consent liability"*, and that label pre-commits to consent as
the whole story. **it is not.** this brief exists to draw the boundary the label obscures.

---

## axis 1 — the number

`§ 64.1200(a)(2)`, quoted in full below for the purpose axis, conditions its prohibition on calls
*"to any of the lines or telephone numbers described in paragraphs (a)(1)(i) through (iii) of this
section"*. so **the regulation's structure is: `(a)(1)` enumerates the protected line types, and
`(a)(2)` layers a purpose condition on top of them.**

the statutory hook most often litigated is `47 U.S.C. § 227(b)(1)(A)(iii)`, which reaches a call to a
number *"assigned to a … cellular telephone service"*.

⭐ **the hook attaches to the number, not to the recipient's role.** so the proposition *"the TCPA is
a consumer statute, therefore business-to-business calls are outside it"* does not follow from the
text — a business contact's mobile number is a number assigned to a cellular telephone service, and
the hook does not ask who the person is or why they are called.

🔶 **the boundary of "assigned to a cellular telephone service" is itself litigated.**
`Breda v. Cellco Partnership`, 934 F.3d 1 (1st Cir. 2019), turned on whether a number on a hybrid
wifi-and-cellular service falls inside it. ⚠️ that decision is **listed here as evidence the question
is live, not as authority for any particular answer** — it was read in this research for an
unrelated purpose (see `define.boundary.formation-not-customer-status-is-the-axis`, where it is
flagged as easy to miscite), and no survey of number-type case law was run.

---

## axis 2 — the purpose

`47 C.F.R. § 64.1200(a)(2)`, verbatim from the official eCFR (title 47 current as of 7/28/2026):

> "No person or entity may initiate, or cause to be initiated, any telephone call that includes or
> introduces an advertisement or constitutes telemarketing, using an automatic telephone dialing
> system or an artificial or prerecorded voice, to any of the lines or telephone numbers described in
> paragraphs (a)(1)(i) through (iii) of this section, other than a call made with the prior express
> written consent of the called party…"

read the conditions apart, because each is a separate gate:

| the clause | what it requires for the paragraph to bite |
|------------|--------------------------------------------|
| *"includes or introduces an advertisement or constitutes telemarketing"* | the **purpose** gate |
| *"using an automatic telephone dialing system or an artificial or prerecorded voice"* | the **technology** gate |
| *"to any of the lines or telephone numbers described in paragraphs (a)(1)(i) through (iii)"* | the **number** gate |
| *"other than a call made with the prior express written consent"* | the consequence — **written** consent, not merely express consent |

⭐ **the purpose gate is judged by the message's content, not by the sender's label for it.** the text
reaches a call that *"includes or introduces"* an advertisement — so one promotional sentence appended
to an order confirmation puts that message inside the paragraph. an internal classification of a
campaign as "transactional" does not decide the question the regulation asks.

🔶 **what standard applies to a non-telemarketing call to the same number is a real and separate
question, and its text was NOT captured verbatim in this research.** `(a)(1)` is the paragraph that
would answer it, and only its cross-reference — not its own words — is in hand. **so this brief
states the telemarketing standard and expressly declines to state the other.** that is a gap to close
before this axis is relied on for a transactional campaign.

### ⚠️ the version question a reader will hit immediately

the paragraph above is quoted from the text **current as of 7/28/2026** — but a reader who knows the
Eleventh Circuit vacated part of the FCC's 2023 consent order in January 2025 will reasonably ask
whether the written-consent condition survived. **it did, and the reason is worth one line here so
this brief does not send a reader off to check.**

the vacatur reached the 2023 Order's *added* restrictions. the court's own footnote 1:

> "The 2012 Order is not at issue in this case."

the 2012 Order is what made the telemarketing standard a **written** one. and the 2023 amendment to
the consent definition never operated at all — `89 FR 5098`'s own `DATES` section set it

> "effective January 27, 2025"

which is **three days after** the January 24, 2025 vacatur. so the definition in force is the
pre-amendment one, and `(a)(2)` reads today as quoted above.

**this is a summary of `define.what-the-2025-vacatur-did-and-did-not-do`, which carries the full
account; it is restated here only because the purpose axis is unusable without it.**

---

## axis 3 — the technology, and the two hooks inside it

`47 U.S.C. § 227(b)(1)(A)` reaches a call made *"using any automatic telephone dialing system **or**
an artificial or prerecorded voice"*. **two independent hooks, joined by "or"** — and they have
diverged sharply, because only the first was narrowed.

`Facebook, Inc. v. Duguid`, No. 19–511 (Apr. 1, 2021), held (slip op. at 12):

> "We hold that a necessary feature of an autodialer under §227(a)(1)(A) is the capacity to use a
> random or sequential number generator to either store or produce phone numbers to be called."

and, in the same paragraph, reserved the other hook expressly:

> "The statute separately prohibits calls using 'an artificial or prerecorded voice' to various types
> of phone lines, including home phones and cell phones, unless an exception applies. See 47 U. S. C.
> §§227(b)(1)(A) and (B). **Our decision does not affect that prohibition.**"

⭐ **so "we do not use an autodialer" answers one hook and not the other.** a prerecorded-voice call
is reached regardless of what equipment placed it, and `Duguid` says so in the sentence immediately
after its rule.

⚠️ **and `Duguid` did not decide that the TCPA reaches text messages.** footnote 2, slip op. at 3:

> "Neither party disputes that the TCPA's prohibition also extends to sending unsolicited text
> messages. See *Campbell-Ewald Co.* v. *Gomez*, 577 U. S. 153, 156 (2016). We therefore **assume that
> it does without considering or resolving that issue**."

the Court assumed the point rather than decided it. **a brief that cited `Duguid` for text-message
coverage would present an assumption as if it had been settled.**

---

## ⭐ the axis that is not an axis — `§ 227(c)` does not ask any of these questions

all three axes above govern `47 U.S.C. § 227(b)`. the **do-not-call** track is a separate private
right of action with a different trigger, and **the equipment used is irrelevant to it**.

`47 U.S.C. § 227(c)(5)` reaches

> "A person who has received more than one telephone call within any 12-month period by or on behalf
> of the same entity in violation of the regulations prescribed under this subsection…"

⭐ **a manually-dialed, live, human-voice marketing call to a registered number sits outside every
`§ 227(b)` hook and squarely inside this one.** so the proposition *"no autodialer, no TCPA"* is true
of `(b)` and false of `(c)`.

and the defense on this track has **no consent element at all** — the same paragraph closes:

> "It shall be an affirmative defense in any action brought under this paragraph that the defendant
> has established and implemented, with due care, reasonable practices and procedures to effectively
> prevent telephone solicitations in violation of the regulations prescribed under this subsection."

**so on the `(c)` track, what protects a sender is a documented suppression program, not a consent
record.** the two tracks call for two different artifacts.

---

## the carve-outs — where contact is permitted without consent

`§ 64.1200(a)(3)` carries exemption machinery that a consent-only frame renders invisible: a
**numerical-limit regime** (no more than three calls per consecutive 30-day period for several call
classes), plus carve-outs for **emergency purposes**, **tax-exempt nonprofit organizations**, and
**HIPAA-covered "health care" messages**.

⭐ **these are permissive, not restrictive.** a reader who treats the three axes as a checklist of
prohibitions will conclude that a call is barred when a carve-out in fact allows it — the
over-fear failure mode named at the head of this brief.

🔶 the **established business relationship** is a further exemption axis that operates on the
`§ 227(c)` track. ⭐ **a later capture made this gap sharper rather than closed it**: `§ 64.1200(f)(15)`
excludes from *telephone solicitation* a call *"to any person with whom the caller has an established
business relationship"*, but the definition of that term at `(f)(6)` opens *"for purposes of paragraph
(a)(4) of this section on the sending of facsimile advertisements"* — **so the captured definition is
fax-scoped, and what EBR means for a voice solicitation is still not settled here.** see
`ref.dnc-suppression-program`.

---

## the axes, side by side

| | number | purpose | technology | `§ 227(c)` DNC |
|---|--------|---------|-----------|----------------|
| **what it asks** | what line is dialed? | advertisement or telemarketing? | autodialer, prerecorded voice, or manual? | is the number on a registry, and is suppression run? |
| **decided by** | the number's assignment | the message's **content** | the equipment **and** the voice | the sender's list practices |
| **can the sender control it?** | only by a decision not to dial | yes — by message design | yes — by channel choice | yes — by program design |
| **narrowed by `Duguid`?** | no | no | **only the autodialer hook** | **no — irrelevant to it** |
| **what a clean consent record buys** | ✅ a defense | ✅ a defense | ✅ a defense | ⛔ **no defense** — here the defense is due-care practices |

---

## the honest gap

- 🔶 **`(a)(1)`'s own text was not captured.** the non-telemarketing standard for a call to a
  protected line is the most consequential omission in this brief — it is precisely the question a
  transactional-message program needs answered, and only `(a)(2)`'s cross-reference to `(a)(1)` is in
  hand. **the brief states the telemarketing standard and declines to state the other.**
- 🔶 **the established-business-relationship exemption is named, not quoted.** its text
  (`§ 64.1200(f)`) was not captured, so its scope is not stated here.
- 🔶 **no number-type case law was surveyed.** `Breda` is cited to show the "assigned to a cellular
  telephone service" boundary is litigated, **not** as authority for where that boundary falls.
- ✅ **time-of-day restrictions, caller-identification duties, and the internal do-not-call list
  obligation are NOT addressed here — but they are no longer unresearched.** each is an independent
  duty whose breach is a violation regardless of consent, and none is one of the three axes above.
  they are now quoted in `ref.dnc-suppression-program`, which was authored to close this gap.
- **state law is not addressed.** a state mini-TCPA may draw any of these axes more broadly —
  Florida's own consent definition, `§ 501.059(1)(g)`, expressly reaches *"text message, or voicemail
  transmission"* where the federal definition speaks of calls. ⚠️ **that Florida line is an
  illustration, not a survey** — it was read only for the point it illustrates. **the survey now
  exists** in `ref.mini-tcpa-five-state`, and ⭐ **it adds an axis this brief's three cannot express**:
  two of the five states turn on **whether a live operator asked on the call** — California requires
  it (`§ 2874`), Indiana offers it as an **alternative** to consent (so a written record still
  reaches Indiana) — which is neither number, purpose, nor technology. a reader who runs the three axes below and concludes "consent was
  not required" has answered the **federal** question only. 🔶 that survey is statutory text only, and
  states outside the baseline remain unexamined.
- **no case law on how courts apply the purpose gate was read.** the text says *"includes or
  introduces an advertisement"*; how that has been applied to a mixed transactional-plus-promotional
  message is a separate question and is **not** answered here.

## key takeaways

| question | answer |
|----------|--------|
| is consent always the question? | ⭐ **no** — `§ 227(c)` turns on suppression practices, and its statutory defense has no consent element |
| does "we don't use an autodialer" clear us? | it addresses one of two hooks in `§ 227(b)(1)(A)`; the prerecorded-voice hook is expressly unaffected by `Duguid`, and `§ 227(c)` is indifferent to equipment |
| is a B2B call to a mobile outside the statute? | the hook is on the **number** — *"assigned to a … cellular telephone service"* — not on the recipient's role |
| who decides whether a message is "telemarketing"? | the **content** does — the text reaches a call that *"includes or introduces an advertisement"*, not one the sender labels as such |
| did *Duguid* decide that texts are covered? | no — the Court *"assume[d] that it does without considering or resolving that issue"* |
| can contact ever be lawful with no consent? | yes — `(a)(3)` carves out emergency purposes, tax-exempt nonprofits, and HIPAA health-care messages, and caps several call classes numerically |
| what is the non-telemarketing standard? | 🔶 **not stated here** — `(a)(1)`'s text was not captured; see `the honest gap` |
| which brief answers "what must consent contain?" | `ref.tcpa-consent-elements` — but read this one first |

## .publishability

☀️ **fullsun** (share) — a read of published federal primary law: one codified regulation, one
statute, and one Supreme Court slip opinion, each quoted from an official publisher. no client
identity, no client-specific mechanic, no design choice settled, **neutral both-sides voice**. the
subject throughout is the documents.

triaged per `rule.require.publishability-triage`; authored in neutral legal voice per
`rule.require.fullsun-facts-not-tactics`.

## .see also

- `ref.tcpa-consent-elements.[ref].md` (once this brief says consent was required, that one says what it must contain)
- `hazard.unprovable-consent-record.[hazard].md` (and that one says what happens when it cannot be produced)
- `ref.tcpa-exposure-tracks.[ref].md` (what a violation on either track is worth)
- `define.what-the-2025-vacatur-did-and-did-not-do.[lesson].md` (why the written-consent baseline still stands)
- `define.boundary.formation-not-customer-status-is-the-axis.[lesson].md` (whether a claim can aggregate at all)

## .sources

1. [47 U.S.C. § 227 — § 227(b)(1)(A) the two technology hooks, § 227(c)(5) the DNC right and its safe harbor (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
2. [47 C.F.R. § 64.1200 — (a)(2) the purpose gate and its cross-reference to the protected lines, (a)(3) the numerical limits and carve-outs, (f)(9) the consent definition (eCFR, official; title 47 current as of 7/28/2026)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200)
3. [Facebook, Inc. v. Duguid, No. 19–511 (U.S. Apr. 1, 2021) — the autodialer rule, footnote 2 on text messages, and the prerecorded-voice reservation (slip opinion)](https://www.supremecourt.gov/opinions/20pdf/19-511_p86b.pdf)
4. [Insurance Marketing Coalition Ltd. v. FCC, No. 24-10277 (11th Cir. Jan. 24, 2025) — the vacatur that did not disturb the written-consent baseline](https://media.ca11.uscourts.gov/opinions/pub/files/202410277.pdf)
5. [89 FR 5098 (Jan. 26, 2024, FCC doc 2023-28832) — DATES: the (f)(9) amendment effective January 27, 2025, three days after the vacatur](https://www.federalregister.gov/documents/2024/01/26/2023-28832/targeting-and-eliminating-unlawful-text-messages-implementation-of-the-telephone-consumer-protection)
6. [Breda v. Cellco Partnership, 934 F.3d 1 (1st Cir. 2019) — cited only to mark the "assigned to a cellular telephone service" boundary as litigated, not as authority for where it falls](https://www.courtlistener.com/opinion/4648199/breda-v-cellco-partnership/)
7. [Fla. Stat. § 501.059(1)(g) — a state consent definition that reaches media the federal one does not, cited for the state-law caveat only (FL Senate, official, 2025 compilation)](https://www.flsenate.gov/Laws/Statutes/2025/501.059)

## .date researched

2026-07-31
