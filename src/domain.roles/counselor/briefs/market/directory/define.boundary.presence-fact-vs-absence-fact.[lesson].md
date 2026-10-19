# define.boundary — presence-fact vs absence-fact

> **not legal advice.** informational only; consult a licensed attorney. every claim is tagged
> `[observed]` (quoted from a captured source), `[inferred]` (reasoning over those sources), or
> `[unverified]` (not yet sourced).

## .what

the facts a directory checks split on **what a positive result looks like**:

- a **presence-fact** — the positive result is *a record that exists*. license, permit, registration.
- an **absence-fact** — the positive result is *that no record exists*. a clean civil history, a
  clean criminal history.

the split matters because **only one of the two can be asserted safely**, and the two behave in
opposite directions as a directory's coverage grows.

## .why the split exists

to say *"their license was found"* is to report a document. to say *"they have no judgments"* is to
report the **absence** of every document, everywhere, forever — a claim no search can support. the
first is bounded by what you looked at; the second is bounded by what exists in the world.

> a presence-fact is falsifiable by one document. an absence-fact is falsifiable by one document
> **you never saw.**

so an absence-fact is not merely harder to verify. it is a categorically different assertion, and
`[inferred]` it carries the exposure of a factual claim about the person while resting on the
completeness of a search that can never be proven complete. and the claim is the directory's own:
`[observed]` 47 U.S.C. § 230(f)(3) makes an *"information content provider"* of whoever is
*"responsible, in whole or in part, for the creation or development of information"*, and a "clean"
badge is information no one but the directory created.

## ⭐ .the correction — a presence-fact returns a STATUS, not a boolean

**an earlier framing of this boundary treated presence-facts as uniformly publishable. that is
wrong, and the error matters.** a license lookup does not return *found* or *not found*. it returns
a **status**, and some statuses are adverse.

`[observed]` the licenser role already enumerates them
(`../../../../licenser/briefs/industry=.all/define.what-licenses-mean.md`):

| status | what it means | assertable? |
|---|---|---|
| **active, clean** | valid, no disciplinary history | ✅ yes — `verified license` |
| **active, disciplined** | valid, but past violations | ⛔ **adverse** |
| **expired** | lapsed, not legal to practice | ⛔ adverse |
| **suspended** | temporarily barred | ⛔ adverse |
| **revoked** | permanently barred | ⛔ adverse |

so the real axis is **not** presence vs absence. it is **favorable vs adverse**, and presence-facts
happen to be the only class that can ever come back favorable.

⭐ **the statute uses that same axis.** `[observed]` 15 U.S.C. § 1681c(a)(5) bars *"any other
**adverse item of information**, other than records of convictions of crimes which antedates the
report by more than seven years."* FCRA's structural line is adverse-vs-not — never present-vs-absent.

## .the corrected boundary

| | **presence-fact** | **absence-fact** |
|---|---|---|
| rows | license · permit · registration · identity | civil history · criminal history |
| a favorable result is | a record exists, in good standing | no record exists |
| assertable? | ✅ **only when the status is favorable** | ⛔ never |
| an adverse result is | a record exists, in bad standing (suspended, revoked) | a record exists (a judgment, a conviction) |
| adverse result renders as | ⬜ — ⭐ **the same cell an un-checked row shows** | ⬜ — ⭐ **the same cell an un-checked row shows** |
| ⭐ as coverage → total | ⬜ drains toward *not currently licensed* | ⬜ fills with **clean people** |
| implication risk | ⚠️ legible — and see below | ✅ stays illegible, and more so at scale |

## ⭐ .the two classes move in opposite directions as coverage grows

this is the finding that decides whether a directory gets safer or riskier as it succeeds.

**absence-facts get safer.** the base rate is clean — most contractors have no judgment and no
conviction. so as coverage rises, `⬜` on the civil row fills up with **people who have nothing
against them**. the class the collapse hides in grows, and the inference from `⬜` gets weaker, not
stronger.

**presence-facts get legible.** in a licensed trade at high coverage, a `⬜` on the license row
increasingly means *this contractor is not currently licensed in good standing.*

