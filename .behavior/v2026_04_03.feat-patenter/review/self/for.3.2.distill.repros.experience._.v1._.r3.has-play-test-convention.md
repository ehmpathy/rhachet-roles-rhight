# review: has-play-test-convention (r3 - actual fix applied)

## what i was asked to review

whether journey tests use the correct `.play.test.ts` convention.

---

## what i found

### the issue (r2 identified, r3 fixed)

the distillation's file convention table had three journey test files without the `.play.` infix:

| before | after |
|--------|-------|
| `patent.priors.search.integration.test.ts` | `patent.priors.search.play.integration.test.ts` |
| `patent.priors.fetch.integration.test.ts` | `patent.priors.fetch.play.integration.test.ts` |
| `patent.propose.integration.test.ts` | `patent.propose.play.integration.test.ts` |

the fourth file (`patent.flow.play.acceptance.test.ts`) already had the `.play.` infix — it was correct.

### why `.play.` matters

the `.play.` infix distinguishes **journey tests** from **unit/integration tests**:

| test type | pattern | what it verifies |
|-----------|---------|------------------|
| unit | `.test.ts` | isolated function behavior |
| integration | `.integration.test.ts` | function + external dependencies |
| journey | `.play.*.test.ts` | step-by-step user experience |

journey tests follow a user through a flow (t0 → t1 → t2...). they verify an experience, not a function. the `.play.` infix signals this to future maintainers at a glance.

without the infix, a file like `patent.priors.search.integration.test.ts` looks like a standard integration test. with the infix, `patent.priors.search.play.integration.test.ts` immediately signals: "this is a journey test that happens to use the integration runner."

### what i actually did in r3

in r2, i documented the intended fix but didn't apply it to the artifact. in r3, i edited `.behavior/v2026_04_03.feat-patenter/3.2.distill.repros.experience._.v1.i1.md` (lines 257-262):

**before**:
```
| `patent.priors.search.integration.test.ts` | search skill tests with mocked API |
| `patent.priors.fetch.integration.test.ts` | fetch skill tests with mocked API |
| `patent.propose.integration.test.ts` | route creation tests |
```

**after**:
```
| `patent.priors.search.play.integration.test.ts` | search journey with mocked API |
| `patent.priors.fetch.play.integration.test.ts` | fetch journey with mocked API |
| `patent.propose.play.integration.test.ts` | route creation journey |
```

also changed the descriptions from "tests" to "journey" to reinforce the intent.

---

## what held

### `.play.acceptance.test.ts` for full journey

the full journey file `patent.flow.play.acceptance.test.ts` already had the correct convention. it uses `.acceptance.` because it requires live API access (not mocked), which makes it an acceptance test by definition.

### no bare `.play.test.ts`

this repo uses rhachet test conventions which require explicit `integration` or `acceptance` qualifiers. there's no bare `.play.test.ts` runner — so we use `.play.integration.test.ts` or `.play.acceptance.test.ts`. the distillation correctly follows this.

---

## lesson

review means verify **and fix**, not just document intent.

when i find an issue:
1. fix the artifact first
2. then document what was fixed and why

not: document what i would fix and claim it's done.

r2 failed because i wrote "how i fixed it" without edits to the artifact. r3 succeeded because i edited the distillation file before i wrote this review.

---

## verified

the distillation now uses correct `.play.` convention for all four journey tests:
- `patent.priors.search.play.integration.test.ts` ✓
- `patent.priors.fetch.play.integration.test.ts` ✓
- `patent.propose.play.integration.test.ts` ✓
- `patent.flow.play.acceptance.test.ts` ✓ (already correct)

