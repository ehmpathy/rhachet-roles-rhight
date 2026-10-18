# rule.require.opt-out-bounded-to-entity-registry-facts

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> reliance. every claim is tagged `[observed]` (quoted from a captured source), `[inferred]`
> (reasoning over those sources), or `[unverified]` (not yet sourced).

## .what

**a datum may be published by default — opt-out clearance — only when it passes all four tests
below. every datum that fails any one of them is opt-in: silence is a refusal.**

opt-out is not a posture the directory adopts wholesale. it is a **clearance a specific datum earns**,
and the four tests are conjunctive, not a balance.

> ⭐⭐ **THIS IS THE CANONICAL STATEMENT of the opt-out boundary, and of the term correction below.
> cite it; do not restate it.**

## ⛔ .the term correction — read this first

> **a design described as "default opt-in" is an OPTOUT design.**

an opt-in is an **affirmative act by the subject**. a default cannot supply an act the subject never
took, so the phrase is not shorthand — it is a contradiction, and it hides a real conflict.

⭐ **the correction maps onto a statutory hook, so it is not merely rhetorical.** `[observed]`
**Cal. Civ. Code § 1798.140(ad)(2)(A)** — a business does not sell where *"A consumer **uses or
directs the business** to intentionally: (i) Disclose personal information"*.

**"directs" is an affirmative act.** an opt-out default supplies no direction, so a design that calls
itself "default opt-in" **does not reach this exit** — while its own label suggests it does. that is
the whole hazard: the phrase reads as consent obtained and describes consent assumed.

⚠️ **and it conflicts with a settled answer.** person background requires the person's **opt-in**. a
design that publishes person data by default and calls it "opt-in" has not satisfied that answer; it
has renamed its breach.

## .the four tests

each datum must pass **all four**. they are ordered by how cheaply each can be checked, so the first
failure stops the analysis.

### 1. grain — the subject of the datum is a business entity

`[observed]` **15 U.S.C. § 1681a(c)**: *"The term 'consumer' means an individual."*
`[observed]` **Cal. Civ. Code § 1798.140(i)**: *"'Consumer' means a natural person who is a
California resident…"*
`[observed]` the right-of-publicity sweep is unanimous on the same word — TX § 26.002 *"**An
individual** has a property right in the use of the individual's name…"*, FL § 540.08(1) *"any
natural person"*, IN § 32-36-1-6 *"a living or deceased natural person"*.

> ⛔ **CORRECTED by the sanity check: this cited TX § 26.014, which is accurate and is the wrong
> anchor.** § 26.014 is the *"Other Rights Not Affected"* savings clause — it mentions *"an
> individual"* only incidentally. **§ 26.002 is where the right is created**, so it is the section
> that decides who the chapter reaches. ⭐ **a quote can be verbatim and still be pulled from a
> provision that does not carry the claim** — a distinct failure from a misquote, and the one a text
> search is worst at, because the search succeeds.

⭐ **four separate regimes, one exit, the same two words.** entity grain is not one mitigation among
several — it is the single structural move that leaves all four at once. that is why it is test 1.

### 2. provenance — the datum comes from a public registry, verbatim and attributed

the registry published it **for the express purpose of public notice**. we mirror a government
record; we do not compose a dossier the state never assembled.

⭐ **this test is what answers the aggregation premise** rather than merely denying it. the objection
to assembly is that a compiled profile is a different object from the records composing it. a mirror
of one registry, attributed to that registry, is not a composition — and a datum that fails this test
(a scraped composite, an inference we drew, a third-party assertion) **is** one.

⚠️ **and it is the test with the sharpest operational cost.** contractor licences are frequently
issued at the municipal or county level, so registry-sourced-only means thousands of registries. it
is the strongest position legally and the most expensive one at national scope. **decide that
knowingly; do not discover it later.**

### 3. expression — the datum is a fact, not authored expression

`[observed]` **17 U.S.C. § 102(a)** extends protection to *"original works of authorship"*.
`[observed]` **Feist Publications v. Rural Telephone**, 499 U.S. 340 (1991) — facts are not
original to an author and are therefore uncopyrightable; a compilation earns protection only through
its own *"selection and arrangement"*.

so a registration number, an established date, a licence status, a permit record, a count, and a URL
are facts. **a logo, a tagline, site copy, a review text, and an aggregate score are not** — and the
last of those is the one that surprises, because a score looks like a number and sits on the
protected side of Feist's line.

