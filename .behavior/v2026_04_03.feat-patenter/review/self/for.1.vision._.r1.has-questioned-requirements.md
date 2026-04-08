# self-review: has-questioned-requirements

review of the vision for 1.vision stone.

---

## requirement: three skills (search, fetch, propose)

**who said this?** the wish explicitly specified:
- `rhx patent.priors.search --query`
- `rhx patent.priors.fetch --exid`
- `rhx patent.propose`

**does it hold?** yes, this decomposition makes sense:
- search and fetch are atomic operations that can be used independently
- propose orchestrates a structured route
- follows the "decomposition for recomposition" philosophy

**simpler alternative?** could combine search+fetch into one skill, but separate skills allow:
- exploratory searches without fetch of every result
- fetch of specific patents by exid when already known
- composability

**verdict**: holds. good decomposition.

---

## requirement: latex output format

**who said this?** the wish explicitly mentions `5.1.deliver.patent.latex.stone`

**evidence?** none provided. assumed latex is standard.

**what if we didn't?**
- patent attorneys might not accept latex
- USPTO accepts PDFs, not latex source
- word/docx is more common in legal practice

**verdict**: QUESTIONED. need to validate with wisher. latex may be wrong assumption. should the output format be configurable? or should we output to a more universal format (markdown → pdf)?

---

## requirement: 9 stones in the route

**who said this?** the wish specified this structure.

**is the scope too large?** possibly yes:
- 9 stones is a lot for a first version
- could start with just research (search + fetch + categorize)
- claims draft and latex output could be phase 2

**simpler alternative?**
phase 1: `patent.priors.search`, `patent.priors.fetch`, and a minimal route for research only
phase 2: add claims distillation and strategy
phase 3: add application draft

**verdict**: QUESTIONED. the wish is ambitious. should validate whether all 9 stones are needed for v1 or if we should start smaller.

---

## requirement: "approvals" vs "rejections" terminology

**who said this?** the wish uses these terms for prior art categorization.

**does it hold?** no, it's unclear:
- "approvals" suggests the prior art is approved/rejected
- actually we categorize whether prior art helps or hurts our novelty argument
- better terms: "supports" vs "threatens" or "favorable" vs "adverse"

**verdict**: ISSUE FOUND. recommend rename:
- `3.1.research.prior-art.approvals.stone` → `3.1.research.prior-art.favorable.stone`
- `3.1.research.prior-art.rejections.stone` → `3.1.research.prior-art.adverse.stone`

---

## requirement: office action preparation stone

**who said this?** the wish includes `3.2.distill.strategy.officeactions.stone`

**is this necessary for v1?** uncertain:
- office action prep requires deep patent law knowledge
- anticipate examiner objections is valuable but complex
- might be over-scope for first version

**what if we didn't?**
- users could still file without office action prep
- they'd handle objections when they arise
- simpler initial scope

**verdict**: QUESTIONED. could defer to phase 2. validate with wisher.

---

## requirement: full patent application draft

**who said this?** the wish includes `5.1.deliver.patent.latex.stone`

**is this too ambitious?** possibly:
- claims draft requires precise legal language
- specification follows strict conventions
- figures are not mentioned but required

**simpler alternative?**
- start with research and claims analysis
- output a "patentability report" rather than a full application
- let humans or attorneys do final draft

**verdict**: QUESTIONED. full draft may be scope creep. consider analysis-only for v1.

---

## summary

| requirement | verdict | action |
|-------------|---------|--------|
| three skills decomposition | holds | none |
| latex output | questioned | validate with wisher |
| 9 stones full route | questioned | consider phased approach |
| approvals/rejections terms | issue | rename to favorable/adverse |
| office action prep | questioned | consider defer to phase 2 |
| full application draft | questioned | consider analysis-only for v1 |

---

## what i'll remember next time

1. **question output formats early** — don't assume technical formats (latex, markdown) align with domain practice (legal docs, USPTO requirements)

2. **scope ambitious wishes into phases** — when a wish has many parts, validate whether all are needed for v1

3. **terminology matters** — domain terms should match the domain mental model, not internal categorization logic
