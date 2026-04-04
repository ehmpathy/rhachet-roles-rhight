# review: has-consistent-conventions (round 4)

## question

does the code diverge from extant name patterns and conventions?

## deeper inspection

reviewed the actual code in both patenter skills and compared with mechanic skills.

## findings

### 1. skill directory names

**status**: consistent

extant pattern: dot-separated names
- mechanic: `git.commit/`, `git.release/`, `set.package/`, `claude.tools/`
- patenter: `patent.priors/`, `patent.propose/`

### 2. skill file names

**status**: consistent

extant pattern: `{skill-name}.sh`
- mechanic: `git.commit.set.sh`, `git.release.sh`, `sedreplace.sh`
- patenter: `patent.priors.search.sh`, `patent.priors.fetch.sh`, `patent.propose.sh`

### 3. test file names

**status**: consistent

extant pattern: `{skill-name}.integration.test.ts`
- mechanic: `git.commit.set.integration.test.ts`
- patenter: `patent.priors.search.integration.test.ts`, `patent.priors.fetch.integration.test.ts`

### 4. output.sh location

**status**: consistent

extant pattern: `output.sh` in skill directory
- mechanic: `claude.tools/output.sh`, `git.commit/output.sh`
- patenter: `patent.priors/output.sh`

### 5. brief file names

**status**: consistent

extant pattern: `{type}.{topic}.[tag].md`
- mechanic: `howto.git-commit-set.[lesson].md`, `define.domain-operation-core-variants.md`
- patenter: `howto.patent-techniques.[lesson].md`, `define.patent-fundamentals.md`

### 6. keyrack.yml structure

**status**: consistent

extant pattern:
```yaml
org: {org}
env.all: ...
env.prod: ...
env.prep: ...
env.test: ...
```

both mechanic and patenter follow this structure.

### 7. role file names

**status**: consistent

extant pattern: `get{Role}Role.ts`
- mechanic: `getMechanicRole.ts`
- patenter: `getPatenterRole.ts`

### 8. skill file header structure

**status**: consistent

extant pattern (from git.commit.set.sh):
```
#!/usr/bin/env bash
######################################################################
# .what = ...
# .why  = ...
# usage:
#   ...
# guarantee:
#   ...
######################################################################
set -euo pipefail
```

patenter skill files follow this exact structure.

### 9. function names

**status**: consistent

extant pattern: `snake_case`
- mechanic: `parse_args`, `validate_query`, `infer_level_from_branch`, `get_commit_prefix`
- patenter: `parse_args`, `validate_exid`, `cache_get`, `fetch_patent`, `emit_results`

### 10. variable names

**status**: consistent

extant pattern: `UPPER_SNAKE_CASE` for globals
- mechanic: `SCRIPT_DIR`, `REPO_ROOT`, `METER_DIR`
- patenter: `SCRIPT_DIR`, `QUERY_TEXT`, `PATENT_EXID`, `CACHE_DIR`

### 11. rhachet arg passthrough

**status**: consistent

extant pattern:
```bash
--skill|--repo|--role)
  # rhachet passes these - ignore them
  shift 2
  ;;
```

patenter skill files include this exact block.

### 12. error exit code semantics

**status**: consistent

extant pattern:
- exit 0: success
- exit 1: malfunction (external error)
- exit 2: constraint (user error)

patenter skills follow this: invalid format = exit 2, API unavailable = exit 1.

## conclusion

all name conventions match extant patterns. no divergence found.

inspected: file headers, function names, variable names, arg passthrough, exit codes.
