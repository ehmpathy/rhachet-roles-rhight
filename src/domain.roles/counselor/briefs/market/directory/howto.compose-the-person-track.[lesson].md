# howto.compose-the-person-track

## .what

this cluster is written **entity-first**. the council answered that the subject of record is the
business, and every brief takes that as its default — then carries a *"on the person track…"* aside
where its own subject differs.

⛔ **the result is that the person track exists in thirteen fragments and nowhere as a sequence.** a
builder who must handle a sole proprietor, a named qualifier, or a judgment against an owner has to
assemble the rules from thirteen files, in an order no file states.

**this brief is that order.** it adds no new law. it says which brief applies at which step, what the
sequence guarantees, and — the part that matters — **which two orderings are wrong.**

> **not legal advice.** informational groundwork for counsel to validate; verify current text before
> any reliance. claims are tagged `[observed]` / `[inferred]` / `[unverified]`.

## .why a sequence, and not just a list

⭐ **the steps are not independent, and the natural build order inverts two of them.**

a list would suggest the steps can be done in any order and checked off. they cannot: two of them
are **preconditions** whose violation cannot be repaired by later work.

| the natural instinct | why it is wrong |
|---|---|
| build the **consent flow first** — it is the visible feature and it answers most exposures | ⛔ `[observed]` consent does **not** cure FCRA (§ 1681b(b)(1) makes authorization a duty *inside* the regime). if the gate is crossed, the consent flow was built on a surface that is **unlawful as built**, and no amount of consent repairs it |
| **collect** the data, then ask for consent before publication | ⛔ collection is itself what pulls the sealed-record and criminal-history-provider duties in. `[observed]` Ind. Code ch. 24-4-18 and Tex. Bus. & Com. ch. 109 bind a provider **without** any consumer-report gate. consent obtained after collection does not undo the collection |

> ⭐ **so: the gate test precedes the consent build, and the consent precedes the collection.** both
> are the reverse of the order a product team would naturally take, which is why the sequence is
> written down rather than left to be inferred.

## ⭐ .the trigger — when this track applies at all

**cited, not restated.** the trigger test and the three leak paths are owned by:

> **`define.boundary.entity-grain-vs-person-grain.[lesson].md`** — § *.the test* and § *.the leak
> paths*

what a composer needs to carry forward from it is one property, because it drives every step below:

> ⚠️ **grain is assigned per DATUM, not per page.** one profile routinely carries both. so the person
> track is not a separate product for separate subjects — it is **a second set of rules that runs on
> some cells of an ordinary entity profile.**

⛔ **the consequence a list would hide: there is no "person-track page" to gate.** the qualifier's
license sits on the same page as the entity's permit history. so every control below must be
**per-cell**, and a page-level switch will silently under-cover.

## ⭐⭐ .the ladder — the order of operations

each step names the brief that owns it. **the order is the content of this brief; the rules are
not.**

### step 0 — establish the regime, before any build begins

> **`hazard.consumer-report-gate.[hazard].md`**

`[observed]` § 1681a(d)(1) keys on information *"used or expected to be used … for the purpose of
serving as a factor in establishing the consumer's eligibility"*. this is a question about the
**reader**, not about the data — so it is answerable before a line of the person track exists, and
it must be.

- **outside the gate** → the rest of this ladder applies
- ⛔ **inside it** → `[observed]` § 1681e(a) demands pre-furnish user identification and purpose
  certification, which an open page cannot perform. **stop. the surface is unlawful as built, and
  every step below is wasted work on it**

⚠️ **this is step 0 rather than step 1 deliberately.** it is not the first task; it is the
precondition for there to be any tasks.

### step 1 — obtain consent BEFORE collection, per check

> **`define.boundary.consent-cures-privacy-not-fcra.[lesson].md`** — § *.the boundary* and
> § *consent has to stay real*

consent is the express statutory defense in four of the five right-of-publicity statutes (⚠️ **TX
differs** — its consent clause reaches only a deceased individual, so the result holds there for a
different reason; the sweep is in the brief above); it is a **direct relationship** for the CA
data-broker definition at `[observed]` Cal. Civ. Code § 1798.99.80(c), which reaches a business with
which the consumer *"does not have a direct relationship"*; and `[observed]` § 1798.140(ad)(2)(A)
exits the CCPA sale definition. **it is the single highest-leverage act on this track.**

