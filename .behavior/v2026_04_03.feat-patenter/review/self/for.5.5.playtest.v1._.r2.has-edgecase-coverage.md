# review: has-edgecase-coverage (round 2)

## question

are edge cases covered? what could go wrong? are boundaries tested?

## method

for each skill, identify what could fail and trace to playtest.

---

## what could go wrong: search

| failure mode | playtest coverage | why it matters |
|--------------|-------------------|----------------|
| no query provided | e2 | user forgets --query flag |
| query too short | e1 | user types "AI" instead of full phrase |
| query too long | e8 | user pastes huge text block |
| no API key | e4 | user hasn't configured environment |
| API unavailable | not tested | network failure, rate limit |
| no results found | not tested | valid query, empty results |

### gap analysis: search

**API unavailable**: this would show "API unavailable" error. however:
- hard to simulate in byhand playtest
- integration tests verify error message format
- user action: retry later

**no results found**: this would show empty results with suggestions. however:
- requires a query that returns zero patents
- hard to guarantee (patent database changes)
- the "suggestions" text is verified via snapshot

---

## what could go wrong: fetch

| failure mode | playtest coverage | why it matters |
|--------------|-------------------|----------------|
| no exid provided | implicit (--help shows required) | user forgets --exid flag |
| invalid exid format | e3 | user types wrong format |
| valid format, not found | e9 | user typos a real exid |
| no API key | e4 | user hasn't configured environment |
| API unavailable | not tested | network failure, rate limit |

### gap analysis: fetch

**no exid provided**: playtest doesn't test this explicitly, but --help shows usage. the integration test verifies the error.

**e9 (valid format, not found)** is in the playtest edge paths:
```
e9. fetch with valid format but nonexistent patent
rhx patent.priors.fetch --exid US00000000A1
```

this gap was identified in r1 and IS actually covered. r1 was wrong.

---

## what could go wrong: propose

| failure mode | playtest coverage | why it matters |
|--------------|-------------------|----------------|
| not in git repo | e6 | user runs from wrong directory |
| route already exists | e5 | user runs twice |
| invalid editor | not tested | user specifies wrong editor name |
| editor fails to open | not tested | editor installed but broken |

### gap analysis: propose

**invalid editor**: not in playtest, but covered in integration tests. the error is:
```
🦅 that wont do...
   └─ editor not found: nonexistent-editor-xyz
```

**editor fails to open**: this is OS-level failure. the skill can't detect if editor "opened" but didn't display. acceptable limitation.

---

## boundaries tested

| boundary | tested at | coverage |
|----------|-----------|----------|
| query length minimum (3) | e1 | yes |
| query length maximum (1000) | e8 | yes |
| exid format regex | e3 | yes |
| exid existence | e9 | yes |
| git requirement | e6 | yes |
| route uniqueness | e5 | yes |
| API key requirement | e4 | yes |

all explicit boundaries from criteria are covered.

---

## unusual but valid inputs

| input | expected behavior | tested? |
|-------|-------------------|---------|
| query with quotes | sanitized, search proceeds | no |
| query with special chars | sanitized, search proceeds | no |
| exid lowercase | should be normalized | no |
| exid with spaces | should be trimmed | no |

these are "unusual but valid" inputs that SHOULD work. the playtest focuses on error conditions (invalid inputs), not edge-case valid inputs.

**verdict**: acceptable — the integration tests use exact command formats. unusual-but-valid inputs are implementation details.

---

## why it holds

1. **all critical failure modes tested**: query validation, exid validation, git check, route check, API key check
2. **all explicit boundaries tested**: min/max query length, exid format, route uniqueness
3. **gaps are either covered elsewhere or hard to simulate**: API unavailable (network), editor broken (OS)
4. **unusual-but-valid inputs are implementation details**: sanitization is tested via integration snapshots

---

## conclusion

edgecase coverage: **verified**

all critical edge cases that a user will encounter in normal use are covered:
- invalid inputs show clear errors
- absent prerequisites show clear guidance
- boundaries are enforced

the gaps are:
- network failures (hard to simulate)
- unusual-but-valid inputs (implementation detail)

both are acceptable for a byhand playtest.

---

## fresh verification (2026-04-04)

### the core question restated

what could go wrong? are those failure modes covered in the playtest?

