# hazard._.catalogue — directory

> scan-first map of the **bodies of law** that reach a directory which publishes verification states
> about third-party subjects. one row per hazard, with its severity, its jurisdiction, and a link to
> the full `hazard.$slug.[hazard].md`.
>
> this is a **navigation artifact** — it makes no independent factual claim, so it inherits its
> citations from the hazard briefs it points to (per `rule.require.seven-distinct-citations` exception).

> **not legal advice.** informational groundwork for counsel to validate.

## ⭐ the convention — which files carry `.enforcement`, and what it means when they do

**every brief in this cluster carries `.enforcement`, including the `[hazard]` and `[lesson]` files.**
that is deliberate, and it is stated here so a reader can tell a convention from an accident.

| file type | what its `.enforcement` block is |
|---|---|
| `rule.*.[rule].md` | ⭐ an **original mandate** — the rule declares the obligation |
| `hazard.*.[hazard].md` | a **derived check** — what to verify so *this body of law* is not tripped |
| `define.boundary.*.[lesson].md` | a **derived check** — what to verify so *this boundary* is not crossed |
| `howto.*.[lesson].md` | a **derived check** — what to verify so *this sequence* is not broken |

⚠️ **the third and fourth rows are one class, and the table lists them apart on purpose:** any
`*.[lesson].md` carries a derived check. they are shown separately because the two answer different
questions — a boundary check asks *which side is this on*, a howto check asks *did the steps run in
order* — and a reader who sees only *"lesson"* would not know a sequence brief enforces at all.

⭐ **why hazards and boundaries enforce at all.** a hazard brief that names a body of law and stops is
unactionable: the reader learns a risk exists and no move to make. **the `.enforcement` block is what
converts a described hazard into a checkable one**, and it is the shape the counselor role's
`market/` hazard briefs are for.

⚠️ **a reader may object that a `[lesson]` which carries blocker-severity enforcement *"functions as
a rule while named as a lesson"* — a fair ubiqlang concern (`rule.forbid.term.addition.ambiguous`).
two answers:**

1. ⛔ **the premise is an inference, not a repo rule.** `rules101.structure` governs how a **rule
   file** is *named* (`rule.$directive.$topic.md`) and how a directive maps to a severity. **it does
   not say that only rule files may carry `.enforcement`**, and no brief in this repo does.
2. ⛔ **the observation reaches almost the whole cluster, so a rename of a few files would make it
   inconsistent with itself.** **14 of the 16 files here** carry enforcement — every `[hazard]`,
   every `[lesson]`, and the `rule`. **the only two exceptions are this catalogue and the glossary,
   both navigation artifacts**, which makes the exception a *category* rather than a one-off.

   > ⚠️ **that count is derived by command, and the command is stated in full — globs included —
   > because a denominator taken from a non-recursive glob silently omits `_taxonomy/`:**
   > `rhx globsafe --pattern 'src/domain.roles/counselor/briefs/market/directory/**/*.md'`

⭐ **so the defect a reader senses is not the enforcement block — it is that they could not tell an
original mandate from a derived check.** the fix is to say which is which, above, and to have each
derived block name the rule it derives from. **a rename would have moved the ambiguity into the
filenames; a declared convention removes it.**

### ⚠️ where this machinery belongs — the lift trigger, named before it is needed

⭐ **the convention declaration, the audit index, and the gap tracker are novel to this cluster.** the
peer `../referrals/` catalogue has none of them.

`rule.prefer.most-common-denominator` says to nest at the leaf until reuse is **proven**, not
predicted — so this machinery is correctly here and **must not be lifted yet**.

> ⛔ **the trigger, so the lift is a decision rather than a drift: when a SECOND `market/` catalogue
> (`reviews/`, `rewards/`) reaches for the same machinery, lift the convention and the tracker spec
> to `market/_taxonomy/`.** one cluster is a leaf; two is a common denominator.

⚠️ **and note which part would lift: the *spec*, never the *contents*.** the gap rows are this
cluster's own and stay here. **a shared tracker with mixed clusters' gaps in it is the aggregation
defect at brief grain.**

> ⛔ **this catalogue carries no worked render of a profile, and that is deliberate.**
> `rule.require.fullsun-facts-not-tactics` divides a brief's **inputs** — the law, the statutory
> text, the structural read, all shareable — from its **outputs**, the decision reached and the
> mechanic chosen. a render of exact copy strings in a fixed order is an **applied design**: our
> answer, not the law's. ⭐ **every RULE such a render would demonstrate ships here in full** — the
> presence-fact date requirement, the claim-is-a-relationship definition, the two-`⬜` collapse, and
> the never-show list are each owned by a named brief and each ☀️ fullsun. what a fullsun cluster
> withholds is the **composition**, not the law.

## ⭐⭐ the AUDIT INDEX — where the checks live, and what each file's checks are about

⛔ **the cluster carries ~118 `= blocker` / `= nitpick` matches across 22 files, and there is no way
to find them but to open all 22.** for briefs whose whole claim is that they are *checkable*, that is
a real omission — a builder or an auditor had no entry point to what they came for.

> ⚠️ **"~" is deliberate.** the raw match count over-reports this file (prose that quotes the pattern)
> and under-reports any brief with a wrapped bullet. **it is an order-of-magnitude figure and the
> per-file table below is the one to act on.**

⚠️ **this is an INDEX, not a checklist. it does not copy the checks.** a second copy of 78 bullets is
a second source of truth, and this cluster has already been bitten three times by a copy that drifted
from its source. **go to the file; this table tells you which file.**