⛔ **but it must be per-check and prior**, not a blanket profile opt-in — consent to a license check
is not consent to a background check, and § 1798.125(b)(3) stacks a stricter gate where the profile
confers value.

### step 2 — apply the publication rule, unchanged

> **`rule.require.asymmetric-disclosure.[rule].md`**

⭐ **the NOHARM rule is grain-independent and does not relax on this track.** consent unlocks what may
be *collected and asserted*; it does not license an adverse publication. a `verified-negative` about a
person who consented still renders `⬜`.

⚠️ **the one change consent DOES make here** is which absence-facts become assertable — see
`define.boundary.presence-fact-vs-absence-fact` and the consent brief's § *what consent DOES unlock*.

### step 3 — carry the three exposures consent does not answer

> **`hazard.stale-public-record-status`** · **`hazard.sealed-record-republication`** ·
> **`define.boundary.consent-cures-privacy-not-fcra`** § *.the boundary*

⛔ **these survive a perfect consent flow, and it is easy to assume they did not:**

| exposure | why consent misses it |
|---|---|
| **accuracy / defamation** | consent to *publication* is not consent to a *false* statement |
| **sealed-record republication** | the duty runs to the **court's order**, not the subject's wishes |
| **FCRA**, if step 0 is ever re-crossed | authorization is a duty inside the regime, not an exit |

⭐ **and note the trade this track makes overall: the privacy layer drops away and the accuracy layer
sharpens.** a person has no registry-assigned unique key, so the mismatch problem that entity grain
nearly solves returns in full.

### step 4 — honor withdrawal, durably

> **`hazard.go-private-request.[hazard].md`**

⚠️ on the entity track a delist request is a **product choice**; on the person track it is the other
half of a real consent, and `define.boundary.consent-cures-privacy-not-fcra` § *consent has to stay
real* makes reversibility a condition of the consent's worth.

the mechanics — a tombstone rather than a row delete, suppression that outlives re-ingestion — are
owned by the go-private brief and are the correct shape here whether or not a statute compels them.

## ⛔⛔ .the step that NO brief owns

⭐ **the trigger rule is defined; the trigger *mechanism* is not.**
`define.boundary.entity-grain-vs-person-grain` says grain is assigned per datum and gives the test.
**no brief in this cluster says how a datum's grain is determined at ingestion time** — whether it is
declared by the source, inferred from the registry's own schema, or asserted by a human.

⚠️ this matters because **the failure is silent and it fails in the unsafe direction**: a person-grain
datum mis-assigned as entity grain gets published under entity rules, which is exactly the set of
rules that assumes the privacy layer does not apply.

`[inferred]` the defensible default while it is open: **treat grain as person unless the datum's
source is an entity registry that says otherwise.** the cost of the safe default is under-publication;
the cost of the unsafe one is publication of personal data under rules written for companies.

⛔ **this is registered in `hazard._.catalogue` rather than resolved here** — it is a design task, not
a repair, and this brief may only name it.

> ⭐ **UPDATED — it is now tracked as `G-grain-assignment` in the catalogue's § *the PRECONDITION*, a
> rank above the gap tables rather than a row inside one.** the promotion is not emphasis; it follows
> from where the gap sits in the composition order. **this brief states that order, so it is the brief
> that should have caught the rank.**
>
> the argument: grain is the composition's **first input**, so a mis-assignment does not yield a wrong
> grain answer — it yields **correct answers to the wrong question**, for every step that follows. a
> backfill gap is one whose *answer* is absent; this one's *input* is absent, and that is a different
> class.
>
> ⚠️ **and the safe default above needs one qualifier the paragraph omits:** it must key on a registry
> **record**, never on the shape of the name. a d/b/a, a single-member LLC, and a qualifier's licence
> all read as entities to the eye, so a name heuristic reproduces the exact error the default exists
> to prevent. see `rule.require.opt-out-bounded-to-entity-registry-facts` § *the three leak paths*.

## .the test

> **"for THIS datum: is the grain person, has the subject consented to THIS check, and does the
> exposure survive that consent?"**

- entity grain → the person track does not run for this cell
- person grain, no consent → ⛔ do not collect it (collection precedes the exposures, not
  publication)
- person grain, consented → publish under the **same** asymmetric-disclosure rule, and carry accuracy,
  sealed-record, and withdrawal duties forward

## .enforcement

