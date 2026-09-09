# ref.tcpa-exposure-tracks

## .what

*"how big is a TCPA penalty?"* has **no single answer**, because the federal statute creates
**three separate exposure tracks** with different claimants, different per-unit figures, different
caps, and different limitations periods. a figure quoted from one track is a poor guide to another.

*"what is the size of the penalty?"* is the common formulation, and this brief's first move is to
refuse its singular: the question decomposes before it can be answered.

> **not legal advice.** informational groundwork for counsel to validate. this brief is **federal
> only** — state mini-TCPAs add a fourth layer with its own figures, and that layer is **not**
> addressed here (see `the honest gap`).

---

## .why

*"what is a TCPA violation worth?"* is asked as though one number answers it, and every popular
account supplies one — usually the private $500. that figure is real and it is **one of three**.

the three tracks differ on every dimension that matters to an estimate: who may file the action, what
the unit of violation is, whether an aggregate cap exists, and how long the window stays open. a
company that reserves against the wrong track can be wrong in **either direction** — it can
over-reserve against a capped agency figure, or under-reserve against an uncapped private one.

⭐ **and the two errors are not symmetric.** the capped track has a limit a reader can compute; the
uncapped one does not, so an estimate anchored on the agency figure fails silently and only in the
expensive direction. **that asymmetry is why the tracks must be separated before any figure is
quoted.**

---

## the three federal tracks

| | **private** | **FCC forfeiture** | **state attorney general** |
|---|---|---|---|
| authority | `47 U.S.C. § 227(b)(3)`, `§ 227(c)(5)` | `§ 227(b)(4)` → `§ 503(b)` → `47 C.F.R. § 1.80` | `47 U.S.C. § 227(g)` |
| who brings it | any called party | the Commission | a state AG, under the **federal** statute |
| per unit | **$500**, trebled to **$1,500** where willful or knowing | up to **$25,132** per violation or per day (`§ 1.80(b)(10)`) | up to **$500**, trebled where knowing or willful |
| aggregate cap | ⭐ **none** | ⭐ **$188,491** *"for any single act or failure to act"* — ⭐ **the phrase is now construed; see below** | ⬜ not researched |
| limitations | ⬜ not researched on this track | **1 year**, or **4 years** where intent is charged (`§ 227(b)(4)(E)`) | ⬜ not researched |

⭐⭐ **the headline, and it runs opposite to intuition.** the government's per-unit figure is roughly
**fifty times** the private one — and it is the **capped** track. the private track's per-unit figure
is small and has **no aggregate limit at all**, so it is the private class action, not the agency,
that scales without bound.

**a reader who assumed the regulator was the larger threat would have it backwards**, on the face of
the rules.

---

## the private track — small unit, no cap

`§ 227(b)(3)` gives a called party, verbatim, an action to recover

> "actual monetary loss from such a violation, or to receive $500 in damages for each such violation,
> whichever is greater"

trebled at the court's discretion where the defendant *"willfully or knowingly violated"* the
subsection.

⚠️ **`§ 227(c)` — the do-not-call track — is a *second* private right with a different shape.** it
reaches a person who received **more than one** violative call within a 12-month period, so it is not
a per-single-call right the way `(b)` is. it also carries a **statutory affirmative defense** for a
defendant with reasonable practices and procedures, which `(b)` does not.

⭐ **the absence of a cap is the whole exposure story on this track.** the per-message figure is
trivial; the multiplier is the send. what governs whether the multiplier is ever applied is
**aggregation** — see `define.boundary.formation-not-customer-status-is-the-axis` for whether claims
can be assembled into a class at all.

### 🔶 the safe harbor is federal — its state analogue is largely unproven

`§ 227(c)(5)`'s affirmative defense is a **federal** defense to a **federal** claim. it does not
travel to a state mini-TCPA claim, and whether each state writes its own analogue is a separate
question per state.

a search of CourtListener for decisions that construe a safe harbor, affirmative defense, or pre-suit
cure condition under the mini-TCPA of each of four states returned:

| state | decisions found that construe such a defense |
|-------|-----------------------------------------------|
| TX | 🔶 hits returned, **none on point** — the results construe other chapters, not a telephone-solicitation safe harbor |
| CA | ⬜ **none found** |
| NY | ⬜ **none found** |
| IN | ⬜ **none found** |

