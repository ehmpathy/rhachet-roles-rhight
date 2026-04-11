# self-review: has-questioned-assumptions (round 4)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: assumptions I may have missed

### assumption 8: scrape selectors should be versioned

**the assumption**: selector file is named `indianapolis.accela.v2026-04.ts`.

**what if opposite**: what if selectors lived inline in the skill?

**evidence check**:
- portal UI changes break selectors
- versioned file enables: keep old version for reference, add new version
- inline selectors would require code archeology to understand history

**verdict**: assumption holds. versioned selectors are defensive.

### assumption 9: caches are immutable once written

**the assumption**: once a permit is cached, we never update it.

**what if opposite**: what if permit status changes (issued → expired)?

**this is a real gap**:
- permits DO change status over time
- cached data could become stale
- vision does not address cache invalidation

**resolution**: the cached data is a snapshot at fetch time. for current status, user should re-fetch. this should be documented in the skill output — show `cached_at` timestamp and hint to re-fetch for current status.

**action**: note this as a documentation requirement, not a blueprint change.

### assumption 10: postal code uniquely identifies jurisdiction

**the assumption**: given a postal code, we can determine the jurisdiction.

**what if opposite**: what if a postal code spans multiple jurisdictions?

**evidence check**:
- vision `1.vision.yield.md` line 499-504 acknowledges this: "some postals span boundaries"
- this is a known edge case

**verdict**: assumption holds as v1 simplification. edge cases surface as "unclear" determination with list of applicable jurisdictions.

### assumption 11: IRC is the base for residential permits

**the assumption**: IRC (International Residential Code) is the baseline for permit requirements.

**what if opposite**: what if a jurisdiction uses a different base code?

**evidence check**:
- research confirms most US jurisdictions adopt IRC with amendments
- exceptions exist (e.g., California Title 24)
- blueprint includes jurisdiction-specific code adoption

**verdict**: assumption holds. IRC is default; jurisdiction research captures exceptions.

### assumption 12: work description is free text

**the assumption**: user enters work as free text string.

**what if opposite**: what if we used a controlled vocabulary picker?

**evidence check**:
- vision UX shows `--work "panel upgrade"` as free text
- parseWorkDescription transforms free text → code terms
- controlled vocabulary would require UI, limit expressiveness

**verdict**: assumption holds. free text with intelligent parse is more flexible than picker.

### assumption 13: permit.fetch uses permit ID, not address

**the assumption**: fetch requires exact permit ID.

**what if opposite**: what if users want to fetch by address + permit type?

**evidence check**:
- vision shows: search by address → list permits → fetch by ID
- this is a two-step workflow by design
- fetch-by-criteria would duplicate search

**verdict**: assumption holds. search → fetch is intentional workflow.

---

## issues found: cache staleness

**the gap**: permit status can change (issued → expired → closed).

**resolution**: not a blueprint change. document in skill output:
- show `cached_at: ISO timestamp`
- hint: "for current status, re-run permit.fetch"

this is a documentation concern, not an architecture concern.

---

## conclusion

examined six additional assumptions (8-13). five hold directly. one (cache staleness) identified as documentation requirement — cached data is snapshot, not live. the blueprint is sound; edge cases are handled via documentation and "unclear" outcomes.