> ⭐ **these are DERIVED checks, not original mandates** — each says what to verify so the sequence
> is not broken. the convention is declared in `hazard._.catalogue` § *the convention*; the original
> mandates live in `rule.*` files. **a `[lesson]` that enforces is checkable, not normative.**

- a person-track control implemented at **page** grain rather than **per datum** = **blocker** (one
  profile carries both grains, so a page switch under-covers)
- a **consent flow built before** the consumer-report gate is established = **blocker** (step 0 is a
  precondition; consent does not cure FCRA)
- person-grain data **collected before** consent, with consent sought before publication =
  **blocker** (collection is what triggers the criminal-history-provider duties, and consent after
  the fact does not undo it)
- an adverse result about a person who **consented**, published as anything but `⬜` = **blocker**
  (consent unlocks collection and favorable assertion; it does not relax the publication rule)
- a **blanket** profile opt-in relied on as consent for a specific check = **blocker** (per-check
  scope; and § 1798.125(b)(3) where the profile confers value)
- a datum whose grain was **assumed entity** without a source that establishes it = **blocker** (the
  safe default is person; see § *the step that NO brief owns*)

## .note on the five-state rule

`rule.require.five-state-baseline` is **not** separately triggered here: this brief states an order
of operations and adds no state-law claim of its own. the sweeps it sequences are run in full in the
briefs that own them — right of publicity in
`hazard.unclaimed-profile-right-of-publicity` (all five, unanimous), and sealed-record republication
in `hazard.sealed-record-republication` (⚠️ **the OPERATIVE provisions are captured in all five; the
UNDER-LAYER is open in four** — IN §§ 24-4-18-2/-3, TX Gov't Code ch. 411 subch. E-1, NY CPL
§§ 160.57/160.50, FL § 943.059 — tracked as `G-sealed-underlayer` in the catalogue's gap table).
**stated so a reviewer can tell a cross-reference from an omission.**

## .sources

1. [15 U.S.C. § 1681a](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681a&num=0&edition=prelim)
2. [15 U.S.C. § 1681b](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681b&num=0&edition=prelim)
3. [15 U.S.C. § 1681e](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681e&num=0&edition=prelim)
4. [Cal. Civ. Code § 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140)
5. [Cal. Civ. Code § 1798.99.80](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.99.80)
6. [Ind. Code ch. 24-4-18](https://law.justia.com/codes/indiana/title-24/article-4/chapter-18/)
7. [Tex. Bus. & Com. Code ch. 109](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.109.htm)

captured via browser per `rule.require.bhrowser-citations`.

⚠️ **fallback noted, per `rule.require.five-state-baseline`:** the Indiana cells are cited to the
Justia section-grain mirror; the official `iga.in.gov` portal serves a javascript shell to a driven
navigation. all other cells are cited to official state sources.

## .publishability

☀️ **fullsun** (share) — an **order of operations** over public law, where every rule it sequences is
itself fullsun. it names no client, carries no coverage data, and settles no choice the law left open
— the two orderings it forbids are forbidden *by* the statutes, not by our preference.

⚠️ **held back:** which leak paths a given adopter actually has (does it list sole proprietors? does
it render the qualifier?), and how far down this ladder it has built, is a map of where its person
track is thin → 🔒 protect. the ladder ships here; the adopter's position on it does not.

⭐ **and the § *step that NO brief owns* section stays fullsun deliberately.** it names an open design
question, not our exposure — the same reason the catalogue's gap tracker ships. **a declared gap is
evidence of a rigorous method; a concealed one is only a gap.**

## .see also

- `define.boundary.entity-grain-vs-person-grain.[lesson].md` — the trigger and the three leak paths
- `hazard.consumer-report-gate.[hazard].md` — step 0, the precondition
- `define.boundary.consent-cures-privacy-not-fcra.[lesson].md` — step 1, and the three exposures it
  does not answer
- `rule.require.asymmetric-disclosure.[rule].md` — step 2, unchanged by grain
- `hazard.go-private-request.[hazard].md` — step 4, withdrawal
- `hazard.reincorporation-blind-spot.[hazard].md` — ⚠️ **why this track is the identity spine rather
  than a branch**: entity grain cannot see a dissolve-and-reform, and person linkage is the only
  continuity
- `hazard._.catalogue.[summary].md` — the index, and the canonical open-question tracker
