# self-review: has-consistent-mechanisms (round 8)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: missed opportunities for reuse

### 1. treestruct output functions

**observation**: patenter has output.sh with treestruct functions. permiter blueprint plans its own output.sh.

**question**: should these be shared at a higher level?

**analysis**:
- patenter uses 🦅 eagle mascot
- permiter would use 🏛️ column mascot
- function signatures are the same (print_tree_branch, etc.)
- but emoji/phrase differs by role

**verdict**: role-specific output.sh is correct. mascot and tone vary by role. extract to shared utility would require parameterization that adds complexity without benefit.

### 2. file-based cache pattern

**observation**: both patenter and permiter use `.cache/` with file-based storage.

**question**: should there be a shared cache utility?

**analysis**:
- patenter caches to `.cache/patents/`
- permiter would cache to `.cache/permits/`
- cache key patterns are domain-specific
- invalidation rules differ (patents are immutable, permits change status)

**verdict**: pattern reuse is correct (same structure), but shared code would over-abstract. domain-specific cache behavior justifies separate implementations.

### 3. transcriber integration

**observation**: transcriber role exists for PDF OCR. permit PDFs might need transcription.

**question**: should permiter use transcriber for document extraction?

**analysis**:
- permit portal returns HTML, not PDF
- permit documents (if fetched) might be PDF
- blueprint does not scope PDF document fetch in v1

**verdict**: no transcriber integration needed in v1. if future scope includes PDF documents, transcriber would be the correct mechanism to use.

### 4. playwright scrape module

**observation**: blueprint plans a new scrape module with Playwright.

**question**: is there extant scrape infrastructure to reuse?

**analysis**:
- searched codebase for playwright, puppeteer, scrape patterns
- no extant browser automation in rhight repo
- patenter uses HTTP API, not scrape

**verdict**: scrape module is genuinely new. no duplication.

### 5. domain-objects library

**observation**: blueprint uses DomainEntity, DomainLiteral patterns.

**question**: are these used correctly?

**analysis**:
- Permit, Jurisdiction, CodeSection use DomainEntity (correct — have identity)
- PermitDetermination, WorkDescription, CodeCitation use DomainLiteral (correct — immutable values)

**verdict**: consistent with library patterns. no custom domain-object infrastructure duplicated.

---

## missed opportunity identified

**cache utility extraction**: as more roles adopt search/fetch patterns, a shared cache utility could emerge. this is not duplication today (only two roles), but worth a note for future consolidation.

**recommendation**: do not extract now. let the pattern stabilize across 3+ roles before extraction.

---

## conclusion

deeper review confirms no meaningful duplication:
1. output.sh is role-specific by design (mascot, tone)
2. cache pattern is shared, code is domain-specific
3. transcriber not needed in v1 scope
4. scrape module is genuinely new
5. domain-objects library used correctly

one future consolidation opportunity noted (cache utility) but premature to extract now.

