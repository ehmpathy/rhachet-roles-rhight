# rule.prefer.unmet-element-over-won-defense

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> reliance. every claim is tagged `[observed]` (quoted from a captured source), `[inferred]`
> (reasoning over those sources), or `[unverified]` (not yet sourced).

## .what

> ⭐⭐ **prefer a design where the predicate never attaches over one where a defense must be won.**

when a regime threatens a design, there are two ways out, and they are not equivalent:

| the exit | what it is | what it costs |
|---|---|---|
| ⭐ **the unmet element** | an element of the claim is **absent**, so the regime never reaches you | ✅ the question is **moot** |
| ⛔ **the won defense** | every element is met, and an affirmative defense excuses it | ⛔ the question is **litigated** |

**choose the first whenever the design permits it, even at a real product cost.**

## .why

`[inferred]` the two exits differ on four dimensions, and every one favors the element:

| | unmet element | won defense |
|---|---|---|
| **who proves it** | the plaintiff must plead every element | ⛔ **you** bear the burden |
| **when it resolves** | ⭐ a motion to dismiss — before discovery | ⛔ often summary judgment or trial |
| **how it resolves** | a legal question on the pleadings | ⛔ frequently a **fact question**, so a jury sees it |
| **what it costs to be right** | near zero | ⛔ the full cost of the defense, win or lose |

⭐ **the fourth line is the one designers discount.** a defense you would *win* still costs the fees,
the discovery, the time, and the disclosure — and *"we would win"* is a prediction, not a property of
the design. **an element that never closes is a property of the design.**

⚠️ **and the asymmetry compounds at scale.** a defense must be won **per claim**; an unmet element
defeats **every** claim under that regime at once, for every subject, forever.

## .how to find the unmet element

1. **read the regime's elements as a conjunction.** most are — *collects **and** sells*, *accepts
   **and** transmits*, *uses for a **commercial purpose**, of a **natural person**, **without
   consent***
2. **ask which element the design can decline to close** — not which is hardest to prove
3. ⭐ **prefer an element that is structural rather than behavioral.** *"we are not a natural person's
   counterparty"* holds by construction; *"we do not intend to compete"* holds only while intent is
   what you say it is
4. **check whether one element closes several regimes at once** — a shared element is a shared exit
5. ⛔ **then verify the exit is CONJUNCTIVE, not merely one reading.** an element you decline in a
   disjunctive test buys no exit at all

## .worked examples from this role

| regime | the element declined | the defense avoided |
|---|---|---|
| ⭐ **four privacy regimes at once** — FCRA · CCPA · a state deletion act · right of publicity | `[observed]` each gates on *"an **individual**"* / *"a **natural person**"*. a subject of record that is a **business entity** never closes it | four separate compliance postures, each argued separately |
| **money transmission** | `[observed]` the two-element test needs an acceptance **and** a transmission. a **spend-only, non-transferable** credit never closes the second | a money-transmitter licence in every state, or a state-by-state exemption argument |
| ⭐ **copyright** | `[observed]` § 102(a) reaches *"original works of authorship"*. a **count** is a measurement, so it never enters the subject matter | ⛔ § 107 fair use — *"the factors … **shall include**"* — a **multi-factor, fact-bound** defense, which is the worst shape a defense can have |
| **data-broker registration** | `[observed]` the definition is *collects **and** sells*. a design that never sells never closes it | registration, a deletion queue, a recurring audit |

> ⭐⭐ **the copyright row is the sharpest, because fair use is a *good* defense and still the wrong
> exit.** it is multi-factor and fact-bound, which means it survives a motion to dismiss in the
> plaintiff's favor as often as yours. **a scope avoided beats a defense proven.**

## ⚠️ .the caveat — this is a `prefer`, and here is when it yields

⛔ **an unmet element is not free, and a design contorted to reach one can cost more than the defense
would have.**

