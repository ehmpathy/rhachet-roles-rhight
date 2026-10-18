# define.boundary — entity grain vs person grain

> **not legal advice.** informational only; consult a licensed attorney. every claim is tagged
> `[observed]` (quoted from a captured source), `[inferred]` (reasoning over those sources), or
> `[unverified]` (not yet sourced).

## .what

**subject grain** is whether the subject of record on a directory profile is a **business entity** or
a **natural person**.

it is not a detail of the data model. it is the axis that decides **which bodies of law can apply at
all** — and it sits *above* the more familiar question of what the reader intends to do with the page.

## .why it is the first question

three of the four regimes a directory normally worries about are **defined in terms of a natural
person**. they do not narrow at entity grain; they **do not exist**.

`[observed]` **15 U.S.C. § 1681a(c): "The term 'consumer' means an individual."**

FCRA's entire apparatus — the consumer-report definition at § 1681a(d)(1), the permissible-purpose
list at § 1681b(a), the seven-year clocks at § 1681c(a), the accuracy duty at § 1681e(b) — is built on
that one word. a report **about a company** is not a consumer report no matter who reads it or why.

> **get the grain wrong and the brief cites a statute that cannot apply.**

## .the boundary

> ⭐⭐ **THIS TABLE IS CANONICAL. cite it; do not restate it.** the grain→regime table has one owner,
> and this is it. `hazard._.catalogue` links here and carries only the one-line result an index
> needs. **a second copy of this table is a blocker** — a partial copy gives a reader a partial map
> with no signal that it is partial, and a cell that changes in one copy silently disagrees with the
> other.

| regime | **business entity** | **natural person** |
|---|---|---|
| **FCRA / consumer-report law** | ⛔ **cannot apply** — `[observed]` § 1681a(c) confines *"consumer"* to an individual | ✅ applies when the use crosses the purpose gate |
| **data-broker deletion law** | ⛔ the definitions gate on *"personal information of a **consumer**"* | ✅ applies |
| **right of publicity** | ⛔ a personal right — the five-state sweep below is unanimous | ✅ applies |
| **privacy torts** | ⛔ `[unverified]` a corporation holds no privacy interest | ✅ applies |
| **criminal-history / sealed-record law** | ⛔ entities are essentially never charged | ✅ applies |
| **defamation / trade libel** | ⭐ **applies, and harder** — damages are economic and provable | ✅ applies |
| **accuracy and currency law** | ⛔ **applies** | ✅ applies |
| **corporate identity / successor law** | ⛔ **applies** | ✅ n/a |
| **§ 5 / UDAP** | ✅ applies — about the *publisher's* conduct toward consumers, not the subject's privacy | ✅ applies |
| **§ 230** | ✅ applies — turns on *who authored*, not on who the subject is | ✅ applies |
| **trademark / false association** | ⭐ **applies** — the layer that *replaces* right of publicity | ⛔ generally not |

> ⭐ **the general result, and it is a fact about the statutes rather than about any product: the
> privacy-derived bodies of law gate on "natural person" and drop away at entity grain; the
> accuracy-derived and property-derived ones do not.** a directory's subject grain therefore selects
> which half of this table it must answer to.

> ⭐ **the trade in one line: at entity grain the privacy layer falls away and the accuracy layer
> sharpens.** this is not a discount. a wrong adverse fact about a company is trade libel with
> provable lost revenue, where the same error about a person yields harder-to-quantify dignitary harm.

## .the five-state sweep — does right of publicity reach an entity?

⭐ **cited, not re-derived.** the sweep has one owner, and this is not it. the per-state verbatim
quotes, the strictest-on-scope vs strictest-on-remedy split, and the Indiana definitions-section trap
all live in the brief whose whole surface is this question:

> **`hazard.unclaimed-profile-right-of-publicity.[hazard].md`** — § *⭐ the five-state sweep — the
> sweep is UNANIMOUS*

the verdict this boundary rests on:

| | |
|---|---|
| sweep | TX, IN, FL, CA, NY — `rule.require.five-state-baseline`, strictest-common-denominator |
| result | ⛔ **unanimous — none of the five reaches a business entity** |
| the cell that could have surprised | **IN**, the broadest of the five: closed on its own definitions section (§ 32-36-1-6, *"'personality' means a living or deceased natural person"*), not by inference |
| residual | ⚠️ `[unverified]` — common-law publicity and privacy torts (Restatement (Second) of Torts § 652) are un-captured |

⚠️ **the conclusion is narrower than "ROP never applies to companies."** the **statutory** sweep is
complete; the common-law overlay is not. that residual is the live risk on this row.

## ⭐ .the leak paths — person data on an entity profile

entity grain is a **default, not a guarantee**. in the contractor trade specifically, person-grain
data enters the profile through three doors, and they are the normal case rather than the edge:

### 1. the qualifier

`[observed]` `src/domain.roles/permiter/briefs/ref.electrical-license-structure.indiana.[ref].md`:

> **"Any contractor must be or employ a master electrician."**

the **entity** registers; a **natural person** holds the credential. so the license row — the most
valuable presence-fact a directory has — is **person-grain data displayed on an entity profile.**

