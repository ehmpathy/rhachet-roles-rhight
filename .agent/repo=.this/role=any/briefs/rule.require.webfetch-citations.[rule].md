# rule.require.webfetch-citations

## .what

all factual claims must be backed by WebFetch'ed citations. WebSearch snippets are insufficient.

## .why

WebSearch returns summaries and snippets — not ground truth. search results can be:
- outdated
- misinterpreted
- hallucinated by search engines
- absent critical context

WebFetch retrieves actual page content, which enables verification of:
- exact text
- eligibility criteria
- cost
- restrictions
- publication dates

## .the rule

| source type | acceptable for citations? |
|-------------|--------------------------|
| WebSearch snippets | **NO** — use to find URLs only |
| WebFetch content | **YES** — quote verbatim |
| PDF reads | **YES** — quote verbatim |
| direct API responses | **YES** — include response data |

## .pattern

```
1. WebSearch to find relevant URLs
2. WebFetch each URL to get actual content
3. Quote verbatim from fetched content
4. Cite URL + specific claim
```

## .examples

### bad — websearch snippet only

```
Chubb offers builder's risk to homeowners.
source: websearch snippet
```

### good — webfetch verified

```
Chubb's Homebuilders product is "designed for residential contractors"
— not individual homeowners.
source: WebFetch of https://www.chubb.com/.../homebuilders-builders-risk-insurance.html
verbatim: "Designed for residential contractors, Homebuilders Builders Risk
coverage protects all sizes of homebuilders"
```

## .enforcement

- claim without webfetch verification = blocker
- websearch-only citation = blocker

## .exception

- well-known facts (e.g., "AM Best rates financial strength")
- definitions from authoritative sources already in context
- internal repo references
