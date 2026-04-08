# review: has-ergonomics-reviewed

## summary

input/output ergonomics reviewed for all journeys.

---

## ergonomics review

### patent.priors.search

**input**: `--query "natural language description"`

| aspect | assessment | notes |
|--------|------------|-------|
| intuitive | ✓ | plain text query, no special syntax |
| convenient | ✓ | single flag, no setup |
| expressive | ✓ | any natural language query accepted |
| composable | ✓ | output exids can pipe to fetch |
| lower trust | ✓ | validates length, sanitizes input |
| deeper behavior | ✓ | empty results show suggestions |

**output**: tree with patents, relevance scores, titles

| aspect | assessment | notes |
|--------|------------|-------|
| intuitive | ✓ | relevance scores are 0-1, easy to interpret |
| clear hierarchy | ✓ | tree shows query → results → patents |
| actionable | ✓ | exids visible for copy to fetch command |

**friction**: none found

### patent.priors.fetch

**input**: `--exid US20210234567A1`

| aspect | assessment | notes |
|--------|------------|-------|
| intuitive | ✓ | exid copied from search results |
| convenient | ✓ | single flag |
| expressive | ✓ | exact patent requested |
| composable | ✓ | output is structured, parseable |
| lower trust | ✓ | validates exid format |
| deeper behavior | ✓ | not-found shows verification hint |

**output**: structured patent document

| aspect | assessment | notes |
|--------|------------|-------|
| intuitive | ✓ | sections match patent structure (claims, figures) |
| clear hierarchy | ✓ | metadata → abstract → claims → figures |
| scannable | ✓ | claims numbered, figures labeled |

**friction**: long documents may require scroll. acceptable for v1, pagination is future scope.

### patent.propose

**input**: no required args, optional `--open nvim`

| aspect | assessment | notes |
|--------|------------|-------|
| intuitive | ✓ | no args needed for default behavior |
| convenient | ✓ | infers branch name, date |
| expressive | ✓ | --open allows editor choice |
| composable | ✓ | output is route path, can cd into |
| lower trust | ✓ | checks git repo, extant route |
| deeper behavior | ✓ | error if route extant |

**output**: tree with created files, branch bind confirmation

| aspect | assessment | notes |
|--------|------------|-------|
| intuitive | ✓ | checkmarks show success |
| clear hierarchy | ✓ | mascot → files → next step |
| actionable | ✓ | shows 0.idea.md path to start |

**friction**: none found

---

## issues found

none — inputs and outputs feel natural for CLI users.

---

## non-issues confirmed

- **exid format not human-readable**: USPTO exids like `US20210234567A1` are standard format. inventors copy from search results, no need to type manually. not an issue.

- **9 stones in route**: the proposal route has many stones. this matches the complexity of patent preparation. progress is tracked via bhrain hooks. not an issue.

- **no GUI**: target audience is CLI-native technical founders. GUI is explicitly out of scope per vision. not an issue.

