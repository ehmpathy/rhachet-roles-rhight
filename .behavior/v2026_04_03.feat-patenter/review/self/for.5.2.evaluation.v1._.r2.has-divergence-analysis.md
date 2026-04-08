# review: has-divergence-analysis (round 2)

## question

did the r1 review find all divergences? did r1 correctly assess severity? did r1 miss any codepath divergences?

## method

deep dive into each codepath tree in the blueprint (3.3.1.blueprint.product.v1.i1.md) and compared line-by-line against actual implementation.

---

## r1 issues addressed

### issue 1: print_blocked vs print_tree_error

**r1 found**: evaluation said "print_blocked" but code has "print_tree_error"

**verification**: checked output.sh via git diff — function is indeed `print_tree_error`, not `print_blocked`

**resolution**: evaluation updated to correct function name. issue closed.

### issue 2: check_api_key() not documented

**r1 found**: check_api_key() was added to search.sh and fetch.sh but not documented as divergence

**verification**:
- search.sh:114 has `check_api_key()` call
- fetch.sh:95 has `check_api_key()` call
- blueprint main() for search.sh (line 319-335 in r1) does not list check_api_key

**assessment**: this is a consequence of the API change from USPTO ODP (public) to PatentsView (requires key). the evaluation already documents "API changed (USPTO ODP → PatentsView)" as a divergence. the check_api_key() addition is an implementation detail of that API change, not a separate divergence.

**resolution**: no change needed. covered implicitly by "API changed" divergence. explicit mention could be added but is not a gap — it's a natural consequence of the documented divergence.

### issue 3: "invalid editor" test case

**r1 found**: blueprint listed "invalid editor" test case but need to verify if this was implemented

**verification**: read patent.propose.integration.test.ts lines 121-139

```typescript
given('[case3] --open with invalid editor', () => {
  when('[t0] nonexistent editor is specified', () => {
    then('error is returned', async () => {
      const result = runPropose({
        proposeArgs: ['--open', 'nonexistent-editor-xyz'],
        tempDir,
      });
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toContain('editor not found');
      expect(result.stdout).toMatchSnapshot();
    });
  });
});
```

**resolution**: test case IS implemented. r1 flagged a non-issue. no gap extant.

---

## codepath tree deep verification

### search.sh codepath

| blueprint function | actual function | match |
|-------------------|-----------------|-------|
| parse_args() | parse_args() lines 28-79 | ✓ |
| validate_query() | validate_query() lines 84-109 | ✓ |
| search_uspto() | search_uspto() lines 127-206 | ✓ (API endpoint changed) |
| parse_results() | parse_results() lines 210-232 | ✓ |
| sort_by_relevance() | sort_by_relevance() lines 235-266 | ✓ |
| emit_results() | emit_results() lines 269-315 | ✓ |
| (not in blueprint) | check_api_key() lines 114-124 | documented via API change |

### fetch.sh codepath

| blueprint function | actual function | match |
|-------------------|-----------------|-------|
| parse_args() | parse_args() lines 28-62 | ✓ |
| validate_exid() | validate_exid() lines 65-75 | ✓ (regex expanded 7-11) |
| cache_get() | cache_get() lines 80-90 | ✓ |
| fetch_patent() | fetch_patent() lines 103-166 | ✓ (API endpoint changed) |
| parse_document() | parse_document() lines 170-225 | ✓ (simplified) |
| cache_set() | cache_set() lines 228-235 | ✓ |
| emit_document() | emit_document() lines 238-271 | ✓ |
| (not in blueprint) | check_api_key() lines 95-100 | documented via API change |

### propose.sh codepath

| blueprint function | actual function | match |
|-------------------|-----------------|-------|
| parse_args() | parse_args() lines 28-58 | ✓ |
| check_git_repo() | check_git_repo() lines 61-74 | ✓ |
| check_route_extant() | check_route_extant() lines 79-90 | ✓ |
| create_route_dir() | create_route_dir() lines 93-98 | ✓ |
| copy_templates() | copy_templates() lines 101-112 | ✓ |
| bind_branch() | bind_branch() lines 115-123 | ✓ |
| emit_success() | emit_success() lines 126-183 | ✓ |
| open_editor() | open_editor() lines 186-196 | ✓ |

### output.sh codepath

| blueprint function | actual function | status |
|-------------------|-----------------|--------|
| print_eagle_header() | print_eagle_header() | ✓ |
| print_tree_start() | print_tree_start() | ✓ |
| print_tree_branch() | print_tree_branch() | ✓ |
| print_tree_leaf() | print_tree_leaf() | ✓ |
| (not in blueprint) | print_section_header() | documented as expansion |
| (not in blueprint) | print_route_info() | documented as expansion |
| (not in blueprint) | print_tree_error() | documented as expansion |
| (not in blueprint) | print_alert() | documented as expansion |
| (not in blueprint) | print_suggestion() | documented as expansion |

---

## divergence completeness

all divergences in evaluation are confirmed:

| divergence | verified |
|------------|----------|
| keyrack.yml added | ✓ file extant, follows mechanic pattern |
| __snapshots__/ dirs added | ✓ standard jest artifact |
| API changed (USPTO ODP → PatentsView) | ✓ code uses api.patentsview.org |
| exid regex expanded (7-8 → 7-11 digits) | ✓ regex is `^US[0-9]{7,11}` |
| parse_document simplified | ✓ no prosecutionHistory extraction |
| output.sh expanded (4 → 9 functions) | ✓ 5 additional functions for complete output |

no additional divergences found.

---

## conclusion

r1 review found 3 issues. upon deep verification:

| issue | resolution |
|-------|------------|
| print_blocked name | fixed in evaluation |
| check_api_key() undocumented | implicitly covered by API change |
| invalid editor test gap | non-issue, test extant |

all 6 divergences in evaluation are accurate and complete. no additional divergences found after line-by-line codepath comparison.

divergence analysis: **complete and accurate**

