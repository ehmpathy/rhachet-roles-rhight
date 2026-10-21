# hazard.go-private-request

> **recommendation disclaimer.** this recommendation is offered to the best of our knowledge, based
> on the information found in research — it carries **no guarantee of success or outcome**, and it must
> be reviewed by a licensed professional (attorney / CPA / licensed advisor) against your own real
> scenario and current law before any reliance. it is groundwork for that review, not a substitute
> for it.

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## .what

a subject asks to be removed — *"take my profile down"*, *"make me private"*. two questions follow,
and they are usually collapsed into one:

1. **is removal compelled?** — a question of law, and the answer turns entirely on subject grain
2. ⭐ **what does the removal itself communicate?** — a question of design, and it is the one that
   reaches `rule.require.asymmetric-disclosure`'s central guarantee

⛔ **the second question is the hazard, and it is easy to miss** because the first has a comfortable
answer. **a removal that a subject controls creates a state the announced blanket rule does not
cover.**

## ⭐ the hazard — absence from the index is a THIRD state

`rule.require.asymmetric-disclosure` earns its guarantee from an announced, blanket, reason-blind
rule: `⬜ unknown` is a union of *checked-and-adverse* and *not-checked*, so a reader who decodes it
as adverse draws an inference **against a disclosed policy**.

⚠️ **that announcement is about a rendered cell. it says not one word about a subject who is not
rendered at all.**

| state | who controls it | covered by the announcement? |
|---|---|---|
| ✅ `verified $noun` | the publisher (a favorable record was found) | ✅ yes |
| `claimed` | the subject (they asserted it) | ✅ yes |
| ⬜ `unknown` | **neither** — it is blanket and reason-blind by rule | ✅ yes — this is the whole design |
| ⛔ **absent from the index** | ⭐ **the subject, unilaterally, at any time** | ⛔ **no** |

⛔ **and the inference is sharper than the one the rule was built to defeat**, for a reason that is
structural rather than incidental:

- `⬜` is **common by design** — every subject has several, and the rule says so in advance
- **absence is rare, and it is an ACT.** a subject who is not listed either was never reached, or
  **asked to be removed**. the second branch is a deliberate choice by the subject, at a moment they
  pick

> ⭐ **the collapse that protects `⬜` does not exist here.** `⬜` collapses two branches into one
> indistinguishable cell. absence has two branches too — *never reached* and *asked to leave* — and
> **they cannot be collapsed, because there is no cell in which to collapse them.** the subject is
> simply gone, and the reason is gone with them.

⚠️ **the hazard grows exactly where the rest of the design gets safer.** at high coverage, `⬜`
absence-facts fill with clean subjects (see `define.boundary.presence-fact-vs-absence-fact`) — but
**absence from a near-complete index becomes more legible, not less.** *"every other licensed roofer
in this metro is here"* is a strong signal about the one who is not.

## is removal compelled? — the law, by grain

⭐ **the legal answer is easy and it is the smaller half of the question.**

| grain | is there a duty? | authority |
|---|---|---|
| **business entity** | ⛔ **no.** a business has no statutory right to be delisted | `[observed]` Cal. Civ. Code § 1798.140(i): *"'Consumer' means a **natural person** who is a California resident"*; `[observed]` § 1798.99.80(c) reaches *"the personal information of a **consumer**"*; `[observed]` 15 U.S.C. § 1681a(c): *"The term 'consumer' means an **individual**."* |
| **natural person** | ✅ **yes**, on two independent paths | the CA deletion mechanism (below) **and** withdrawal of the opt-in that put them there |

⭐ **so at the grain this cluster publishes at, "go private" is a PRODUCT choice, not a compliance
duty.** that is a genuinely good position and it is why the design question above is the one that
matters — this is a place where a policy is chosen, not a place where a statute is obeyed.

### the person track — withdrawal of consent is the primary path

`define.boundary.consent-cures-privacy-not-fcra` establishes that person-grain facts enter only by
the subject's opt-in. **so the person-track removal path is not primarily a statutory deletion
request — it is a withdrawal of the consent that authorized the publication.**

⭐ **and that is a cleaner instrument than a deletion duty**, because it is symmetric: the same act
that authorized the data withdraws it, with no test of whether a statute reaches the publisher.

### ⛔⛔ but withdrawal does more than stop future publication — it removes a DEFENSE