⚠️ **read this as a null result, not as proof.** a search of one corpus that returns no match
establishes that **no construction was located**, not that no safe harbor exists in the statute — an
unlitigated provision is still a provision. what it does establish is the practical point: **in these
states a sender cannot point to a court that has told it what "due care" buys.** the mitigant that is
concrete on the federal DNC track is, on the state tracks, untested.

⭐ **the one state where a comparable off-ramp IS on the books is Florida**, and it is not a safe
harbor at all — `Fla. Stat. § 501.059(10)(c)` makes a `STOP` reply a **condition precedent** to a
damages action over texts, with a **15-day cure**. that is a procedural gate, not a due-care defense,
and it is why the two should not be filed under one heading.

⭐ **and a later statutory-text sweep found a third shape: Indiana carries a genuine due-care
provision** — `Ind. Code § 24-4.7-5-2` — which no decision in the sweep above construes. **so the
four-state null was about case law, exactly as it said, and one of those four had the provision all
along.** the three shapes are distinct and should not be collapsed: a **due-care defense** (federal
`§ 227(c)(5)`, Indiana), a **procedural gate** (Florida), and **no located analogue** (TX, CA, NY —
at the text level, still unsearched). see `ref.mini-tcpa-five-state`.

**reproducible pull**: `refs/find.state-safe-harbors.play.ts`

---

## the FCC forfeiture track — large unit, hard cap

`§ 227(b)(4)` routes a TCPA forfeiture through `47 U.S.C. § 503(b)`, whose amounts are
inflation-adjusted in `47 C.F.R. § 1.80`. three provisions matter beyond the headline figures:

| provision | what it does |
|-----------|--------------|
| `§ 227(b)(4)(A)` | *"Paragraph (5) of section 503(b) … shall not apply"* — ⭐ the citation-first step that normally protects a non-licensee is **switched off** for a TCPA violation |
| `§ 227(b)(4)(B)` | a violation **with intent** carries a further penalty, statutorily *"not to exceed $10,000"*, adjusted to **$12,266** by `§ 1.80(b)(5)` |
| `§ 227(b)(4)(F)` | the Commission **may not** penalize under both (A) and (B) *"based on the same conduct"* |

and `§ 1.80(b)(9)` carries a distinct **failure-to-block** forfeiture of $25,132, expressly
*"assessed on a per-call basis"* — a different duty from consent, with its own count.

⛔ **the central ambiguity, stated rather than smoothed.** whether *"any single act or failure to
act"* means **one call** or **one campaign** decides whether the $188,491 cap is a real limit or a
formality, and **`§ 1.80` does not say.** ⭐ **three 2025 circuit decisions have now construed that
phrase and shown the Commission's count method** — set out immediately below — **but none of them is
a TCPA case**, so read the *method* across and the *amounts* not at all.

---

## ⭐ what the Commission actually assesses — three 2025 decisions

the figures above are what the **rules** state. what follows is what a **court record** shows the
agency imposed, quoted from published 2025 opinions.

⚠️ **read the scope line before the numbers.** all three decisions review forfeitures under
**`47 U.S.C. § 222`** (customer proprietary network information), not under the TCPA. they matter
here because `§ 227(b)(4)` routes a TCPA forfeiture through **the same `§ 503(b)`**, so the
**count method** and the **construction of the cap phrase** are the same machinery. ⛔ **the dollar
figures are NOT transferable** — `§ 1.80` sets a different amount tier for a common carrier
($2,048,915 per violation, per these opinions) than the TCPA row this brief quotes ($25,132).

| decision | what the agency assessed | how it was counted |
|---|---|---|
| `AT&T v. FCC` (5th Cir. 2025) | NAL proposed **$57,265,625**; order imposed **$57 million** | *"the Commission found that AT&T committed **84 continuing violations**"* |
| `Verizon v. FCC` (2d Cir. 2025) | NAL proposed **$48,318,750**; order imposed **$46.9 million** | **63 continuing violations** — *"one for each ongoing relationship with an aggregator or location-based services provider that retained access to customer data more than 30 days after publication"* |
| `Sprint Corp. v. FCC` (D.C. Cir. 2025) | **$80,080,000** against T-Mobile and **$12,240,000** against Sprint — *"a combined $92 million"* | *"$40,000 for the first day and $2,500 for each subsequent day until the carrier canceled the third party's access"* |

⭐⭐ **so the count is per-RELATIONSHIP, per-DAY — not per-campaign, and not per-customer.** the
`Sprint` opinion states the arithmetic outright: a base figure for day one, a smaller figure for each
day after, run separately against every third party. **the multiplier is the number of open channels
times the number of days each stayed open.**

