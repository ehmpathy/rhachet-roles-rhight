# review: has-divergence-addressed (round 3)

## question

did i address each divergence properly? verification via actual file inspection.

## method

for each divergence: opened the relevant file, verified the claim, checked git for visibility.

---

## file-verified divergence assessment

### 1. keyrack.yml added

**r2 verdict**: valid backup, needed for API key

**verification**:
```
$ cat src/domain.roles/patenter/keyrack.yml

org: rhight

env.prod:
  - PATENTSVIEW_API_KEY
```

**file extant**: yes, contains `PATENTSVIEW_API_KEY`

**skeptical recheck**: could we have avoided keyrack.yml?
- PatentsView requires API key (verified via patentsview.org/apis/keyrequest URL in code)
- keyrack.yml is the rhachet standard for key declaration
- no alternative pattern extant in this repo

**verdict holds**: valid backup. not laziness.

---

### 2. __snapshots__/ dirs added

**verification**:
```
$ ls src/domain.roles/patenter/skills/patent.priors/__snapshots__/
patent.priors.fetch.integration.test.ts.snap
patent.priors.search.integration.test.ts.snap

$ ls src/domain.roles/patenter/skills/patent.propose/__snapshots__/
patent.propose.integration.test.ts.snap
```

**files extant**: yes, 3 snapshot files

**skeptical recheck**: could we have avoided snapshots?
- blackbox criteria requires "stdout shows the route structure"
- snapshot tests are the standard for CLI output verification
- mandatory requirement in blueprint: "stdout snapshots on every test"

**verdict holds**: valid backup. cannot avoid jest snapshots when toMatchSnapshot() is used.

---

### 3. API changed (USPTO ODP → PatentsView)

**verification**:
```
src/domain.roles/patenter/skills/patent.priors/patent.priors.fetch.sh:109:
  local endpoint="https://api.patentsview.org/patents/query"

src/domain.roles/patenter/skills/patent.priors/patent.priors.search.sh:128:
  local endpoint="https://api.patentsview.org/patents/query"
```

**API in code**: api.patentsview.org (not USPTO ODP as blueprint specified)

**skeptical recheck**: should we have used USPTO ODP?
- looked at blueprint: "endpoint: GET https://data.uspto.gov/apis/patent-file-wrapper/search"
- research (3.1) evaluated USPTO ODP vs PatentsView:
  - USPTO ODP requires enterprise key, complex auth
  - PatentsView has free registration, documented rate limits
- is PatentsView inferior?
  - different coverage: PatentsView indexes granted patents and applications
  - USPTO ODP would have prosecution history, PatentsView does not
- was this documented? yes, in evaluation under "API changed"

**future risk check**: could this cause problems?
- users may expect prosecution history → documented limitation in evaluation
- coverage differences → should be noted in briefs (action from r2)

**verdict holds**: valid backup with caveat noted. research justified the choice.

---

### 4. exid regex expanded (7-8 → 7-11 digits)

**verification**:
```
src/domain.roles/patenter/skills/patent.priors/patent.priors.fetch.sh:67:
  if [[ ! "$PATENT_EXID" =~ ^US[0-9]{7,11}(A1|A2|B1|B2)?$ ]]; then
```

**regex in code**: `^US[0-9]{7,11}(A1|A2|B1|B2)?$`

**blueprint spec**: `^US[0-9]{7,8}(A1|B1|B2)?$`

**skeptical recheck**: was blueprint correct?
- patent numbers: US7654321 (7 digits), US12345678B2 (8 digits) → 7-8 covers these
- application numbers: US20210234567A1 (11 digits) → 7-8 does NOT cover these
- vision example uses: US20210234567A1 (11 digit application number)
- blackbox criteria: `--exid US20210234567A1` (11 digits)

**conclusion**: blueprint regex was too restrictive. 7-11 is correct.

**verdict holds**: valid backup. this is a blueprint correction, not a divergence from intent.

---

### 5. parse_document simplified

**verification**:
```
$ grep -n "prosecutionHistory\|prosecution" src/domain.roles/patenter/skills/patent.priors/

(no matches in fetch.sh)
```

**blueprint specified**:
```
# history: .prosecutionHistory[] if available
```

**code has**: no prosecution history extraction

**skeptical recheck**: could we have gotten prosecution history?
- PatentsView API: does not provide prosecution history
- USPTO PAIR: separate API, separate auth, not integrated
- was this laziness? no — the data is not available from our chosen API
- was API choice wrong? evaluated in divergence #3

**is it documented?**
- fetch.sh header (lines 5-8): lists claims, specification, metadata — omits prosecution history
- evaluation: "blueprint listed prosecutionHistory extraction but PatentsView API does not provide it"

**verdict holds**: valid backup. API limitation, not laziness.

---

### 6. output.sh expanded (4 → 9 functions)

**verification**:
```
$ grep "^[a-z_]*(" src/domain.roles/patenter/skills/patent.priors/output.sh | wc -l
9

$ grep "^[a-z_]*(" src/domain.roles/patenter/skills/patent.priors/output.sh
print_eagle_header()
print_tree_start()
print_tree_branch()
print_tree_leaf()
print_section_header()
print_route_info()
print_tree_error()
print_alert()
print_suggestion()
```

**blueprint specified**: 4 functions (header, start, branch, leaf)

**code has**: 9 functions

**skeptical recheck**: why 5 extra functions?
- print_section_header: used in patent.propose for stone listings
- print_route_info: used in patent.propose for branch bind info
- print_tree_error: used for error output (blocked scenarios)
- print_alert: used for vague query warnings (blackbox criteria)
- print_suggestion: used for no-results hints (blackbox criteria)

**were extra functions needed?**
- blackbox criteria 2.1 specifies: "they receive an alert about query specificity"
- blackbox criteria 2.1 specifies: "they receive suggestions for query refinement"
- print_alert and print_suggestion are required by blackbox criteria

**verdict holds**: valid backup. blueprint underspecified output needs.

---

## verification summary

| divergence | file verified | claim verified | verdict |
|------------|---------------|----------------|---------|
| keyrack.yml | keyrack.yml extant | PATENTSVIEW_API_KEY declared | ✓ valid |
| snapshots | __snapshots__/ extant | 3 snap files | ✓ valid |
| API changed | fetch.sh:109, search.sh:128 | patentsview.org endpoint | ✓ valid |
| exid regex | fetch.sh:67 | 7-11 matches 11-digit apps | ✓ valid |
| parse_document | fetch.sh header | no prosecution history listed | ✓ valid |
| output.sh | output.sh | 9 functions, extras for alerts/suggestions | ✓ valid |

---

## conclusion

all 6 divergences verified via file inspection:
- each backup rationale is supported by actual code
- no backup is laziness — each has technical justification
- no backup should be repaired instead

divergence review: **complete and verified**

