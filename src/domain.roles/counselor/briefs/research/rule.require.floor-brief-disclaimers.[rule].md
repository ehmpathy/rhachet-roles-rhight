# rule.require.floor-brief-disclaimers

## .what

**REQUIRE** every `floor.*` brief to carry **six blocks** beyond the universal brief anatomy.

⭐ **and the reason is not politeness.** in a floor brief the disclaimers are **structural claims that
carry weight** — they are what make the artifact **falsifiable**. strip them and the file does not
merely lose its manners; it becomes a document a reviewer cannot check and a reader cannot bound.

> **recommendation disclaimer.** this is offered to the best of our knowledge, based on the information
> found in research — it carries **no guarantee of success or outcome**, and it must be reviewed by a
> licensed professional (attorney / CPA / licensed advisor) against your own real scenario and current
> law before any reliance. it is groundwork for that review, not a substitute for it.

> **not legal advice.** informational groundwork for counsel to validate.

---

## ⭐ .why — a floor brief has three failure modes that a disclaimer is the only defense against

| ⛔ the failure | what a reader concludes | ⭐ the block that prevents it |
|---------------|------------------------|----------------------------|
| **the certificate** | "we hold every line, so we are compliant" | ⭐ the **not-defeated line** |
| **the clearance** | "it is not in the file, so it is not a hazard" | ⭐ the **honest gap** |
| ⚠️ **the padded floor** | "these are the lines the sources force" — when some were ours | ⭐ the **silences table** |

⛔ **the third is the one nobody else catches.** an artifact that admits items by a stated rule can be
padded with preference and still read perfectly, because the pad looks exactly like the rest. the only
external evidence the rule was actually applied is a list of the places it **excluded** an item.

⭐ **so the silences table is not a caveat. it is the audit trail** — and a floor brief with no silences
has almost certainly been padded, because a real rule of admission always excludes.

---

## .the six blocks

⚠️ **the universal brief anatomy is already enforced elsewhere** — `.publishability`, `.date
researched`, the not-advice callout, the ≥7-citation floor, and the see-also/source-anchor checks are
graded by the repo's brief-integrity check for **every** brief. this rule adds what is specific to a
**floor**.

| # | the block | what it must contain | ⛔ which rungs owe it |
|---|-----------|---------------------|---------------------|
| **1** | **the recommendation disclaimer** | all three qualifiers: best-knowledge · no-guarantee · must-be-reviewed-by-a-licensed-professional-against-your-own-scenario | ⛔ **every rung that carries an imperative** — ② redlines, ③ mustcants. ⚠️ ① catalogues prescribe no action, so they carry it only if a row drifts into an instruction |
| **2** | ⭐ **the not-defeated line** | in the file's own words: to hold every line means **not defeated**, never **compliant** | **all rungs** |
| **3** | ⭐ **the honest gap** | what was **not** swept, read, or tested — and the explicit statement that an absence is **not a clearance** | **all rungs** |
| **4** | ⭐ **the silences table** | every place the sources permit a choice, listed **as open** — ⛔ **with build order among them** | ② and ③ (the derived rungs). ⚠️ ① has no silences to list, since it prescribes no action at all |
| **5** | **the sauce-test table** | the three checks run **row by row inside `.publishability`**, with the verdict per row — never a bare tag | **all rungs** |
| **6** | ⭐ **the derivability statement** | the rule of admission, named, plus the claim that a second reader with the same inputs produces the same artifact | **all rungs** |

### ⛔ block 2 in full, because its exact shape matters

the sentence must land in the file's own voice, in at least two places: the `.what` or a limits
section, and `key takeaways`. the shape is:

> **not defeated** — never **compliant**

⚠️ **the phrase must not be softened into "helps ensure compliance" or "supports compliance."** the
floor is the intersection of what **defeats** you; compliance is the whole affirmative build, which is
a strictly larger set. a floor brief that gestures at compliance has made the exact claim it exists to
refuse.

### ⛔ block 4 must list build order explicitly

⭐ **order is the appetite that hides best**, because a sequence reads as helpfulness rather than as a
recommendation. so the silences table must carry a row like:

> **what order to do these in** — ⛔ no order is implied and none should be inferred. a sequence is a
> spend decision, and a spend decision is appetite.

⚠️ **the one admissible exception is a clock the source itself imposes.** in the worked example ⏰ `CE`
carries a clock because the regulation makes a record contemporaneous — not because we ranked it. **if
a floor brief carries any order, it must name the source that imposes it, in the row.**

### ⚠️ block 5 — the tag alone is not the triage

`rule.require.publishability-triage` states plainly that intuition leaks and that the triage "is not
done at the tag." ⛔ **so a bare `☀️ fullsun` fails this rule** even though it satisfies the integrity
check. the three sauce-test rows must appear with their verdicts, so a reviewer sees the reasons rather
than the conclusion.

---

## .examples

⚠️ **the two blocks below open with `#··.publishability` rather than the literal header.** ⛔ **a
worked example that reproduces a real section header collides with every header-keyed parse that reads
this file** — the repo's own brief-integrity check found three `.publishability` sections here on the
first run and could not tell the file's own from its examples. ⭐ **an example of a document convention
must not be a valid instance of it.**

### 👎 bad — a floor brief with the tag and no table

```md
#··.publishability

☀️ fullsun (share) — generic public law, no client identity.
```

⛔ a reviewer cannot tell whether the three checks were run or whether the author felt fine.

### 👍 good — the checks, row by row, with the appetite row answered hardest

```md
#··.publishability

☀️ **fullsun** (share) — ⚠️ one item is still owed: the confirmatory blind red-team.

| sauce-test check | this file | verdict |
|------------------|-----------|---------|
| names a client, campaign, volume, vendor, schema, or config? | **no** — … | ✅ clean |
| discloses a choice the sources do not force? | ⭐ **no, by the rule of admission** — … | ✅ clean |
| discloses risk appetite? | ⛔ **no** — no row is ranked, sequenced, or costed, and build order is a silence | ✅ clean |
```

### 👎 bad — a silences section with no silences

```md
## .the silences

the sources are clear; no material choice is left open.
```

⚠️ **this is the padded-floor tell.** a rule of admission that excluded no item is a rule that was not
applied — and every floor brief run to date has produced between six and eight genuine silences.

---

## .enforcement

| the defect | severity |
|------------|----------|
| a `floor.*` brief with **no honest gap** | ⛔ **blocker** |
| a `floor.*` brief with **no not-defeated line** | ⛔ **blocker** |
| a not-defeated line softened toward "supports compliance" | ⛔ **blocker** |
| a derived rung (② or ③) with **no silences table** | ⛔ **blocker** |
| a silences table with **no build-order row** | ⛔ **blocker** |
| an order carried without a **named source** that imposes it | ⛔ **blocker** |
| a `.publishability` section with a tag and **no sauce-test rows** | ⛔ **blocker** |
| a rung that carries imperatives with **no recommendation disclaimer** | ⛔ **blocker** |
| **no derivability statement** | ⚠️ **nitpick** — the trace columns are the harder evidence, and they are checked at each rung |
| a silences table with a single self-evident row | ⚠️ **nitpick** — likely padded, worth a second look |

⚠️ **not one of the six is graded by the repo's brief-integrity check today.** ⛔ **that gap is stated
rather than left implicit**: these are author-and-review duties, and a rule with no gate is a rule that
degrades. see the honest gap.

## key takeaways

| question | answer |
|----------|--------|
| ⭐ why are these disclaimers, not boilerplate? | they are what make the artifact **falsifiable** — a reviewer cannot check an admission rule without the list of what it excluded |
| ⭐ which block does the most work? | the **silences table** — it is the only external evidence the rule of admission was actually applied |
| ⛔ what is the padded-floor tell? | a silences section with no silences. a real rule of admission always excludes |
| ⛔ what must never be softened? | **not defeated, never compliant.** "supports compliance" makes the exact claim the floor refuses |
| which appetite hides best? | ⭐ **order** — a sequence reads as helpfulness. so build order is an explicit silence row |
| when may a floor brief carry an order? | ⚠️ only when **the source imposes the clock**, and the row names the source |
| is a bare `☀️ fullsun` enough? | ⛔ **no.** the triage is not done at the tag; the three rows must show |
| ⚠️ are these enforced by the checker? | **no** — and that is stated rather than implied |