⛔ **and passage of this test is necessary, never sufficient.** a bare count clears copyright and
can still be forbidden by **contract** — `[observed]` Yelp's terms forbid automated collection of
*"Yelp data"*, a category that reaches a count. see `rule.prefer.metadata-over-republication`.

### 4. valence — the datum is favorable, or it renders `⬜`

opt-out clearance answers *may we hold and publish this by default*. it **never** authorizes
publication of an adverse result.

⭐ **the two questions are genuinely separate, and this test is where they meet.** a civil judgment
against an entity passes tests 1–3 cleanly: it is entity-grain, it is a court record published for
public notice, and it is a fact. it is therefore **cleared to hold** — and `rule.require.asymmetric-
disclosure` renders it `⬜` regardless.

| | clearance | publication |
|---|---|---|
| asks | may we **hold** this? | do we **surface** it? |
| owned by | ⭐ this rule | `rule.require.asymmetric-disclosure` |
| entity civil judgment | ✅ opt-out | ⛔ renders `⬜` |
| licence status = revoked | ✅ opt-out | ⛔ renders `⬜` |
| licence status = active clean | ✅ opt-out | ✅ ✔ verified |

⚠️ **note the licence rows.** a licence lookup returns a **status**, never a boolean — *active clean ·
active disciplined · expired · suspended · revoked* — and only the first is assertable. a design that
treats the licence row as "we found it or we did not" has collapsed the wrong axis.

## ⭐⭐ .the argument FOR default publication that pure opt-in cannot make

> **with no record, there is nothing to suppress. a durable "never list me" is structurally
> unreachable under pure opt-in.**

this inverts the intuition, so it is worth the steps:

1. under pure opt-in, a subject who never enrolls has **no row** in our store
2. a later crawl re-discovers them from the same public registry and rebuilds the same stub
3. we cannot suppress what we do not hold — a suppression needs an object to attach to
4. therefore the subject's refusal survives only until the next crawl, and they must refuse again,
   forever

`[inferred]` the requirement that suppression **outlive re-ingestion** is standard for any go-private
duty, and it is satisfied by a **tombstone** — a retained marker that says *this subject declined* —
never by deletion of the row. a tombstone is a record. **so the object that creates the privacy
problem is the only object that can durably solve it.**

⚠️ **this is an argument for a bounded default, not for a broad one.** it justifies holding a
suppression marker; it does not justify publication of whatever else the crawl found. the four tests
still govern **what is published**; this section governs only **why a record may exist at all**.

## ⛔ .the three leak paths — where test 1 fails silently

test 1 is the cheapest to check and the easiest to get wrong, because a subject that looks like an
entity is often a person wearing one:

| leak | why the "entity" subject is a person |
|---|---|
| **the DBA** | a d/b/a is not an entity. it is a name a human trades under, so every datum under it is personal |
| **the single-member LLC** | one human, one wrapper. the registry says entity; § 1798.140(i) asks who the datum is *about* |
| ⭐ **the qualifier's licence** | `[unverified]` trades run on a qualifier structure — an **individual** holds the licence, the company holds a registration against it. so the most valuable presence-fact on the page may be personal data |

⭐ **all three fail test 1 while they pass the eye test**, which is why grain assignment is a
**precondition** to this rule rather than a step inside it: the rule cannot run until the grain of the
subject is settled, and a wrong grain silently converts every downstream verdict.

**the safe default: treat a subject as person-grain unless an entity registry says otherwise.** the
error is asymmetric — a person mis-scored as an entity loses four regimes' worth of protection at
once, and an entity mis-scored as a person loses only some publishable rows.

## .enforcement

- a datum published by default that fails **any** of the four tests = **blocker**
- ⛔ a design that describes itself as *"default opt-in"* = **blocker** — the label is the defect;
  rename it opt-out and the conflict it hides becomes visible
- ⛔ person-grain data published by default = **blocker**, whatever the surrounding design is called
- ⛔ **opt-out clearance cited as authority to PUBLISH an adverse result = blocker** — clearance and
  publication are different questions and this rule answers only the first
- a licence row treated as a boolean rather than a status = **blocker**
- ⛔ a subject scored as entity-grain **without** an entity registry record that says so = **blocker**
  (the safe default is person)
- a suppression implemented as a row delete rather than a tombstone = **blocker** — deletion
  guarantees re-ingestion, so the subject's refusal does not survive the next crawl