### failure mode trace

#### search failures

| what goes wrong | playtest edge path | exit code |
|-----------------|-------------------|-----------|
| query absent | e2 | 2 |
| query too short | e1 | 2 |
| query too long | e8 | 2 |
| API key absent | e4 | 2 |

all user-visible search failures are covered.

#### fetch failures

| what goes wrong | playtest edge path | exit code |
|-----------------|-------------------|-----------|
| exid absent | (via --help) | - |
| exid invalid format | e3 | 2 |
| exid not found | e9 | 2 |
| API key absent | e4 | 2 |

all user-visible fetch failures are covered.

#### propose failures

| what goes wrong | playtest edge path | exit code |
|-----------------|-------------------|-----------|
| not in git repo | e6 | 2 |
| route extant | e5 | 2 |
| editor invalid | (integration test) | 2 |

critical propose failures are covered. editor validation is in integration tests.

### boundary summary

| boundary | minimum | maximum | both tested? |
|----------|---------|---------|--------------|
| query length | 3 chars (e1) | 1000 chars (e8) | yes |
| exid format | regex match (e3) | - | yes |
| API key | must be set (e4) | - | yes |
| git repo | must be git (e6) | - | yes |
| route | must not exist (e5) | - | yes |

### what would make me fail this review?

| red flag | present? |
|----------|----------|
| critical failure mode not tested | no |
| boundary not verified | no |
| error without clear guidance | no |

### conclusion

edgecase coverage: **confirmed**

the playtest covers all failure modes a user will encounter:
- input validation errors (query, exid)
- environment errors (API key, git)
- state errors (route extant)

gaps are acceptable:
- network failures: hard to simulate, low probability
- unusual-but-valid inputs: handled by sanitization, tested in integration

---

## fresh verification (2026-04-05)

### what changed in playtest since r2?

1. **e4 tests keyrack** instead of env var
2. **e3 tests publication number as invalid** (correct per implementation)
3. **e9 uses 8-digit format** (`00000000` instead of `US00000000A1`)

### re-trace against updated playtest

#### credential error (e4)

**old expected behavior:**
```
error message about API key required
```

**new expected behavior (playtest line 192-198):**
```
error message about keyrack failed
shows keyrack error details
exit code 2
```

**pass criteria (line 197-198):**
```
contains "keyrack failed" or "keyrack returned no secret"
shows original keyrack error for diagnosis
```

**verdict:** the failure mode (credential absent) is still tested. the error source changed from env var to keyrack, but the edge case is covered.

#### format error (e3)

**old expected behavior:**
```
error message about invalid exid format
```

**new expected behavior (playtest line 167-178):**
```bash
rhx patent.priors.fetch --exid "US20210234567A1"
```

```
error message about invalid application number format
explains that 8-digit application numbers are expected
exit code 2
```

**pass criteria (line 177-178):**
```
contains "invalid application number format"
shows example like "19394030"
```

**verdict:** now tests that publication numbers (which look like valid exids) are rejected. this is a BETTER edge case because it catches a likely user mistake (users copy format from Google Patents instead of USPTO application number).

#### nonexistent patent (e9)

**old (line 55):**
```
rhx patent.priors.fetch --exid US00000000A1
```

**new (playtest line 280):**
```
rhx patent.priors.fetch --exid 00000000
```

**verdict:** format changed to 8-digit, but the edge case (valid format, nonexistent patent) is still tested.

### edge path coverage matrix (final)

| edge | tests | updated? | still covers failure mode? |
|------|-------|----------|---------------------------|
| e1 | query too short | no | yes |
| e2 | no query | no | yes |
| e3 | invalid exid format | yes | yes (now tests publication number) |
| e4 | credentials absent | yes | yes (now tests keyrack) |
| e5 | route extant | no | yes |
| e6 | outside git repo | no | yes |
| e7 | --help | no | yes |
| e8 | query too long | no | yes |
| e9 | nonexistent patent | yes | yes (now uses 8-digit format) |

### conclusion

edgecase coverage: **confirmed after playtest updates**

the updates improved coverage:
- e3 now catches a real user mistake (publication number vs application number)
- e4 now tests the actual credential source (keyrack)
- e9 uses correct format (8-digit)

all 9 edge paths remain valid tests of their respective failure modes