`[inferred]` **and where it becomes legible, it is safe**, for three reasons that stack:

1. the inference is **true** — and truth defeats defamation in all five baseline states, though not
   on identical terms (§ *truth across the five states*, below)
2. the underlying fact is published **free by the state**, so the profile discloses no more than the
   registry does
3. the status is one the contractor is **legally required to hold** to hold themselves out at all

> ⭐ **the rows where the implication is legible are the rows where it is true and harmless. the rows
> where it would be damaging are the rows where it stays illegible — permanently, and more so at
> scale.**

## ⭐ truth across the five states

`[observed]` truth reaches defamation through three different doors:

| state | authority | the text | what it makes truth |
|---|---|---|---|
| TX | Tex. Civ. Prac. & Rem. Code § 73.005(a) | *"The truth of the statement in the publication on which an action for libel is based is a defense to the action."* | a **defense** |
| CA | Cal. Civ. Code § 45 | *"Libel is a false and unprivileged publication …"* | an **unmet element**: a true statement is not libel at all (`../../rule.prefer.unmet-element-over-won-defense`) |
| FL | Fla. Const. art. I, § 4 | *"In all criminal prosecutions and civil actions for defamation the truth may be given in evidence. If the matter charged as defamatory is true and was published with good motives, the party shall be acquitted or exonerated."* | a defense **conditioned on good motives**, civil actions included |
| NY | N.Y. Const. art. I, § 8 | *"In all criminal prosecutions or indictments for libels, the truth may be given in evidence to the jury; and if it shall appear to the jury that the matter charged as libelous is true, and was published with good motives and for justifiable ends, the party shall be acquitted"* | a defense **in criminal libel**, conditioned on motives and ends |
| IN | Ind. Const. art. 1, § 10 | *"In all prosecutions for libel, the truth of the matters alleged to be libellous, may be given in justification."* | a justification **in libel prosecutions** |

⭐ **so "truth is a complete defense" holds as stated in TX, holds more strongly in CA, and carries a
motive condition on its face in FL.** `[inferred]` a `⬜` that becomes legible is not a publication with
a motive at all; it is the absence of a badge. that is the strongest posture any of the five texts
allows. ⚠️ `[unverified]` the civil-defamation treatment of truth in NY and IN, which these
constitutional texts address only for prosecutions, and the federal constitutional overlay on all five.

⚠️ `[unverified]` — **false light** is the live residue. some states reach true-but-misleading
juxtaposition, which is exactly the `⬜`-beside-`✅` shape. truth answers defamation; it does not
automatically answer false light. see `hazard.unclaimed-profile-right-of-publicity` for the
five-state posture and note that the false-light sweep is **not yet run**.

## ⚠️ .the cost this boundary imposes, stated plainly

under a publish-only-favorable rule, **a revoked license renders identically to "not yet
checked."** that is the single highest-cost cell in the design: the consumer most needs the signal, and
the directory is structurally silent.

`[inferred]` the mitigation is not to publish the adverse status but to make the **favorable** signal
load-bearing: a consumer who learns to read `verified license` as *the thing to look for* is served
by its absence, without the directory ever making an adverse claim. that is a product-design answer
to a legal constraint, and it should be stated rather than assumed.

⚠️ **it also means the ability to say "clean" is forfeit.** a contractor with a spotless twenty-year
record cannot be distinguished from one with an unpaid judgment. the good operator differentiates on
**presence-facts** — verified license, verified permit, verified registration — never on an empty
record.

## ⭐ .one registry record can carry three presence-facts

`[observed]` `src/domain.roles/permiter/briefs/ref.electrical-license-structure.indiana.[ref].md`
— to register with Marion County DBNS a contractor must:

> register with Marion County DBNS · **maintain required insurance** · **provide proof of surety bond**

so a single **entity-grain** registration bundles license-linkage, insurance, and bond. `[inferred]`
that answers insurance and bond as badge rows **without** a third-party-attestation model — the
registry already attests them, and mirroring a registry is the cheapest presence-fact there is.

## .the test

> **"if this check comes back the way the subject would want, am I reporting a document — or the
> absence of one?"**

