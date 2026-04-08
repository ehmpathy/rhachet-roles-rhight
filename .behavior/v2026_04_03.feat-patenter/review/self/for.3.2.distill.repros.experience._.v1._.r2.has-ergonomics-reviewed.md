# review: has-ergonomics-reviewed (r2 - deeper reflection)

## what i was asked to review

input/output ergonomics for the patenter skills — whether they feel natural to inventors.

---

## what i found

### issue 1: query length validation message

**the friction**: the criteria say queries < 3 chars get "error: query too short" — but this message doesn't help the user understand *why* or *what to do*.

**how i fixed it**: updated the journey sketch to show a more helpful error:

```
$ rhx patent.priors.search --query "AI"

🦅 hmm...

⚓ patent.priors.search
   └─ query too short (2 chars, need 3+)

try a more specific query:
  • "neural network compression" (25 chars)
  • "distributed consensus protocol" (32 chars)
```

this shows the char count, the minimum, and suggests alternatives.

### issue 2: no-results output could show why

**the friction**: when a search yields no results, we show "empty list + refinement suggestions" — but we don't explain why results might be empty.

**how i fixed it**: the output should acknowledge possible causes:

```
$ rhx patent.priors.search --query "quantum blockchain neural fusion"

🦅 crickets...

🔍 patent.priors.search
   ├─ query: quantum blockchain neural fusion
   └─ results: 0

no matches found. possible reasons:
  • query too novel (not yet patented)
  • query too specific (try broader terms)
  • query combines unrelated domains

try:
  • "quantum computation" (broaden)
  • "blockchain consensus" (split domains)
```

---

## what held

### exid as fetch input

**why it holds**: users copy the exid from search results — they don't type it manually. the exid appears in the search output, user copies it, pastes it to fetch. this is the natural flow.

alternative considered: allow fetch by title. rejected because:
- titles are not unique (many patents have similar titles)
- title search would just be another search, not a fetch
- exid is the canonical identifier

### tree output format

**why it holds**: tree format (🐚, ├─, └─) is consistent with other rhachet skills. inventors who use rhachet are familiar with this format. consistency > novelty.

alternative considered: JSON output. rejected because:
- primary audience is humans, not programs
- tree is more scannable
- JSON could be added as `--output json` for programmatic use (future scope)

### 9 stones in route

**why it holds**: patent preparation is genuinely complex. the stones map to real phases:
1. idea capture
2. vision
3. prior art (favorable)
4. prior art (adverse)
5. prior art analysis
6. patentable claims
7. office action strategy
8. blueprint
9. latex output

each stone serves a purpose. to collapse them would hide necessary work. the friction is intentional — patent preparation *should* feel deliberate.

---

## summary

found 2 issues (query length message, no-results explanation) — both addressable in implementation.

3 design choices questioned and validated (exid input, tree output, 9 stones).

