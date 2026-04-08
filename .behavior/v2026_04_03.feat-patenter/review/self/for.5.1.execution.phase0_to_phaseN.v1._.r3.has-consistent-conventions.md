# review: has-consistent-conventions

## question

does the code diverge from extant name patterns and conventions?

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

## conclusion

all name conventions match extant patterns. no divergence found.
