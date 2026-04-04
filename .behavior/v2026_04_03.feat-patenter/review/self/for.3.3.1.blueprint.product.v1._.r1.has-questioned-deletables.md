# review: has-questioned-deletables

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds ✓

each component is necessary. the blueprint is minimal for deliver.

---

## deletion analysis

### skills

| component | can delete? | reason to keep |
|-----------|-------------|----------------|
| patent.priors.search | no | core skill per wish |
| patent.priors.fetch | no | core skill per wish |
| patent.propose | no | core skill per wish |
| output.sh | no | avoids duplication in 3 skills, follows mechanic pattern |

### features

| feature | can delete? | reason to keep |
|---------|-------------|----------------|
| cache in fetch | maybe | research strongly recommends for immutable patents. first fetch: 5s, cached: <100ms. worth the ~10 lines. |
| --since/--until args | maybe | pagination-fns style is project standard. date range is useful for "recent patents only" queries. ~5 lines. |
| prosecution history | maybe | domain research shows value for office action context. ~3 lines in parse. |
| figures | maybe | part of complete patent document. ~2 lines in parse. |

**decision**: all "maybe" items are low-cost additions (<10 lines each) with clear value. delete would not simplify meaningfully.

### briefs

| brief | can merge? | reason to keep separate |
|-------|------------|------------------------|
| howto.patent-techniques | no | process-focused (how to search, how to draft claims) |
| define.patent-fundamentals | no | terminology-focused (what is 101/102/103) |

separate briefs follow repo convention: `howto.*` vs `define.*`.

### test infrastructure

| component | can delete? | reason to keep |
|-----------|-------------|----------------|
| fixtures/ | no | required to avoid live API calls in integration tests |
| snapshot tests | no | required for output verification |

---

## simplest version that works

the blueprint is already the simplest version:
- 3 skills (minimum per wish)
- 1 shared output helper (avoid duplication)
- 2 briefs (one howto, one define)
- fixtures for test isolation

---

## conclusion

no deletables found. proceed.
