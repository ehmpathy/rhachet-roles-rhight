# define.boundary.optin-vs-optout-vs-blocked

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> reliance. every claim is tagged `[observed]` (quoted from a captured source), `[inferred]`
> (reasoning over those sources), or `[unverified]` (not yet sourced).

## .what

**a directory's clearance question has THREE answers, not two — and the third is the one a two-state
model gets wrong rather than merely coarse.**

| clearance | what it means | ⭐ who can cure it |
|---|---|---|
| **optout** | published by default; the subject may claim the profile, correct it, or ask for removal | already cleared |
| **optin** | ⛔ not published until the subject affirmatively acts. silence is a refusal | ⭐ **the subject** — the right is theirs to grant |
| ⛔ **blocked** | **a THIRD party forbids it, and the subject cannot grant what they do not own** | ⛔ **only that third party** — by licence, or by a different source |

## ⭐⭐ .why two states are not enough

the two-state model asks *"is it published by default?"* and stops. it never asks the question that
decides what to **build**: ⭐ **who has to say yes.**

**the tell.** an aggregate star rating and a customer's review text both look like `optin` — favorable
material about a business, so surely the business can authorize it. ⛔ **it cannot.** the rating is the
platform's compilation and the review is its author's expression. **a consent checkbox on the
contractor's profile grants us no right at all**, because the contractor never held one.

⚠️ **and the two failure modes are not symmetric:**

| the error | what it costs |
|---|---|
| over-strict — `blocked` where `optin` was true | ⚠️ one row of the product, recoverable |
| ⛔ **under-strict — `optin` where `blocked` was true** | **a shipped feature that collects a worthless consent and publishes anyway** — and the consent flow makes the breach look deliberate and documented |

> ⭐ **the third state is not a subdivision of `optin`. it is a different axis.** `optin`/`optout`
> answers *what is the default*. `blocked` answers *who holds the right*. a datum can be blocked and
> optout-eligible at once.

## ⛔ .the term correction that precedes all three

> **a design described as *"default opt-in"* is an OPTOUT design.**

an opt-in is an **affirmative act by the subject**, so a default cannot supply one. ⭐ the phrase is
not shorthand — it is a contradiction that reads as consent obtained while it describes consent
assumed. canonical in `rule.require.opt-out-bounded-to-entity-registry-facts`.

## ⭐ .the states, applied

each row below is a **worked demonstration**, not an inventory — the per-datum operational table is a
separate artifact and is not published.

| datum class | clearance | the deciding authority |
|---|---|---|
| entity registration, established date, address, trade | ✅ **optout** | `[observed]` four regimes exit on one word — see below |
| licence **status**, when *active clean* | ✅ **optout** | ⛔ a status, never a boolean; *disciplined · expired · suspended · revoked* render `⬜` |
| a permit pulled by the entity | ✅ **optout** | a county record of a business activity |
| a URL to their own site or profile | ✅ **optout** as a **link** | a URL is a fact; the page behind it is expression |
| a civil judgment against the **entity** | ✅ **optout to HOLD** | ⛔ and it renders `⬜` — see *valence*, below |
| ⛔ logo, wordmark, site copy, taglines | ⛔ **optin** | `[observed]` § 102(a) *"original works of authorship"* — ⭐ **and the right-holder IS the subject, so their opt-in genuinely works** |
| ⛔ any person-grain datum — criminal, civil, identity, home address, headshot, personal bio | ⛔ **optin** | the four regimes below all reach it; ⚠️ **and consent does not cure FCRA** |
| ⛔⛔ an aggregate star rating computed by a platform | ⛔ **BLOCKED** | the **platform** owns the compilation |
| ⛔⛔ review text a customer wrote | ⛔ **BLOCKED** | the **reviewer** is the author |
| ⛔⛔ a record a court ordered sealed | ⛔ **BLOCKED** | the **court** — an opt-in does not cure a sealing order |

### the four regimes that decide the grain rows, and they exit on one word

| regime | the exit, verbatim |
|---|---|
| FCRA | `[observed]` § 1681a(c) — *"The term 'consumer' means an **individual**."* |
| CCPA | `[observed]` § 1798.140(i) — *"'Consumer' means a **natural person** who is a California resident"* |
| DELETE Act | `[observed]` § 1798.99.80(c) — *"collects and sells … the personal information of a **consumer**"* |
| right of publicity | `[observed]` FL § 540.08(1) *"any **natural person**"*; TX (Tex. Prop. Code ch. 26) § 26.002 *"An **individual** has a property right…"*; IN § 32-36-1-6 *"a living or deceased **natural person**"* |

