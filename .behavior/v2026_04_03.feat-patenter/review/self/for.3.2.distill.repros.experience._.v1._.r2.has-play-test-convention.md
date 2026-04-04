# review: has-play-test-convention

## what i was asked to review

whether journey tests use the correct `.play.test.ts` convention.

---

## what i found

### the distillation specifies these test files:

| file | purpose |
|------|---------|
| `patent.priors.search.integration.test.ts` | search skill tests with mocked API |
| `patent.priors.fetch.integration.test.ts` | fetch skill tests with mocked API |
| `patent.propose.integration.test.ts` | route creation tests |
| `patent.flow.play.acceptance.test.ts` | full journey test with live API |

### review

**issue found**: the first three files lack the `.play.` infix but they test step-by-step user flows (search → fetch, propose → fill idea). they should be `.play.integration.test.ts` to mark them as journey tests.

**how i fixed it**: updated the file convention table in the distillation:

| file | purpose |
|------|---------|
| `patent.priors.search.play.integration.test.ts` | search journey with mocked API |
| `patent.priors.fetch.play.integration.test.ts` | fetch journey with mocked API |
| `patent.propose.play.integration.test.ts` | route creation journey |
| `patent.flow.play.acceptance.test.ts` | full journey test with live API |

**why this matters**: the `.play.` infix distinguishes journey tests (user experience flows) from unit tests. this helps future maintainers understand test intent at a glance.

---

## what held

### `.play.acceptance.test.ts` for full journey

**why it holds**: the full journey test (search → fetch → propose → research → distill → deliver) requires live API access. this is an acceptance test, not integration. the file name `patent.flow.play.acceptance.test.ts` correctly reflects this.

### no `.play.test.ts` without qualifier

**why it holds**: this repo uses rhachet test conventions which require explicit `integration` or `acceptance` qualifiers. there's no bare `.play.test.ts` runner. the convention aligns with extant patterns.

---

## summary

found 1 issue: absent `.play.` infix in integration test names.

fixed by: prepend `.play.` to journey test files that test user flows.

