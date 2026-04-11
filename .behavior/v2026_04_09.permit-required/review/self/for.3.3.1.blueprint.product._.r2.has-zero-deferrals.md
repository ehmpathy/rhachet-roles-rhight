# self-review: has-zero-deferrals (round 2)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: why zero-deferrals holds

### the core question

are any vision or criteria items deferred in the blueprint?

### vision v1 scope (from 1.vision.yield.md, lines 83-88)

| skill | layer | purpose |
|-------|-------|---------|
| `permit.check.required` | rigid | is permit required for this work? |
| `permit.search` | solid | search permits by address/criteria |
| `permit.fetch` | solid | fetch permit details by ID |

### blueprint coverage verification

**permit.check.required** — fully specified in 3.3.1.blueprint.product.yield.md:
- skill file: `permit.check.required.sh`
- templates: 0.query through 5.3.deliver
- acceptance test: `permit.check.required.play.acceptance.test.ts`
- contract: lines 297-314

**permit.search** — fully specified:
- skill file: `permit.search.sh`
- integration tests: `permit.search.integration.test.ts`, `permit.search.play.integration.test.ts`
- contract: lines 316-339

**permit.fetch** — fully specified:
- skill file: `permit.fetch.sh`
- integration tests: `permit.fetch.integration.test.ts`, `permit.fetch.play.integration.test.ts`
- contract: lines 341-367

### vision future items (explicitly deferred in vision)

| skill | status | notes |
|-------|--------|-------|
| `permit.check.granted` | future | explicitly marked as future in vision (line 93) |

this is NOT a blueprint deferral — the vision itself marks this as future scope.

### criteria requirements verification

| criteria requirement | blueprint location |
|---------------------|-------------------|
| determination outcomes: required \| not_required \| conditional \| unclear | PermitDetermination literal, line 113 |
| proof chain with verbatim text | CodeCitation literal, line 121 |
| pagination with limit, since, until, cursor | permit.search contract, lines 200-202 |
| inspection timeline | permit.fetch contract, lines 363-366 |
| disclaimer included | skill contract coverpage, line 313 |

all criteria requirements are covered.

### the one factory deferral

| what | why acceptable |
|------|----------------|
| p-queue rate limit integration | not in vision or criteria; optimization we identified |

vision acknowledges "can't promise uniform experience" (line 533). rate limit support was never promised.

---

## conclusion

zero deferrals on vision or criteria items. the vision's three v1 skills are fully specified. the future `permit.check.granted` skill is vision-scoped deferral, not a blueprint gap. the factory rate limit deferral is an optimization beyond what was promised.

