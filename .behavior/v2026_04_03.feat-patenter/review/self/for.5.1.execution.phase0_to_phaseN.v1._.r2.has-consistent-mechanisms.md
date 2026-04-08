# review: has-consistent-mechanisms (r2)

review for new mechanisms that duplicate extant functionality.

---

## search results

found 35 files with treestruct patterns. examined output.sh files across roles:

| role | output.sh location | mascot |
|------|-------------------|--------|
| mechanic | skills/git.commit/output.sh | 🐢 turtle |
| mechanic | skills/claude.tools/output.sh | 🐢 turtle |
| patenter | skills/patent.priors/output.sh | 🦅 eagle |

---

## analysis

### output.sh pattern — consistent, not duplicated

each role has its own output.sh because:
1. **mascots differ** — 🐢 for mechanic, 🦅 for patenter, 🦫 for bhuild
2. **phrases differ** — "cowabunga" vs "lets soar" vs "oh, behave"
3. **some role-specific functions** — git.commit has `print_tip`, patenter has `print_alert`

this is the **established pattern**. patenter follows it correctly.

### function names — consistent

| function | mechanic | patenter | purpose |
|----------|----------|----------|---------|
| print_*_header | print_turtle_header | print_eagle_header | mascot header |
| print_tree_start | 🐚 shell | 🌎 globe | tree root |
| print_tree_branch | ✓ | ✓ | tree branch |
| print_tree_leaf | ✓ | ✓ | tree leaf |
| print_tree_error | ✓ | ✓ | error display |
| print_blocked | ✓ | ✓ | constraint error |

patenter output.sh follows the extant pattern from mechanic.

### API patterns — consistent

| pattern | mechanic | patenter |
|---------|----------|----------|
| retry with backoff | git.release | patent.priors.search |
| exit code semantics | 0/1/2 | 0/1/2 |
| cache pattern | n/a | patent.priors.fetch (new) |

cache pattern is new but appropriate — patents are immutable documents.

---

## findings

### no duplication found

1. **output.sh** — follows extant pattern, role-appropriate customization
2. **retry logic** — follows extant pattern from git.release
3. **exit codes** — follows extant convention (0=success, 1=malfunction, 2=constraint)

### potential concern: shared output library?

could output functions be extracted to a shared library?

**decision**: no. each role needs role-specific customization (mascot, phrases). the current pattern of per-role output.sh is correct. extracting would either:
- force all roles to same mascot (wrong)
- create complex conditional logic (overengineered)

---

## conclusion

**no duplication found**. patenter mechanisms are consistent with extant patterns:
- output.sh follows the per-role pattern
- retry logic follows extant conventions
- exit codes follow extant semantics