⚠️ **this is the part that is easy to get backwards.** consent is not merely what made the publication
polite; in the right-of-publicity statutes it is the **express statutory element or defense**, and it
is written into the prohibition itself:

⭐ **cited, not re-derived** — all five statutes gate on use *without consent*, and the verbatim text
of each lives in `hazard.unclaimed-profile-right-of-publicity` § *the five-state sweep*, with the
defense framed at `define.boundary.consent-cures-privacy-not-fcra`. what this brief needs from them:

- `[observed]` **consent is written into the prohibition itself** in all five — FL, CA, NY, and IN each
  bar the use *"without … consent"*, so consent is not a courtesy the publisher extends; it is the
  element the plaintiff must negate
- `[observed]` **CA prices it**: Cal. Civ. Code § 3344(a)(1) carries a **$750 statutory floor per
  violation**, profits, punitives, and **attorney's fees** — which is what makes a slow removal path
  expensive rather than merely awkward

⛔ **so on the person track, a page that was lawful yesterday becomes a live ROP claim the moment
consent is withdrawn and the page is still up.** the removal is not a courtesy with a comfortable SLA
— **it is the only act that keeps the affirmative defense alive**, and the exposure re-attaches on
withdrawal rather than on any later act by the publisher.

⭐ **the design consequence: a removal path must be at least as fast as the consent path.** a
one-click opt-in beside a support-ticket opt-out is not merely poor ergonomics — it is a window in
which the statutory defense has lapsed and the page has not.

### ⚠️ and not every removal comes from the subject

a removal request is the **subject-initiated** case. it is not the only trigger, and the others do not
route through any opt-out UI:

| trigger | who demands it | brief |
|---|---|---|
| the subject asks | the subject | this brief |
| a court seals or expunges the source record | ⛔ **the state** — `[observed]` N.Y. Civ. Rights Law § 50-g attaches a damages action to disclosure of a sealed conviction | `hazard.sealed-record-republication.[hazard].md` |
| the record's status changes and the badge decays | ⛔ **no one** — it happens on its own | `hazard.stale-public-record-status.[hazard].md` |

⭐ **so a removal-request policy answers exactly one of three, and it is the only one with a human on
the other end to raise it.** the suppression machinery this brief describes is the same machinery the
other two need.

### the person track — the CA mechanism, and its shape is the lesson

`[observed]` Cal. Civ. Code § 1798.99.86(c)(1): *"**Beginning August 1, 2026**, a data broker shall
access the accessible deletion mechanism … **at least once every 45 days**"*, and per (c)(1)(A),
*"Within 45 days after receiving a request … delete all personal information related to the consumers
making the requests."*

`[observed]` § 1798.99.86(d)(1): after a deletion, *"the data broker shall delete all personal
information of the consumer **at least once every 45 days**"* thereafter.

⚠️ **an entity-grain directory that does not sell sits outside this definition on two independent
prongs** — the subject of record is a business, and `[observed]` § 1798.99.80(c) is conjunctive:
*"collects **and sells**"*. so it does not bind such a directory as written.

⭐ **it is quoted anyway, because its MECHANICS are the correct shape for a voluntary path** — and
three of them are counterintuitive:

| mechanic | why it matters even absent a duty |
|---|---|
| **a request may arrive through a queue that must be POLLED** | a support inbox does not discharge a duty that is defined as an outbound check |
| ⭐ **deletion is NOT one-shot** — § 1798.99.86(d)(1) demands repeat deletion | a re-crawl that resurrects the row undoes the removal silently |
| ⭐ **suppression must therefore outlive re-ingestion** | `[inferred]` the implementation is a **tombstone**, not a row delete. a deleted row is re-discoverable; a tombstone is what remembers the refusal |

⛔ **and note the trap in the obvious implementation:** a *"private" flag that retains the record and
hides the page* is a **third operation**, distinct from both deletion and suppression. it may be the
right product answer, but it should never be described as deletion.

## ⚠️ one request, two kinds of speech — and they do not have the same answer

*"take my profile down"* is a single sentence that reaches two different legal objects, and a policy
that treats it as one will over- or under-deliver:

| what is on the page | whose speech | may they compel removal? |
|---|---|---|
| **the badges** — `✅ verified $noun`, `⬜`, the rows themselves | ⛔ **the publisher's** — developed by them (see `define.boundary.who-speaks-decides-the-regime`) | person track: yes, on withdrawal of consent. entity track: no duty, a policy choice |
| **third-party content** — a review someone else wrote about them | ✅ **the author's** | `[observed]` 47 U.S.C. § 230(c)(1) shields a provider from treatment as the **publisher** of *"information provided by another information content provider"* |

