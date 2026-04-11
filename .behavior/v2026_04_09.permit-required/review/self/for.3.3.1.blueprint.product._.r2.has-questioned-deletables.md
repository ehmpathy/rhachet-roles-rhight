# self-review: has-questioned-deletables (round 2)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## feature audit: can we delete this?

### domain objects

| object | traceability | delete? |
|--------|--------------|---------|
| Permit | vision: permit.search returns permits | no — core entity |
| Jurisdiction | vision: jurisdiction adoption documented | no — proof chain requires it |
| CodeSection | vision: verbatim code text citations | no — proof chain requires it |
| PermitDetermination | criteria: determination outcomes | no — required by criteria |
| WorkDescription | criteria: work mapped to code terms | no — required by criteria |
| CodeCitation | vision: exact citations | no — proof chain requires it |

**no deletable domain objects**. each traces directly to vision or criteria.

### operations

| operation | traceability | delete? |
|-----------|--------------|---------|
| getOnePermit | permit.fetch needs it | no |
| getAllPermitsForAddress | permit.search needs it | no |
| setPermit | cache writes | no — scrape module fills cache |
| getOneJurisdiction | permit.check.required needs it | no |
| setJurisdiction | jurisdiction cache | no |
| getOneCodeSection | permit.check.required needs it | no |
| getAllCodeSectionsForCategory | permit.check.required needs it | no |
| setCodeSection | code cache | no |
| parseWorkDescription | criteria: work mapped to code terms | no |
| computeDetermination | criteria: determination outcomes | no |

**question**: do we need setPermit, setJurisdiction, setCodeSection?

**answer**: yes. the scrape module fetches from portal and caches locally. without set operations, we'd hit the portal every time. caches are essential for:
1. performance (avoid re-scrape)
2. resilience (portal unavailable)
3. auditability (what data did we use?)

### skills

| skill | traceability | delete? |
|-------|--------------|---------|
| permit.check.required | vision v1 scope | no |
| permit.search | vision v1 scope | no |
| permit.fetch | vision v1 scope | no |

**no deletable skills**. all three are in vision v1 scope.

### thought route templates

| template | traceability | delete? |
|----------|--------------|---------|
| 0.query | vision: captures postal + work | no |
| 1.vision | route structure | no |
| 3.1.research.code.baseline | criteria: baseline code identified | no |
| 3.1.research.code.exemptions | criteria: exemptions checked | no |
| 3.2.distill.determination | criteria: determination produced | no |
| 5.1.deliver.diagnosis | vision: thorough analysis | no |
| 5.3.deliver.coverpage | vision: one-page summary | no |

**all templates trace to vision or criteria**.

---

## component simplification audit

### can we remove output.sh files?

**current**: each skill has output.sh for treestruct format functions.

**alternative**: inline format logic in main skill.

**decision**: keep output.sh. separation of concerns — skill logic vs output format. makes tests easier. small overhead for clear benefit.

### can we merge skill test files?

**current**: each skill has `.integration.test.ts` and `.play.integration.test.ts`.

**alternative**: combine into one file.

**decision**: keep separate. unit assertions (`.integration.test.ts`) vs journey snapshots (`.play.integration.test.ts`) serve different purposes. play tests capture full output for visual review.

### can we simplify domain object structure?

**question**: do we need both entities and literals?

**answer**: yes. domain-objects pattern distinguishes:
- entities (Permit, Jurisdiction, CodeSection) — have unique keys, can be persisted
- literals (PermitDetermination, WorkDescription, CodeCitation) — immutable values, no identity

this distinction matters for cache behavior and idempotency.

---

## conclusion

no deletable features or components identified. each traces to vision or criteria requirements. the separation of concerns (output.sh, test files, entity/literal distinction) serves clear purposes with minimal overhead.