> ⭐⭐ **four regimes, one hinge, the same phrase.** entity grain is not one mitigation among several
> — it is the single move that leaves all four at once.

⚠️ **and what remains after the exit is not zero — it changes shape.** defamation and trade libel
survive at entity grain with **economic damages easier to prove** than a person's dignitary harm. the
entity rows are cleared on **privacy** and still owe **accuracy**.

⛔ **the counterintuitive pair, and both catch designers out:**

1. **person × promotional is still optin.** § 1798.140(i) says *"natural person"*; § 540.08(1) says
   *"any natural person"*. **neither asks whether the datum flatters the subject.** a headshot is
   favorable personal material and privacy law does not gate on whether a fact is nice.
2. **business × promotional is where grain buys almost none of the answer.** the four exits are all
   **privacy** exits, and a logo is not primarily a privacy problem. a designer who reasons *"it is a
   business, and it is flattering"* has answered privacy twice and IP never.

## ⭐⭐ .the BLOCKED rows share ONE escape, and it is not a legal argument

every blocked row is blocked because a third party authored or compiled the thing. so they share one
exit:

| row | who holds the right | what actually clears it |
|---|---|---|
| aggregate score | ⛔ the **platform** (compilation) | ⭐ **compute our own** from reviews we host — a different score, lawfully ours under the same logic that protects theirs |
| review text | ⛔ the **reviewer** (authorship) | ⭐ **collect our own** — the author submits to us, and the grant is real because they own it |
| a count held behind platform terms | ⚠️ **no party** owns the fact; the platform owns the **pipe** | ⭐ **count our own**, or use a sanctioned API rather than automated collection |

> ⭐⭐ **subject-supplied provenance clears every blocked row at once, and it is the only route that
> does.** it needs no case law, no browsewrap decision, no fair-use argument. **every question becomes
> moot rather than won.**

⚠️ **and it is expensive in the way that matters — a cold-start problem, not a legal one.** a
platform's count is available on day one and ours is not. **the blocked rows are exactly the rows a
competitor with a decade of collected reviews already has**, which is why the temptation to score them
`optin` and ship a consent checkbox is strong.

`[observed]` **the mechanism is not novel** — a major review platform's authority over a business page
rests on *the business owner's agreement*, not on a copyright answer.

## ⭐⭐ .the four dimensions that are NOT clearance axes

⛔ **a three-state model is still not the whole answer, and a reader who stops there will apply it as
though it were.** four more dimensions matter, and they split three ways:

| dimension | what it actually changes |
|---|---|
| ⭐ **provenance** — who supplied it | ✅ **the clearance itself** |
| ⭐ **valence** — favorable or adverse | ⛔ **the PUBLICATION, not the clearance** |
| **volatility** — how fast it decays | ⚠️ the standing **duty**, not the permission |
| **linkage** — self-keyed or match-required | ⚠️ the **precondition**, not the permission |

> ⭐⭐ **clearance and publication are two different questions.** clearance asks *may we hold and
> process this datum*. publication asks *do we surface it*. ⛔ **a datum can be cleared at optout and
> still never appear**, and that is not a contradiction.

### provenance — the one genuinely additional clearance axis

| provenance | clearance effect | why |
|---|---|---|
| **government registry** | ✅ optout-eligible | published by the state for the express purpose of public notice |
| ⭐ **the subject, on a claimed profile** | ✅ **cleared by supply** | `[observed]` § 1798.140(ad)(2)(A) — a consumer who *"uses or **directs** the business"* to disclose. **the affirmative act an optout default cannot supply** |
| ⚠️ **a third-party attester** — insurer, surety, bond issuer | ⚠️ **unmodeled** | neither us nor them; a fourth kind the badge vocabulary has no state for |
| **a third-party platform** | ⛔ **contract-gated** | copyright may be clear and the terms still forbid the access method |
| ⛔ **our own inference or derivation** | ⛔ **highest exposure of the five** | `[observed]` § 230(f)(3) — a provider *"responsible, **in whole or in part**, for the creation or development"* is unshielded. **we speak it, so we own it** |

⭐ **the same datum carries different exposure per where it came from.** a licence number from the
state board and the identical number taken from a competitor's directory are the same fact and a
different legal position.

⛔ **the last row is the trap.** a **derived** datum — a computed trust score, an inferred service
area, a normalized trade category — is **our assertion** however factual its inputs were. provenance
washout is the failure mode: five sourced facts combined into one number we authored.

### valence — the dimension most often mistaken for a clearance axis

| valence | clearance | publication |
|---|---|---|
| favorable | per the table above | ✅ assertable where the result permits |
| ⛔ **adverse** | **identical to favorable** | ⛔ **renders `⬜`, always** |

