# review: has-consistent-mechanisms

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds

all mechanisms follow extant patterns. no duplication detected.

---

## analysis

### mechanism 1: output.sh with mascot

**blueprint proposes**: `src/domain.roles/patenter/skills/patent.priors/output.sh` with 🦅 eagle mascot

**extant patterns**:
- `mechanic/skills/claude.tools/output.sh` — 🐢 turtle mascot
- `mechanic/skills/declapract.upgrade/output.sh` — 🐢 turtle mascot
- `librarian/skills/brief.condense/output.sh` — 🐢 turtle mascot

**verdict**: consistent. each role can have its own mascot. functions follow same pattern (print_header, print_tree_start, print_tree_branch, print_tree_leaf).

---

### mechanism 2: route creation (patent.propose)

**blueprint proposes**: create route with templates, bind to branch via `route.bind.set`

**extant patterns**:
- `mechanic/skills/declapract.upgrade/init.sh` — same pattern:
  1. check prerequisites
  2. compute route metadata (ISO_DATE, ROUTE_SLUG, ROUTE_PATH)
  3. mkdir -p route directory
  4. copy templates
  5. bind via `npx rhachet run --repo bhrain --skill route.bind.set`
  6. output tree format

**verdict**: consistent. blueprint follows the declapract.upgrade/init.sh pattern exactly.

---

### mechanism 3: API calls via curl

**blueprint proposes**: inline curl calls to USPTO API with timeout and error codes

**extant patterns**:
- `mechanic/skills/keyrack.operations.sh` — inline curl
- `mechanic/skills/git.release/git.release._.get_one_transport_status.sh` — inline curl
- `mechanic/skills/show.gh.action.logs.sh` — uses gh cli (wraps curl)

**verdict**: consistent. no shared curl helper in codebase. inline curl is the pattern.

---

### mechanism 4: document cache

**blueprint proposes**: `~/.cache/rhachet/patents/${PATENT_EXID}.json` (home directory)

**extant patterns**:
- `mechanic/skills/get.package.docs.sh` — `.refs/get.package.docs/` (repo directory)

**verdict**: consistent, with justified difference:
- **patent cache**: home directory because patents are user-global and immutable
- **package docs cache**: repo directory because versions are repo-specific

the blueprint documents this: "patents are immutable → cache aggressively"

---

### mechanism 5: argument parse pattern

**blueprint proposes**: while loop with case statement for --query, --exid, --open

**extant patterns**:
- `mechanic/skills/get.package.docs.sh` — same pattern
- `mechanic/skills/declapract.upgrade/init.sh` — same pattern
- all mechanic skills — same pattern

**verdict**: consistent.

---

## utilities considered for reuse

| utility | in codebase? | reuse? |
|---------|--------------|--------|
| curl wrapper | no | n/a |
| jq wrapper | no | n/a |
| tree output | yes (per-skill output.sh) | create new for patenter |
| route bind | yes (route.bind.set skill) | reuse |
| arg parse | no shared lib | inline (consistent) |

---

## conclusion

all mechanisms follow extant patterns. no duplication. proceed.