> ⛔ **RE-COUNTED — the numbers below are from a fresh run, and the header two paragraphs up
> (*"78 checks across 17 files"*) is STALE.** the current run reports **118 matches across 22 files**,
> and the two figures do not reconcile by growth alone: five briefs were added, and the pattern that
> produced 78 was one of the three partial patterns this section warns about. ⭐ **an index that
> documents its own count failure modes and then carries a number produced by one of them is the
> exact defect it describes.**

| brief | checks | what its checks are about |
|---|---|---|
| `rule.require.asymmetric-disclosure` | 10 | ⭐ **start here** — the publication rule itself: what may be asserted, the collapse, the announcement, the required copy, paid placement, and the hosted-speech boundary |
| `rule.prefer.metadata-over-republication` | 8 | ⭐ the three layers over third-party content: copyright, contract, accuracy — count vs score vs text |
| `hazard.sealed-record-republication` | 7 | adverse-record publication, the fee model, juvenile records |
| `hazard.go-private-request` | 7 | removal on request: the announcement copy, the tombstone, re-ingestion |
| `define.boundary.promotional-vs-sensitive` | 7 | which body of law a datum's **kind** selects; the § 102 routes; the compilation trap |
| `rule.require.opt-out-bounded-to-entity-registry-facts` | 7 | ⭐ **the clearance standard** — the four tests, the label correction, the leak paths |
| `rule.require.dispute-channel` | 6 | ⭐ the subject's correction path: conspicuous, free, acted on, and not a leak |
| `hazard.consumer-report-gate` | 6 | the three-part refusal — terms, design, evidence — that keeps the surface outside FCRA |
| `hazard.badge-implies-endorsement` | 6 | false association: badge form, disclaimer, paid placement |
| `hazard.stale-public-record-status` | 6 | as-of dates, expiry, unique-key match, pre-revert notice |
| `define.boundary.registry-date-vs-claimed-tenure` | 6 | the entity date vs the operator's claim; attribution, and the forbidden delta |
| `define.boundary.optin-vs-optout-vs-blocked` | 9 | ⭐⭐ **the clearance model** — three states, who can cure each, and the four dimensions that are NOT clearance axes |
| `define.boundary.consent-cures-privacy-not-fcra` | 5 | what an opt-in buys and what it does not; the CCPA sale exit |
| `howto.compose-the-person-track` | 5 | the **order** of the person-track steps, and the two preconditions |
| `hazard._.catalogue` (this file) | 5 | ⚠️ mostly **prose that quotes** the pattern; the real check count is **1** — the sync rule |
| `hazard.reincorporation-blind-spot` | 4 | ⚠️ inverted severity — the checks fire on mechanisms that **close** the gap |
| `define.boundary.diligence-answer-vs-published-claim` | 4 | research vs publication; the § 230 limit |
| `define.boundary.entity-grain-vs-person-grain` | 4 | grain stated before any statute is cited |
| `hazard.unclaimed-profile-right-of-publicity` | 3 | person-grain pages, consent, paid placement |
| `define.boundary.who-speaks-decides-the-regime` | 3 | who authored the statement, and which regime that selects |
| `define.boundary.presence-fact-vs-absence-fact` | 2 | which results may be asserted at all |
| `_taxonomy/_.glossary` | 1 | ⚠️ **the one check outside a `.enforcement` block** — a restatement of a canonical atom without its section number. it hid from this index precisely because it sits inline in prose |

> ⭐ **counted by command, not by increment**, per the lesson two sections above:
> `rhx grepsafe --pattern '= \*?\*?(blocker|nitpick)'` over this directory. **re-run it rather than
> trust the numbers** — they are a snapshot and this table does not self-update.

> ⚠️ **the count has THREE known failure modes, and all three under- or over-report silently:**
>
> | mode | what it does | how it was found |
> |---|---|---|
> | **bold vs bare** — `= **blocker**` and `= blocker` both occur | a pattern matched to one form omits whole **files**, and a file with no row reads as a file with no checks | ⛔ **an audit index built from a partial pattern is worse than no index** |
> | ⭐ **a wrapped bullet** — the `=` ends one line and `blocker` starts the next | the check is **invisible** to a line-oriented count; the file's own total reads one low | found here — `rule.require.dispute-channel` counted 5 against 6 real bullets |
> | **prose about the pattern** | a sentence that *quotes* `= blocker` matches as though it were a check; this file's own count reads 4 against **1** real check | the same pass |
>
> ⭐ **so a raw count is a lower bound on real checks and an upper bound on this file's.** the mitigation
> that actually holds is on the **authoring** side: keep `= blocker` on one line. widen the pattern
> before you trust a count, and hand-verify any file whose number moved.

### ⭐ every brief here now clears the seven-source floor, and none by a padded list

> ⛔ **SUPERSEDED — this section used to list six briefs that rested on fewer than seven sources,
> deliberately.** each of the six named its own gap in place (an `[unverified]` residual, an
> un-swept state, a clause *"quoted at second hand"*). the gap was closed by **capturing those named
> residuals**, never by a re-quote of what an owner brief already holds:
>
> | brief | sources | what closed the gap |
> |---|---|---|
> | `rule.require.dispute-channel` | 2 → 7 | the dispute analogues in CA, NY, and FCRA, each scoped to its own regulated party; IN and FL still un-swept |
> | `define.boundary.presence-fact-vs-absence-fact` | 1 → 7 | *"truth is a complete defense"* read state by state, which **corrected** it (FL conditions truth on good motives) |
> | `define.boundary.registry-date-vs-claimed-tenure` | 4 → 10 | the `[unverified]` § 5 / state UDAP residual, swept federal + five-state |
> | `hazard.stale-public-record-status` | 5 → 9 | § 1681m, once named but uncaptured, plus the dispute clock |
> | `define.boundary.entity-grain-vs-person-grain` | 6 → 7 | § 45, which its regime table leaned on uncited |
> | `define.boundary.consent-cures-privacy-not-fcra` | 6 → 7 | § 1798.125(b)(3), once quoted at second hand, captured direct and confirmed |
>
> ⚠️ counts are numbered `[title](url)` entries under `.sources`, the shape `briefs.integrity` parses;
> re-run it rather than trust this table. ⚠️ and two pads went the other way: *Feist* left
> `define.boundary.optin-vs-optout-vs-blocked` (it states it *"needs no case law"*) and § 1798.99.80
> left `rule.require.opt-out-bounded-to-entity-registry-facts` (no sentence there used it).

