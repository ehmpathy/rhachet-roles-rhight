# self-review: has-ergonomics-reviewed

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.2.distill.repros.experience._.yield.md

---

## ergonomics review

### permit.check.required

#### input ergonomics

| input | natural? | improvement possible? |
|-------|----------|----------------------|
| `--postal 46220` | ✓ yes | could infer from `--address` in future |
| `--work "panel upgrade"` | ✓ yes | natural language is intentional |

**verdict**: inputs feel natural. users speak "postal" and "work" language.

#### output ergonomics

| output | natural? | improvement possible? |
|--------|----------|----------------------|
| determination: required | ✓ yes | clear binary-ish (required/not_required/unclear) |
| proof chain | ✓ yes | shows exactly why, citable |
| coverpage treestruct | ✓ yes | scannable one-page summary |
| diagnosis markdown | ✓ yes | thorough analysis for those who want depth |

**verdict**: outputs serve two audiences — quick scan (coverpage) and deep dive (diagnosis).

### permit.search

#### input ergonomics

| input | natural? | improvement possible? |
|-------|----------|----------------------|
| `--address "123 Main"` | ✓ yes | how user thinks of property |
| `--postal 46220` | ✓ yes | could be inferred from address |
| `--limit`, `--since`, `--until` | ✓ yes | optional refinement |

**issue found**: `--postal` is redundant when `--address` includes city/state/zip. could infer postal from address in future.

**resolution**: mark as future enhancement, not blocker. v1 requires both inputs.

#### output ergonomics

| output | natural? | improvement possible? |
|--------|----------|----------------------|
| permits list | ✓ yes | treestruct is scannable |
| pagination cursor | ? | `--until` as cursor is less intuitive than `--cursor` |

**issue found**: pagination uses `--until` as cursor. users may not understand this.

**resolution**: add `--cursor` alias that accepts the next.until value from response. both work.

### permit.fetch

#### input ergonomics

| input | natural? | improvement possible? |
|-------|----------|----------------------|
| `--id INDY-2019-00012345` | ? awkward | ID format is jurisdiction-specific |

**issue found**: permit IDs are opaque strings. user must discover via search first.

**analysis**: this is acceptable friction. alternative (search by description) would be ambiguous. the journey is: search → select → fetch.

**resolution**: document the journey in help text. not a design flaw.

#### output ergonomics

| output | natural? | improvement possible? |
|--------|----------|----------------------|
| permit details | ✓ yes | clear structure |
| inspection timeline | ✓ yes | shows progress through approval |
| contractor info | ✓ yes | answers "who did the work" |

**verdict**: output is comprehensive and well-structured.

---

## friction summary

| journey | friction | resolution |
|---------|----------|------------|
| permit.check.required | none | - |
| permit.search | postal redundant with address | future: infer postal from address |
| permit.search | pagination cursor not intuitive | add `--cursor` alias |
| permit.fetch | ID opaque | acceptable; document journey |

---

## pit of success assessment

| principle | assessment |
|-----------|------------|
| intuitive design | ✓ users can succeed with minimal docs |
| convenient | ? postal inference would help; mark as v2 |
| expressive | ✓ optional filters allow refinement |
| composable | ✓ search → fetch is natural composition |
| lower trust contracts | ✓ inputs validated at boundary |
| deeper behavior | ✓ edge cases (unclear, not found) handled gracefully |

---

## issues to fix now

1. **pagination cursor alias**: add `--cursor` as alias for `--until` in permit.search contract.

updated in 3.2.distill.repros.experience._.yield.md? no — this is a contract change, should be noted in blueprint.

---

## issues to defer

1. **postal inference**: infer postal from address string. v2 enhancement.

---

## conclusion

ergonomics review complete. one improvement identified (pagination cursor alias). design is solid for v1.
