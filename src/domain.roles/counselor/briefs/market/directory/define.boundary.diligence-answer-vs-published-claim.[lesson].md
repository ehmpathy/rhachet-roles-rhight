# define.boundary.diligence-answer-vs-published-claim

> **not legal advice.** informational groundwork for counsel to validate before any reliance. claims
> are tagged `[observed]` (quoted from a captured source) / `[inferred]` (our inference over those
> sources) / `[unverified]` (not yet sourced).

## .what

**an adverse fact told to its own subject is not a publication. the same fact rendered on a public
profile is.** the two are different legal objects, and almost every regime in this cluster attaches
to only one of them.

this boundary exists because `rule.require.asymmetric-disclosure` reads, at first glance, as a bar on
adverse-fact research generally — on the diligence services that exist precisely to surface a defect
in a property, a permit, or a record. **it is not**, and the reason is the axis the whole cluster
turns on: **who is the subject, and who is the audience.**

## .the boundary

| | ⭐ a diligence answer | ⭐ a published claim |
|---|---|---|
| the subject of the adverse fact | ⭐ **the asker's own property** | ⛔ **a third party** |
| the audience | ⭐ **the asker themself** | ⛔ **the public** |
| consent | ⭐ inherent — they asked about what they own | ⛔ absent |
| is it a publication? | ⛔ **no** — it is an answer to the person it concerns | ✅ **yes** |
| which regime attaches | none of the four; there is no third-party subject | ROP · FCRA · CCPA · state provider statutes |

⭐ **so the boundary is clean: diligence answers a question about YOU; a directory publishes a claim
about SOMEONE ELSE.** an adverse fact told to its own subject triggers no publicity right, no
consumer-report duty, and no sale — because the subject and the audience are the same person.

## ⚠️ which side of § 230 each one sits on

this explains why the asymmetry binds the operator and not the third-party reviews beside it.

`[observed]` 47 U.S.C. § 230(c)(1) shields a provider only as to *"information provided by **another**
information content provider"*, and § 230(f)(3) defines that as anyone *"responsible, **in whole or in
part**, for the creation or development of information."*

⛔ **a badge is developed by the operator, so no shield reaches it** — which is precisely why the
asymmetry has to be a **self-imposed rule** rather than an inherited immunity.

## ⭐ where a subject opt-in lands

with the subject's consent, a directory moves **toward the diligence column**: the subject has
directed the disclosure. two independent hooks:

- `[observed]` **CCPA's own sale safe harbor** — Cal. Civ. Code § 1798.140(ad)(2)(A): a business does
  not sell when *"A consumer **uses or directs the business** to intentionally: (i) Disclose personal
  information"*
- `[observed]` **the express consent defense under right of publicity, in all five states.** ⭐ the
  sweep is set out in full below rather than by one exemplar, because *"in all five states"* is a
  claim and one example does not carry it:

> ⭐⭐ **THIS TABLE IS CANONICAL. cite it; do not restate it.** the ROP consent-defense sweep has one
> owner, and this is it. `hazard.unclaimed-profile-right-of-publicity` owns the **right** (scope,
> remedy, carve-outs) and carries only the one-line result of this table;
> `define.boundary.consent-cures-privacy-not-fcra` owns what consent does **not** reach. ⛔ **a second
> copy of the per-state clauses anywhere in this cluster is a blocker** — a restatement drifts toward
> the local brief's grain, and this one drifts toward the wrong answer, because the TX cell clears by
> a different mechanism than the other four and a summary loses that.

| state | the consent clause, verbatim | reaches a person who is alive? |
|---|---|---|
| **FL** | `[observed]` § 540.08(1) — *"without the express written or oral consent"* | ✅ yes |
| **CA** | `[observed]` § 3344(a)(1) — *"without that person's prior consent, or, in the case of a minor, the prior consent of their parent or legal guardian"* | ✅ yes |
| **NY** | `[observed]` § 51 — *"without the written consent first obtained as above provided"* | ✅ yes |
| **IN** | `[observed]` § 32-36-1-8(a) — *"without having obtained previous written consent from a person specified in section 17"* | ✅ yes |
| **TX** | `[observed]` Tex. Prop. Code § 26.011 — *"without the written consent of a person who may exercise the property right, **a deceased individual's** name…"* | ⛔ **no** — the statute is deceased-only |

⭐ **so consent is an express statutory defense in four of five, and in the fifth there is no statutory
right a person could consent away while alive.** the practical effect is the same everywhere — a
subject's opt-in clears the statutory ROP layer in all five — but the *reason* differs in TX, and a
brief that wrote *"consent defeats ROP in all five"* without the split would be right by accident.
⚠️ `[unverified]` the TX **common-law** publicity tort is un-captured, so the TX cell is clear on the
statute only.

