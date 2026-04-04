# review: has-consistent-mechanisms

## question

does the code introduce new mechanisms that duplicate extant functionality?

## findings

### 1. output.sh pattern

**status**: consistent

each role/skill area has its own `output.sh` file with role-specific mascot:
- mechanic: `🐢` turtle
- patenter: `🦅` eagle

this is intentional — each role has its own identity. the function signatures (`print_tree_start`, `print_tree_branch`, `print_tree_leaf`) are consistent across roles.

files checked:
- `src/domain.roles/mechanic/skills/claude.tools/output.sh`
- `src/domain.roles/patenter/skills/patent.priors/output.sh`

### 2. keyrack.yml pattern

**status**: consistent

keyrack.yml structure follows the same pattern as mechanic role:
- org header
- env.all, env.prod, env.prep, env.test sections
- keys declared per environment

files checked:
- `src/domain.roles/mechanic/keyrack.yml`
- `src/domain.roles/patenter/keyrack.yml`

### 3. check_api_key() function

**status**: new but appropriate

this is a new pattern not found elsewhere. however:
- mechanic skills don't currently use external APIs that require keys
- the pattern follows extant guard clause conventions
- extracted to separate function to avoid command substitution capture issue

appropriate because:
- API key check is skill-specific (each API has different key names)
- no shared utility would reduce code — each skill still needs its own variable name

### 4. role definition pattern

**status**: consistent

`getPatenterRole.ts` follows the same structure as other roles:
- Role.build() with slug, name, purpose
- readme, boot, keyrack, briefs, skills, inits, hooks sections

files checked:
- `src/domain.roles/mechanic/getMechanicRole.ts`
- `src/domain.roles/patenter/getPatenterRole.ts`

## conclusion

no mechanisms duplicate extant functionality. patterns are consistent with codebase conventions.
