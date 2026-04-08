# ref.uspto-odp-api

## .what

USPTO Open Data Portal API reference for patent search and document retrieval.

## .why

the patenter role needs correct API endpoints. USPTO migrated from `data.uspto.gov/apis/...` to `api.uspto.gov/api/v1/...` — the old endpoints return HTTP 400 with "Please use the api.uspto.gov endpoint".

## .endpoints

### base url

```
https://api.uspto.gov/api/v1/patent
```

### search patents

```
GET https://api.uspto.gov/api/v1/patent/applications/search
```

**query parameters:**
- `q` — search query (OpenSearch syntax)
- `fields` — fields to return
- `pagination` — pagination options

**example:**
```bash
curl -H "X-Api-Key: $USPTO_ODP_API_KEY" \
  "https://api.uspto.gov/api/v1/patent/applications/search?q=inventionTitle:wireless"
```

### fetch patent by application number

```
GET https://api.uspto.gov/api/v1/patent/applications/{appNumber}
```

**critical**: `{appNumber}` is the **numeric application number** (e.g., `19394030`), NOT the publication number (e.g., `US7654321B2`).

| identifier type | format | example | used for |
|-----------------|--------|---------|----------|
| application number | 8 digits | `19394030` | API fetch by ID |
| publication number | USxxxxA1/B2 | `US20210234567A1` | human reference |

**related endpoints:**
- `/api/v1/patent/applications/{appNumber}/meta-data` — metadata
- `/api/v1/patent/applications/{appNumber}/documents` — document list
- `/api/v1/patent/applications/{appNumber}/continuity` — continuity data
- `/api/v1/patent/applications/{appNumber}/transactions` — transaction history

**example:**
```bash
curl -H "X-Api-Key: $USPTO_ODP_API_KEY" \
  "https://api.uspto.gov/api/v1/patent/applications/19394030"
```

## .authentication

```bash
-H "X-Api-Key: $USPTO_ODP_API_KEY"
```

get a key at: https://data.uspto.gov

## .rate limits

- 60 requests/minute per API key (observed)
- HTTP 429 returned when exceeded
- `Retry-After` header indicates wait time

## .migration notice

> "Please use the api.uspto.gov endpoint as this endpoint is intended for the web UI use only."
> — USPTO API response, 2026-04-04

the `data.uspto.gov/apis/...` endpoints now return HTTP 400. use `api.uspto.gov/api/v1/...` instead.

**timeline:**
- Open Data Portal Beta shutdown: April 20, 2026
- new endpoint: `api.uspto.gov`

## .sources

| source | url |
|--------|-----|
| USPTO API Catalog | https://developer.uspto.gov/api-catalog |
| USPTO ODP Portal | https://data.uspto.gov |
| API observed behavior | direct test 2026-04-04 |