### the cap phrase, construed — and it did NOT swallow the count

each set of carriers argued precisely the reading that would have made the cap decisive. the
`Sprint` court records the argument, verbatim:

> "the Carriers argue that the Commission exceeded the statutory maximum penalty of $2,048,915 for
> 'any single act or failure to act.' … The Carriers renew their claim that 'each Company committed,
> at most, a single' violation by continuing to operate their LBS programs without improved
> safeguards"

and rejected it:

> "The Commission saw things differently, and its approach was reasonable. The Commission determined
> that the Carriers committed separate violations for each third party that accessed their CPNI in
> the absence of adequate safeguards."

the `Verizon` court records the same argument — that in maintenance of *"one set"* of flawed policies
the carrier committed at most one *"single act or failure to act"* — and likewise upheld the agency's
per-relationship count, with the operative rule stated as:

> "for any given continuing violation, the Act authorizes the FCC to impose a penalty of up to
> $200,000 for each successive day, so long as the aggregate penalty for any 'single act or failure
> to act' does not exceed $2 million"

⭐ **this answers the brief's own ⛔ item, and answers it against the respondent.** the cap binds
**per violation-unit**, and the agency — not the respondent — draws the unit. a program with many
open channels is many units, each with its own cap, so the cap constrains a *cell* and never the
*total*.

⚠️ **one dissenting voice is recorded inside the agency itself**, and it is worth knowing that the
point is contested rather than settled: `Sprint` notes that *"Commissioner Simington disputed the
Commission's conclusion that 'a single, systemic failure' could be subdivided into 'many separate and
continuing violations.'"*

### ⭐ but the cap IS capable of biting — a worked example where it did

`Gray Television, Inc. v. FCC`, 130 F.4th 1201 (11th Cir. 2025) is not a telephone case at all — it
is a broadcast-license matter — and it is included for one reason: it is the captured record in which
**the cap actually cut the number**. the court describes the arithmetic:

> "the base amount of $8,000 for 'unauthorized substantial transfer of control' cases to each day of
> the continued violation … This calculation produced a forfeiture amount of **$1.72 million**, which
> the FCC proposed to reduce to **$518,283, the then-statutory maximum penalty for a single violation
> by a broadcast station licensee**"

⭐ **so the cap is a real limit, not a formality — inside one unit.** it cut a computed $1.72M to
$518,283, roughly a 70% reduction. **the two results are consistent and together they state the
whole rule**: the cap is genuine, and it applies to a unit the agency defines. **the way to a
large total is not a large cell — it is many cells.**

---

## ⭐ the constitutional question is OPEN, and three circuits split on it in 2025

this is the single largest development in the captured record, and it cuts against the forfeiture
track's practical force.

| court | disposition, verbatim | ground |
|---|---|---|
| **5th Cir.** — `AT&T v. FCC` | *"we grant the petition and **vacate the forfeiture order**"* | *SEC v. Jarkesy*, 603 U.S. 109 (2024) — Seventh Amendment + Article III |
| **2d Cir.** — `Verizon v. FCC` | *"the forfeiture order neither violates the applicable statutory limits nor Verizon's asserted Seventh Amendment rights. Accordingly, we **DENY the petition**"* | rejects the challenge on the merits |
| **D.C. Cir.** — `Sprint Corp. v. FCC` | *"we **deny the petitions** for review"* | ⭐ **declines to reach it** |

⭐ **the D.C. Circuit's reason for the non-answer is the most useful sentence in this whole brief**,
because it closes a loop with `§ 504(a)`:

> "We start with the Carriers' claim that the Commission violated their right to a jury trial under
> the Seventh Amendment. But we need not resolve that claim. That is because the statutory procedure
> at issue allowed the Carriers to obtain a jury trial before suffering any legal consequences."

**that statutory procedure is the `§ 504(a)` trial de novo this brief already quotes** in `the honest
gap`. the two halves now meet: a respondent who **refuses to pay** and forces the government to sue
gets a jury; a respondent who **pays and petitions for review** does not. the `AT&T` court states the
trade in one line — the carrier *"may challenge the order's legal validity but, by choosing this
path, forgoes a jury trial."*

⚠️ **and note who actually paid.** the `Verizon` and `Sprint` records both show the carriers **paid
the forfeiture first and petitioned afterward**. so the collection-suit route that `§ 504(a)`
describes is available and, in the largest recent matters, was **not taken**.

