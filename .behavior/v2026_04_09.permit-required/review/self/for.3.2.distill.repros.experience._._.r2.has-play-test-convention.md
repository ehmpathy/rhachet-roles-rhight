# self-review: has-play-test-convention (round 2)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.2.distill.repros.experience._.yield.md

---

## play test convention review

### file name convention verified

| usecase | file name | convention |
|---------|-----------|------------|
| permit.check.required | `permit.check.required.play.acceptance.test.ts` | `.play.acceptance.test.ts` ✓ |
| permit.search | `permit.search.play.integration.test.ts` | `.play.integration.test.ts` ✓ |
| permit.fetch | `permit.fetch.play.integration.test.ts` | `.play.integration.test.ts` ✓ |

### convention pattern

```
{skill-name}.play.{scope}.test.ts
```

| element | purpose |
|---------|---------|
| `{skill-name}` | matches skill file name |
| `.play.` | indicates journey test (vs unit) |
| `{scope}` | acceptance \| integration |
| `.test.ts` | jest test file |

### scope selection rationale

| usecase | scope | why |
|---------|-------|-----|
| permit.check.required | acceptance | full thought route, user-visible output |
| permit.search | integration | portal scrape, real external dependency |
| permit.fetch | integration | portal scrape, real external dependency |

**acceptance**: blackbox, tests complete user journey from input to output
**integration**: tests with real dependencies (portal, cache)

### convention consistency check

compared to patenter role:

| patenter | permiter | consistent? |
|----------|----------|-------------|
| patent.priors.search | permit.search | ✓ parallel structure |
| patent.priors.fetch | permit.fetch | ✓ parallel structure |
| patent.propose | permit.check.required | ✓ thought route pattern |

---

## issues found in round 2

none. convention follows established patterns from patenter role.

---

## conclusion

play test convention is correct. file names follow `.play.{scope}.test.ts` pattern. scope selection matches test boundaries (acceptance for thought routes, integration for portal scrapes).

