# review: has-critical-paths-identified

## summary

critical paths identified and verified for pit of success.

---

## critical paths reviewed

### path 1: search → fetch → review

**identified**: yes
**why critical**: core prior art research flow — if this fails, inventors can't assess the patent landscape

**pit of success verification**:
- narrower inputs: query is plain text, validated for length (3-1000 chars) ✓
- convenient: single command, no setup required ✓
- expressive: query accepts natural language, allows refinement ✓
- failsafes: vague query shows alert + suggestions ✓
- failfasts: empty/too-short query rejected with clear error ✓
- idempotency: search is read-only, safe to retry ✓

### path 2: propose → idea → research

**identified**: yes
**why critical**: core proposal flow — if route creation fails, inventors can't structure their work

**pit of success verification**:
- narrower inputs: no required args, optional --open ✓
- convenient: single command creates full route ✓
- expressive: --open flag for editor preference ✓
- failsafes: route already extant shows clear error ✓
- failfasts: not in git repo shows clear error ✓
- idempotency: genPatentProposalRoute is find-or-error ✓

### path 3: search with good query

**identified**: yes
**why critical**: if search results are poor, the tool is useless

**pit of success verification**:
- narrower inputs: minimum 3 chars enforced ✓
- convenient: plain text input, no special syntax ✓
- expressive: full-text search via USPTO API ✓
- failsafes: no results shows suggestions ✓
- failfasts: API errors surface clearly ✓
- idempotency: search is read-only ✓

### path 4: fetch complete document

**identified**: yes
**why critical**: claims are the essence of patents — incomplete fetch is useless

**pit of success verification**:
- narrower inputs: exid format validated ✓
- convenient: exid copied from search results ✓
- expressive: returns full document with all sections ✓
- failsafes: not found shows verification hint ✓
- failfasts: invalid format rejected immediately ✓
- idempotency: fetch is read-only, cached ✓

---

## issues found

none — critical paths are well-defined with pit of success properties.

---

## non-issues confirmed

- **friction with many stones**: the route has 9 stones, which may feel heavy. this is intentional — patent preparation requires thoroughness. progress indicators mitigate the friction. not an issue.

- **long documents in fetch**: patent documents can be lengthy. the structured output (claims, figures, metadata separate) helps. pagination is future scope, not a blocker.

