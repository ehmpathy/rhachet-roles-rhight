# review: has-consistent-mechanisms

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds

all mechanisms follow extant patterns. no duplication detected. thorough line-by-line comparison confirms consistency.

---

## analysis

### mechanism 1: output.sh with mascot

**blueprint proposes**: `src/domain.roles/patenter/skills/patent.priors/output.sh` with 🦅 eagle mascot

**extant patterns examined**:
- `mechanic/skills/claude.tools/output.sh` — 🐢 turtle mascot
- `mechanic/skills/declapract.upgrade/output.sh` — 🐢 turtle mascot
- `librarian/skills/brief.condense/output.sh` — 🐢 turtle mascot

**line-by-line comparison**:

| function | extant (mechanic) | proposed (patenter) |
|----------|-------------------|---------------------|
| header | `print_turtle_header()` → echo "🐢 $phrase" | `print_eagle_header()` → echo "🦅 $phrase" |
| root | `print_tree_start()` → echo "🐚 $skill" | `print_tree_start()` → echo "🌎 $skill" |
| branch | `print_tree_branch()` → echo "   ├─ $key: $value" | same |
| leaf | `print_tree_leaf()` → echo "   └─ $content" | same |

**verdict**: consistent. mascot and root emoji differ per role (as expected). tree structure functions identical.

---

### mechanism 2: route creation (patent.propose)

**blueprint proposes**: create route with templates, bind to branch via `route.bind.set`

**extant pattern**: `mechanic/skills/declapract.upgrade/init.sh`

**codepath comparison**:

| step | extant (declapract.upgrade) | proposed (patent.propose) |
|------|---------------------------|---------------------------|
| prereq check | check declapract.use.yml extant | check git repo extant |
| compute metadata | ISO_DATE=$(date +%Y_%m_%d) | DATE=$(date +%Y_%m_%d) |
| route slug | "v${ISO_DATE}.declapract.upgrade" | "v${DATE}.patent.propose" |
| create dir | mkdir -p "$ROUTE_PATH" | mkdir -p "$ROUTE_PATH" |
| copy templates | for file in templates/*.stone templates/*.guard | for each file in $TEMPLATE_DIR |
| bind | npx rhachet run --repo bhrain --skill route.bind.set | same skill |
| output | print_turtle_header + tree | print_eagle_header + tree |

**verdict**: consistent. exact same pattern with different template files.

---

### mechanism 3: API calls via curl

**blueprint proposes**: inline curl with 10s timeout, backoff on 429

**extant patterns examined**:

```bash
# from keyrack.operations.sh
curl -sS --connect-timeout 10 --max-time 30 ...

# from git.release._.get_one_transport_status.sh
gh api ... (wraps curl internally)
```

**blueprint codepath**:
```
search_uspto():
  curl with 10s timeout
  if 429: read Retry-After header, sleep, retry with exponential backoff + jitter
  if network error: exit 1
```

**verdict**: consistent. inline curl is the pattern. the 429 retry logic is new but not duplicated — no extant backoff utility to reuse.

---

### mechanism 4: document cache

**blueprint proposes**: `~/.cache/rhachet/patents/${PATENT_EXID}.json`

**extant pattern**: `get.package.docs.sh` uses `.refs/get.package.docs/`

**why different location is correct**:

| aspect | package docs | patents |
|--------|--------------|---------|
| scope | repo-specific (version-matched) | user-global (same everywhere) |
| mutability | changes with package version | immutable after publication |
| location | repo dir (.refs/) | home dir (~/.cache/) |

the blueprint explicitly states: "patents immutable → cache never stale"

**verdict**: consistent. different cache location is justified by different data semantics.

---

### mechanism 5: validation functions

**blueprint proposes**: `validate_query()`, `validate_exid()` inline in skills

**extant pattern**: `set.package.install.sh` and `set.package.upgrade.sh`

```bash
# extant pattern from set.package.upgrade.sh:73
validate_flags() {
  if [[ -z "$PACKAGE" ]]; then
    OUTPUT_STREAM="stderr"
    print_turtle_header "bummer dude..."
    print_tree_start "set.package.upgrade"
    print_error "--package is required"
    exit 2
  fi
  ...
}
```

**blueprint pattern**:
```
validate_query():
  if len < 3: exit 2 "query too short"
  if len > 1000: exit 2 "query too long"
  sanitize: trim whitespace, escape special chars
```

**verdict**: consistent. inline validation function with exit 2 for constraint errors.

---

### mechanism 6: argument parse pattern

**blueprint proposes**: while loop with case statement

**extant pattern**: all skills use same structure

```bash
# extant from get.package.docs.sh
while [[ $# -gt 0 ]]; do
  case $1 in
    readme|filetree) SUBCOMMAND="$1"; shift ;;
    --of) PACKAGE="$2"; shift 2 ;;
    --repo|--role|--skill) shift 2 ;;  # rhachet passthrough
    *) echo "error: unknown argument" >&2; exit 2 ;;
  esac
done
```

**blueprint codepath**:
```
parse_args():
  --query "$TEXT" → extract QUERY_TEXT
  --limit N → extract PAGE_LIMIT
  --since/--until → extract DATE_*
```

**verdict**: consistent. same while/case pattern.

---

## utilities considered for reuse

| utility | in codebase? | reuse decision |
|---------|--------------|----------------|
| curl wrapper | no shared lib | inline (consistent with extant) |
| jq wrapper | no shared lib | inline (consistent with extant) |
| backoff+jitter | no shared lib | inline (new, not duplicated) |
| tree output | yes, per-skill output.sh | create new for patenter |
| route bind | yes, route.bind.set skill | reuse via npx rhachet |
| arg parse | no shared lib | inline (consistent with extant) |
| validation | no shared lib | inline (consistent with extant) |

---

## conclusion

thorough line-by-line comparison confirms all mechanisms follow extant patterns:
1. output.sh — same function structure, different mascot
2. route creation — exact same pattern as declapract.upgrade/init.sh
3. curl calls — inline, consistent with keyrack and git.release
4. cache — different location justified by different data semantics
5. validation — inline functions with exit 2, same as set.package
6. arg parse — while/case pattern used everywhere

no duplication detected. no extant utilities overlooked. proceed.
