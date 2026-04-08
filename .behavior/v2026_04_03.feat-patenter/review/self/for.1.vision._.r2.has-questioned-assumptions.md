# self-review r2: has-questioned-assumptions

## reflection

this review surfaced assumptions I had internalized without awareness. the "10x faster" claim felt natural to write but had no basis. the promise of "patent application" output was aspirational, not realistic for LLM capabilities.

the pattern I now see: enthusiasm creates overpromise. vision documents are persuasive writing, and persuasion tempts exaggeration. the fix is to question every specific claim: "what evidence supports this number/capability/outcome?"

deeper review after fixes applied to vision.

---

## issue found: "weekend sprint" timeline

**what was wrong**: claimed specific duration ("a weekend sprint") without evidence

**how it was fixed**:
- removed specific time estimates from timeline section
- replaced with "times vary by invention complexity"
- added note: "faster than traditional attorney-led process, but actual duration depends on invention scope and prior art landscape"

**why this fix holds**: timelines depend on too many variables (invention complexity, prior art density, claims scope) to give specific estimates. honest uncertainty is better than false confidence.

---

## issue found: target user undefined

**what was wrong**: assumed "inventors" as target without technical comfort level specified

**how it was fixed**:
- added "target user" section to mental model
- defined primary: "technical founders and indie inventors who are comfortable with CLI tools"
- defined secondary: "patent attorneys who want research automation (future scope)"
- explicitly excluded: "non-technical inventors who need hand-held GUI experiences"

**why this fix holds**: CLI tools have a specific audience. this explicit scope prevents scope creep toward GUI features and sets clear expectations.

---

## issue found: assumptions presented as facts

**what was wrong**: assumptions section listed items as if they were verified

**how it was fixed**:
- renamed section to "assumptions (to verify before build)"
- marked patent search API and text extraction as "UNVERIFIED — research/test required"
- marked "inventors can describe ideas" with mitigation: "provide structured 0.idea.md template"
- marked output format as item that needs wisher validation

**why this fix holds**: unverified assumptions should be visible so we don't build on false foundations. explicit marks create a checklist for pre-build research.

---

## non-issues that hold

### google patents website implies API

**why questioned**: website exists doesn't mean API exists

**why it holds as a question, not a fix**: we correctly flagged this as item to research. the vision already lists it under "external research needed." no change required — the uncertainty is appropriately surfaced.

### single-inventor usecase

**why questioned**: teams might collaborate

**why it holds for v1**: the wish describes individual inventor workflow. team collaboration can be added later. the vision doesn't preclude it; it just doesn't optimize for it. acceptable scope for v1.

### $15-30k attorney fee claim

**why questioned**: number is unverified

**why it holds**: the rhetorical point (attorneys are expensive) is true regardless of exact figure. the range is reasonable for complex utility patents. minor inaccuracy doesn't undermine the vision.

---

## summary

| issue | status | action taken |
|-------|--------|--------------|
| "weekend sprint" timeline | fixed | removed specific times, added variance note |
| target user undefined | fixed | added target user section with explicit scope |
| assumptions as facts | fixed | marked each assumption with verification status |
| API exists | holds as question | already flagged for research |
| single-inventor scope | holds for v1 | acceptable scope limitation |
| attorney fee claim | holds | rhetorical purpose served |

---

---

## deeper assumptions discovered on re-read

### assumption: "10x faster" is accurate

**line 111**: "10x faster than manual research"

**evidence?** none. I made up this multiplier.

**what if the opposite were true?**
- if LLM analysis requires human review, might only be 2x faster
- if search results require manual curation, time savings shrink
- depends heavily on invention complexity

**verdict**: ISSUE FOUND. should either verify or soften claim to "faster" without specific multiplier.

---

### assumption: LLMs can draft patent claims

**line 9, implied throughout**: "distills patentable claims", "produces a latex-ready patent application"

**evidence?** none. patent claim language is highly specialized.

**what if the opposite were true?**
- LLMs might produce claims that sound plausible but are legally weak
- claim scope requires legal expertise to get right
- patent examiners might reject LLM-drafted claims more often

**verdict**: ISSUE FOUND. should be more honest that this is research assistance, not claim drafting. the output is a "patentability analysis" not a "ready-to-file application."

---

### assumption: we can predict office actions

**line 46**: "3.2.distill.strategy.officeactions.stone (anticipated objections)"

**evidence?** weak. office action patterns are known, but specific rejections depend on examiner and prior art.

**what if the opposite were true?**
- examiners find different prior art than we do
- 101 rejections (abstract idea) are unpredictable
- anticipation is educated guess, not prediction

**verdict**: MINOR ISSUE. the vision correctly marks this as "medium" coverage. acceptable if we don't overclaim.

---

### assumption: prosecution history is available via API

**line 35**: "output: full patent text, claims, figures, prosecution history"

**evidence?** none. USPTO has prosecution history but it's in PAIR, separate from patent text.

**what if the opposite were true?**
- prosecution history might require separate API calls
- might not be programmatically accessible
- might require PDF parsing

**verdict**: ISSUE FOUND. should verify what data is actually available before promising prosecution history.

---

## summary of new issues

| new assumption | verdict | action | status |
|----------------|---------|--------|--------|
| "10x faster" claim | issue | soften to "faster" without multiplier | FIXED |
| LLMs can draft claims | issue | reframe as "analysis" not "draft" | FIXED |
| predict office actions | minor | acceptable as stated | holds |
| prosecution history via API | issue | mark as conditional | FIXED |

### fixes applied to vision:

1. **line 111**: changed "10x faster than manual research and drafting" → "faster than manual research (actual speed depends on invention complexity)"

2. **line 9**: changed "distills patentable claims, anticipates office actions, and produces a latex-ready patent application" → "produces a patentability analysis with draft claims, and prepares materials for attorney review or provisional file"

3. **line 35**: changed "full patent text, claims, figures, prosecution history" → "full patent text, claims, figures (prosecution history if available via API)"

---

## what i'll remember next time

1. **mark verification status on assumptions** — use explicit labels like "UNVERIFIED" so they don't get treated as facts

2. **define target user early** — "users" is too vague; specify technical level, comfort with tools, primary vs secondary audiences

3. **avoid specific multipliers without data** — "faster" is safer than "10x faster"

4. **distinguish analysis from drafting** — LLMs are good at analysis and research; final draft requires human expertise

5. **verify API outputs before specifying** — don't promise data outputs until you've confirmed the data is available
