# self-review: has-pruned-yagni (round 4)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## YAGNI audit: what wasn't requested?

### domain objects check

| object | requested? | minimum viable? |
|--------|------------|-----------------|
| Permit | yes (vision: permit.search, permit.fetch) | yes — has only what's shown in skill contracts |
| Jurisdiction | yes (vision: jurisdiction adoption) | yes — has only slug, name, state, codeAdopted, portalUrl, contact |
| CodeSection | yes (vision: verbatim citations) | yes — has only code, section, title, verbatim, effectiveAt |
| PermitDetermination | yes (criteria: determination outcomes) | yes — has only determination + proof chain references |
| WorkDescription | yes (criteria: work mapped) | yes — has only raw, normalized, category, subcategory |
| CodeCitation | yes (vision: proof chain) | yes — has only codeRef, verbatim, applies, reason |

**no extras**. each field traces to a skill contract or criteria requirement.

### operations check

| operation | requested? | minimum viable? |
|-----------|------------|-----------------|
| getOnePermit | yes (permit.fetch needs it) | yes |
| getAllPermitsForAddress | yes (permit.search needs it) | yes |
| setPermit | implicit (cache for scrape) | yes — minimum for cache pattern |
| getOneJurisdiction | yes (proof chain jurisdiction) | yes |
| setJurisdiction | implicit (cache) | yes |
| getOneCodeSection | yes (proof chain citations) | yes |
| getAllCodeSectionsForCategory | yes (exemption check) | yes |
| setCodeSection | implicit (cache) | yes |
| parseWorkDescription | yes (criteria: work mapped) | yes |
| computeDetermination | yes (criteria: determination) | yes |

**potential YAGNI**: `getAllCodeSectionsForCategory`

**is it needed?**
- permit.check.required needs to check all exemptions in R105.2
- R105.2 has multiple subsections (electrical, pipe/sewer, mechanical, etc.)
- to check if work is exempt, we need ALL exemptions in that category

**verdict**: not YAGNI. required for exemption check.

### skills check

| skill | requested? |
|-------|------------|
| permit.check.required | yes (vision v1 scope) |
| permit.search | yes (vision v1 scope) |
| permit.fetch | yes (vision v1 scope) |

**no extra skills**. exactly three skills as specified in vision.

### test files check

| test type | requested? | minimum viable? |
|-----------|------------|-----------------|
| unit tests for domain objects | mechanic pattern | yes — one per object |
| integration tests for operations | mechanic pattern | yes — verify real deps |
| play tests for skills | mechanic pattern | yes — journey snapshots |

**no extra test files**. follows established mechanic patterns.

### fixtures check

| fixture | requested? | needed? |
|---------|------------|---------|
| search-results.html | implicit | yes — deterministic tests |
| permit-detail.html | implicit | yes — deterministic tests |
| irc-r105-1.md | implicit | yes — code section fixture |
| irc-r105-2.md | implicit | yes — exemptions fixture |

**no extra fixtures**. minimum set for deterministic tests.

---

## "while we're here" check

did we add extras while we were here?

**searched for patterns**:
- extra config options → none found
- extra output formats → none found (only treestruct)
- extra API endpoints → none found
- extra domain objects "for completeness" → none found

---

## "future flexibility" check

did we add abstraction for hypothetical future needs?

**searched for patterns**:
- generic base classes → none found
- plugin architecture → none found
- configuration system → none found
- feature flags → none found

the design is concrete and specific to the three v1 skills.

---

## conclusion

no YAGNI detected. every component traces to vision, criteria, or established mechanic patterns (tests, fixtures, cache). the blueprint is minimum viable for v1 scope.

