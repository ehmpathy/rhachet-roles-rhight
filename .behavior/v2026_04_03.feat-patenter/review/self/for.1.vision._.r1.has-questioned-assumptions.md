# self-review: has-questioned-assumptions

review of assumptions in the vision for 1.vision stone.

---

## assumption: google patents api provides sufficient search coverage

**where in vision?** section "assumptions" item 1

**what do we assume?** that google patents (or similar) has a usable API with good patent coverage

**evidence?** none. I assumed this based on the fact that google patents website exists.

**what if the opposite were true?**
- google patents has no public API
- USPTO has bulk data but not a search API
- might need to scrape or use paid services

**verdict**: UNVERIFIED. need to research what APIs actually exist before build.

---

## assumption: pdf/text extraction from patents is reliable

**where in vision?** section "assumptions" item 2

**what do we assume?** that we can extract structured text from patent PDFs reliably

**evidence?** none. patents have complex layouts, figures, tables, claims sections.

**what if the opposite were true?**
- patent PDFs might have OCR errors
- figures might be embedded in ways that break extraction
- claims sections might not be clearly delimited

**verdict**: UNVERIFIED. need to test extraction on real patents.

---

## assumption: inventors can describe their inventions clearly

**where in vision?** section "assumptions" item 3

**what do we assume?** that inventors can write a clear 0.idea.md

**evidence?** weak. inventors often struggle to articulate novelty.

**what if the opposite were true?**
- 0.idea.md might be vague or unfocused
- might need guided prompts or templates
- might need iteration between inventor and patenter

**verdict**: NEEDS MITIGATION. should provide structured template for 0.idea.md, not blank canvas.

---

## assumption: "weekend sprint" timeline is realistic

**where in vision?** section "timeline" — "total: a weekend sprint"

**what do we assume?** that the full route can be completed in a weekend

**evidence?** none. I made this up to sound attractive.

**what if the opposite were true?**
- prior art research alone could take days
- claims analysis requires back-and-forth
- timeline depends on complexity of invention

**verdict**: ISSUE FOUND. overpromise. should remove specific timeline claims or make them conditional.

---

## assumption: patent attorneys charge $15-30k per application

**where in vision?** section "day-in-the-life" before

**what do we assume?** that patent attorney fees are in this range

**evidence?** weak. this is a common figure but varies widely by complexity, jurisdiction, firm.

**what if the opposite were true?**
- provisional applications can be cheaper ($1-5k)
- complex patents can be more ($50k+)
- geographic variation (US vs EU vs Asia)

**verdict**: MINOR ISSUE. the point holds (attorneys are expensive) but the specific number is unverified.

---

## assumption: users want terminal-based workflow

**where in vision?** mental model section — "patent attorney in my terminal"

**what do we assume?** that inventors are comfortable with CLI tools

**evidence?** none. many inventors are not technical.

**what if the opposite were true?**
- inventors might prefer a web UI or desktop app
- CLI might be unfriendly for non-engineers
- target audience might be narrower than "all inventors"

**verdict**: NEEDS CLARIFICATION. who is the actual target user? technical founders? patent attorneys? indie inventors? this shapes the interface.

---

## assumption: USPTO is the target jurisdiction

**where in vision?** implied throughout, explicit in questions

**what do we assume?** focus on US patent system

**evidence?** the wish doesn't specify jurisdiction. I assumed US.

**what if the opposite were true?**
- might need to support EPO, WIPO, PCT
- different jurisdictions have different claim requirements
- international file is common

**verdict**: UNVERIFIED. wisher should clarify target jurisdiction.

---

## assumption: single-inventor usecase

**where in vision?** implied throughout

**what do we assume?** one inventor works through the route alone

**evidence?** the wish doesn't specify.

**what if the opposite were true?**
- teams might collaborate on patent applications
- might need shared state, handoffs
- might need role distinctions (researcher, drafter, reviewer)

**verdict**: UNVERIFIED. likely fine for v1 to assume single inventor, but should note.

---

## summary

| assumption | verdict | action |
|------------|---------|--------|
| google patents API exists | unverified | research APIs before build |
| pdf extraction reliable | unverified | test on real patents |
| inventors can describe ideas | needs mitigation | provide structured 0.idea.md template |
| "weekend sprint" timeline | issue | remove or qualify |
| $15-30k attorney fees | minor issue | acceptable for rhetorical purposes |
| CLI interface suitable | needs clarification | clarify target user |
| USPTO jurisdiction | unverified | wisher to clarify |
| single-inventor usecase | unverified | acceptable for v1 |

---

## what i'll remember next time

1. **timelines are dangerous** — never commit to specific durations without evidence. "fast" is safer than "a weekend."

2. **target user shapes all** — CLI vs web, technical vs non-technical, solo vs team. clarify early.

3. **verify external dependencies exist** — don't assume APIs, libraries, or data sources exist until verified.