⛔ **the 5th Circuit's own posture is a trap for a careless citation, and it is recorded here rather
than smoothed.** the April 17, 2025 opinion published at **135 F.4th 230 was WITHDRAWN** — the
August 22, 2025 opinion on the same docket opens *"DENIED. We withdraw our previous opinion at 135
F.4th 230, and substitute the following."* **the substituted opinion reaches the same disposition**,
but a brief that cited `135 F.4th 230` would cite a withdrawn opinion. ⚠️ the court also stated
*"we need not reach the other issues AT&T raises"* — so the challenges to the **amount** and to the
liability finding were **not decided**; only the forum question was.

⚠️ **do not over-read this section.** none of the three is a TCPA case, none binds outside its own
circuit, and a split of this kind is the classic posture for further review that has not happened as
of this brief's research date. **what a reader may take from it is that the forfeiture track's
enforceability is contested — not that it has been struck down.**

---

## the state-AG track — a federal right, not a state one

⭐ **this track is easy to miss because its name suggests state law.** `47 U.S.C. § 227(g)` gives a
state attorney general an action **under the federal statute** — distinct from the private right,
distinct from the FCC forfeiture, and **distinct again from the state mini-TCPAs**, which are
separate state causes of action on top.

`United States v. Dish Network`, 75 F. Supp. 3d 942 (C.D. Ill. 2014) is the worked example: an action
brought by the United States **and four state attorneys general**, where the court records that the
`§ 227(g)` counts *"allow the Court to treble statutory award of up to $500 per violation if Dish
acted knowingly or willfully."*

---

## ⭐ how an exposure count is actually built

the same decision carries the most useful operational fact in this brief, and it is not a rate — it
is a **method**. Dish produced **~435,000,000** call records, and the count was assembled by expert
analysis into buckets defined by **which duty was breached**:

| the bucket, verbatim from the decision | count |
|----------------------------------------|-------|
| *"telemarketing calls … for which Dish had invalid Established Business Relationship claims"* | 1,112,125 |
| *"no Established Business Relationship claim of any kind"* | 2,230,290 |
| *"on both the Registry and the Dish internal Do-Not-Call List"* | 3,698,918 |
| *"calls to telephone numbers on the Dish internal Do-Not-Call List"* | 6,485,211 |

⭐ **the exposure is not one number multiplied by one rate. it is per-bucket, and the buckets are the
duties.** a program that breaches three duties is counted three ways over the same call log, and the
records that define the buckets are **the sender's own**.

⚠️ **and that is where this brief meets the record question.** the buckets above were built from call
data; whether a given call sits in a lawful bucket turns on a consent or suppression record the
sender must produce. see `hazard.unprovable-consent-record`.

---

## ⭐ what the nominal number becomes when it is actually paid

the tracks above give the statutory units. those are the **upper bound**, and the distance between
that bound and a paid outcome is the largest single distortion in how this exposure gets described.

the clearest measure sits in `Amadeck v. Capital One Fin. Corp.`, 80 F. Supp. 3d 781 (N.D. Ill.
2015) — the final-approval opinion for what the defendants told the court was, at the time, *"the
largest cash sum in the 22-year history of the TCPA"*. every figure below is that court's own.

| the quantity | the figure |
|---|---|
| calls alleged in violation | ~**1.9 billion** |
| nominal exposure at $500/call, verbatim | *"a minimum of **$950 billion**"* |
| nominal exposure if willful, verbatim | *"as high as **$2.85 trillion**"* |
| the settlement fund | **$75,455,099** |
| less notice + administration | ($5,093,000) |
| less counsel fees + service awards | ($22,636,530 + $25,000) |
| **value delivered to the class**, as the court states it | **$47,700,569** |
| class size | **17,522,049** |
| per class member, had all claimed | **$2.72** |
| claimants who actually filed | **1,378,534** — a **7.87%** claims rate |
| **per claimant, as paid** | **$34.60** |

⭐ **so the largest TCPA settlement of its era paid about $75.5M against a nominal $950B — on the
order of one part in twelve thousand.** and the court did not treat $34.60 as generous: in its own
words that figure *"falls on the 'lower end of the scale'"* of comparable TCPA recoveries.

⚠️ **two cautions on how to read this.**

- **the ratio is not a rule.** it is one case, with a very large class and a consent defense the
  court described at length. a small class with clean liability compresses that distance sharply,
  and the claims rate — **7.87%** here — is what does most of the work.
