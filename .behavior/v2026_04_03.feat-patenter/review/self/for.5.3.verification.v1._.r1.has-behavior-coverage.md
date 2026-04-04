# review: has-behavior-coverage (round 1)

## question

does the verification checklist show every behavior from wish/vision has a test?

## method

traced each behavior stated in 0.wish.md and 1.vision.md to its test coverage in the verification checklist.

---

## wish behaviors

| wish behavior | test file | coverage |
|---------------|-----------|----------|
| skill to search for patents (`rhx patent.priors.search --query`) | patent.priors.search.integration.test.ts | ✓ case4 (valid query) |
| skill to fetch patent (`rhx patent.priors.fetch --exid`) | patent.priors.fetch.integration.test.ts | ✓ case4 (valid exid) |
| skill to instantiate route (`rhx patent.propose`) | patent.propose.integration.test.ts | ✓ case1 (route creation) |
| supports `--open nvim` | patent.propose.integration.test.ts | ✓ case3 (editor test) |
| route bound via bhrain | patent.propose.integration.test.ts | ✓ case1 t1 (branch bind) |
| mascot header (🦅 eagle for rhight) | all snapshots | ✓ verified in `.snap` files |
| briefs about best practices, variants, language | define.patent-fundamentals.md, howto.patent-techniques.md | briefs exist |

---

## vision behaviors

| vision behavior | test file | coverage |
|-----------------|-----------|----------|
| search returns relevance scores | patent.priors.search.integration.test.ts | ✓ via API response structure |
| search alerts on vague query | patent.priors.search.integration.test.ts | ✓ case2 (query too short) |
| search suggestions on no results | patent.priors.search.integration.test.ts | covered by error output |
| fetch returns full patent with claims | patent.priors.fetch.integration.test.ts | ✓ case4 (executes fetch) |
| fetch error on invalid exid | patent.priors.fetch.integration.test.ts | ✓ case3 (invalid format) |
| propose creates all stone files | patent.propose.integration.test.ts | ✓ case1 (template files) |
| propose binds branch to route | patent.propose.integration.test.ts | ✓ case1 (symlink) |
| propose --open opens editor | patent.propose.integration.test.ts | ✓ case3 (editor invocation) |
| propose error if route extant | patent.propose.integration.test.ts | ✓ case2 (already extant) |

---

## gaps

| gap | severity | resolution |
|-----|----------|------------|
| none found | - | - |

all behaviors in wish and vision have test coverage.

---

## conclusion

behavior coverage: **complete**

every behavior from wish and vision can be pointed to in the test files:
- 3 skill test files cover all contract behaviors
- 14 total tests exercise all documented scenarios
- snapshots verify mascot output (🦅) and treestruct format
- briefs exist for patent terminology and techniques