- a datum that clears copyright under test 3 published **without** its contract layer checked =
  **blocker** (see `rule.prefer.metadata-over-republication`)

## severity

**require → blocker**, and the peer rules in `market/` are all `prefer → nitpick`. the divergence is
deliberate: a nitpick is a rule whose breach costs quality, and a breach here publishes a natural
person's data by default — which forfeits the FCRA, CCPA, publicity, and data-broker exits
simultaneously, `[observed]` all four keyed on the same *"natural person"* / *"individual"* language.
**four regimes lost to one mis-scored row is not a quality cost.**

## .what this rule does NOT own, deliberately

- **what renders** once a datum is cleared — `rule.require.asymmetric-disclosure`
- **how grain is assigned** — `define.boundary.entity-grain-vs-person-grain`; this rule states the
  safe default and consumes the answer
- **the contract layer** on promotional material — `rule.prefer.metadata-over-republication`
- ⭐ **the THIRD clearance state** — `define.boundary.optin-vs-optout-vs-blocked`. this rule's four
  tests decide **optout vs optin**; they do not reach `blocked`, where a third party holds the right
  and the subject cannot cure it. ⛔ **a design that runs only these four tests will score a platform's
  compilation as `optin` and ship a consent flow that grants no right**
- **the per-datum verdicts** — the applied composition of this rule is **not published**, per
  `rule.require.publishability-triage`'s *fingerprint* test; this rule is the public standard it
  applies

## .sources

1. 15 U.S.C. § 1681a — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim
2. 15 U.S.C. § 1681b — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim
3. Cal. Civ. Code § 1798.140 — https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140
4. Cal. Civ. Code § 1798.99.80 — https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80
5. 17 U.S.C. § 102 — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title17-section102&num=0&edition=prelim
6. Feist Publications v. Rural Telephone, 499 U.S. 340 (1991) — https://supreme.justia.com/cases/federal/us/499/340/
7. Tex. Prop. Code ch. 26 — https://statutes.capitol.texas.gov/Docs/PR/htm/PR.26.htm
8. Fla. Stat. § 540.08 — http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0540/Sections/0540.08.html
9. Ind. Code § 32-36-1 — https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/
10. license status vocabulary — `src/domain.roles/licenser/briefs/industry=.all/define.what-licenses-mean.md`

captured via browser per `rule.require.bhrowser-citations`.

⚠️ **source 9 is a mirror, and the fallback is declared here per that rule.** the official Indiana
portal (`iga.in.gov`) never served a chapter body to a driven navigation across four URL shapes —
returns of 805 / 569 / 4,324 / 3,967 bytes, each navigation chrome rather than statute. the failed
playbooks are retained in the route's `refs/` as the record of what was tried.

⭐ **sources 7–9 are listed for a single word.** each is cited only to show that the publicity statutes
key on *"individual"* / *"natural person"*, which is test 1's ground. **a sweep is worth its lines
when the finding is that the states agree** — a unanimous answer is a different fact from three
scattered ones, and it cannot be shown by one citation.

## .publishability

☀️ **fullsun** (share) — the four tests are a composition of statutory definitions and one Supreme
Court holding, with no client identity, no coverage data, and no applied mechanic. per
`rule.require.publishability-triage`'s clean line, *"the law says X"* → share.

⚠️ **what is held back, and the split is deliberate.** the **standard** ships; the **application**
does not. the artifact that scores specific data against these tests is 🔒 protect and was **removed
from the shippable tree** — the per-datum verdicts, which source feeds which row, and the coverage
they imply are the applied mechanic.

⭐ **and the term correction ships loudest of all.** a design mislabeled *"default opt-in"* is a
mistake an adopter makes in good faith and cannot see from inside. **a correction that only its
author knows corrects nobody.**

## .see also

- `define.boundary.optin-vs-optout-vs-blocked` — ⭐ the **third state** these four tests cannot reach
- `rule.require.asymmetric-disclosure` — what renders once a datum is cleared
- `define.boundary.entity-grain-vs-person-grain` — how test 1 is decided
- `define.boundary.promotional-vs-sensitive` — which body of law test 3 hands off to
- `rule.prefer.metadata-over-republication` — the contract layer test 3 does not clear
- `hazard.go-private-request` — the tombstone mechanics this rule's default assumes
- `hazard.reincorporation-blind-spot` — why the qualifier's licence leak matters most