⭐ **so the shield that protects the reviews does NOT protect the badges** — and the asymmetry runs the
useful way for this brief: **the part of the page a subject most wants removed (the badges) is the
part the publisher is freest to remove**, because it is their own speech and no third party's interest
is at stake.

⚠️ **the trap is the reverse move:** a subject who asks to *"go private"* in order to erase a harsh
review demands the suppression of **someone else's speech**, and a policy that grants it silently
converts a removal feature into a review-suppression feature. **the two requests deserve separate
answers, in the policy and in the UI.**

### ⛔⛔ and that trap has a RULE attached — 16 C.F.R. § 465.7(b)

`[observed]` **the FTC's 2024 review rule reaches exactly this move.** § 465.7 has two prongs, and it
is the second that bites here: **selective removal or suppression of negative reviews.** see
`market/reviews/ref.ftc-part-465-review-rule.[ref].md`.

⛔ **so the reverse move is not merely poor policy — it is a candidate unfair-or-deceptive practice**,
and the go-private feature is the vector:

| what happens | how it reads under § 465.7(b) |
|---|---|
| a subject with **favorable** reviews goes private | ✅ a removal, uniformly applied |
| a subject with **harsh** reviews goes private, and the reviews go with the page | ⚠️ **negative reviews removed at the business's request** — the shape the rule describes |
| the directory grants go-private **only** when asked, and subjects with bad reviews ask most | ⛔ the *selection* is performed by the request pattern, and the publisher supplies the removal |

⭐⭐ **the design consequence, and it is the reason this cross-link matters:** *"honor every removal
request"* sounds maximally subject-friendly and is the exact policy that produces a
sentiment-correlated removal set. **a removal path must dispose of the badges (the publisher's own
speech) and leave third-party reviews in place** — otherwise the person-grain remedy this brief
argues for becomes the § 465.7(b) exposure `market/reviews/` warns about.

⚠️ **the two rules pull in opposite directions and both are real:** withdrawal of consent makes a slow
removal expensive (ROP, above); § 465.7(b) makes an *indiscriminate* removal expensive. **the only
posture that satisfies both is a removal scoped to the publisher's own speech.**

## the mitigations, and the first one is the only structural one

1. ⭐ **announce the removal policy the same way the badge policy is announced.** the announcement is
   what does the work in `rule.require.asymmetric-disclosure`, and it is available here on the same
   terms: *"subjects may ask to be removed at any time, for any reason, and the reasons are not
   distinguished."* blanket, reason-blind, in advance. ⚠️ `[inferred]` — this narrows the inference; it does
   **not** close it, because absence is still rare and still an act
2. ⛔ **never render a tombstone.** *"this business has asked to be removed"* is the worst possible
   outcome — it converts a silent absence into a published adverse-adjacent assertion, and it is
   exactly the *"3 people asked, no response"* failure `rule.require.asymmetric-disclosure` names
3. **do not treat removal as a rank or a badge event.** a subject who leaves should not leave a
   shaped hole — no *"formerly listed"*, no greyed row, no altered sort order among their peers
4. ⚠️ **the residual is real and should be stated rather than papered over:** at high coverage,
   absence carries a statistical signal that no design answers — the same residual named in
   `rule.require.asymmetric-disclosure`'s honest gap, which arrives here by a second door

## .the test

> **"if a subject asks to be removed today, can a reader tell tomorrow that they ASKED — rather than
> that they were never reached?"**

- no → the removal is clean
- yes → a tombstone has leaked, and it is a published assertion about the subject's conduct

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this body of
> law is not tripped. the convention is declared in `hazard._.catalogue` § *the convention*; the
> original mandates live in `rule.*` files. **a `[hazard]` that enforces is checkable, not normative.**

- a rendered marker of any kind where a removed subject used to be = **blocker** (a published
  adverse-adjacent assertion)
- a removal that a later crawl reverses = **blocker** (suppression must outlive re-ingestion)
- a "private" flag described to subjects or in terms as **deletion** = **blocker** (they are
  different operations, and the difference is what a person-grain statute measures)
- a removal policy applied but **not announced in advance** = **blocker** (same defect as an
  unannounced badge asymmetry — the announcement is the mechanism)