`[inferred]` an entity-grain civil judgment is lawful to **hold** — the docket is public and the entity
holds no privacy interest. the design declines to **surface** it. **so its clearance is optout and its
publication is `⬜`.** a reader who conflates the two will think this brief contradicts
`rule.require.asymmetric-disclosure`; it does not, because they answer different questions.

⭐ **an optout clearance is permission to INGEST, never an instruction to RENDER.**

### volatility — what standing duty the datum creates

| class | example | duty |
|---|---|---|
| **immutable** | registration date, state of incorporation | none — a captured date stays true |
| **periodic** | licence status, permit record | ⚠️ re-check on the registry's own cadence |
| ⭐ **continuous** | a review count or score | ⛔ an as-of date is **mandatory**; the number is stale the day after |
| ⛔ **event-driven** | suspension, revocation | ⛔ a schedule-based re-check is **structurally insufficient** — the harm lands between polls |

`[observed]` **§ 1681k(a)(2)** supplies the standard: an item is up to date only where *"the **current
public record status** of the item at the time of the report is reported."*

⛔ **the event-driven row has no good answer.** a revoked licence is exactly the datum a consumer most
needs and exactly the one a periodic poll surfaces last.

### linkage — what the datum needs before it can attach

| class | example | what it needs first |
|---|---|---|
| **self-keyed** | a record retrieved *by* the entity's registry or licence number | ✅ the key **is** the identity |
| ⛔ **match-required** | a court record found *by name*, a profile found *by business name* | ⛔ an identity match, and a wrong one attaches a stranger's record |

⭐ **entity grain mostly dissolves this** — a business has a registry-assigned unique key and a person
does not, which is why `[observed]` § 1681e(b)'s *"maximum possible accuracy"* mixed-file liability
exists. ⚠️ **but match-required survives entity grain wherever the source has no key** — court dockets
and review platforms both index by name.

> ⛔ **a match-required datum inherits the substrate risk whatever its clearance.** optout on a
> name-matched record is optout on a guess.

### ⚠️ what was considered and rejected as NOT a dimension

recorded so the list reads as bounded rather than arbitrary:

- **sensitivity tier** (a national ID vs a business address) — a sub-scale *inside* person-grain, not
  an orthogonal axis; every tier lands on **optin** already
- **jurisdiction** — under a strictest-common-denominator posture it varies the **strictest cell**,
  never the clearance of a datum
- **reversibility** — real, but it governs the **remedy** (tombstone, suppression) rather than the
  permission. owned by `hazard.go-private-request`
- **reader's expected use** — decisive for the FCRA gate, and a property of the **surface**, not of
  the datum. owned by `hazard.consumer-report-gate`

## .the test

for any datum, in this order. **steps 1–4 decide the clearance; 5–7 decide what the clearance is
worth.**

1. **grain** — is the subject a natural person? → **optin**, stop
2. **kind** — is it authored expression? → **optin to reproduce**; ask whether a fact *about* it
   (count, link, existence) would serve instead
3. ⭐ **provenance** — where did it come from? a registry is optout-eligible; the subject's own supply
   is cleared by that act; **our own derivation is our assertion**
4. ⛔ **third-party rights** — does anyone but the subject hold this? a platform's compilation, an
   author's expression, a court's order → **BLOCKED**, and the subject cannot cure it
5. **result** — is a favorable result assertable? → presence-facts yes when the status is clean;
   absence-facts never
6. ⛔ **valence** — is the result adverse? → it renders `⬜` **whatever steps 1–4 concluded**
7. **volatility + linkage** — what standing duty and what precondition does this datum carry?

⛔ **step 4 is independent of the first three and is the step most likely to be skipped**, because
privacy and copyright both answered "yes" before it.

⛔⛔ **step 6 is the one a reader will mistake for a contradiction.** it does not reverse the
clearance — it decides the render. **cleared and surfaced are different verdicts.**

## ⛔ .the precondition this whole model depends on

> **an optout default plus a mis-assigned grain publishes personal background with no consent.**

the grain **test** is owned and clear; the grain **assignment mechanism** is owned by no brief, and it
**fails silently and in the unsafe direction**. `[inferred]` **safe default until it exists: person
unless an entity registry record says otherwise.**

⚠️ **and the default must key on a registry RECORD, never on the shape of the name** — a d/b/a, a
single-member LLC, and a qualifier's licence all read as entities to the eye.

tracked as `G-grain-assignment` in `hazard._.catalogue`, where it is ranked a **precondition** rather
than a gap.

## .enforcement