⭐ **the lesson of the six: a brief that names its own residual has already written its research
list.** the honest route to the floor was to read what each brief said it had not read.

⛔ **that is a rule collision, and it deserves a note because it will recur:**

| rule | grain | what it demands |
|---|---|---|
| `rule.require.seven-distinct-citations` | **per document** | ≥ 7 distinct sources in *this file* |
| ⭐ the canonical-owner convention (§ *the convention*, above) | **per cluster** | *"cite it; do not restate it"* — a derived brief points at its owner rather than a re-quote of the statute |

a derived brief that obeys the second can still miss the first, and a padded list is never the fix —
it would restate what the owner briefs own, the very duplication the convention exists to prevent.
the fix that held here is the brief's own named residuals. **an honest four still beats a padded
seven:** a reader can act on *"this rests on four sources"*; a reader who trusts
a padded seven has been told a falsehood about how well-supported the document is.

## the bodies of law covered

| area of law | principal authorities | brief |
|---|---|---|
| **consumer-report law** | 15 U.S.C. § 1681 (FCRA); state consumer-reporting statutes with no federal gate | `hazard.consumer-report-gate.[hazard].md` |
| **accuracy and currency law** | § 1681k(a)(2); state re-verify and staleness duties | `hazard.stale-public-record-status.[hazard].md` |
| **right of publicity** | TX Prop. ch. 26 · IN §§ 32-36-1-6/-8 · FL § 540.08 · CA § 3344 · NY Civ. Rights § 51 | `hazard.unclaimed-profile-right-of-publicity.[hazard].md` |
| **trademark / false-association law** | 15 U.S.C. § 1125(a); the § 1125(c) dilution exclusions | `hazard.badge-implies-endorsement.[hazard].md` |
| **criminal-history and sealed-record law** | TX Bus. & Com. ch. 109 · IN ch. 24-4-18 · CA § 1786.18 · NY Civ. Rights § 50-g · FL § 943.0585 | `hazard.sealed-record-republication.[hazard].md` |
| ⭐ **subject dispute and correction duty** | TX Bus. & Com. §§ 109.003–109.004, priced by § 109.005; the fee prong feeds CCPA § 1798.140(ad)(1) | `rule.require.dispute-channel.[rule].md` — ⚠️ **sourced from the row above and broader than it**: its scope reaches any record a directory publishes about a subject, not only a criminal one |
| **corporate identity and successor law** | state entity registries; the person-grain statutes each linkage key re-enters | `hazard.reincorporation-blind-spot.[hazard].md` |
| **data-broker deletion law** | ⚠️ Cal. Civ. Code § 1798.99.86 — **a mechanics model here; it does not bind an entity-grain directory that does not sell**; other-state analogues un-swept | `hazard.go-private-request.[hazard].md` |

## ⭐ the axis that sorts them — subject grain

`define.boundary.entity-grain-vs-person-grain` is the axis above all others, because **most of these
statutes define their subject as a natural person.** whether a given body of law reaches a directory
at all is decided there first. **read this column before the brief.**

⭐ **cited, not re-derived.** the full grain→regime table — eleven regimes × entity/person, with the
verbatim definitional hooks — has one owner:

> **`define.boundary.entity-grain-vs-person-grain.[lesson].md`** — § *.the boundary*

the one-line result an index needs:

> ⭐ **the privacy-derived bodies of law gate on "natural person" and drop away at entity grain; the
> accuracy-derived and property-derived ones do not.** a directory's subject grain therefore selects
> which half of the table it must answer to.

⛔ **this section carries the one-line result and NOT a second copy of the table.** two copies of a
grain→regime table drift, and when they do **neither is a superset of the other** — so a reader of
either gets a partial map with **no signal that it is partial**, and *"keep them in sync"* has no
agreed row set to sync *to*.

⚠️ **an index is where that defect is most expensive.** a catalogue is read *instead of* the briefs,
by a reader who wants the shape without the detail — so a partial table here is not a convenience,
it is a wrong answer delivered with an index's authority.

## the hazards

