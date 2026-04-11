# self-review: has-critical-paths-identified

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.2.distill.repros.experience._.yield.md

---

## critical paths reviewed

### path 1: happy: check required

| criterion | assessment |
|-----------|------------|
| narrower inputs | ✓ postal is constrained to US ZIP format; work is free text (intentional) |
| convenient | ✓ only two inputs required; defaults handle the rest |
| expressive | ✓ work description allows natural language |
| failsafes | ✓ "unclear" determination when ambiguous, not forced guess |
| failfasts | ✓ postal validation before research begins |
| idempotency | ✓ same postal + work yields same route |

**verdict**: holds. the core value prop path is well-designed.

### path 2: happy: search permits

| criterion | assessment |
|-----------|------------|
| narrower inputs | ✓ address + postal constrains to one jurisdiction |
| convenient | ✓ postal can be inferred from address in future |
| expressive | ✓ optional filters (since, until, limit) allow refinement |
| failsafes | ✓ empty results show "no permits found", not error |
| failfasts | ✓ address validation before scrape |
| idempotency | ✓ same query yields same results (modulo new permits filed) |

**verdict**: holds. search path is solid.

### path 3: happy: fetch permit

| criterion | assessment |
|-----------|------------|
| narrower inputs | ✓ permit ID is exact; no ambiguity |
| convenient | ? ID discovery requires prior search — acceptable |
| expressive | ✓ no additional options needed |
| failsafes | ✓ "not found" error with format hint |
| failfasts | ✓ ID format validation before fetch |
| idempotency | ✓ same ID yields same record (permits are immutable once issued) |

**verdict**: holds. fetch path is solid, though ID discovery friction is noted.

### path 4: error: portal unavailable

| criterion | assessment |
|-----------|------------|
| failsafes | ✓ graceful error with retry hint |
| user guidance | ✓ tells user what happened and what to do |

**verdict**: holds. error path is user-friendly.

### path 5: error: ambiguous work

| criterion | assessment |
|-----------|------------|
| failsafes | ✓ returns "unclear" with suggested questions |
| user guidance | ✓ tells user what to ask permit office |

**verdict**: holds. ambiguous work is handled correctly — clarification over forced guess.

---

## issues found

none. all critical paths pass pit of success criteria.

---

## observations

1. **ID discovery friction** in permit.fetch is intentional — users must first search to find IDs. this is acceptable UX because the alternative (search by description) would be ambiguous.

2. **work interpretation** is the highest-risk area. if we misinterpret "panel upgrade", the whole proof chain is wrong. the "unclear" escape hatch is critical.

3. **portal unavailable** path is important because Accela portals have downtime. graceful degradation protects user experience.

---

## conclusion

critical paths are correctly identified and pass pit of success review. no changes required.
