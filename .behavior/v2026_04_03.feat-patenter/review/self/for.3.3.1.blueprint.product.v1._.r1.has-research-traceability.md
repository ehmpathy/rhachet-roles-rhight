# review: has-research-traceability

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds ✓

the blueprint leverages all critical research recommendations. deferred items have clear rationale.

---

## research artifacts reviewed

| artifact | recommendations |
|----------|-----------------|
| 3.1.1.research.external.product.access | USPTO ODP API, rate limits, cache |
| 3.1.1.research.external.product.domain | domain objects, claim hierarchy, classifications |
| 3.2.distill.domain | domain objects, operations, cache semantics |
| 3.2.distill.repros.experience | journeys, fixtures, snapshot coverage |
| 3.2.distill.factory.upgrades | cache, fixture tool |

---

## traceability matrix

### from access research (3.1.1)

| recommendation | blueprint | status |
|----------------|-----------|--------|
| USPTO ODP as primary API | search_uspto() uses `data.uspto.gov/apis/patent-file-wrapper` | ✓ leveraged |
| API key authentication | `X-API-KEY: $USPTO_ODP_API_KEY` header | ✓ leveraged |
| exponential backoff + jitter for 429 | "if 429: read Retry-After header, sleep, retry with exponential backoff + jitter" | ✓ leveraged |
| cache (immutable patents) | cache_get(), cache_set() in fetch codepath | ✓ leveraged |
| avoid Google Patents scrape | not in scope | ✓ avoided |
| PatentsView (secondary API) | not included | deferred (v1 scope is single API) |

### from domain research (3.1.1)

| recommendation | blueprint | status |
|----------------|-----------|--------|
| model Patent with exid, title, abstract | parse_document() extracts all fields | ✓ leveraged |
| preserve independent/dependent claim hierarchy | "dependsOn: extract 'claim N' reference or null" | ✓ leveraged |
| include classifications | "metadata: {dateFiled, datePublished, inventors, assignee, classifications}" | ✓ leveraged |
| include prosecution history | "history: .prosecutionHistory[] if available" | ✓ leveraged |
| support figures | "figures: .drawings[] if available" | ✓ leveraged |

### from domain distillation (3.2)

| recommendation | blueprint | status |
|----------------|-----------|--------|
| PatentSearchQuery with pagination | --limit, --since, --until args | ✓ leveraged |
| relevance score | sort_by_relevance() with keyword match score | ✓ leveraged |
| cache by exid, no TTL | "patents immutable → cache never stale" | ✓ leveraged |

### from experience distillation (3.2)

| recommendation | blueprint | status |
|----------------|-----------|--------|
| journey.1 search t0-t3 | test coverage table has "t0-t3 journey" | ✓ leveraged |
| journey.2 fetch t0-t3 | test coverage table has "t0-t3 journey" | ✓ leveraged |
| journey.3 propose t0-t2 | test coverage table has "t0-t2 journey" | ✓ leveraged |
| snapshot coverage | 8 snapshots enumerated | ✓ leveraged |
| fixtures directory | `.fixtures/` with 5 sample files | ✓ leveraged |

### from factory upgrades (3.2)

| recommendation | blueprint | status |
|----------------|-----------|--------|
| patent document cache | cache_get/cache_set inline in fetch skill | ✓ leveraged |
| fixture generation tool | not as separate tool | deferred (manual capture is acceptable per distillation: "improvements integrate into normal build flow") |

---

## deferred items with rationale

| item | rationale | acceptable? |
|------|-----------|-------------|
| PatentsView API | v1 scope is single API (USPTO ODP). secondary API adds complexity without block to functionality. | yes |
| fixture generation tool | distillation explicitly states this integrates into test authorship, not a prerequisite. manual capture works. | yes |
| EPO OPS for international | wish specifies USPTO focus ("USPTO for now"). international is future scope. | yes |

---

## gaps found: none

all research was either leveraged or has documented deferral rationale.

---

## conclusion

the blueprint has excellent research traceability. proceed to execution.