- **the bound still matters, because it is what drives the settlement.** the court said plainly that
  complete victory *"would most surely bankrupt the prospective judgment debtor"*. that is precisely
  why the defendant paid. **the statutory maximum is not what gets paid; it is the leverage that
  decides what does.**

**source**: [Amadeck v. Capital One Fin. Corp., 80 F. Supp. 3d 781 (N.D. Ill. 2015)](https://www.courtlistener.com/opinion/7311505/amadeck-v-capital-one-financial-corp/)

---

## the honest gap

- 🔶 **forfeiture magnitudes: PARTLY CLOSED, and the residue is precise.** ✅ what a real forfeiture
  order looks like is now on the record — $57M (AT&T), $46.9M (Verizon), $92M combined
  (T-Mobile + Sprint) — with the count method and the cap construction quoted above. ⛔ **what is
  still absent is a magnitude from a TCPA order specifically.** every captured figure is a `§ 222`
  CPNI matter. the machinery transfers because `§ 227(b)(4)` routes through the same `§ 503(b)`; the
  **amounts do not**, because `§ 1.80` sets a different tier for each. **a reader must not quote
  "$57 million" as a TCPA exposure figure.**
- ⚠️ **why the earlier appellate sweep came back near-empty, corrected.** an earlier pass searched
  courts-of-appeals review and got **zero hits on two of three queries**, and this brief explained
  that by `§ 504(a)`'s collection route. ⭐ **that explanation was too strong.** the appellate corpus
  was not empty — a six-facet sweep found four 2025 circuit decisions the narrow pass missed. the
  lesson is the one this research keeps re-learning: **a two-query null is a null about the
  queries, not about the corpus.** `§ 504(a)` remains a true description of the collection route; it
  was not the reason the earlier search failed.
- ⬜ **district-court collection suits remain UNREAD — a named null, not a silence.** this brief
  identified them as the place to look, and four were located by name:
  `United States v. Neely` (D.S.C. 2009), `United States v. TravelCenters of America` (D. Or. 2007),
  `United States v. Unipoint Techs.` (D. Mass. 2016), `United States v. Worldwide Indus. Enters.`
  (E.D.N.Y. 2016). **all four rendered at 316 bytes** — far under the 2,000-byte content floor — so
  their text was never read and **not one word of them is quoted anywhere in this brief.** the search
  result line for `Neely` describes *"an action to enforce a $4000 monetary forfeiture"*, which
  suggests these are small matters rather than the nine-figure ones, **but a search-result line is
  not a capture and that figure is deliberately not relied upon.** a different host for these four is
  the next step.
- ⚠️ **that emptiness is recorded as a result, not retried into a confirmation** — and ⭐ **the
  statute explains it.** `47 U.S.C. § 504(a)` routes collection of a forfeiture to a **civil suit**,
  not to appellate review of an agency record, and says so expressly:

  > "The forfeitures provided for in this chapter shall be payable into the Treasury of the United
  > States, and shall be recoverable … **in a civil suit in the name of the United States** brought
  > in the district where the person or carrier has its principal operating office … *Provided*, That
  > any suit for the recovery of a forfeiture imposed pursuant to the provisions of this chapter
  > **shall be a trial de novo**"

  ⭐ **a trial de novo is not appellate review.** the contested forfeiture is re-tried from scratch in
  a **district** court, so an absence of courts-of-appeals merits decisions is what the collection
  route predicts — it is not evidence that forfeitures go uncontested. **this converts the earlier
  read from a bare hypothesis into a statutorily-grounded explanation**, and it also means the place
  to look for real magnitudes is district-court collection suits, not appellate opinions.
- ✅ **the meaning of *"any single act or failure to act"*: CLOSED for practical purposes.** the
  phrase is still undefined **in `§ 1.80` itself** — that has not changed — but three 2025 circuit
  decisions now show how it operates, and two of them **rejected** the respondent-friendly read that
  a whole flawed program is one act. the apparent contradiction this bullet used to describe
  dissolves: **the cap is real inside a unit** (`Gray` cut $1.72M to $518,283) **and the unit is
  drawn by the agency**, so a large total is reached by many capped cells rather than one uncapped
  one. ⚠️ the construction is of `§ 503(b)(2)(B)`'s phrase in non-TCPA matters; **no TCPA decision
  applies it**, and one FCC Commissioner is on record against the subdivision.
- ⬜ **the deepfake-robocall NAL is still unpulled.** `LWV v. Kramer` (D.N.H. 2025) confirms an FCC
  *Notice of Apparent Liability* exists in that record (document no. 71-3) without an amount in the
  captured text. **that remains the closest thing to a TCPA-adjacent magnitude and it was not
  reached on this pass.**
- 🔶 **state mini-TCPA penalties are now addressed elsewhere, and the result inverts this brief's
  frame.** `ref.mini-tcpa-five-state` carries the matrix. ⭐ **the states with the largest
  per-violation figures — Indiana at $25,000, California with a disconnection remedy — have no
  private right located at all**, while New York, which does have one, sets it at **$50**. so the
  federal intuition this brief builds (small private unit, no cap, agency capped) **does not
  transfer**: at state level the big numbers belong to regulators and the private numbers can be an
  order of magnitude *below* the federal $500. ⚠️ where a single state is named anywhere in **this**
  brief, it is cited for the one point it makes and is not a survey. **a sender's total exposure is
  the federal tracks plus every served state's own.** ⬜ five states is not fifty.
- ⭐ **the state safe-harbor null above was accurate AND incomplete — and a later pass proved it.**
  the TX/CA/NY/IN table records that **no construction was located** on CourtListener, and warned
  that the statutory *text* had not been read for a due-care provision. **that text has since been
  read for Indiana, and Indiana has one**: `Ind. Code § 24-4.7-5-2` conditions its penalty on a
  defendant who cannot show it *"did not know; and (2) in the exercise of reasonable care could not
  have known"*. so the caveat earned its place — **an unlitigated defense is still a defense**, and
  the null would have read as absence without it. TX, CA, and NY remain unsearched at the text level.
- **the private track's limitations period is not stated here**; the general four-year federal
  window and its own provenance caveat are covered in `hazard.unprovable-consent-record`.
- 🔶 **settlement data now rests on a single case.** the `Amadeck` section above closes the worst of
  this gap with one court's own figures, but **one data point is not a range.** the court itself said
  it *"does not have the necessary data to compare this proposed settlement to other TCPA actions
  based on the recovery per class member"* — so a per-claimant benchmark across cases is owed, and a
  reader should not treat `$34.60` or the twelve-thousand-to-one ratio as typical.
- **verdict data is still absent.** every figure above comes from a *settlement*. what a TCPA case
  yields at **trial** was not researched, and a settlement discount is not a verdict discount.
- **whether class treatment is available** — the assumption on which every uncapped private figure
  rests — is a separate question with its own brief.
- ⛔ **whether the FCC may impose a forfeiture in-house AT ALL is now contested, and unsettled.** the
  5th Circuit vacated one on *Jarkesy* grounds, the 2d Circuit rejected the same challenge, and the
  D.C. Circuit declined to reach it — all in 2025. ⬜ **what was NOT researched**: whether any court
  has applied *Jarkesy* to a **TCPA** forfeiture specifically, whether review was sought in any of the
  three, and what the Commission's enforcement posture has been since. **a brief that treats the
  forfeiture track as reliably collectible, or as reliably dead, would be wrong in the same way.**
- ⚠️ **the FCC's own document corpus was never reached on this pass either.** every figure in the new
  section comes from a **court's description** of an agency order, not from the order itself.
  `fcc.gov`'s search remains a javascript app that defeated three earlier queries. **a court's
  recital is a reliable secondary account and it is not the primary document.**

## key takeaways

| question | answer |
|----------|--------|
| is there one penalty figure? | **no** — three federal tracks, plus state law on top |
| which track has no cap? | the **private** one — `§ 227(b)(3)` states no aggregate limit |
| which per-unit figure is largest? | the **FCC forfeiture** — up to $25,132, ~50× the private $500 |
| so is the regulator the bigger threat? | ⭐ **not on the face of the rules** — that track is capped at $188,491 per single act |
| does the cap settle it? | ⭐ **no, but not for the reason first supposed** — the cap is **real inside a unit**, and the **agency draws the unit** |
| what is a "unit", per the 2025 decisions? | **per relationship, per day** — `Verizon` upheld 63 units, one per third-party channel left open |
| has the cap ever actually cut a number? | ⭐ **yes** — `Gray Television`: a computed **$1.72M** was reduced to the **$518,283** cap |
| so how does a total get large? | ⭐ **many capped cells, never one uncapped one** |
| what has the FCC really imposed? | **$57M** (AT&T) · **$46.9M** (Verizon) · **$92M** combined (T-Mobile + Sprint) — ⚠️ all `§ 222` CPNI matters, **not TCPA** |
| may those figures be quoted as TCPA exposure? | ⛔ **no** — `§ 1.80` sets a different amount tier per service; only the **method** transfers |
| can the FCC even do this in-house? | ⛔ **contested** — 5th Cir. vacated on *Jarkesy*; 2d Cir. said yes; D.C. Cir. declined to decide |
| where does a jury enter, on the courts' account? | ⭐ the two routes diverge: `§ 504(a)`'s collection suit is tried de novo, while a petition for review *"forgoes a jury trial"* — and both large 2025 respondents paid and petitioned |
| is `135 F.4th 230` safe to cite? | ⛔ **no** — that opinion was **withdrawn** and substituted on 2025-08-22 |
| what does treble require? | a **willful or knowing** violation, and it is discretionary |
| does a state AG need state law? | **no** — `§ 227(g)` is a state-AG action under the *federal* statute |
| how is a real count built? | ⭐ **per bucket, by breached duty**, off the sender's own call records |
| are these the numbers a defendant pays? | ⭐ **no** — in the largest TCPA settlement of its era, ~$950B nominal became **$75.5M** paid, **$34.60** per claimant |
| why settle at all, then? | because complete victory *"would most surely bankrupt the prospective judgment debtor"* — the bound is the leverage |
| does the `§ 227(c)(5)` safe harbor help on a state claim? | **no** — it is a federal defense to a federal claim; each state's analogue is its own question |
| what has a court said "due care" buys in TX/CA/NY/IN? | 🔶 **no construction was located** in any of the four — the mitigant is untested there, which is **not** the same as absent |
| are forfeiture-order amounts verified? | 🔶 **partly** — real orders are now on the record, but **none from a TCPA matter**; that residue is the brief's remaining gap |

## .publishability

☀️ **fullsun** (share) — generic public-law reference; three statutes, one codified regulation, and
six published federal decisions. no client identity, no client-specific mechanic, no design choice
settled, **neutral both-sides voice**. the subject throughout is the documents, not a party.

authored in neutral legal voice per `rule.require.fullsun-facts-not-tactics`: every figure is given
as the rule gives it, with the text quoted so a reader can check the brief rather than rely on it,
and the gap between what the rules state and what agencies assess is named rather than papered over
with a plausible number. the brief states **what the law provides** and does **not** state what any
party should do about it — any decision that follows is a business decision and does not belong in a
fullsun brief. triaged per `rule.require.publishability-triage`.

## .see also

- `hazard.unprovable-consent-record.[hazard].md` (the record that decides which bucket a call lands in)
- `ref.tcpa-consent-elements.[ref].md` (what consent must contain to keep a call out of a bucket)
- `define.boundary.formation-not-customer-status-is-the-axis.[lesson].md` (whether the uncapped private track can aggregate)
- `ref.mini-tcpa-five-state.[ref].md` (the **fourth** layer this brief names and disclaims — five
  states' own penalty tracks, where the biggest figures belong to regulators, not plaintiffs)
- `../../../../insurer/briefs/hazard.either-question-can-defeat-gl-coverage-of-a-tcpa-claim.[hazard].md`
  (whether a CGL answers any of these tracks)

## .sources

1. [47 U.S.C. § 227 — § 227(b)(3) private damages, § 227(b)(4) forfeiture, § 227(c)(5) DNC right + safe harbor, § 227(g) state-AG action (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim)
2. [47 U.S.C. § 503 — the forfeiture authority § 227(b)(4) routes into (House OLRC, official)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section503&num=0&edition=prelim)
3. [47 U.S.C. § 504 — collection by civil suit, "shall be a trial de novo" (House OLRC, official; text in effect July 29, 2026)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section504&num=0&edition=prelim)
4. [47 C.F.R. § 1.80(b)(10) — the inflation-adjusted TCPA forfeiture amounts and the single-act cap (eCFR, official)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-1/subpart-A/subject-group-ECFR7ff8b7fb03d9c60/section-1.80)
5. [47 C.F.R. § 1.80(b)(5), (b)(9) — the intent-penalty adjustment and the per-call failure-to-block forfeiture (eCFR, official). ⚠️ **the same CFR section as the `§ 1.80(b)(10)` entry above, reached at a second eCFR page** — counted as two urls, but honestly it is **one document**, so the distinct-document count of this brief is **7**, not 8](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-1/subpart-A/subject-group-ECFRe23796df9028e47/section-1.80)
6. [United States v. Dish Network, L.L.C., 75 F. Supp. 3d 942 (C.D. Ill. 2014) — the § 227(g) counts and the per-bucket count method](https://www.courtlistener.com/opinion/7311150/united-states-v-dish-network-llc/)
7. [League of Women Voters of New Hampshire v. Kramer (D.N.H. 2025) — confirms an FCC Notice of Apparent Liability in the record without an amount in the captured text](https://www.courtlistener.com/opinion/10696904/league-of-women-voters-of-new-hampshire-league-of-women-voters-of-the/)
8. [47 C.F.R. § 64.1200 — the duties whose breach defines each exposure bucket (eCFR, official; title 47 current as of 7/28/2026)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200)
9. [Amadeck v. Capital One Fin. Corp., 80 F. Supp. 3d 781 (N.D. Ill. 2015) — final approval; the $950B-nominal vs $75.5M-paid comparison, the 7.87% claims rate, and the $34.60 per-claimant recovery](https://www.courtlistener.com/opinion/7311505/amadeck-v-capital-one-financial-corp/)

10. [Fla. Stat. § 501.059(10)(c) — the pre-suit `STOP` condition and the 15-day cure (FL Senate, official, 2025 compilation)](https://www.flsenate.gov/Laws/Statutes/2025/501.059)
11. ⭐ [AT&T v. FCC, No. 24-60223 (5th Cir. **Aug. 22, 2025**) — the $57,265,625 NAL, the 84-continuing-violation count, and the *Jarkesy* vacatur. ⛔ **cite THIS opinion, not 135 F.4th 230**, which it expressly withdraws](https://www.courtlistener.com/opinion/10658934/att-v-fcc/)
12. ⚠️ [AT&T v. FCC, 135 F.4th 230 (5th Cir. Apr. 17, 2025) — **WITHDRAWN and superseded**. retained in this list only so a reader who meets the F.4th cite elsewhere can see that it was replaced; **no quote in this brief rests on it**](https://www.courtlistener.com/opinion/10380754/att-v-fcc/)
13. ⭐ [Verizon Commc'ns Inc. v. FCC (2d Cir. Sept. 10, 2025) — the $48,318,750 NAL, the $46.9M order, the 63-violation per-relationship count, and the construction of *"single act or failure to act"*](https://www.courtlistener.com/opinion/10669161/verizon-commcns-inc-v-fed-commcns-commn/)
14. ⭐ [Sprint Corp. v. FCC (D.C. Cir. Aug. 15, 2025) — the $92M combined forfeiture, the *"$40,000 for the first day and $2,500 for each subsequent day"* arithmetic, the $2,048,915 common-carrier cap, and the § 504 jury-trial reasoning](https://www.courtlistener.com/opinion/10654759/sprint-corporation-v-fcc/)
15. [Gray Television, Inc. v. FCC, 130 F.4th 1201 (11th Cir. 2025) — the worked example in which the cap actually bit: a computed $1.72M reduced to the $518,283 statutory maximum](https://www.courtlistener.com/opinion/10352035/gray-television-inc-v-federal-communications-commission/)

⚠️ **on the count.** fifteen entries, but entries **4 and 5** are one CFR section reached at two eCFR
pages, and entries **11 and 12** are one docket — the second being the withdrawn predecessor of the
first, listed for the correction it records rather than for any quote. the **distinct-document**
count is therefore **13**.

**reproducible pulls** — the playbooks behind each leg, retained in full:

- 2026-07-31 · settlement magnitudes:
  `refs/find.tcpa-settlement-magnitudes.play.ts`
- 2026-07-31 · settlement approvals:
  `refs/read.tcpa-settlement-approvals.play.ts`
- 2026-07-31 · state safe harbors:
  `refs/find.state-safe-harbors.play.ts`
- 2026-08-01 · forfeiture magnitudes, six-facet search:
  `refs/find.fcc-forfeiture-magnitudes.play.ts`
- 2026-08-01 · forfeiture opinions, with the disposition grep as a hard gate:
  `refs/read.fcc-forfeiture-amounts.opinions.play.ts`

## .date researched

2026-08-01 (the forfeiture-magnitude and 2025 circuit-split legs); 2026-07-31 (the
settlement-magnitude and state-safe-harbor legs); the balance of the brief, 2026-07-30
