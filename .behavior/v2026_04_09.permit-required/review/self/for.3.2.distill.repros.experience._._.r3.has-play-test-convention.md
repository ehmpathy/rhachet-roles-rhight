# self-review: has-play-test-convention (round 3)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.2.distill.repros.experience._.yield.md

---

## deeper reflection: why play test convention holds

### the core question

are journey tests named correctly per `.play.{scope}.test.ts` convention?

### verification against yield file

read the yield file structure at lines 284-299:

```
src/domain.roles/permiter/skills/
├── permit.check.required/
│   ├── permit.check.required.sh
│   └── permit.check.required.play.acceptance.test.ts  ← journey test
├── permit.search/
│   ├── permit.search.sh
│   ├── permit.search.integration.test.ts             ← unit assertions
│   └── permit.search.play.integration.test.ts        ← journey test
└── permit.fetch/
    ├── permit.fetch.sh
    ├── permit.fetch.integration.test.ts
    └── permit.fetch.play.integration.test.ts         ← journey test
```

### why each choice holds

#### permit.check.required → `.play.acceptance.test.ts`

**why acceptance?**
- tests the complete thought route from wish to yield
- user experience is: invoke skill → route drives → yields appear
- no external service boundary (code research is cached/fixture)
- blackbox test: only sees inputs and final outputs

**why this holds**: acceptance tests verify user-visible behavior end-to-end. the thought route is a complete user journey that produces a determination with proof chain. this is the definition of acceptance scope.

#### permit.search → `.play.integration.test.ts`

**why integration?**
- crosses external boundary: Accela portal via Playwright
- tests real HTTP responses (or cached fixtures)
- verifies parse logic against actual portal HTML

**why this holds**: integration tests verify behavior across system boundaries. the portal scrape is an external dependency. even with fixtures, we test integration with a third-party system's data format.

#### permit.fetch → `.play.integration.test.ts`

**why integration?**
- same rationale as permit.search
- crosses portal boundary
- fetches real permit detail HTML

**why this holds**: same rationale. external system dependency = integration scope.

### what `.play.` prefix means

the `.play.` infix distinguishes:
- `feature.test.ts` → unit test of internals
- `feature.integration.test.ts` → unit assertions with real deps
- `feature.play.integration.test.ts` → journey test (step-by-step)

journey tests follow the step table pattern from the yield:

| step | action | user sees |
|------|--------|-----------|
| t0 | before | initial state |
| t1 | invoke | route created |
| t2 | after | yields appear |

this temporal sequence is what makes it a "play" — we watch the story unfold.

### no issues found

the convention is correct because:
1. `.play.` prefix correctly marks journey tests
2. scope selection (acceptance vs integration) matches boundary type
3. file names parallel patenter role patterns
4. separation of unit assertions (`.integration.test.ts`) from journey tests (`.play.integration.test.ts`) is clear

---

## conclusion

play test convention holds. the design correctly distinguishes journey tests from unit tests, and correctly selects acceptance scope for thought routes vs integration scope for portal scrapes.