| when the defense is the better call | why |
|---|---|
| the element can be declined only by a **product mutilation** | a directory with no review data avoids one regime and has no product |
| the defense is **statutory, categorical, and text-level** | e.g. an express exclusion with a bright line — closer to an element than to a defense |
| the element is **behavioral**, so it must be re-earned continuously | *"we do not intend X"* is a defense that dresses as an element |
| ⛔ the "element" rests on `[unverified]` reasoning | ⭐ **an element you have not sourced is a defense you have not written down** |

⚠️ **and the last row is the failure mode to watch.** a design that believes it has an unmet element,
on an un-captured reading, has the **worst** of both: the confidence of an element and the exposure of
a defense, with no defense prepared.

## .the test

> **"if a plaintiff pleaded every element, would this design already be outside the regime — or would
> I have to persuade someone?"**

- already outside → ✅ the element is unmet; **name it, cite it, and design around keeping it open**
- I would have to persuade → ⚠️ a defense. **ask once more whether an element is reachable at
  acceptable product cost**, then proceed knowingly

## .enforcement

- ⚠️ reliance on an affirmative defense where an element could have been declined at acceptable
  product cost = **nitpick** (this is a `prefer`)
- ⛔ an unmet-element claim asserted on `[unverified]` reasoning, with **no defense prepared** =
  **blocker** — the design has the confidence of an element and the exposure of a defense
- ⛔ an element declined in a **disjunctive** test, described as an exit = **blocker** — a conjunction
  is what makes one element sufficient
- ⛔ a **behavioral** element (intent, purpose, self-restraint) presented as **structural** =
  **blocker** — it must be re-earned continuously and it will not be

## severity

**prefer → nitpick**, matching the peer rules in `market/`. it is a design-strategy preference rather
than a duty: a design that relies on a good defense is not unlawful, only more expensive and less
certain than one that never reaches the question.

⛔ **the two enforcement bullets that are blockers are not exceptions to that** — they do not punish
the choice of a defense. they punish a **defense mislabeled as an element**, which is a factual error
about your own posture rather than a strategic one.

## .see also

- `market/directory/define.boundary.entity-grain-vs-person-grain.[lesson].md` — the four-regimes-one-word case
- `market/directory/define.boundary.optin-vs-optout-vs-blocked.[lesson].md` — where the same logic decides three clearance states
- `market/directory/rule.prefer.metadata-over-republication.[rule].md` — the copyright case: a metadata fact never enters the subject matter
- `market/rewards/define.boundary.spend-only-shuts-three-regimes.[lesson].md` — the transmit-element case
- `market/directory/define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — ⚠️ the counter-case: consent looks like an exit and is a **condition inside** the regime

## .sources

1. 15 U.S.C. § 1681a — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim
2. 17 U.S.C. § 102 — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section102&num=0&edition=prelim
3. 17 U.S.C. § 107 — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section107&num=0&edition=prelim
4. Cal. Civ. Code § 1798.140 — https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140
5. Cal. Civ. Code § 1798.99.80 — https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80
6. Fla. Stat. § 540.08 — http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html
7. 31 C.F.R. § 1010.100 — https://www.law.cornell.edu/cfr/text/31/1010.100 (**mirror** — cited by `market/rewards/define.boundary.spend-only-shuts-three-regimes`, which owns that sweep)

captured via browser per `rule.require.bhrowser-citations`, except source 7, which is inherited from
the brief that owns it and is **not independently re-captured here**.

⭐ **the sources are cited as ILLUSTRATIONS, not as authority for the rule itself.** the rule is a
statement about how litigation works — burden, timing, and forum — and `[inferred]` **no captured text
states it.** each source proves that one worked example's element is real; **none proves the
preference.** stated plainly so a reader does not mistake a well-cited example set for a sourced
principle.

## .publishability

☀️ **fullsun** (share) — a statement about how claims and defenses differ in burden and timing,
illustrated from public statutes. no client identity, no coverage data, no applied mechanic. per
`rule.require.publishability-triage`'s decision test: **correct → share.**

⭐ **and it belongs in daylight for a second reason.** the error it corrects — a good defense chosen
where a free element was available — is one an adopter makes **while they feel well-advised**,
because the defense analysis is the visible work. **the cheaper answer looks like less work and is
worth more.**