### 2. the sole proprietor and the DBA

a DBA is not an entity. a single-member LLC is one human. `[inferred]` aggregation about a sole
proprietor is aggregation about a person with a business label attached, and calling the profile
"a business" does not change what the data is.

### 3. suits and records against the human

a judgment against the LLC is entity data. a judgment against its owner is person data. the same
docket search returns both.

> ⚠️ **so the design is two-track by necessity, not by choice.** publish at entity grain; hold a
> person-grain track for the leaks, with its own rules.
>
> ⭐ **this brief supplies the TRIGGER; the person track's ORDER OF OPERATIONS is owned by
> `howto.compose-the-person-track.[lesson].md`.** the split is deliberate — the test for *which grain*
> is a boundary question and belongs here; *what runs, in what order, once person grain is detected*
> spans six briefs and belongs in one place that is none of them.

## ⭐ .the cost nobody prices — entity grain is blind to reincorporation

a contractor who takes a deposit and never does the work, then loses the resulting suit, has a cheap
and standard answer: **dissolve the company and form a new one.** same human, same trucks, a fresh
entity with no history.

at entity grain the history is not merely withheld from publication — **it is invisible.** the new LLC
is a new subject.

`[inferred]` the only continuity that survives is the **qualifier's credential**, because a person
carries their license across entities. which makes the person track the **identity spine**, live from
day one, rather than a future branch.

⚠️ `[unverified]` whether the qualifier's license number is retrievable as public registry data about
a licensed professional (usable for linkage) or is person-grain background (consent-gated) is
**unresolved and load-bearing**. it decides whether the gap is closable at all.

## .the test

> **"is the subject of record a legal entity, or a human being?"**

- an LLC, corporation, or registered partnership → **entity grain**
- a sole proprietor, a DBA, or a named individual → **person grain**
- a named qualifier, owner, or officer *inside* an entity profile → **person grain, for that datum**

⚠️ grain is assigned **per datum**, not per page. one profile can carry both.

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so this boundary
> is not crossed. the convention is declared in `hazard._.catalogue` § *the convention*; the original
> mandates live in `rule.*` files. **a `[lesson]` that enforces is checkable, not normative.**

- a brief that cites FCRA, the CA DELETE Act, or a right-of-publicity statute against an **entity**
  subject, without first stating the grain = **blocker** (the statute does not reach it)
- ⛔ **a second copy of the grain→regime table anywhere in this cluster = blocker** — this file owns
  it (§ *.the boundary*); cite it, do not restate it
- a profile that renders person-grain data (a named qualifier, an owner's record) without the
  person-track rules = **blocker**
- a claim that entity grain removes exposure *generally*, rather than the **privacy** layer
  specifically = **blocker** (defamation and trade libel sharpen)

## .sources

1. 15 U.S.C. § 1681a — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim
2. 15 U.S.C. § 1681b — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim
3. 15 U.S.C. § 1681c — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681c&num=0&edition=prelim
4. 15 U.S.C. § 1681e — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim
5. 47 U.S.C. § 230 — https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section230&num=0&edition=prelim
6. Ind. Code § 32-36-1-6 — https://law.justia.com/codes/indiana/title-32/article-36/chapter-1/section-32-36-1-6/

all captured via browser per `rule.require.bhrowser-citations`. ⚠️ the Indiana cell cites the Justia
section-grain mirror — fallback noted per `rule.require.five-state-baseline`.

> ⚠️ **six distinct sources, below the `rule.require.seven-distinct-citations` floor, deliberately.**
> § *the five-state sweep* opens with *"cited, not re-derived — the sweep has one owner, and this is
> not it"*, so the ROP statutes are quoted by their owner brief and merely cited here. ⛔ **extra
> quotes to reach seven would duplicate what the canonical-owner convention exists to prevent.**

## .publishability

☀️ **fullsun** (share) — the analysis is statutory definitions and a cited five-state verdict, quoted
verbatim from public law. no client identity, no coverage data, no applied mechanic. its value is
that it is **correct**, and correctness survives daylight.

⚠️ **one paragraph is a split point.** the *reincorporation* section states public terrain (contractors
dissolve and reform; entity grain cannot see it). the **synthesis** — that this is the blind spot the
grain choice itself creates, and how a given adopter closes it with the qualifier's credential — is
applied design and belongs in a restricted artifact. per `rule.require.publishability-triage`:
publish the terrain, hold the synthesis.

## .see also

- `_taxonomy/_.glossary.[summary].md` — the term index
- ⭐ `hazard.unclaimed-profile-right-of-publicity.[hazard].md` — **the owner of the five-state ROP
  sweep this boundary cites**; go there for the per-state verbatim quotes and the Indiana trap
- `define.boundary.presence-fact-vs-absence-fact.[lesson].md` — which facts are publishable at all
- ⭐ `howto.compose-the-person-track.[lesson].md` — **what runs, in what order, once this boundary
  routes a datum to person grain**
- `define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — the person-track rules
- `hazard.consumer-report-gate.[hazard].md` — the purpose gate, which applies only at person grain
- `src/domain.roles/permiter/briefs/ref.electrical-license-structure.indiana.[ref].md` — the
  qualifier structure, observed
