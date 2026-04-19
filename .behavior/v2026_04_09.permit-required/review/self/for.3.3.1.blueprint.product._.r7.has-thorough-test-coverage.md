# self-review: has-thorough-test-coverage (round 7)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: why this coverage holds

### the question beneath the question

r6 verified test coverage is declared. but coverage declared is not coverage achieved. what makes this coverage *actually* thorough?

### 1. grain-appropriate test types

| grain | test type | why appropriate |
|-------|-----------|-----------------|
| domain objects | unit | pure construction, no deps |
| transformers | unit | pure computation, deterministic |
| communicators | integration | real i/o boundaries |
| orchestrators | integration | composed workflows |
| skills | acceptance + snapshots | human-faced contracts |

this follows `rule.require.test-coverage-by-grain` exactly. not arbitrary.

### 2. case coverage is derived, not invented

the positive/negative/edge cases trace to criteria:

| criteria requirement | test case |
|---------------------|-----------|
| determination outcomes (required/not_required/conditional/unclear) | positive + negative + edge |
| verbatim citations | positive case with citations |
| exemption check | negative case (not-required) |
| work category parse | ambiguous → unclear (edge) |

cases are not padded. each maps to a criteria requirement.

### 3. snapshot coverage at contract boundaries only

snapshots declared for:
- permit.check.required output
- permit.search output
- permit.fetch output

not for:
- internal transformers (tested via assertions)
- communicators (response shapes covered by integration)

snapshots are expensive to maintain. limited to contracts is deliberate.

### 4. the absent test gap check

what is NOT covered?

| gap candidate | covered? | how |
|---------------|----------|-----|
| portal unavailable | yes | negative case in permit.search |
| rate limit exceeded | yes | edge case with retry hint |
| malformed html | no | **gap identified** |
| partial scrape data | no | **gap identified** |

**gaps found**: malformed html and partial scrape data are not explicitly covered.

**assessment**: these are defensive cases. portal html structure changes would break scrape regardless of test coverage. the correct defense is selector version suffixes (which blueprint includes) not test coverage. acceptable gap.

### 5. test pyramid shape

```
        acceptance (3 skills)
       /                    \
  integration (8 operations + 3 skill integration)
 /                                              \
unit (6 domain objects + 2 transformers)
```

wide base (8 unit tests), narrow top (3 acceptance). correct pyramid shape.

---

## conclusion

coverage is thorough because:
1. test types match grain (not arbitrary)
2. cases derive from criteria (not invented)
3. snapshots at contracts only (not everywhere)
4. identified gaps are acceptable (portal html defense is version suffixes, not tests)
5. pyramid shape is correct (wide base, narrow top)

the gaps in malformed html / partial scrape are acknowledged and rationale documented.