| hazard | what trips it | severity | jurisdiction | brief |
|--------|---------------|----------|--------------|-------|
| **consumer-report gate** | a page is *expected to be used* for an eligibility decision → it is a consumer report, and an open page has no lawful form | blocker | federal § 1681a(d)(1) + **state CRA statutes with no federal gate** | `hazard.consumer-report-gate.[hazard].md` |
| **stale public-record status** | a favorable status outlives the record behind it → a true claim decays into a false one with no act by anyone | blocker | federal § 1681k(a)(2); **IN 60-day bound; CA 30-day re-verify duty** | `hazard.stale-public-record-status.[hazard].md` |
| **unclaimed-profile right of publicity** | a pre-populated page about a natural person is a commercial use of their name — **before any status is rendered** | blocker | TX/IN/FL/CA/NY (FL strictest on scope, CA on remedy) | `hazard.unclaimed-profile-right-of-publicity.[hazard].md` |
| **badge implies endorsement** | a mark reproduced beside a certification implies an affiliation or approval that does not exist | blocker | federal § 1125(a) — ⛔ **no statutory fair-use exclusion**, unlike (c) | `hazard.badge-implies-endorsement.[hazard].md` |
| **sealed-record republication** | a record captured while public is later sealed → the duty depends on **which actor the state regulates** | blocker | TX ch. 109 + IN ch. 24-4-18 bind the **publisher**; CA binds the reporter; NY binds a prior seal-duty holder; FL binds only agencies | `hazard.sealed-record-republication.[hazard].md` |
| **reincorporation blind spot** | a subject dissolves and re-forms → entity-grain history resets, and every linkage key that would bridge it is person-grain | ⚠️ the **gap itself** is an accuracy limit, not an exposure — ⛔ but every **cure** for it is a blocker: predecessor-entity link, officer/agent name, adverse cross-entity inference | the person-grain regimes each linkage key re-enters (see the ROP and consumer-report rows) | `hazard.reincorporation-blind-spot.[hazard].md` |
| **go-private request** | a subject asks to be removed → the duty is person-grain, and the removal itself is legible | blocker (person grain) — ⭐ the operative duty is **ROP consent-withdrawal**, swept unanimously in the ROP row above | ⚠️ **CA § 1798.99.86 is a MECHANICS MODEL, not the authority** — its source brief holds that it does not bind an entity-grain directory that does not sell, on two independent prongs. other-state broker analogues un-swept | `hazard.go-private-request.[hazard].md` |

⚠️ **two rows carry no statutory duty at entity grain and are catalogued anyway** — reincorporation
and, at entity grain, go-private. **an index restricted to liability would omit the accuracy limits
entirely**, and accuracy is the layer that does *not* drop away with grain.

⭐⭐ **and read the reincorporation row's severity precisely, because the obvious sense inverts it.**
the *gap* — a subject dissolves, re-forms, and their history resets — carries no duty. **every
mechanism that would CLOSE the gap is a blocker**, because each one is a person-grain linkage key
that re-enters the regimes entity grain had just exited. so the row is not "harmless"; it is
**"harmless only while it stays unfixed."** an index that scored it `n/a` would invite exactly the
fix that creates the exposure.

## ⛔⛔ .the DECLARED GAPS — hazards with no brief, named here rather than footnoted

> ⭐⭐ **THIS IS THE CANONICAL OPEN-QUESTION TRACKER for the cluster. add a gap here first.** other
> briefs may note a gap where it bites them, and each must **link here**. a gap that lives only in a
> hazard brief's footnote is not tracked — it is mentioned.

⚠️ **an index whose only omissions are silent is worse than an incomplete one**, because a reader
takes the row set as the census. these three are real and have **no `hazard.*` brief**:

| key | gap | why it is not merely un-swept | where it currently hides |
|---|---|---|---|
| `G-false-light` | ⭐⭐ **false light** | flagged **three separate times** across the cluster as un-swept — and `rule.require.asymmetric-disclosure`'s own honest-gap section calls it *"the row counsel should test first."* **the cluster's highest-priority open question has no row in the index that is supposed to rank open questions.** the exposure is structural: the whole design turns on what a `⬜` *implies*, and false light is the tort about implication | 3 footnotes, no row |
| `G-claimant-identity` | ⭐ **claimant identity verification** | the vision calls identity *"the substrate"* and names *"a pro claims their profile"* a core scenario. the cluster defines `claimed profile` as a **relationship state** — but **how a claimant proves they are who they claim is addressed nowhere.** a claim flow with no identity proof lets a stranger take control of a real business's page, which re-opens ROP (the name), false association (the badges), and defamation (whatever they then assert) | defined as a state; the flow is absent |

⚠️ **the open edge cases under the identity gap, so a future brief starts from a list rather than a
blank page:** a contested claim (two parties claim one profile), a claim by someone who is **not** the
qualifier, a claim by a former officer after a sale, and re-verification cadence after a claim is
granted.

### ⭐⭐ the third gap — the one that carries three defenses at once

| key | gap | why it belongs in the tracker | where it currently hides |
|---|---|---|---|
| `G-section5-omission-cure` | ⭐⭐ **does advance disclosure cure a § 5 omission claim?** | `[unverified]`, no FTC authority captured. ⛔ **it is a single point of failure for three separate defenses** — the publication asymmetry (a `⬜` is consistent with stated terms), the inference at high coverage (a disclosed blanket rule defeats the inference), and the aggregation answer (we assemble but assert no adverse fact). **all three rest on this one premise, and if it fails they fail together** | `rule.require.asymmetric-disclosure` § the honest gap |

⛔ **note where that gap was hiding, because it is the pattern this tracker exists to defeat:** it was
recorded where it was *discovered* — inside the rule it threatens — rather than where a reader who
wants the open-question list would *look*. **a gap noted beside what it threatens is legible to that
brief's reader and invisible to everyone else.**

⭐ **why these are declared rather than drafted:** each needs its own capture pass and a five-state
sweep, which is a research task rather than a repair. **flagged for the council with the scope named.**

### ⛔⛔ the PRECONDITION — the one gap that BLOCKS the others rather than joins them

> **`G-grain-assignment` is promoted out of the backfill table. it is not a gap in the analysis — it
> is a gap in the analysis's INPUT, and every verdict downstream of it inherits the error.**

| key | gap | why it is a precondition | where it currently hides |
|---|---|---|---|
| `G-grain-assignment` | ⭐⭐ **how a datum's GRAIN is assigned at ingest** | the grain **test** is owned and clear; the grain **mechanism** is owned by no brief. ⛔ **it fails silently and in the unsafe direction** | `howto.compose-the-person-track` § the step that NO brief owns |

⭐ **why it outranks every other row in this tracker, in one line:**

> **every other gap costs one answer. this one costs ALL of them, and costs them without a symptom.**