⚠️ **and what consent does NOT do: it does not exit FCRA.** `[observed]` § 1681b(b)(1)(A)(ii) makes
the consumer's written authorization a **condition of lawful furnishment** *inside* the regime — so
consent is an element of compliance, never an exemption. ⭐ **cited, not re-derived** — the structural
argument has one owner:

> **`define.boundary.consent-cures-privacy-not-fcra.[lesson].md`**

## .the test

> **"is the adverse fact told to the person it is about, or about someone else to the public?"**

- told to its own subject → a diligence answer; no third-party regime attaches
- about a third party, to the public → a published claim; `rule.require.asymmetric-disclosure` governs
- about a third party, **at that party's direction** → the consent hooks above move it toward
  diligence on the privacy layers — ⛔ **but never on FCRA**

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this boundary
> is not crossed. the convention is declared in `hazard._.catalogue` § *the convention*; the original
> mandate lives in `rule.require.asymmetric-disclosure`.

- ⛔ **a diligence-grade adverse result rendered on a public profile = blocker.** the analysis that
  was safe as an answer becomes a publication, and every regime this cluster exists to avoid attaches
  at once. **the same fact, the same accuracy, a completely different legal object**
- ⛔ **reliance on § 230 to shield a badge or a summary = blocker** — § 230(f)(3); the operator
  developed it
- ⛔ **treatment of `rule.require.asymmetric-disclosure` as a bar on adverse-fact research = blocker**
  in the other direction: it bounds **publication about third parties**, never a subject's own
  diligence about their own property
- ⚠️ **consent cited as an FCRA answer = blocker** — see the owner above

## .note on the five-state rule

`rule.require.five-state-baseline` is satisfied by reference, not by omission. the state-law layers
this boundary touches each have a complete sweep in the brief that owns them:

| layer | owner |
|---|---|
| right of publicity — the **right** itself (scope, remedy, carve-outs) | `hazard.unclaimed-profile-right-of-publicity` |
| ⭐ right of publicity — the **consent defense**, five-state | ⭐ **this file**, § *where a subject opt-in lands* — swept in full above |
| criminal-history / sealed-record provider statutes | `hazard.sealed-record-republication` |

⚠️ **the middle row was added in the same correction as the sources list, and the split it records is
the point.** one statute can be owned by two briefs at different **grain**: the ROP brief owns what
the right *is*, this file owns what **consent does to it**. that is not duplication — the two answer
different questions and neither restates the other.

**stated so a reviewer can tell a cross-reference from an un-run sweep.** the rest of the boundary is
federal + CA statutory and draws no further state-law redline of its own.

## .sources

1. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
2. [15 U.S.C. § 1681b](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim)
3. [Cal. Civ. Code § 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140)
4. [Fla. Stat. § 540.08](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html)
5. [Cal. Civ. Code § 3344](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=3344)
6. [N.Y. Civ. Rights Law § 51](https://www.nysenate.gov/legislation/laws/CVR/51)
7. [Ind. Code § 32-36-1-8](https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-8/)
8. [Tex. Prop. Code ch. 26](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.26.htm)

all eight captured through **bhrowser** per `rule.require.bhrowser-citations`. ⚠️ the Indiana cell
cites the Justia section-grain mirror — the official portal served an app shell to a driven
navigation across three URL shapes; fallback noted per `rule.require.five-state-baseline`.

⭐ **the consent defense is carried by all five state statutes, not by one exemplar plus an
*"e.g."*** — `rule.require.five-state-baseline` forbids the shorthand, and the five-state claim in
§ *the consent defense* is the claim that needs it.

## .publishability

☀️ **fullsun** (share) — a boundary drawn between two legal objects, from public statutory text. run
against the four tests:

| test | fires? | why |
|------|--------|-----|
| **fingerprint** | ⛔ no | names no client, no product, no applied mechanic |
| **optionality** | ⛔ no | it restates where the statutes draw a line; it settles no choice the law left open |
| **insight** | ⛔ no | the aha — *that subject and audience collapse to one person is what keeps an adverse fact from being published* — is a read of § 230(f)(3) and § 1798.140(ad)(2)(A), and it survives de-identification because it carries no identity |
| **voice** | ⛔ no | ⚠️ the risk here is real and was checked: a brief that says *"here is how an adverse fact stays outside four regimes"* can read as advisory. it is written to describe **both** columns symmetrically and to state where each regime attaches, never which column an actor should pick |

## .see also

- `rule.require.asymmetric-disclosure.[rule].md` — the rule this boundary bounds; **it owns the
  normative statement**, this file owns the scope question
- `define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — the owner of the consent/FCRA split
- `define.boundary.who-speaks-decides-the-regime.[lesson].md` — the § 230(f)(3) axis in full
- `hazard._.catalogue.[summary].md` — the cluster index and the open-question tracker
