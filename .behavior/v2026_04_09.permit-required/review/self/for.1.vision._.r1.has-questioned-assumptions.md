# review: has-questioned-assumptions

## assumption 1: IRC is the base code for most US jurisdictions

**what do we assume?** that the International Residential Code (IRC) is adopted by most US states.

**what evidence supports this?** widely documented. ICC states 49 states + DC adopt some form of IRC or IBC.

**what if the opposite were true?** we'd need state-by-state base code research for each query.

**did the wisher say this?** no, inferred from the briefs we created.

**exceptions?** some states (e.g., parts of Texas) have no statewide code. localities may adopt different codes.

**verdict**: **holds with caveat**. IRC is common baseline, but always verify state adoption and local amendments.

---

## assumption 2: state code adoptions are publicly documented

**what do we assume?** that we can find which code version each state adopted.

**what evidence supports this?** UpCodes, ICC, and state fire marshal sites document adoptions.

**what if the opposite were true?** we'd need to contact each state's code authority.

**did the wisher say this?** no, inferred.

**exceptions?** some states lag in updates. some have complex amendment histories.

**verdict**: **holds**. documentation exists, but may require effort to locate.

---

## assumption 3: local amendments are findable via municode/official sites

**what do we assume?** that local code modifications are accessible online.

**what evidence supports this?** Municode covers many jurisdictions. Indianapolis is there.

**what if the opposite were true?** we'd need to call each permit office.

**did the wisher say this?** no, inferred.

**exceptions?** rural jurisdictions may not publish online. some charge for code access.

**verdict**: **holds for urban areas**. rural/small jurisdictions may require manual inquiry.

---

## assumption 4: permit history is searchable per-address

**what do we assume?** that jurisdictions expose permit records by address.

**what evidence supports this?** Indianapolis does via Accela portal.

**what if the opposite were true?** permit search would be impossible programmatically.

**did the wisher say this?** yes, explicitly requested for Indianapolis.

**exceptions?** many jurisdictions don't expose this. some require in-person records request.

**verdict**: **holds for Indianapolis**. cannot generalize without per-jurisdiction research.

---

## assumption 5: users want legal citations, not summaries

**what do we assume?** that verbatim code text is more valuable than "you probably need a permit."

**what evidence supports this?** user feedback in earlier conversation — "cite the exact quote."

**what if the opposite were true?** simple yes/no answers would suffice.

**did the wisher say this?** implied by "based on legal code."

**exceptions?** casual users may just want yes/no. but defensible answers need citations.

**verdict**: **holds**. the proof chain IS the value proposition.

---

## assumption 6: web scrape is acceptable fallback

**what do we assume?** that we can scrape Accela portal when API access is denied.

**what evidence supports this?** technically feasible. wish ref doc mentions it.

**what if the opposite were true?** we'd be limited to manual portal use.

**did the wisher say this?** yes, in the ref doc: "web scrape (with caution)."

**exceptions?** ToS may prohibit scrape. portal changes break scripts. rate limits apply.

**verdict**: **holds with risk accepted**. document fragility and manual fallback.

---

## summary

| assumption | verdict | caveat |
|------------|---------|--------|
| IRC is base code | holds | verify state adoption |
| state adoptions documented | holds | may need effort |
| local codes online | holds | urban focus |
| permit history searchable | holds | indianapolis only |
| users want citations | holds | core value prop |
| web scrape acceptable | holds | risk accepted |

---

## what i learned

- most assumptions are reasonable but bounded to urban US jurisdictions
- indianapolis-first approach is validated — we can prove the pattern there
- the proof chain (citations, not summaries) is what users actually want
- web scrape fragility is known and accepted
