# self-review: core domain identified

## stone reviewed

`3.2.distill.domain._` → `3.2.distill.domain._.yield.md`

---

## the question

what is the heart of this system? where should we invest the most care?

---

## analysis: which context is core?

### context: code

**what it does**: stores legal code text

**generic or unique?**: generic — this is a document store. could be replaced with a file system, database, or even a third-party legal API.

**verdict**: support domain

---

### context: jurisdiction

**what it does**: maps postal codes to authorities and their adopted codes

**generic or unique?**: generic — this is a lookup table. the data is unique but the logic is trivial. could be a CSV file.

**verdict**: support domain

---

### context: permit

**what it does**: stores and retrieves permit records from portal

**generic or unique?**: semi-generic — the scrape logic is specific to Accela, but the concept of "fetch permit records" is not unique. this is integration code.

**verdict**: support domain

---

### context: determination

**what it does**: computes whether permit is required based on work description, jurisdiction, and code

**generic or unique?**: **unique** — this is the core value proposition. no other system does this. this is what differentiates us from:
- the permit portal (shows permits pulled, not permits required)
- a legal database (shows code text, not determinations)
- a contractor (charges money for this knowledge)

**verdict**: **core domain**

---

## why determination is the core

### the test: "what if we replaced it with a generic solution?"

| context | replaced with | impact |
|---------|---------------|--------|
| code | legal database API | minimal — just a data source change |
| jurisdiction | CSV lookup | minimal — same logic, different storage |
| permit | different portal scraper | minimal — same data, different source |
| determination | ??? | **no generic solution exists** |

there is no "permit determination as a service" we can buy. this is the gap we fill.

### the test: "where does competitive advantage live?"

a homeowner can:
- look up permits on the portal (permit context replaces this)
- read the code online (code context replaces this)
- find their jurisdiction (jurisdiction context replaces this)

but a homeowner cannot:
- determine if their work requires a permit without read and interpret of the code

the determination context is the only one that provides value the homeowner cannot get elsewhere.

---

## implications for the design

### where to invest care

| context | investment level | why |
|---------|------------------|-----|
| determination | **high** | core domain — must be correct, clear, defensible |
| code | medium | must be accurate but logic is simple |
| jurisdiction | low | lookup table, rarely changes |
| permit | medium | scrape fragility needs attention but not core logic |

### what "high investment" means for determination

1. **correctness** — determination logic must match legal code exactly
2. **explainability** — every determination must cite proof
3. **humility** — "unclear" must be a valid output when confidence is low
4. **testability** — every edge case needs a test
5. **auditability** — determinations should be reproducible

---

## found issue: none

the yield file does not explicitly label determination as the core domain, but the structure implies it:
- determination is listed first in the treestruct
- the main flow (`permit.check.required`) is in determination context
- determination has the most complex operation (`getOnePermitDetermination`)

**verdict**: no fix needed — the structure already reflects the priority.

---

## reflection: what makes a core domain?

core domain criteria:
1. **uniqueness** — no generic solution exists
2. **value** — this is why users come to us
3. **complexity** — requires domain expertise to build correctly
4. **differentiation** — competitors can't easily copy

determination meets all four. the other contexts are necessary infrastructure but not where the magic happens.

---

## conclusion

**core domain**: determination context

**support domains**: code, jurisdiction, permit

the yield file structure implicitly prioritizes determination. the design should continue to invest most care there.
