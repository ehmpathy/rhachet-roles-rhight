# rule.forbid.aggregation-index-build-narrative

# tldr

## severity: blocker

an aggregation surface — a `boot.yml`, an index, a `_.glossary`, a `_.catalogue`, a manifest, a
`.see also` web — must describe its briefs as **neutral topic law**, never as a **cohesive applied-design
set** that builds one program.

each brief in a fullsun set can be individually clean, yet the **index that groups them** leaks the
secret sauce — because a build-narrative index (comments like "the debt anchor + the two redemption
paths", "spend-only credit sits outside three regimes at once", "the core recommendation rules",
"the $product assessment") tells a reader the set is **one program's blueprint**, not a library of
generic law. name the **legal topic**, never the **applied design**.

---
---
---

# deets

## .what

an **aggregation surface** is any artifact that lists, groups, orders, or cross-links other briefs:

- a role `boot.yml` (the load list + its section comments)
- an index / `_.glossary` / `_.catalogue` / `_taxonomy` rollup
- a manifest or handoff that inventories briefs
- a dense `## .see also` web that stitches briefs into a dependency graph

the rule: an aggregation surface must group and label its briefs by **neutral legal topic** — the body
of law each brief covers — and must **not** narrate them as a cohesive set that assembles one applied
design.

this is the **composition leak** the per-brief rules cannot catch. `rule.require.fullsun-facts-not-tactics`
and the voice test operate **within** a brief. this rule operates on the **index over** the briefs — the
one place the leak survives even when every brief is neutral.

## .why

- a competitor who cannot reconstruct the design from any single brief can still read it off the
  **index**, because the index reveals the **curation**: which briefs go together, in what order, toward
  what conclusion. the grouping *is* the blueprint.
- build-narrative labels are the tell. "the debt anchor", "the two redemption paths", "the core
  recommendation rules", "sits outside three regimes at once", "$product assessment", "the greenlit
  program" — each names a **step in one program's design**, not a **body of law**. a neutral library
  names the law: "loyalty-points characterization law", "money-transmitter boundary law",
  "consumer-disclosure rules".
- an index is high-leverage: one build-narrative comment block can leak the whole design that dozens of
  carefully-neutralized briefs were scrubbed to protect.

## severity: blocker

a build-narrative aggregation surface leaks the integrated design for zero public-knowledge gain — the
same irreversible competitive loss as a leaked decision, concentrated in one high-visibility file. the
fix is cheap (relabel by topic); the leak is not.

## .the test

read the index's labels/comments/ordering **alone**, without the briefs. ask:

> does this read as a **library of legal topics**, or as **one program's build plan**?

- **library** (pass): sections named by body of law — "referral-incentive law", "money-transmitter
  boundary law", "escheat law". a reader learns *what areas of law* the set covers.
- **build plan** (fail): sections named by design step or conclusion — "the debt anchor", "the two
  redemption paths", "the core recommendation rules", "the $product firewall", "sits outside three
  regimes". a reader learns *what the actor built*.

## .the transform — build-narrative → topic-law

| build-narrative label (leaks) | topic-law label (neutral) |
|-------------------------------|----------------------------|
| `# the debt anchor + the two redemption paths` | `# loyalty-points characterization law (debt vs stored value)` |
| `# spend-only credit sits outside three regimes at once` | `# multi-regime boundary law (money-transmitter / stored-value / escheat)` |
| `# the conditional money-transmitter hazards` | `# money-transmitter boundary law` |
| `# the core recommendation rules (the prefer-directives)` | `# consumer-disclosure recommendation rules` |
| `# $product assessment (nav rollups)` | `# market-mechanics law — term index + hazard maps` |
| `.see also: the points-are-a-debt anchor` | `.see also: loyalty-points characterization law` |

the left column names the **actor's design**; the right names the **area of law**. the same brief list,
grouped and labelled the second way, reveals a library — not a blueprint.

## .where

applies to every aggregation surface that could ship in a public role:

- `**/boot.yml` — load-list section comments
- `**/_.glossary.*`, `**/_.catalogue.*`, `**/_taxonomy/**` — rollup framing + `.see also`
- any index / manifest that groups briefs
- the `## .see also` sections of fullsun briefs (a dense web that reconstructs the design is itself an
  aggregation leak — keep cross-links to what a reader needs for the *law*, not a stitch of the *design*)

it does **not** forbid grouping or ordering — a library is organized. it forbids **naming the groups
after the design** instead of after the law.

## .how

- label each group by the **body of law** it covers (money-transmitter, escheat, FTC disclosure,
  referral-selling, prize/lottery) — a topic a law student would recognize.
- drop design-conclusion words from labels: "anchor", "the two paths", "sits outside … at once",
  "the core recommendation rules", "safe", "MT-safe", "firewall", "greenlit", "$product".
- drop engagement/assessment framing ("the $x assessment", "the rewards-program briefs") — name the
  **subject-matter law**, not the engagement.
- keep `.see also` links purposeful (the reader needs this *legal* definition), not assembling (this
  brief plus that brief equals the design).

## .enforcement

- an aggregation surface (boot.yml / index / glossary / catalogue / manifest) whose labels or comments
  narrate the applied design = **blocker**
- a group label that names a design step or conclusion instead of a body of law = **blocker**
- a `.see also` web that stitches fullsun briefs into one integrated design = **blocker**
- publishability review must run the four-test triage on **aggregation surfaces**, not only on the
  individual briefs (per `rule.require.publishability-triage`)

## .see also

- `rule.require.publishability-triage.[rule].md` — the four-test triage; run it on indexes too
- `rule.require.fullsun-facts-not-tactics.[rule].md` — the within-brief voice test (this rule is its across-brief companion)
- `howto.test-obscurity-via-blind-convergence.[lesson].md` — the composition leak the convergence probe measures
- `howto.redact-completed-behavior-route.[lesson].md` — redacting the route-level aggregation (wish / vision / manifests)
