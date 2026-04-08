# review: has-snapshot-coverage (round 3)

## question

do all test cases have snapshot assertions? do snapshots capture the full user-visible output?

## method

read each test file, verified every `then()` block includes `toMatchSnapshot()`.

---

## snapshot inventory

### patent.priors.search.integration.test.ts

| case | then block | snapshot? | captures |
|------|------------|-----------|----------|
| case1 --help | usage is shown | ✓ | help text with usage examples |
| case2 query too short | error is returned | ✓ | error message about min length |
| case3 no query | error is returned | ✓ | error message about required query |
| case4 valid query | search executes | ✓ | results or API key error |

**coverage**: 4/4 then blocks have snapshots

### patent.priors.fetch.integration.test.ts

| case | then block | snapshot? | captures |
|------|------------|-----------|----------|
| case1 --help | usage is shown | ✓ | help text with usage examples |
| case2 no exid | error is returned | ✓ | error message about required exid |
| case3 invalid format | error is returned | ✓ | error message about format |
| case4 valid exid | fetch executes | ✓ | patent data or API key error |

**coverage**: 4/4 then blocks have snapshots

### patent.propose.integration.test.ts

| case | then block | snapshot? | captures |
|------|------------|-----------|----------|
| case1 new route | route created | ✓ | route tree with stones |
| case1 new route | branch bound | ✓ | bind confirmation |
| case2 route extant | error is returned | ✓ | error about extant route |
| case3 invalid editor | error is returned | ✓ | editor not found error |
| case4 --help | usage is shown | ✓ | help text |
| case5 not git repo | error is returned | ✓ | git repository error |

**coverage**: 6/6 then blocks have snapshots

---

## snapshot file verification

```
src/domain.roles/patenter/skills/patent.priors/__snapshots__/
├── patent.priors.fetch.integration.test.ts.snap
└── patent.priors.search.integration.test.ts.snap

src/domain.roles/patenter/skills/patent.propose/__snapshots__/
└── patent.propose.integration.test.ts.snap
```

all three snapshot files exist and match test count.

---

## conclusion

snapshot coverage: **verified**

- 14 then blocks total
- 14 snapshots total
- 100% coverage
- all snapshots capture full stdout output