the composition order this cluster runs — grain, then kind, then result — takes grain as its **first**
input. so a mis-assigned grain does not produce a wrong answer to the grain question; it produces
**correct answers to the wrong question**, all the way down. the page renders, the badges compute, the
clearance verdicts pass their own tests, and every one of them was decided under a regime that does
not apply.

⛔ **and the four exits fail together, because they are one hinge.** `[observed]` FCRA § 1681a(c)
*"an individual"*, `[observed]` CCPA § 1798.140(i) *"a natural person"*, `[observed]` the DELETE Act's
consumer definition, and `[observed]` the publicity sweep's unanimous *"individual"* / *"natural
person"* — **four regimes, one word.** entity grain leaves all four at once, which is its power, and a
mis-assignment forfeits all four at once, which is its danger. **there is no partial failure mode.**

#### the safe default, stated so it can be adopted before the gap closes

> `[inferred]` **treat a subject as person-grain unless an entity registry record says otherwise.**

⭐ **the argument is asymmetric error, not caution.** the two mistakes do not cost the same:

| mistake | cost |
|---|---|
| a **person** scored as an entity | ⛔ four regimes' protection forfeited, silently, on a live page |
| an **entity** scored as a person | ⚠️ some publishable rows withheld — a product cost, fully recoverable |

one is a permanent disclosure; the other is a delay. **when the errors are that unequal, the default
is not a judgment call.**

⚠️ **and the default must be keyed on a registry RECORD, never on the shape of the name.** the three
leak paths all look like entities to the eye — a d/b/a, a single-member LLC, and a qualifier's licence
held by a human — so a heuristic over the name reproduces exactly the error the default exists to
prevent. see `rule.require.opt-out-bounded-to-entity-registry-facts` § *the three leak paths*.

⛔ **what remains open even with the default adopted:** the *mechanism* — what registry is consulted,
at what point in ingest, what happens on a miss, and how a re-assignment propagates to already-
published rows. a default answers the **verdict**; it does not answer the **flow**, and the flow is
what a build needs.

### the BACKFILL table — gaps whose only other record is a `[research]` tag inside a brief

⚠️ **a canonical owner that is announced but left short is worse than no owner at all** — it converts
a scattered set of gaps, which a reader knows to hunt for, into an authoritative-looking list that is
quietly incomplete. these are each named `[research]` or *"not covered here"* somewhere in the
cluster:

| key | gap | why it belongs here | where it currently hides |
|---|---|---|---|
| `G-databroker-sweep-4state` | **data-broker sweep — TX · IN · FL · NY** | CA is the only swept cell. the entity answer likely exits all four on the same *natural person* hinge — **likely is not swept**. ⛔ **and no non-CA data-broker statute is captured at all**, so even the citation is un-fixed | `define.boundary.entity-grain-vs-person-grain` § the regime union |
| `G-in-chp-scope` | ⭐ **IN § 24-4-18-2 / -3 — are WE a "criminal history provider"?** | `[observed]` §§ -6/-7/-8 are captured and relied on, and the **definitions that decide whether the chapter reaches us at all** are not. a duty analysis that skips the scope section assumes its own premise | `hazard.sealed-record-republication` § the IN layer |
| `G-nominative-fair-use` | **nominative fair use under Lanham § 1125(a)** | ⛔ the statutory exclusion sits at **(c)(3)(A)**, inside dilution, and does **not** reach (a). so the claim that scales with coverage has **no statutory defense** — only un-captured case law | `hazard.badge-implies-endorsement` § the correction |
| `G-common-law-rop` | **common-law ROP + privacy torts (Restatement § 652)** | the **statutory** five-state sweep is complete; the common-law overlay is not. it is the layer § 230 declines to preempt | `hazard.unclaimed-profile-right-of-publicity` § the sweep |
| `G-sealed-underlayer` | **the four un-captured statutes UNDER the sealed-record sweep** | the five-state sweep is run and its **operative** sections are captured. what is open is the layer beneath: `[unverified]` **IN §§ 24-4-18-2/-3** (scope), **TX Gov't Code ch. 411 subch. E-1** (orders of nondisclosure, referenced by § 109.005(a)(2)), ⭐ **NY CPL §§ 160.57 / 160.50** — *§ 50-g's whole trigger*, so the NY narrowness read rests on § 50-g's own text alone — and **FL § 943.059** (seal, distinct from the captured § 943.0585 expunction) | `hazard.sealed-record-republication` § what is NOT covered here |
| `G-successor-liability` | **successor liability across a reincorporation** | ⚠️ a **separate** gap from the row above, and it was folded into it by mistake. no successor-liability authority is captured in any state | `hazard.reincorporation-blind-spot` |
| `G-grain-assignment` | ⛔ **PROMOTED — see § *the PRECONDITION* above.** the row is left here as a pointer rather than deleted, because a key that vanishes from the table a reader last saw it in reads as closed | ⚠️ **do not re-add the full row here.** it was a backfill row and that was the mis-rank: a backfill gap is one whose answer is absent, and this one's **input** is absent. tracked in exactly one place | § the PRECONDITION |
| `G-unclaimed-surface` | ⭐ **the unclaimed-subject surface — page, or search result?** | `hazard.unclaimed-profile-right-of-publicity`'s **cleanest** mitigation (*"a search result, not a page"*) removes the browse surface that makes a directory a directory. ⛔ **the strongest legal answer is the weakest product answer.** the conflict is confined to **unclaimed** subjects — claimed pages survive either way — so it is a bounded wisher trade, not an open-ended one | `hazard.unclaimed-profile-right-of-publicity` § that variant CONFLICTS |
| `G-dispute-sla` | ⚠️ **the DISPUTE / correction channel** — ✅ **owner assigned, in its own file; the SLA number stays open** | it was relied on in **four** briefs and owned by none. ⛔ **it is not a courtesy — TX §§ 109.003–109.004 make its absence actionable**, so it is now `rule.require.dispute-channel.[rule].md`, at the four citers' common ancestor per `rule.prefer.most-common-denominator`. ⭐ **the placement is load-bearing twice over**: four citers is the lift trigger, **and** the duty's scope is broader than the criminal-history chapter that supplies it — filed inside a sealed-record brief it reads as bounded to sealed records, and it is not. ⚠️ what remains open: the **SLA number** (*"prompt"* is statutory; a number is a build choice) and the **other four states' analogues**, un-swept — so the duty is grounded in one state and adopted everywhere on the strictest-common-denominator posture | `rule.require.dispute-channel` |
| `G-registry-tou` | **state corporate-registry terms of use** | several registries restrict **bulk reuse of officer data** — which is exactly the linkage the reincorporation gap would need. un-swept | `hazard.reincorporation-blind-spot` § what is NOT covered here |
| `G-state-udtpa` | **state unfair-competition / deceptive-trade-practices analogues to § 1125(a)** | `rule.require.five-state-baseline` does not bind the badge brief (§ 1125 is federal), so the state parallel layer was never swept — **the rule's own scope is why this one hid** | `hazard.badge-implies-endorsement` § what is NOT covered here |
| `G-lanham-1114` | **15 U.S.C. § 1114** — registered-mark infringement | ⚠️ **found by this sweep, not by the review.** the badge brief reaches § 1125 only; § 1114 is the registered-mark cause of action beside it | `hazard.badge-implies-endorsement` § what is NOT covered here |
| `G-sealed-caselaw` | **case law on all five sealed-record states** | the sweep is statutory by construction; the case-law overlay is absent, and this layer's remedies are the ones with per-day statutory damages | `hazard.sealed-record-republication` § what is NOT covered here |
| `G-qualifier-key` | **is the qualifier's licence number public registry data, or consent-gated background?** | ⛔ **it decides whether the reincorporation gap is closable at all** — person-linkage is the only continuity across a dissolve-and-reform, and F2 gates person background on opt-in. a contractor who reincorporates to shed a record simply declines to opt in | `define.boundary.entity-grain-vs-person-grain` § the cost nobody prices |

