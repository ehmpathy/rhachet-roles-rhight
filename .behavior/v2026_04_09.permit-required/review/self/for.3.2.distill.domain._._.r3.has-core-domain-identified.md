# self-review round 3: core domain identified

## stone reviewed

`3.2.distill.domain._` → `3.2.distill.domain._.yield.md`

---

## deeper challenge: is determination really the core?

in round 2, i concluded determination is the core domain. let me challenge that.

### counter-argument 1: "code is the core"

**claim**: without accurate code text, determinations are worthless. code is the foundation.

**analysis**: code is necessary but not sufficient. a homeowner with access to all code sections still cannot easily determine permit requirements. the value is not in the code itself but in the interpretation.

**verdict**: code is critical infrastructure, not core domain.

---

### counter-argument 2: "permit search is the core"

**claim**: homeowners want to verify permit history. determination is secondary.

**analysis**: re-read the wish (0.wish.md):

> "determine whether or not a certain residential or commercial service requires a permit"

the wish explicitly prioritizes determination. permit search is goal #2, and it's framed as a separate skill (`permit.search`), not the main value.

**verdict**: wish confirms determination is primary.

---

### counter-argument 3: "jurisdiction is the core"

**claim**: different jurisdictions have different rules. the complexity is in the jurisdiction, not the determination.

**analysis**: jurisdiction complexity is data complexity, not logic complexity. once you know "Indianapolis uses IRC 2020", the lookup is trivial. the hard part is:
- map work description to code category
- find relevant sections in that code
- apply exemption logic
- decide confidence level

all of that is determination logic, not jurisdiction logic.

**verdict**: jurisdiction is lookup, determination is logic. logic is core.

---

## why i'm confident now

after challenge, determination still stands as core because:

1. **wish alignment** — the wish says "determine if permit required"
2. **unique value** — no other system does automated permit determination
3. **logic complexity** — the hard part is interpretation, not data storage
4. **error impact** — mistakes in determination cause real harm (fines, stop-work)

---

## what would change my mind?

if the wish had said:
- "search permit history" → permit would be core
- "provide legal code access" → code would be core
- "map addresses to permit offices" → jurisdiction would be core

but the wish says "determine if permit required". that's determination.

---

## found issue: yield file should explicitly mark core domain

the yield file structure implies determination is core (listed first, most complex), but does not say it explicitly.

**proposal**: add a "core domain" section to the yield file.

**decision**: this is a documentation improvement, not a structural issue. the implicit signal is sufficient for now. document this as a future enhancement.

**verdict**: no fix needed for MVP. note for future.

---

## reflection: how to identify core domain in future

1. **read the wish** — what does it literally ask for?
2. **ask "what's unique?"** — what can't be bought or borrowed?
3. **ask "where's the complexity?"** — data storage vs logic
4. **ask "what's the error impact?"** — where do mistakes hurt most?
5. **challenge yourself** — argue the opposite, see if it holds

---

## conclusion after challenge

**core domain**: determination — confirmed after challenge

the counter-arguments failed. determination remains the heart of the system.
