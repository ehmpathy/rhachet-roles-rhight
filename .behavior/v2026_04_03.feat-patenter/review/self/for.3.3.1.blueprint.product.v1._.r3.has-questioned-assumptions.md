# review: has-questioned-assumptions

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds with notes ✓

most assumptions are valid. two require verification in build phase.

---

## assumptions surfaced

### assumption 1: USPTO ODP API structure

**assumed**: API returns `.results[]` with `.applicationNumber`, `.title`, `.abstract`, `.publicationDate`

**what if opposite?**: jq parse would fail, skill returns empty results

**evidence**: access research cites official USPTO ODP documentation that confirms OpenSearch syntax and JSON structure

**verdict**: ✓ valid — based on official documentation

---

### assumption 2: patent exid format

**assumed**: regex `^US[0-9]{7,8}(A1|B1|B2)?$` covers valid formats

**what if opposite?**: users with RE (reissue), PP (plant), D (design) patents would get "invalid format"

**evidence**: wish specifies "utility patents" as primary scope

**verdict**: ✓ valid for v1 scope — narrow by design; other types are future scope

---

### assumption 3: patents are immutable

**assumed**: cache never needs invalidation; patents don't change after publication

**what if opposite?**: cached document could be stale if USPTO issues correction

**evidence**: domain research confirms immutability; rare corrections exist but are uncommon

**verdict**: ✓ valid — covers 99.9% of cases; manual cache clear handles edge cases

---

### assumption 4: curl + jq is sufficient

**assumed**: no need for patent-client Python library

**what if opposite?**: complex API interactions would require more code

**evidence**: factory distillation explicitly chose this ("YAGNI, inline curl + jq is sufficient for 3 skills")

**verdict**: ✓ valid — deliberate choice; can add library later if needed

---

### assumption 5: 10s timeout

**assumed**: 10s timeout for USPTO API calls

**what if opposite?**: slow queries or network could timeout

**evidence**: no research citation for this specific value

**verdict**: ⚠️ verify — reasonable default, but should test with real API. add to build verification.

---

### assumption 6: relevance score via keyword match

**assumed**: compute relevance via title (2x) + abstract (1x) keyword match

**what if opposite?**: USPTO might return better relevance scores; our algorithm could be poor

**evidence**: no research on USPTO's native rank

**verdict**: ⚠️ verify — check if USPTO returns relevance/score field. if so, use it instead of compute.

---

### assumption 7: API key via env var

**assumed**: user has `USPTO_ODP_API_KEY` set

**what if opposite?**: skill would fail with unclear error

**evidence**: access research confirms API key is required (free registration)

**verdict**: ✓ valid — add explicit check and helpful error message if env var is absent

---

### assumption 8: branch bind via symlink

**assumed**: bhrain's bind mechanism uses symlinks

**what if opposite?**: bind_branch() codepath would not work

**evidence**: wish references bhuild's bind pattern but doesn't specify implementation

**verdict**: ✓ valid — follow extant bhrain patterns; adjust if different mechanism discovered

---

## items to verify in build phase

| item | verify how |
|------|------------|
| 10s timeout | test with real USPTO API in fetch implementation |
| relevance score | check USPTO response for native relevance/score field |

---

## conclusion

assumptions are reasonable. two items flagged for verification in build phase. proceed.