### ⛔⛔ the SYNC-RULE SWEEP — 11 keys were live in briefs and absent from this tracker

> **the sync rule predicted its own breach and the prediction came true within one cycle.** it said:
> *"the honest weakness of this rule: it has no verifier … people do not compute set differences
> reliably."* **the set difference was computed by hand for the first time here, and it found 11.**

⭐ **the pattern is not carelessness — it is the ORDER of the work.** every one of these was raised by
a brief at the moment a capture answered or opened it, which is exactly when a tracker update is
furthest from the author's attention. **a gap is registered when it is discovered and forgotten when
it is resolved**, so a tracker that is only appended to drifts toward stale-open, while one updated
only on discovery drifts toward incomplete. **this one did both.**

#### ✅ CLOSED by capture — recorded so a reader does not re-open a settled question

| key | resolved by | what moved |
|---|---|---|
| `G-facts-originality` | ✅ **Feist, 499 U.S. 340** | ⛔ **it closed AGAINST the brief that raised it** — `[observed]` *"§ 102(b) is universally understood to prohibit any copyright in facts"*, which reversed that brief's own § 102(b) correction. a fact enters the list as a *"discovery"* |
| `G-aggregate-score` | ✅ **Yelp ToS** (`20260101_en_us`) | *"aggregate star ratings"* named as their own Content — the score moved from ⚠️ *attribute it* to ⛔ **optin** |
| `G-browsewrap-assent` | ✅ **Nguyen v. Barnes & Noble**, 763 F.3d 1171 | a bare browsewrap gives no constructive notice — ⛔ **and it does not rescue us**, because **actual knowledge** is the other route and this cluster now quotes the terms |

#### ⚠️ OPEN and previously untracked — each was live in a brief with no row here

| key | gap | where it hides |
|---|---|---|
| `G-platform-tos` | ⭐ **the platform-terms sweep beyond Yelp** — Google, Angi, BBB, trade platforms. ⛔ **the five-state frame does NOT fit**: it is one agreement per platform, not one law with five variants | `rule.prefer.metadata-over-republication`; `define.boundary.promotional-vs-sensitive` |
| `G-ftc-reviews-rule` | **16 C.F.R. Part 465** — the FTC rule on fake and AI-generated reviews. it reaches **platforms**, not only sellers, so the whole review row inherits it | 3 briefs, no row |
| `G-hiq-disposition` | ⛔ **what became of LinkedIn's contract claim.** the capture is the 2022 **preliminary-injunction** opinion on the CFAA. **do not cite hiQ for a final outcome on any theory** | `rule.prefer.metadata-over-republication` |
| `G-robots-as-notice` | ⭐ **is a `robots.txt` directive the "more" Nguyen required?** `[inferred]` it is an express notice channel aimed at automated agents — which is precisely what a bare browsewrap lacks | `rule.prefer.metadata-over-republication` |
| `G-browsewrap-circuits` | **browsewrap outside the 9th Circuit** — Nguyen is one circuit, and it construes a **consumer** browsewrap rather than a commercial collector at scale | `define.boundary.optin-vs-optout-vs-blocked` |
| `G-attested-provenance` | ⭐ **the third-party attester** — insurer, surety, bond issuer. neither us nor them: **a fourth provenance kind the badge vocabulary has no state for**, and the counselor readme names insurance and bonds as its first two protection mechanisms | `define.boundary.optin-vs-optout-vs-blocked` |
| ~~`G-blocked-row-split`~~ | ✅ **CLOSED — the split was executed.** the ☀️ fullsun half is now `define.boundary.optin-vs-optout-vs-blocked`; the 🔒 protect half left the shippable tree entirely, per `rule.require.publishability-triage`'s *"remove from the shippable tree"*. ⭐ **the gap lasted one cycle, which is the shortest life any row in this tracker has had** — and it is the only one whose fix was a **file move** rather than a research pass | executed |
| `G-event-driven-recheck` | **what triggers a re-check** of a status between scheduled passes | `define.boundary.optin-vs-optout-vs-blocked` |
| `G-metadata-refresh` | **the refresh cadence for a published count** — a stale count is a stale assertion under the same as-of duty every other row carries | `rule.prefer.metadata-over-republication` |

