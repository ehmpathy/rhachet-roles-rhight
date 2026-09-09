# rule.require.seven-distinct-citations

## .what

every research doc (brief, lesson, ref, hazard, case study) that makes factual claims must stand
on **at least 7 distinct source citations**, each one captured through `bhrowser` — never a
WebSearch snippet, and never a WebFetch paraphrase.

this is the count companion to `rule.require.bhrowser-citations` (which governs the *quality* of
each citation). that rule says every citation must be captured off the real page; this rule says
there must be **≥ 7 separate ones**.

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
| captured | each source counts only after a `bhrowser` capture of that url returned real content |
| verbatim | quote the captured page verbatim; do not paraphrase-and-cite |
| WebSearch role | WebSearch may ONLY discover candidate urls; a snippet is never a citation |
| WebFetch role | none — a WebFetch paraphrase is not a citation (`rule.require.bhrowser-citations`) |

## .what "distinct" excludes

| pattern | distinct count | verdict |
|---------|----------------|---------|
| one statute url cited 7 times | 1 | ❌ fails |
| 5 real captured urls + 2 WebSearch snippets | 5 | ❌ fails |
| 7 urls, but 3 captures returned empty/dead | 4 | ❌ fails |
| same doc at two mirrors (findlaw + cornell) of one statute | counts as 2 (different pages) | ✅ allowed, but prefer breadth |
| 7 different pages, each captured + quoted | 7 | ✅ passes |

## .pattern

```
1. WebSearch to discover candidate urls (this step cites no source)
2. capture each url through bhrowser; keep only the ones that return real content
3. quote each captured page verbatim in the body
4. list every distinct url in ## .sources
5. count the distinct urls — if < 7, capture more before the doc is done
```

## .how to verify

- open the doc's `## .sources` list
- dedupe the urls
- count the distinct captured ones
- confirm each maps to a verbatim quote traceable to that captured page
- if the count is below 7, the doc is incomplete and blocks

## .exception

- pure navigation/rollup artifacts that make no independent factual claim (e.g. a glossary index
  or a `_.catalogue` summary that only links to other docs) — these inherit their citations from
  the docs they point to
- ⭐ **method briefs** — a doc whose subject is **how to write a document**, not a claim about any
  subject domain (e.g. `howto.distill-redlines-and-landmines`, `define.the-floor-ladder`). ⚠️ **it
  earns the exception only on a condition**, stated below
- well-known, non-controversial definitions already established in an authoritative in-context
  source (still prefer to cite)

### ⭐ why the method-brief class exists, and what it costs to claim it

⛔ **every mechanic in this rule presumes an external source**: capture the url, quote it verbatim,
dedupe the urls, count seven. a brief about **document structure** quotes no external page, so the
count bar does not measure its rigor — it measures whether the author padded a list.

⚠️ **and the check the rule really wants is still available, in a different currency.** a method
brief's claims trace to **the repo's own artifacts** — the worked example that produced the method.
so the exception swaps the bar rather than removes it:

| for a research doc | ⭐ for a method brief |
|--------------------|---------------------|
| ≥ 7 distinct external urls, each captured | ⭐ **every claim traced to a named internal artifact**, listed as a lineage |

⛔ **the exception is NOT available to a doc that makes any claim about a subject domain.** the test:

> **if you deleted every internal artifact this doc names, would any factual claim about the world
> survive in it?**

- **yes** → ⛔ it is a research doc in a method brief's clothes. the count bar applies.
- **no** → ✅ it is a method brief. the lineage bar applies.

⚠️ **a worked example is the trap.** a method brief may **point at** its worked example freely; the
moment it **restates** the example's legal or factual content as its own claim, it has made an
independent claim and owes the seven.

## .enforcement

- research doc with fewer than 7 distinct captured sources = blocker
- padded count (repeats, snippets, dead captures counted as sources) = blocker

## .see also

- `rule.require.bhrowser-citations.[rule].md` — the quality bar per citation (companion rule)
- `motto.not-legal-advice.[motto].md` — disclaimer discipline for legal research docs
- `rule.require.research-to-briefs.[rule].md` — research lands as briefs