- ⛔ a design that describes a default-publish posture as **"opt-in"** = **blocker** — it claims
  compliance with a constraint it breaches
- ⛔ **any** person-grain datum published at optout = **blocker**, favorable or not
- ⛔⛔ **a datum scored `optin` where a THIRD party holds the right = blocker** — the consent obtained
  is worthless and the flow that obtained it documents the breach
- ⛔ a **consent flow** that requests permission the subject cannot grant = **blocker**, independently
  of whether the datum is then published
- ⛔ an **optout clearance cited as authority to publish an adverse result** = **blocker** — clearance
  and publication are different questions
- a **derived** datum treated as carrying its inputs' provenance = **blocker** (§ 230(f)(3) — the
  derivation is ours)
- a **licence row treated as a boolean** rather than a status = **blocker**
- a **continuous** or **event-driven** datum published without an as-of date = **blocker**
- ⛔ a subject scored entity-grain **without** an entity registry record that says so = **blocker**

## ⚠️ .what is NOT covered here

- ⚠️ `[unverified]` **the third-party-attester state** — an insurer's or surety's certificate is
  neither ours nor the subject's, and the badge vocabulary has no state for it. ⛔ **no capture will
  close this; it is a vocabulary gap, not a research gap.** tracked as `G-attested-provenance`
- ⚠️ `[unverified]` **platform terms beyond the one captured** — one agreement per platform, so the
  five-state frame does not fit this layer. tracked as `G-platform-tos`
- ⚠️ `[unverified]` **nominative fair use under § 1125(a)** — the logo row's only defense, and the
  statutory exclusion sits in the **dilution** subsection. tracked as `G-nominative-fair-use`
- the **per-datum operational verdicts** — deliberately not published; see `.publishability`

## .sources

1. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
2. [15 U.S.C. § 1681b](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim)
3. [15 U.S.C. § 1681e](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim)
4. [15 U.S.C. § 1681k](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681k&num=0&edition=prelim)
5. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
6. [17 U.S.C. § 102](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section102&num=0&edition=prelim)
7. [Cal. Civ. Code § 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140)
8. [Cal. Civ. Code § 1798.99.80](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80)
9. [Fla. Stat. § 540.08](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html)
10. [Tex. Prop. Code ch. 26](https://statutes.capitol.texas.gov/Docs/PR/htm/PR.26.htm)
11. [Ind. Code § 32-36-1-6](https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-6/) — (**mirror fallback** — the official portal never served a chapter body to a driven navigation)

captured via browser per `rule.require.bhrowser-citations`.

## .date researched

2026-08-02 to 2026-08-04: the capture dates of the sources listed in `.sources`, each read via browser.

## .publishability

☀️ **fullsun** (share) — ⭐ **and this brief exists BECAUSE the model it carries was previously
trapped inside a restricted artifact.**

the three states, the who-can-cure column, the blocked/optin distinction, and the four dimensions are
a **taxonomy of public law**. every deciding authority above is `[observed]` from an official source.
per `rule.require.publishability-triage`'s clean line, *"the law says X"* → share.

⛔ **the argument for daylight is stronger here than for most fullsun briefs.** the under-strict error
— `optin` where `blocked` was true — is one an adopter makes **in good faith and cannot see from
inside**, because a consent checkbox that grants no right looks exactly like compliance. **a
correction only its author knows corrects nobody.**

⚠️ **what is deliberately held back, and it is a narrow set:**

| held back | why |
|---|---|
| the **per-datum operational inventory** — which sources, by what method, for which rows | *fingerprint* — this is the moat line, and the one item a competitor could act on directly |
| our own **citation audit** — which cells rest on thin ground | *"we assess our position as Y and our weak spot is Z"* → 🔒 protect |

⭐ **the split is the point: the STANDARD ships and the APPLICATION does not.** anyone can adopt the
three states; what they cannot copy is which registries and platforms one product has already
reached.

## .see also

- `rule.require.opt-out-bounded-to-entity-registry-facts.[rule].md` — ⭐ the four tests a datum passes to be optout, and the canonical *"default opt-in"* correction
- `rule.require.asymmetric-disclosure.[rule].md` — what renders once a datum is cleared; why an adverse result is `⬜`
- `rule.prefer.metadata-over-republication.[rule].md` — the blocked rows in full: copyright, contract, accuracy
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — how step 1 is decided
- `define.boundary.promotional-vs-sensitive.[lesson].md` — how step 2 is decided
- `define.boundary.who-speaks-decides-the-regime.[lesson].md` — the § 230(f)(3) line under provenance
- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — how step 5 is decided
- `hazard._.catalogue.[summary].md` — the cluster index and the gap tracker