- ⭐⭐ **the announcement copy is REQUIRED, not paraphrasable — a substituted string = blocker.** the
  announcement must state all three properties, and the canonical form is:

  > **"subjects may ask to be removed at any time, for any reason, and the reasons are not
  > distinguished."**

  | the string must carry | why it does the work |
  |---|---|
  | *"at any time"* | makes the policy **stable** — not a window, not a campaign |
  | *"for any reason"* | makes it **blanket** — no per-subject judgment is made |
  | *"the reasons are not distinguished"* | makes it **reason-blind**, which is the property that defeats the inference |

  ⛔ **forbidden paraphrases**, each of which silently drops a property: *"we honor removal requests"*
  (drops reason-blindness), *"we review removal requests"* (asserts a per-subject judgment, so it is
  no longer blanket), *"we remove listings on request where appropriate"* (drops all three)

⭐ **why this is a mandated string rather than prose.** it is the structural twin of the badge
asymmetry's exact-copy table (`rule.require.asymmetric-disclosure` § *the REQUIRED copy*).
⛔ **the two announcements do the same job by the same mechanism, so a paraphrase costs the same here
as there:** a builder who
writes *"we review removal requests"* has, in four words, converted a blanket reason-blind policy
into a per-subject judgment — and the defense was never the removal, it was the **blanket-ness**.
- a per-subject exception to the removal policy = **blocker** (it is no longer blanket)
- ⭐ a removal that takes **third-party reviews** down with the badges = **blocker** — 16 C.F.R.
  § 465.7(b), selective suppression of negatives at the business's request. **scope the removal to
  the publisher's own speech**

## ⚠️ .note on the five-state rule — an un-run row, declared

`rule.require.five-state-baseline` asks for a TX/IN/FL/CA/NY sweep on any state-law layer. **this
brief runs it on the grain question** — the *"natural person"* hinge is `[observed]` in FCRA, CCPA,
and the DELETE Act, and the right-of-publicity sweep is complete in
`hazard.unclaimed-profile-right-of-publicity`.

⛔ **it does NOT run the sweep on state DATA-BROKER DELETION duties.** only California's mechanism is
captured. `[unverified]` — TX Bus. & Com. ch. 509 and any IN / FL / NY analogues are **un-swept**.

⚠️ **stated as a bounded gap rather than an omission, and here is why it is bounded:** the duties in
question reach a **data broker**, and an entity-grain directory that does not sell falls outside that
definition on two independent prongs. so the un-swept row governs the **person track only**, and there the withdrawal-of-consent
path (above) is the primary instrument regardless of what a state statute adds. **a future brief owes
this sweep before the person track ships.**

## .sources

1. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
2. [Cal. Civ. Code § 1798.99.80](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80)
3. [Cal. Civ. Code § 1798.99.86](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.86)
4. [Cal. Civ. Code § 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140)
5. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
6. [Cal. Civ. Code § 3344](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=3344)
7. [N.Y. Civ. Rights Law § 50-g](https://www.nysenate.gov/legislation/laws/CVR/50-G)

captured via browser per `rule.require.bhrowser-citations`.

## .date researched

2026-08-02 to 2026-08-03: the capture dates of the sources listed in `.sources`, each read via browser.

## .publishability

☀️ **fullsun** (share). the grain analysis is statutory definitions — *"it is just the law."* the
design hazard is a **generic structural insight about opt-out in an announced-asymmetry system**, and
it survives de-identification whole: it holds for any directory that pairs a blanket disclosure
policy with a subject-controlled removal.

⚠️ **what is held back.** the **coverage figures** that would let a reader estimate how legible an
absence actually is in a given trade and metro are operational data. and any **applied** assessment —
a named party's read of how exposed the residual leaves them — belongs in a restricted artifact, per
`rule.require.publishability-triage`'s line: *"we assess our position as Y and our weak spot is Z"*
→ 🔒 protect. **the residual itself is stated above, because it is a property of the design, not of
any one adopter.**

## .see also

- `rule.require.asymmetric-disclosure.[rule].md` — the announcement this hazard escapes
- `define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — why withdrawal, not deletion, is the
  person-track instrument
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the axis that decides whether a duty exists
- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — why `⬜` gets safer at scale while
  absence-from-index gets more legible
- `hazard._.catalogue.[summary].md` — the cluster's hazard map
