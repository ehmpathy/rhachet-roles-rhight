# review: has-role-standards-adherance

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds

blueprint follows mechanic role standards. no violations detected.

---

## rule directories checked

| directory | relevance | rules checked |
|-----------|-----------|---------------|
| code.prod/pitofsuccess.errors/ | high | exit-code-semantics, fail-fast |
| code.prod/readable.narrative/ | high | early-returns, forbid-else-branches |
| code.prod/evolvable.procedures/ | medium | named-args (bash) |
| code.prod/readable.comments/ | medium | what-why-headers |
| code.test/frames.behavior/ | high | given-when-then, snapshots |
| lang.terms/ | high | gerunds, treestruct, ubiqlang |
| lang.tones/ | medium | mascot output style |

---

## line-by-line standard checks

### exit-code-semantics (rule.require.exit-code-semantics)

| blueprint line | exit code | meaning | adherance |
|----------------|-----------|---------|-----------|
| line 73-74: validate_query() | exit 2 | constraint: query too short/long | correct |
| line 88: search_uspto() | exit 1 | malfunction: API unavailable | correct |
| line 129: validate_exid() | exit 2 | constraint: invalid format | correct |
| line 141: fetch_patent() | exit 2 | constraint: patent not found | correct |
| line 142: fetch_patent() | exit 1 | malfunction: network error | correct |
| line 186: check_git_repo() | exit 2 | constraint: not a git repo | correct |
| line 192: check_route_extant() | exit 2 | constraint: route already extant | correct |
| line 227: open_editor() | exit 2 | constraint: editor not found | correct |

**verdict**: all exit codes follow semantic pattern (2 = constraint, 1 = malfunction).

---

### fail-fast (rule.require.fail-fast)

| codepath | guard check | adherance |
|----------|-------------|-----------|
| patent.priors.search | validate_query() before API call | correct |
| patent.priors.fetch | validate_exid() before API call | correct |
| patent.priors.fetch | cache_get() before API call | correct |
| patent.propose | check_git_repo() before route creation | correct |
| patent.propose | check_route_extant() before route creation | correct |
| patent.propose | command -v before editor open | correct |

**verdict**: all codepaths validate early, fail fast on invalid input.

---

### no else branches (rule.forbid.else-branches)

reviewed codepath trees for else patterns:

- parse_args(): sequential extractions, no else
- validate_*(): early exit on failure, no else
- search_uspto(): if 429 retry, if error exit — no else
- parse_results(): if null set ALERT — no else
- cache_get(): if file extant return, no else
- check_*(): if fail exit — no else

**verdict**: no else branches in codepath pseudocode.

---

### named arguments (rule.require.named-args)

| skill | args | style | adherance |
|-------|------|-------|-----------|
| patent.priors.search | --query, --limit, --since, --until | named flags | correct |
| patent.priors.fetch | --exid | named flag | correct |
| patent.propose | --open | named flag | correct |

**verdict**: all args use named flags, no positional args.

---

### what-why headers (rule.require.what-why-headers)

blueprint codepath comments include purpose annotations:

- `# --query "$TEXT" --limit N...` — what the args are
- `# if len < 3: exit 2 "query too short"` — what it does
- `# patents immutable, cache never stale` — why the cache works

the actual implementation should include full .what/.why headers per function. blueprint shows intent.

**verdict**: blueprint pseudocode shows intent; full headers required in implementation.

---

### treestruct output (rule.require.treestruct)

| skill | output format | adherance |
|-------|---------------|-----------|
| patent.priors.search | tree with mascot, key-value branches | correct |
| patent.priors.fetch | tree with mascot, document structure | correct |
| patent.propose | tree with mascot, stone list | correct |
| output.sh | print_eagle_header, print_tree_start/branch/leaf | correct |

**verdict**: output.sh provides standard treestruct functions; all skills use them.

---

### given-when-then tests (rule.require.given-when-then)

| test file | coverage style | adherance |
|-----------|----------------|-----------|
| patent.priors.search.integration.test.ts | t0-t3 journey | BDD style |
| patent.priors.fetch.integration.test.ts | t0-t3 journey | BDD style |
| patent.propose.integration.test.ts | t0-t2 journey | BDD style |

**verdict**: test coverage uses journey notation (t0, t1, t2, t3) per BDD conventions.

---

### snapshot tests (rule.require.snapshots)

| journey | snapshot | adherance |
|---------|----------|-----------|
| search t1 success | results tree | covered |
| search t2 vague query | results + alert | covered |
| search t3 no results | empty + suggestions | covered |
| fetch t1 success | document tree | covered |
| fetch t2 invalid exid | error message | covered |
| fetch t3 not found | error + hint | covered |
| propose t1 success | route tree | covered |
| propose t2 already extant | error message | covered |

**verdict**: all test journeys have snapshot coverage specified.

---

### term usage (lang.terms rules)

| check | result | adherance |
|-------|--------|-----------|
| no gerunds in blueprint | checked: no -ing nouns | correct |
| ubiqlang terms | exid, query, route, stone | consistent |
| no forbidden terms | not present | correct |

**verdict**: terminology follows lang.terms standards.

---

### mascot output (lang.tones rules)

| skill | mascot | phrases | adherance |
|-------|--------|---------|-----------|
| patent.priors.search | eagle | "lets soar and see," | vibey |
| patent.priors.fetch | eagle | "got one," | vibey |
| patent.propose | eagle | "take to the sky," | vibey |

**verdict**: mascot output matches rhight repo style (eagle, not seaturtle).

---

## potential issues checked

### 1. cache location

**rule**: follow mechanic conventions for cache locations.

**blueprint**: `~/.cache/rhachet/patents/${PATENT_EXID}.json`

**assessment**: correct. home directory for user-global immutable data. not repo-specific.

---

### 2. fixture organization

**rule**: fixtures should be colocated with tests.

**blueprint**: `.fixtures/` directory under `patent.priors/`

**assessment**: correct. fixtures are colocated with the skills they support.

---

### 3. brief structure

**rule**: briefs follow `practices/{category}/{rule}.md` pattern.

**blueprint**:
- `briefs/practices/howto.patent-techniques.[lesson].md`
- `briefs/practices/define.patent-fundamentals.md`

**assessment**: correct. follows extant brief patterns.

---

## conclusion

blueprint adheres to all mechanic role standards:
- exit codes follow semantic pattern (1 = malfunction, 2 = constraint)
- fail-fast guards precede main logic
- no else branches
- named arguments for all flags
- treestruct output via shared output.sh
- BDD test coverage with snapshots
- terminology follows lang.terms
- mascot matches rhight repo

no violations detected. proceed.