⭐⭐ **`G-attested-provenance` is the largest of these and it is a VOCABULARY gap rather than a research
gap.** the badge states describe two speakers — us (`verified`) and them (`claimed`). an insurer's
certificate is neither, and no capture will supply the absent state. **it is the one row here that a
research pass cannot close.**

### ⛔ the sync rule — without it a canonical tracker decays on contact

a tracker with no rule that binds the other briefs to it is a snapshot, not an owner. the rule:

> ⛔ **a `[research]` item, an `[unverified]` claim a brief says it cannot close, or a *"not covered
> here"* note in ANY brief of this cluster, that has no row in the tables above = blocker.**

the brief that discovers a gap still records it where it bites — that is what makes it legible to
that brief's reader. **the record and the row are both required; neither substitutes for the other.**

⛔⛔ **and the honest weakness of this rule: it has no verifier.** a careful re-read is a
**set-difference over 16 files**, and people do not compute set differences reliably. ⚠️ **the
mechanical form is a grep, and it is NOT built** — run it by hand until it is:

```
# every gap marker in the cluster, with the file that raised it
rhx grepsafe --pattern '\[research\]|\[unverified\]|not covered here' \
  --glob 'src/domain.roles/counselor/briefs/market/directory/**/*.md'
# reconcile against the G-<slug> keys in this file; a marker with no key is the blocker
```

⛔ **and note what that check does NOT fix: the rows here are hand-copied from per-brief § *what is
NOT covered here* footnotes, so the same fact is authored twice.** a grep detects the divergence; it
does not prevent it, because a second author still writes a footnote and forgets the row. **a check
on a duplicated fact is a smoke alarm, not a sprinkler** — the durable form is a **generated**
tracker whose rows are derived from the footnotes rather than copied beside them.

#### ⛔ every gap carries a STABLE KEY

⚠️ **a gap referenced by prose description alone can silently absorb another** — two gaps with no
identity to compare merge on a careless read, and no check detects the merge.

⭐ `rule.require.immutable-refs` and the domain-object discipline both say a record referenced across
contexts needs a stable, immutable key. **a tracked gap is exactly that** — referenced from a brief,
from a council list, and from a future capture pass.

> ⭐ **the key format: `G-<slug>`, assigned once and never reused.** the slug is descriptive, the key
> is immutable. a gap that is **split** yields two new keys and the old one is retired with a note;
> a gap that **graduates** (DECLARED → BACKFILL) keeps its key, because it is the same gap at a new
> stage.

⛔ **and the rule that gives the key teeth: a brief that names a gap cites its key**, not a
paraphrase of it. a paraphrase is what lets one gap absorb another.

✅ **all 17 rows above carry a key** — 2 declared + 1 declared-later + 14 backfill, by a row count of
the three tables.

#### ⭐ which table a new gap enters — the criterion, so it is not inferred

⚠️ this section holds **two** tables, and a contributor had to guess which one a new gap belonged in.
the criterion is **whether any brief owns the topic at all**:

| the gap is… | it goes in… |
|---|---|
| a topic **no brief covers** — there is no `hazard.*` or `define.*` for it | ⛔ **the DECLARED GAPS table** — the ⛔⛔ one above |
| a **hole inside a covered topic**, named in that brief's own § *what is NOT covered here* | **the BACKFILL table** |

⭐ **the distinction is not cosmetic — the two need different work.** a DECLARED gap needs someone to
**decide it owns a brief**; a BACKFILL gap needs a **capture pass** on a brief that already exists.
⚠️ **and a DECLARED gap can graduate**: once a brief is written for it, its remaining open edges move
down to the backfill table.

> ⛔ **maintenance invariant for the rows above: a summary row must be checked against the section it
> summarizes, not against memory of it — and never against a capture's *filename*.** a wrong citation
> on a gap row is worse than a blank one, because it retires the search; and an index that
> contradicts its own source is worse than an absent index, because a reader trusts the index
> precisely so they need not open the source.

### ⛔⛔ what is NOT a gap — the scope line this cluster draws

⚠️ **a reviewer of this cluster will repeatedly find that a stated requirement has no build spec** —
*"consent must be cheap to reverse"* with no UX, *"no bulk-export or eligibility-shaped API"* with no
architecture, *"a data row, not a crest"* with no visual spec, *"poll the queue every 45 days"* with
no owner or SLA. that observation is **correct and is not a defect of these briefs.**

| this cluster states | a build spec states |
|---|---|
| ⭐ **what must be true**, and the authority that makes it so | **how to make it true** in one product |
| the **test** a design must pass | the design that passes it |
| the exposure a choice opens or closes | which choice to take, and its screens |

⭐ **the split is deliberate and it is what keeps these briefs ☀️ fullsun.** a requirement traced to a
statute is public law; the mechanism a given adopter builds to satisfy it is a **fingerprint** — see
`rule.require.publishability-triage`. **fold the build spec in and the whole cluster drops to 🔒
protect**, and the value of a publicly-stated policy (which is itself the legal mechanism, per
`rule.require.asymmetric-disclosure` § the ANNOUNCEMENT) is lost with it.

⛔ **the two exceptions, and note what they have in common:**

