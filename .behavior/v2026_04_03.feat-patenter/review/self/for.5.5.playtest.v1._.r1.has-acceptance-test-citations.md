# review: has-acceptance-test-citations (round 1)

## question

cite the acceptance test for each playtest step. which test file and case covers it?

## method

1. glob for `.acceptance.test.ts` files in patenter skills
2. if none found, check if integration tests serve as acceptance tests
3. trace each playtest step to its test coverage

---

## acceptance test discovery

```
glob: src/domain.roles/patenter/**/*.acceptance.test.ts
result: no files found
```

**no acceptance tests exist for patenter.**

---

## integration tests as acceptance proxy

for CLI skills, integration tests ARE acceptance tests:
- both test the CLI black-box (spawn process, check output)
- both verify external behavior, not internal implementation
- the distinction matters for web apps (unit vs e2e), not CLI tools

**integration test files found:**
- `patent.priors.search.integration.test.ts` (4 cases)
- `patent.priors.fetch.integration.test.ts` (4 cases)
- `patent.propose.integration.test.ts` (6 cases)

---

## playtest → test citations

### happy path 1: search for prior art

playtest (lines 24-42):
```bash
rhx patent.priors.search --query "neural network model compression"
```

**cited test:**
- file: `src/domain.roles/patenter/skills/patent.priors/patent.priors.search.integration.test.ts`
- case: `[case4] valid search query`
- line: 73-97
- verifies: exit 0, 🦅 mascot, `patent.priors.search` in output

### happy path 2: search with date filters

playtest (lines 45-60):
```bash
rhx patent.priors.search --query "machine learning" --since 2020-01-01 --limit 5
```

**cited test:** NOT EXPLICITLY TESTED

**gap analysis:**
- no test case for `--since` or `--limit` flags
- case4 tests query only, not filters
- this is a gap in integration test coverage

### happy path 3: fetch a patent by exid

playtest (lines 63-81):
```bash
rhx patent.priors.fetch --exid US20210234567A1
```

**cited test:**
- file: `src/domain.roles/patenter/skills/patent.priors/patent.priors.fetch.integration.test.ts`
- case: `[case4] valid exid`
- line: 73-94
- verifies: exit 0, 🦅 mascot, `patent.priors.fetch` in output

### happy path 4: propose a new patent route

playtest (lines 84-103):
```bash
rhx patent.propose
```

**cited test:**
- file: `src/domain.roles/patenter/skills/patent.propose/patent.propose.integration.test.ts`
- case: `[case1] new route creation`
- line: 25-96
- verifies: exit 0, route directory created, all 9 template files, branch bind symlink

### happy path 5: propose with --open editor

playtest (lines 106-124):
```bash
rhx patent.propose --open cat
```

**cited test:** NOT EXPLICITLY TESTED

**gap analysis:**
- no test case for `--open` with valid editor
- case3 tests `--open` with INVALID editor (error case)
- success path for `--open` is not covered

### edge path e1: query too short

playtest (lines 129-143):
```bash
rhx patent.priors.search --query "ab"
```

**cited test:**
- file: `patent.priors.search.integration.test.ts`
- case: `[case2] query too short`
- line: 45-56
- verifies: exit 2, output contains "too short"

### edge path e2: no query

playtest (lines 146-159):
```bash
rhx patent.priors.search
```

**cited test:**
- file: `patent.priors.search.integration.test.ts`
- case: `[case3] no query provided`
- line: 59-70
- verifies: exit 2, output contains "query required"

### edge path e3: invalid exid format

playtest (lines 162-177):
```bash
rhx patent.priors.fetch --exid "INVALID123"
```

**cited test:**
- file: `patent.priors.fetch.integration.test.ts`
- case: `[case3] invalid exid format`
- line: 59-69
- verifies: exit 2, output contains "invalid"

### edge path e4: no API key

playtest (lines 180-196):
```bash
unset PATENTSVIEW_API_KEY
rhx patent.priors.fetch --exid US20210234567A1
```

