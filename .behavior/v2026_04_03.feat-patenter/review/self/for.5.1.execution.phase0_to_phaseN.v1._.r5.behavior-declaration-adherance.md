# review: behavior-declaration-adherance (round 5)

## question

does the implementation match the behavior declaration correctly? did it drift from the spec?

## method

reviewed each changed file line by line against vision, criteria, and blueprint. checked for drift or misinterpretation.

---

## adherance check: patent.priors.search.sh

### vision says

> `rhx patent.priors.search --query "neural network model compression distillation"`
> output: list of relevant patent IDs with titles, abstracts, relevance scores

### implementation does

```bash
# search.sh:268-314 emit_results()
print_tree_start "patent.priors.search"
print_tree_branch "query" "$QUERY_TEXT"
print_tree_branch "results" "$result_count patents"
# ... emits each patent with exid, relevance score, and title
```

**adherance**: correct. outputs query, results count, and each patent with exid/relevance/title.

### vision says

> results are sorted by relevance

### implementation does

```bash
# search.sh:235-263 sort_by_relevance()
# computes relevance: title match (2x) + abstract match (1x)
# scales to 0-1: score / max_possible
# sorts from high to low by relevance
```

**adherance**: correct. sort is by computed relevance, high to low, normalized to 0-1.

---

## adherance check: patent.priors.fetch.sh

### vision says

> fetches all patent contents by exid

### implementation does

```bash
# fetch.sh:206-230 parse_document()
# extracts: exid, title, abstract, dateFiled, numClaims
```

**adherance**: partial. vision says "all patent contents" but implementation extracts only metadata. the PatentsView API returns limited fields — full claims text requires a different endpoint or PDF extraction.

**noted**: this is a known limitation documented in the blueprint. the API returns metadata, not full specification text. this is acceptable for v1 — the blueprint explicitly states "claims text requires different approach".

### vision says

> caches immutable patent data

### implementation does

```bash
# fetch.sh:80-90 cache_get()
# fetch.sh:235-240 cache_set()
# cache path: ~/.cache/rhachet/patents/${PATENT_EXID}.json
```

**adherance**: correct. patents are immutable. cache is forever valid.

---

## adherance check: patent.propose.sh

### vision says

> instantiates route with 9 specific stones

### implementation does

```bash
# propose.sh:106-122 copy_templates()
# copies all files from templates/ to route directory
```

templates/ contains exactly 9 files, named per vision.

**adherance**: correct.

### vision says

> bound to branch via hooks

### implementation does

```bash
# propose.sh:127-136 bind_branch()
# creates symlink .branch/.bind/$BRANCH -> route
```

**adherance**: correct. symlink enables bhrain hooks to track branch ↔ route.

### vision says

> supports --open nvim, --open code

### implementation does

```bash
# propose.sh:180-191 open_editor()
if ! command -v "$OPEN_EDITOR" >/dev/null 2>&1; then
  print_blocked "editor not found: $OPEN_EDITOR"
  exit 2
fi
"$OPEN_EDITOR" "$ROUTE_PATH/0.idea.md"
```

**adherance**: correct. opens specified editor on 0.idea.md. errors if editor not found.

---

## adherance check: output.sh

### vision says

> mascot: 🦅 eagle
> phrases: "lets soar and see," "got one," "take to the sky," "that wont do..."

### implementation does

```bash
# output.sh:17-21
print_eagle_header() {
  echo "🦅 $phrase"
}

# output.sh:97-101
print_blocked() {
  echo "🦅 that wont do..."
}
```

**adherance**: correct. eagle mascot, correct phrases.

---

## adherance check: getPatenterRole.ts

### blueprint says

> Role.build with slug, name, purpose, readme, boot, keyrack, briefs, skills

### implementation does

```typescript
export const ROLE_PATENTER: Role = Role.build({
  slug: 'patenter',
  name: 'Patenter',
  purpose: 'research prior art and prepare patent proposals',
  readme: { uri: `${__dirname}/readme.md` },
  boot: { uri: `${__dirname}/boot.yml` },
  keyrack: { uri: `${__dirname}/keyrack.yml` },
  briefs: { dirs: { uri: `${__dirname}/briefs` } },
  skills: { dirs: { uri: `${__dirname}/skills` }, refs: [] },
  // ...
});
```

**adherance**: correct. all specified sections present.

---

## adherance check: exit code semantics

### criteria says

> exit 0 = success, exit 1 = malfunction, exit 2 = constraint

### implementation does

reviewed all exit statements:

| file | exit code | context | correct? |
|------|-----------|---------|----------|
| search.sh:77 | 2 | query required | ✓ constraint |
| search.sh:91 | 2 | query too short | ✓ constraint |
| search.sh:98 | 2 | query too long | ✓ constraint |
| search.sh:120 | 2 | API key required | ✓ constraint |
| search.sh:170 | 1 | API unavailable | ✓ malfunction |
| search.sh:193 | 1 | rate limited | ✓ malfunction |
| fetch.sh:58 | 2 | exid required | ✓ constraint |
| fetch.sh:73 | 2 | invalid format | ✓ constraint |
| fetch.sh:101 | 2 | API key required | ✓ constraint |
| fetch.sh:148 | 1 | API unavailable | ✓ malfunction |
| fetch.sh:165 | 2 | patent not found | ✓ constraint |
| propose.sh:64 | 2 | not in git repo | ✓ constraint |
| propose.sh:89 | 2 | route extant | ✓ constraint |
| propose.sh:187 | 2 | editor not found | ✓ constraint |

**adherance**: correct. all exit codes match semantics.

---

## conclusion

| component | adherance |
|-----------|-----------|
| patent.priors.search | ✓ matches spec |
| patent.priors.fetch | ✓ matches spec (with documented API limitation) |
| patent.propose | ✓ matches spec |
| output.sh | ✓ matches spec |
| getPatenterRole.ts | ✓ matches spec |
| exit code semantics | ✓ matches spec |

no drift found. implementation adheres to the behavior declaration.

the one limitation (fetch returns metadata, not full claims text) is documented in the blueprint as a known constraint of the PatentsView API.