1. **required copy strings** — the go-private announcement, the badge strings, the branch-blind
   support answer. **the exact words carry the load**, because a paraphrase drifts and the collapse
   breaks in the paraphrase
2. **structural controls where a policy would not hold** — the store-boundary projection
   (`rule.require.asymmetric-disclosure` § *the projection is the boundary*), the tombstone that
   outlives re-ingestion. **an outcome asserted with no mechanism is a policy that merely looks like
   one**, and where the mechanism is the only reason the rule is true, it is stated

> ⭐ **the line: we specify a mechanism when the rule is FALSE without it. we decline to specify one
> when the rule is merely unimplemented without it.**

⚠️ so *"no UX spec for consent withdrawal"* is out of scope, and *"no mechanism that makes the
console rule structurally true"* is **in** it — the console rule is false without its mechanism, and
the withdrawal rule is merely unbuilt without its UX.

## what each body of law regulates

the seven do not regulate the same object, which is why a single mitigation never answers more than
one of them:

| the regulated object | areas of law |
|---|---|
| an **affirmative assertion** about a subject | accuracy and currency law · trademark / false association |
| the **compilation** itself, before any assertion | right of publicity · consumer-report law |
| a **retained record**, whether or not published | criminal-history and sealed-record law |
| the **identity** the assertions attach to | corporate identity and successor law |
| the **removal** of a subject on request | data-broker deletion law |

## the boundaries that draw each line

- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — which statutes reach which subject
- `define.boundary.who-speaks-decides-the-regime.[lesson].md` — § 230(f)(3) and the speaker question
- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — which results are favorable at all
- `define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — the reach and limit of consent
- `define.boundary.diligence-answer-vs-published-claim.[lesson].md` — ⭐ why an adverse fact told to
  its own subject is not a publication, and where that boundary breaks
- `define.boundary.promotional-vs-sensitive.[lesson].md` — ⭐ the datum's **kind**, which selects
  between the privacy stack and the IP/contract stack. ⛔ **grain buys almost none of the second**
- `define.boundary.registry-date-vs-claimed-tenure.[lesson].md` — the entity's registry date vs the
  operator's own claim; the one comparison that surfaces a reincorporation at **zero grain cost**

## ⭐ the composition guide — the order the boundaries run in

- `howto.compose-the-person-track.[lesson].md` — ⭐⭐ **the person track as a SEQUENCE.** the cluster is
  written entity-first, so the person rules exist as an aside in thirteen files and as an order in
  none. this brief supplies the order

⚠️ **it is the only brief here whose content is a sequence rather than a rule.** that is deliberate:
every rule it sequences is owned elsewhere, so it restates none of them. **a reviewer who finds it
thin on law has found its design, not a defect.**

## the recommendation rule in this area

- ⭐⭐ `../../rule.prefer.unmet-element-over-won-defense.[rule].md` — **the strategy rule above this
  whole cluster.** four of its worked examples come from here, and it is stated at the counselor root
  because the same move recurs in `rewards/`. ⛔ **read it before any brief here**: it is why entity
  grain, spend-only credits, and metadata-not-republication are the same design move
- `define.boundary.optin-vs-optout-vs-blocked.[lesson].md` — ⭐ the clearance model: three states, and
  **who can cure each**. the third state is the one a two-state model gets wrong rather than coarse
- `rule.require.asymmetric-disclosure.[rule].md` — publish-only-favorable disclosure law, and why it
  sits above the legal floor rather than at it
- `rule.require.opt-out-bounded-to-entity-registry-facts.[rule].md` — ⭐ **the clearance standard.**
  the four conjunctive tests a datum passes to be published by default, and the *"default opt-in"*
  label correction. ⛔ **paired with, never merged into, the rule above** — clearance asks *may we hold
  this*, publication asks *do we surface it*, and a datum can clear opt-out and still render `⬜`
- `rule.prefer.metadata-over-republication.[rule].md` — the three layers over third-party content:
  copyright, contract, accuracy. ⭐ **link it, count it, or licence it — do not copy it**
- `rule.require.dispute-channel.[rule].md` — the subject's correction path, and why its absence is
  itself the violation rather than a partial one

## .date researched

2026-08-02 to 2026-10-19: the span of the captures behind the briefs this index points to. it reads no source of its own.

## .publishability

☀️ **fullsun** (share) — a public-law hazard map. every row names a body of law, what trips it, and
which brief holds the verbatim authority. no client identity, no coverage data, no applied mechanic.

⚠️ **two kinds of content are deliberately kept OUT of this index, and both exclusions are load-bearing:**

| what does not belong here | which rule decides it |
|---|---|
| an **applied mechanic** — exact badge copy strings, a rendered profile, a runbook of the order one product runs the steps in | ⛔ `rule.require.fullsun-facts-not-tactics` — a fullsun brief carries the **question**, not our answer |
| a **build narrative** — how this cluster was assembled, which pass found which defect, what a review round said | ⛔ `rule.forbid.aggregation-index-build-narrative` — an index must read as *"a library of legal topics"*, never as *"one program's build plan"* |

⭐ **the two fail differently, so they want different fixes.** an applied mechanic must be **cut** —
once published it cannot be unpublished. a build narrative is not secret at all; it is **filed as the
wrong kind of artifact**, and the fix is to move it to the route record that owns construction
history (`howto.correct-visibly-without-a-leak.[lesson].md`).

⚠️ **and note the check that does NOT protect this file:** the automated `repo-rules` reviewer is
scoped to `**/*.{ts,sh}` and has never read a markdown brief in this cluster. **the publishability
verdict here rests on a human read.**

## .see also

- `_taxonomy/_.glossary.[summary].md` — the term index for this area
- `../_taxonomy/_.glossary.[summary].md` — the market-mechanics term index, and the `verified` overload
