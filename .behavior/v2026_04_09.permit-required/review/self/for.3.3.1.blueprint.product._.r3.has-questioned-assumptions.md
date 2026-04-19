# self-review: has-questioned-assumptions (round 3)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## technical assumptions audit

### assumption 1: playwright is the right tool for portal scrape

**the assumption**: we need browser automation (playwright) to scrape the Accela portal.

**what if opposite**: what if raw HTTP requests could work?

**evidence check**:
- research `3.1.4.research.internal.factory.blockers._.yield.md` notes Accela portal is JavaScript-heavy
- permit search requires form fill → submit → parse results
- simple curl/fetch would not execute JS

**verdict**: assumption holds. portal is a JS-heavy SPA, not a static HTML page.

### assumption 2: file-based cache is appropriate

**the assumption**: cache permits and code sections to local files.

**what if opposite**: what if we used in-memory cache or database?

**evidence check**:
- CLI tool, not a server — in-memory cache lost between invocations
- database adds dependency (postgres/sqlite)
- file cache is portable, inspectable, diffs in git

**verdict**: assumption holds for v1. file cache is simplest for CLI use case.

### assumption 3: permit ID format is jurisdiction-specific

**the assumption**: permit IDs like `INDY-2019-00012345` are jurisdiction-specific.

**what if opposite**: what if a universal format exists?

**evidence check**:
- no US standard for permit ID format
- each jurisdiction uses own system (Accela, Cityworks, custom)
- Indianapolis uses `INDY-` prefix, others differ

**verdict**: assumption holds. no universal format exists.

### assumption 4: treestruct output is the right CLI format

**the assumption**: treestruct format is ideal for permit skill output.

**what if opposite**: what if JSON or plain text is better?

**evidence check**:
- patenter uses treestruct, establishes precedent
- treestruct is scannable for humans
- JSON could be added as `--output json` option later

**verdict**: assumption holds. treestruct is primary; JSON can be secondary.

### assumption 5: acceptance tests need snapshots

**the assumption**: play tests should use `.toMatchSnapshot()`.

**what if opposite**: what if explicit assertions are sufficient?

**evidence check**:
- mechanic briefs require snapshots for user-faced outputs
- snapshots enable visual diff review in PRs
- explicit assertions verify behavior, snapshots verify aesthetics

**verdict**: assumption holds. both are needed — assertions for correctness, snapshots for aesthetics.

### assumption 6: domain objects pattern is appropriate

**the assumption**: use domain-objects library with entities and literals.

**what if opposite**: what if plain TypeScript types suffice?

**evidence check**:
- domain-objects provides `.unique`, `.updatable`, `.nested`
- enables idempotent operations via unique key
- matches ehmpathy conventions

**verdict**: assumption holds. domain-objects pattern is established in this ecosystem.

### assumption 7: thought route is right for permit.check.required

**the assumption**: permit determination needs a multi-stone thought route.

**what if opposite**: what if a single operation could determine permit requirement?

**evidence check**:
- vision requires: work interpretation → baseline code → exemptions → jurisdiction
- each step has audit trail value
- thought route enables human review at each stage

**verdict**: assumption holds. multi-step research with audit trail is the point.

---

## issues found

none. all assumptions trace to evidence from research yields or established patterns.

---

## conclusion

seven technical assumptions examined. each holds when tested against evidence or established conventions. no hidden assumptions identified that would undermine the blueprint.