- a document → **presence-fact**. publishable **when the status is favorable**.
- the absence of one → **absence-fact**. never publishable; it collapses to `⬜`.
- ⚠️ a document in **bad standing** → still a presence-fact, but **adverse**. it collapses to `⬜` too.

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this boundary
> is not crossed. the convention is declared in `hazard._.catalogue` § *the convention*; the original
> mandates live in `rule.*` files. **a `[lesson]` that enforces is checkable, not normative.**

- a badge that asserts an **absence-fact** — "no records found", "clear", "clean" = **blocker**
- a badge that asserts a presence-fact **without its status** — `verified license` on a suspended or
  expired license = **blocker** (it is a false statement, and the accuracy layer is the one that
  sharpens at entity grain)
- a brief that treats presence-facts as uniformly publishable, rather than favorable-status-only =
  **blocker** (the defect this brief corrects)
- an adverse presence-status rendered as anything other than the same `⬜` as an unchecked row =
  **blocker** (it defeats the collapse; see `rule.require.asymmetric-disclosure`)

## .note on the five-state rule

`rule.require.five-state-baseline` is met for the one state-law step this brief takes (§ *truth across
the five states*); it draws no state-law redline of its own. its axis is federal (§ 1681c(a)(5)) plus a
structural taxonomy. the state-law layer it points
at — false light, sealed-record republication — is carried by the hazard briefs, where the five-state
sweep is run. **stated explicitly so a reviewer can tell a scope boundary from an omission.**

## .sources

1. [15 U.S.C. § 1681c](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681c&num=0&edition=prelim)
2. [47 U.S.C. § 230](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim)
3. [Tex. Civ. Prac. & Rem. Code § 73.005 (TX Legislature, official; ch. 73 page)](https://statutes.capitol.texas.gov/Docs/CP/htm/CP.73.htm)
4. [Cal. Civ. Code § 45 (CA Legislative Info, official)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=45)
5. [Fla. Const. art. I, § 4 (FL Senate, official)](https://www.flsenate.gov/Laws/Constitution)
6. [N.Y. Const. art. I, § 8 (NYS Senate, official)](https://www.nysenate.gov/legislation/laws/CNS/A1S8)
7. [Ind. Const. art. 1, § 10 (Justia mirror)](https://law.justia.com/constitution/indiana/art1.html)
8. license status vocabulary — `../../../../licenser/briefs/industry=.all/define.what-licenses-mean.md`
   (which cites [Virginia DPOR consumer resources](https://www.dpor.virginia.gov/Consumers))
9. contractor registration bundle — `src/domain.roles/permiter/briefs/ref.electrical-license-structure.indiana.[ref].md`

statutory sources captured via browser per `rule.require.bhrowser-citations`.

> ⭐ **seven distinct statutory sources.** the adverse-vs-favorable axis still needs only one anchor,
> § 1681c(a)(5). the other six carry the two steps the argument rests on: that the badge is the
> directory's own claim (§ 230(f)(3)), and that truth defeats defamation, read state by state rather
> than assumed. ⚠️ the Indiana row cites the Justia mirror, a fallback per
> `rule.require.five-state-baseline`.

## .date researched

2026-08-02 to 2026-10-19: the capture dates of the sources listed in `.sources`, each read via browser.

## .publishability

☀️ **fullsun** (share) — a structural taxonomy over public law. the distinction is derivable by
anyone who reads § 1681c(a)(5) beside a state license registry; no client identity, no coverage data,
no applied mechanic. its value is that it is **correct**.

⚠️ **one line is held back.** the *observation* that coverage growth strengthens the collapse on
absence-facts is public reasoning and ships here. the **coverage figures themselves** — which trades,
which metros, what share of profiles carry `⬜` — are operational data and belong in the restricted
artifact.

## .see also

- `_taxonomy/_.glossary.[summary].md` — the term index
- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the axis above this one
- `rule.require.asymmetric-disclosure.[rule].md` — the rule that renders adverse results as `⬜`
- `hazard.stale-public-record-status.[hazard].md` — why a favorable status decays
- `../../../../licenser/briefs/industry=.all/define.what-licenses-mean.md` — the status vocabulary
