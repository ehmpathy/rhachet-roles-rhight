# self-review r3: has-questioned-questions

## reflection

the wish is the source of truth. in r2, I triaged questions but did not re-read the wish carefully enough. several items marked [wisher] were actually answerable from the wish itself.

the lesson: before you mark an item [wisher], check if the wish already provides the answer.

---

## issues found and fixed

### issue 1: "patenter" name was marked [wisher] but wish specifies it

**what was wrong**: marked "patenter as name" as [wisher], which suggested the name needed wisher input

**evidence from wish**: line 3 says "we'd like to create a new role, called 'patenter'"

**fix applied**: changed from [wisher] to [answered: wish explicitly says "a new role, called 'patenter'"]

---

### issue 2: "integration" was marked [wisher] but wish implies external APIs

**what was wrong**: marked "should skills call external APIs?" as [wisher]

**evidence from wish**:
- line 24: "a skill to search for relevant patents"
- line 25: "a skill to grab the pdf of a given patent"
- line 44: "fetches all patent contents by exid"

these operations inherently require external API calls — you cannot search or fetch patents without a patent database.

**fix applied**: changed from [wisher] to [answered: yes, external API calls are inherent to the design]

---

### issue 3: "output format" was marked [wisher] but wish specifies latex

**what was wrong**: marked "latex specifically? or also word/pdf?" as [wisher] in two places

**evidence from wish**: line 35 says "5.1.deliver.patent.latex.stone" — latex is explicitly named

**fix applied**: changed both instances from [wisher] to [answered: latex as specified in wish; alternatives are future scope]

---

## updated triage summary

| category | count | items |
|----------|-------|-------|
| [answered] | 10 | resolved via logic, wish, or prior decisions |
| [research] | 8 | need external data, answer in research phase |
| [wisher] | 3 | only wisher can decide (scope, preference) |

### [answered] — 10 items

1. inventors can describe ideas — mitigated by structured template
2. output format acceptable — latex from wish
3. integration — yes, external APIs from wish
4. output format — latex from wish
5. patenter as name — from wish
6. route stone order — follows bhrain convention
7. approvals vs rejections — rename to favorable/adverse
8. fetch by exid — search-first flow is correct
9. automation vs accuracy — accepted tradeoff with disclaimer
10. accessibility vs expertise — target technical users

### [research] — 8 items

1. patent search API — what APIs are available?
2. text extraction reliable — test on real PDFs
3. attorney handoff format — what format do attorneys expect?
4. patent database APIs — google patents, USPTO bulk data, espacenet
5. claim structure patterns — what makes claims strong vs weak?
6. office action patterns — common 101/102/103/112 rejections
7. latex patent templates — do standard templates exist?
8. API costs — rate limits and price tiers

### [wisher] — 3 items (verified as genuinely unresolvable)

1. **scope of "patent"** — utility only? or design, provisional, PCT?
   - **why wisher**: the wish says "patent" without qualifier. utility patents have claims, design patents protect appearance, provisionals are placeholders, PCT is international. each has different requirements. only the wisher knows which scope they intend.

2. **target jurisdiction** — USPTO? or international (EPO, WIPO)?
   - **why wisher**: the wish doesn't mention jurisdiction. USPTO has different requirements than EPO or WIPO. claim formats differ. examination processes differ. only the wisher can decide which market(s) to target.

3. **single route for all patent types** — or split by type?
   - **why wisher**: depends on answer to question 1. if scope includes multiple patent types, the route structure may need to branch. this is a product scope decision only the wisher can make.

---

## non-issues that hold

### remaining research items are genuinely researchable

the 8 [research] items cannot be answered via logic or the wish:
- they require API documentation review
- they require domain expert knowledge
- they require cost analysis from actual services
- they will be resolved during the 3.1 research stones

### question coverage is complete

I scanned all sections of the vision for implicit questions:
- **outcome world**: no open questions (describes target state)
- **user experience**: no open questions (describes interface contract)
- **mental model**: no open questions (describes target user and framing)
- **evaluation**: no open questions (describes assessment)
- **open questions & assumptions**: all items tagged
- **what is awkward**: all items tagged

every item that could be a question has been triaged.

---

## what I learned

1. **read the wish first** — before you mark an item [wisher], check if the wish already answers it

2. **implicit answers count** — "skill to search for patents" implicitly answers "should we call external APIs?" — yes, obviously

3. **explicit specifications are decisions** — when the wish says "latex.stone", that's a decision, not a question

4. **fewer wisher questions is better** — 3 genuine wisher questions is cleaner than 6 that include items the wish already decided
