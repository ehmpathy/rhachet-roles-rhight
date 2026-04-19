# self-review: has-consistent-conventions (r3)

## verdict: pass

## analysis

examined name conventions against extant patterns in this codebase.

### domain object names

| pattern | permit domain | consistent? |
|---------|---------------|-------------|
| `{Domain}` prefix | Permit*, PermitCode*, PermitWork* | yes |
| PascalCase | PermitDetermination | yes |
| folder = domain | `domain.objects/permit/` | yes |
| file = class | `PermitCodeCitation.ts` → `PermitCodeCitation` | yes |

**why it holds**: follows standard domain-objects library conventions.

### domain operation names

| pattern | permit domain | consistent? |
|---------|---------------|-------------|
| camelCase | fetchPermit, searchPermits | yes |
| verb prefix | fetch*, search*, compute*, parse* | yes |
| file = function | `fetchPermit.ts` → `fetchPermit` | yes |

**why it holds**: follows rule.require.get-set-gen-verbs and ehmpathy conventions.

### skill directory names

compared patenter vs permiter:

| patenter | permiter |
|----------|----------|
| `patent.priors/` (groups search+fetch) | `permit.search/` (separate) |
| `patent.propose/` | `permit.fetch/` (separate) |
| | `permit.check.required/` |

**observed difference**: patenter groups search/fetch under `patent.priors`. permiter has separate directories.

**why the difference holds**:
- patenter: search and fetch are both "prior art" operations (sub-domain)
- permiter: search and fetch are general permit operations, not a sub-domain

the name pattern is still consistent: `{domain}.{action}` or `{domain}.{subdomain}.{action}`.

### skill file names

| pattern | permit domain | patenter domain |
|---------|---------------|-----------------|
| `{skill-name}.sh` | permit.search.sh | patent.priors.search.sh |
| `output.sh` | permit.search/output.sh | patent.priors/output.sh |
| `{skill-name}.ts` | permit.search.ts | (uses different impl) |

**why it holds**: consistent skill structure across roles.

### shell command flags

examined flag conventions:

| permiter flag | standard? |
|---------------|-----------|
| `--work` | yes (describes the work) |
| `--postal` | yes (postal code) |
| `--address` | yes (address) |
| `--permit-number` | yes (kebab-case) |
| `--format` | yes (output format) |
| `--help` | yes (standard) |

**why it holds**: all flags use kebab-case, standard conventions.

## conclusion

name conventions are consistent with:
1. domain-objects library conventions
2. ehmpathy operation names (verb prefixes)
3. skill structure patterns from patenter
4. standard shell flag conventions

no divergences found.