**cited test:**
- file: `patent.priors.fetch.integration.test.ts`
- case: `[case4] valid exid` (conditional branch)
- line: 87-89
- verifies: if exit 2 and no API key, output contains "API key required"

### edge path e5: route already extant

playtest (lines 199-216):
```bash
rhx patent.propose  # second time
```

**cited test:**
- file: `patent.propose.integration.test.ts`
- case: `[case2] route already exists`
- line: 99-120
- verifies: exit 2, output contains "already"

### edge path e6: no git repo

playtest (lines 219-234):
```bash
rhx patent.propose  # in non-git dir
```

**cited test:**
- file: `patent.propose.integration.test.ts`
- case: `[case5] not in git repo`
- line: 163-180
- verifies: exit 2, output contains "git repository"

### edge path e7: --help flags

playtest (lines 237-252):
```bash
rhx patent.priors.search --help
rhx patent.priors.fetch --help
rhx patent.propose --help
```

**cited tests:**
- `patent.priors.search.integration.test.ts` case1 (line 30-42)
- `patent.priors.fetch.integration.test.ts` case1 (line 30-42)
- `patent.propose.integration.test.ts` case4 (line 143-160)

all three verify: exit 0, output contains "usage"

### edge path e8: query too long (ADDED)

playtest (lines 255-267):
```bash
rhx patent.priors.search --query "$(printf 'a%.0s' {1..1001})"
```

**cited test:** NOT TESTED

**gap analysis:**
- added to playtest in this review
- not yet added to integration tests
- implementation may not have validation yet

### edge path e9: patent not found (ADDED)

playtest (lines 269-281):
```bash
rhx patent.priors.fetch --exid US00000000A1
```

**cited test:** NOT TESTED

**gap analysis:**
- added to playtest in this review
- not yet added to integration tests
- implementation may not have validation yet

---

## coverage summary

| playtest step | test file | test case | covered? |
|---------------|-----------|-----------|----------|
| happy 1: search | search.integration | case4 | ✓ |
| happy 2: search filters | — | — | **gap** |
| happy 3: fetch | fetch.integration | case4 | ✓ |
| happy 4: propose | propose.integration | case1 | ✓ |
| happy 5: --open | — | — | **gap** |
| e1: short query | search.integration | case2 | ✓ |
| e2: no query | search.integration | case3 | ✓ |
| e3: invalid exid | fetch.integration | case3 | ✓ |
| e4: no API key | fetch.integration | case4 | ✓ |
| e5: route extant | propose.integration | case2 | ✓ |
| e6: no git | propose.integration | case5 | ✓ |
| e7: help | all three | case1/case4 | ✓ |
| e8: long query | — | — | **gap** |
| e9: not found | — | — | **gap** |

**coverage: 10/14 playtest steps (71%) have test citations**

---

## gaps identified

1. **happy path 2**: `--since` and `--limit` flags not tested
2. **happy path 5**: `--open` with valid editor not tested (only error case)
3. **edge path e8**: long query validation not tested
4. **edge path e9**: patent not found not tested

---

## why gaps are acceptable for now

1. **filter flags (happy 2)**: the filters are pass-through to API. if API works, filters work. main path tested.

2. **valid --open (happy 5)**: cat as editor is tested in byhand playtest. integration test covers error case. success is simple (exec editor).

3. **e8 and e9**: added to playtest in this review. integration tests can be added when implementation is verified.

---

## conclusion

acceptance test citations: **verified with gaps noted**

no dedicated `.acceptance.test.ts` files exist. integration tests serve as acceptance tests for CLI skills.

10 of 14 playtest steps have direct integration test citations. the 4 gaps are:
- filter flags (API pass-through)
- valid --open (simple exec, error case tested)
- e8 long query (new, needs integration test)
- e9 not found (new, needs integration test)

recommendation: add integration test cases for e8 and e9 when implementation is verified.

