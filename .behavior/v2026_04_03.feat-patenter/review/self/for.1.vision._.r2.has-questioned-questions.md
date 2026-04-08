# self-review r2: has-questioned-questions

## reflection

questions reveal what we don't know. triage reveals what we can know now vs later. many "questions" were actually answerable via logic — I just hadn't taken the time to answer them.

the discipline: for each question, ask "can I answer this right now?" before deferring it.

---

## triage summary

| category | count | items |
|----------|-------|-------|
| [answered] | 7 | can address via logic or already mitigated |
| [research] | 8 | need external data, answer in research phase |
| [wisher] | 6 | only wisher can decide (scope, preference) |

---

## [answered] — addressed now

### 1. inventors can describe ideas

**original concern**: inventors might not articulate novelty clearly

**answer**: already mitigated — provide structured 0.idea.md template with guided prompts. this is a design decision, not an open question.

### 2. route stone ordering

**original concern**: gaps in numbering (no 2, 4) feel odd

**answer**: follows bhrain convention. phases are: 0-idea, 1-vision, 2-criteria, 3-research+distill+blueprint, 4-roadmap, 5-execution. the numbering reflects phase categories, not a sequential checklist. not awkward once you understand the convention.

### 3. "approvals" vs "rejections" terminology

**original concern**: terms confuse prior art judgment with novelty help/hurt

**answer**: rename to "favorable" vs "adverse" — prior art that helps vs hurts our novelty argument. updated recommendation in vision.

### 4. fetch by exid flow

**original concern**: users think in titles, not patent numbers

**answer**: design is correct. search-first is the natural flow: `rhx patent.priors.search` returns exids, then `rhx patent.priors.fetch` uses those exids. users never need to know exids upfront.

### 5. automation vs accuracy tradeoff

**original concern**: more automation = more risk of missed nuance

**answer**: accepted tradeoff. mitigate via explicit "not legal advice" disclaimer. target audience (technical founders) understands tool limitations.

### 6. accessibility vs expertise tradeoff

**original concern**: easy patents might encourage weak filings

**answer**: target technical users who understand limitations. this is research assistance, not legal service. the disclaimer and target user definition address this.

### 7. attorney handoff format

**original concern**: what format do attorneys expect?

**answer**: reclassified as [research] — can research common formats (word, pdf, latex). not a wisher question; it's a domain knowledge question.

---

## [research] — answer in research phase

1. **patent search API exists** — what APIs are available?
2. **text extraction reliable** — test on real patent PDFs
3. **patent database APIs** — google patents, USPTO bulk data, espacenet
4. **claim structure patterns** — what makes claims strong vs weak?
5. **office action patterns** — common 101/102/103/112 rejections
6. **latex patent templates** — do standard templates exist?
7. **API costs** — rate limits and pricing for patent APIs
8. **attorney handoff format** — common formats attorneys accept

---

## [wisher] — requires wisher input

1. **scope of "patent"** — utility only? or design, provisional, PCT?
2. **target jurisdiction** — USPTO? or international (EPO, WIPO)?
3. **integration** — call external APIs or scrape?
4. **output format** — latex? markdown? word?
5. **"patenter" naming** — is this clear? alternatives?
6. **single route scope** — handle all patent types or split routes?

---

## changes made to vision

1. added [answered], [research], [wisher] tags to all open items
2. moved "attorney handoff" from [wisher] to [research]
3. added "API costs" as research item
4. addressed "route stone ordering" with bhrain convention explanation
5. clarified "favorable" vs "adverse" recommendation for prior art terms

---

## what i'll remember next time

1. **answer what you can now** — many "questions" are answerable via logic or prior knowledge. don't defer unnecessarily.

2. **distinguish wisher from research** — wisher questions are scope/preference; research questions are facts you can look up.

3. **triage creates clarity** — marking [answered]/[research]/[wisher] on each item makes the path forward obvious.