## the honest gap

- ⬜ **not one of the six blocks is machine-checked.** the repo's brief-integrity check grades the
  universal anatomy — the tag, the date, the callout, the citation floor — and none of the six. ⛔ **a
  rule with no gate degrades**, and this one is convention plus review until a check exists.
- ⚠️ **the block list is derived from the floor briefs already written**, so it describes the practice
  rather than tests it. a floor brief in a domain with a different shape may owe a block that is absent
  here, and the list has no mechanism to discover one.
- ⬜ **"the silences table proves the rule was applied" is an argument, not a proof.** a sufficiently
  careful author could pad the artifact **and** the silences. ⭐ the table raises the cost of a padded
  floor; it does not make one impossible.
- ⚠️ **block 1's scope has a soft edge.** "carries an imperative" is clear for a rung-② line and
  arguable for a rung-① row that states a duty as a fact. the rule assigns it by rung and admits the
  boundary is judgment.
- ⬜ **no floor brief has yet completed the confirmatory blind red-team** that
  `rule.require.publishability-triage` requires before publication, so every `☀️` in the family — this
  file's among them — is provisional.

## .publishability

☀️ **fullsun** (share) — ⚠️ one item is still owed: the confirmatory blind red-team.

| sauce-test check | this file | verdict |
|------------------|-----------|---------|
| names a client, campaign, volume, vendor, schema, or config? | **no** — it governs document structure and names no party, product, or configuration | ✅ clean |
| discloses a choice the sources do not force? | ⚠️ **yes, and that is what an author's rule IS** — the six blocks are **ours**. ⭐ they are choices about **how to write a document**, never about what a reader should do about their own risk | ✅ clean |
| discloses risk appetite? | ⛔ **no** — it prescribes **blocks**, and its central demand is that the artifacts it governs carry **no** rank, sequence, or price | ✅ clean |

⭐ **the self-application check:** this file carries all six blocks it requires, its own silences among
them. a rule that exempted itself would be the strongest possible evidence the blocks are decorative.

## .see also

- `define.the-floor-ladder.[lesson].md` — ☀️ the three rungs this rule assigns blocks to
- `define.the-mustcants-matrix.[lesson].md` — ☀️ rung ③, and why build order is a silence
- `define.what-it-means-to-raise-the-floor.[lesson].md` — ☀️ the ground under the not-defeated line
- `howto.distill-redlines-and-landmines.[lesson].md` — ☀️ the method whose output these blocks bound
- `../market/comms/floor.mustcants.[lesson].md` — ☀️ a worked example that carries all six
- `../market/comms/floor.redlines.[lesson].md` — ☀️ a worked example that carries all six

⚠️ **this list is the published set, not a directory.** the repo holds further material that carries
other tags, deliberately not named here.

## .sources

⚠️ **this file makes no independent factual claim about any subject domain** — it is a **method brief**
that states an author's duty, and every artifact it governs carries its own citations. per
`rule.require.seven-distinct-citations`'s method-brief exception it owes a **traced internal lineage**
in place of the seven-url count:

1. `rule.require.publishability-triage` — the two-phase triage, and "the triage is not done at the tag"
2. `rule.require.recommendation-disclaimer` — the three qualifiers block 1 demands
3. `rule.require.fullsun-facts-not-tactics` — fullsun the facts, never the decisions
4. `howto.discover-a-fullsun-floor` — the three-check sauce test block 5 runs
5. `howto.test-obscurity-via-blind-convergence` — the confirmatory pass still owed on every floor brief
6. `motto.not-legal-advice` — the callout the universal anatomy already enforces
7. `define.the-floor-ladder` — the rung assignment blocks 1 and 4 turn on

## .date researched

2026-08-06
