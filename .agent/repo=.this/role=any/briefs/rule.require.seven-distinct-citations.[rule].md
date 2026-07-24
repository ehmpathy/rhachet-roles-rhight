# rule.require.seven-distinct-citations

## .what

every research doc (brief, lesson, ref, hazard, case study) that makes factual claims must stand
on **at least 7 distinct source citations**, each one WebFetch'd — never a WebSearch snippet.

this is the count companion to `rule.require.webfetch-citations` (which governs the *quality* of
each citation). that rule says every citation must be WebFetch'd; this rule says there must be
**≥ 7 separate ones**.

## .why

- a single source can be wrong, outdated, or misread; seven independent sources cross-check each
  other
- a high bar forces real research breadth, not one url stretched across a whole doc
- "separate" defeats the pad-the-count trap — one statute cited seven times is still one source
- it makes each doc defensible: a reader (or counsel) can triangulate the claim across many origins

## .the rule

| requirement | detail |
|-------------|--------|
| minimum count | **≥ 7 distinct sources per doc** |
| distinct | seven *different* urls — dedupe before you count |
| WebFetch'd | each source counts only after a WebFetch of that url returned real content |
| verbatim | quote the fetched page verbatim; do not paraphrase-and-cite |
| WebSearch role | WebSearch may ONLY discover candidate urls; a snippet is never a citation |

## .what "distinct" excludes

| pattern | distinct count | verdict |
|---------|----------------|---------|
| one statute url cited 7 times | 1 | ❌ fails |
| 5 real WebFetch'd urls + 2 WebSearch snippets | 5 | ❌ fails |
| 7 urls, but 3 fetches returned empty/dead | 4 | ❌ fails |
| same doc at two mirrors (findlaw + cornell) of one statute | counts as 2 (different pages) | ✅ allowed, but prefer breadth |
| 7 different pages, each fetched + quoted | 7 | ✅ passes |

## .pattern

```
1. WebSearch to discover candidate urls (this step cites no source)
2. WebFetch each url; keep only the ones that return real content
3. quote each fetched page verbatim in the body
4. list every distinct url in ## .sources
5. count the distinct urls — if < 7, fetch more before the doc is done
```

## .how to verify

- open the doc's `## .sources` list
- dedupe the urls
- count the distinct WebFetch'd ones
- confirm each maps to a verbatim quote traceable to that fetched page
- if the count is below 7, the doc is incomplete and blocks

## .exception

- pure navigation/rollup artifacts that make no independent factual claim (e.g. a glossary index
  or a `_.catalogue` summary that only links to other docs) — these inherit their citations from
  the docs they point to
- well-known, non-controversial definitions already established in an authoritative in-context
  source (still prefer to cite)

## .enforcement

- research doc with fewer than 7 distinct WebFetch'd sources = blocker
- padded count (repeats, snippets, dead fetches counted as sources) = blocker

## .see also

- `rule.require.webfetch-citations.[rule].md` — the quality bar per citation (companion rule)
- `motto.not-legal-advice.[motto].md` — disclaimer discipline for legal research docs
- `rule.require.research-to-briefs.[rule].md` — research lands as briefs
