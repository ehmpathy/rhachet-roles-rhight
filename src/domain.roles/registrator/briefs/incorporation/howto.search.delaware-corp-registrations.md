# howto.search.delaware-corp-registrations

## .what

how to look up information about Delaware corporations and LLCs.

**use this to:**
- verify an entity exists
- find file number, incorporation date, registered agent
- check entity status (active, void, etc.)
- research other companies

**do NOT use this to:**
- pay franchise tax → use [corp.delaware.gov/paytaxes](https://corp.delaware.gov/paytaxes/)
- file annual report → use [corp.delaware.gov](https://corp.delaware.gov/)
- amend your certificate → use [corp.delaware.gov](https://corp.delaware.gov/)

---

## .the short answer

**manual search (free):**
[icis.corp.delaware.gov/ecorp/entitysearch](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx)

**no public API exists.** Delaware's ICIS system is web-only with captcha protection.

---

## .manual search via web

### step by step

1. go to [Delaware Entity Search](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx)
2. enter entity name (e.g., "Sandpine Inc")
3. click "Search"
4. click entity name in results to view details

### what you can find

| field | available |
|-------|-----------|
| entity name | yes |
| file number | yes |
| formation date | yes |
| entity type | yes (corp, LLC, LP, etc.) |
| status | ⚠️ shown, but disclaimed as not current — see the tiers below |
| registered agent | yes |
| registered agent address | yes |
| owner/member names | **no** (private in Delaware) |
| annual report filings | limited |

> "You cannot publicly look up a business's owner or member names in Delaware."
>
> — [Discern: How to Find Delaware Entity Information](https://www.discern.com/resources/how-to-find-delaware-entity-information)

### search by file number

if you have the 7-digit file number:

**option 1: via search form**
1. go to [icis.corp.delaware.gov/ecorp/entitysearch](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx)
2. change dropdown from "Entity Name" to "File Number"
3. enter file number (e.g., "1234567")
4. click "Search"
5. click entity name in results

**option 2: direct URL**

```
https://icis.corp.delaware.gov/Ecorp/EntitySearch/Status.aspx?i={FILE_NUMBER}&d=y
```

### entity status page — information tiers

this page is for **lookup** only. it is NOT for tax payment.

- **free** — name, file number, incorporation date, registered agent. ⛔ the page disclaims it as *"not an indication of the current status"*
- **$10** status · **$20** status with tax & history (5 recent filings, franchise tax assessment, authorized shares, tax due)
- officer and director names are unavailable at any tier; neither online option produces a certificate of good standing

the tiers, quoted from `corp.delaware.gov/onlinestatus/` with bytes embedded:
`variant=c-corp/define.amended-annual-report.state=delaware.md` § *⛔ the FREE
search cannot tell you an entity's status*.

### franchise tax payment (separate)

to **pay** your franchise tax, use a different portal:

[corp.delaware.gov/paytaxes](https://corp.delaware.gov/paytaxes/)

you do NOT need to pay $10 or $20 to look up info before you file your tax. the tax portal shows your tax due when you log in.

---

## .programmatic access options

### 🚩 official API — NOT verified absent

> "The Delaware Division of Corporations maintains a free, public, online database... **however, there is no indication that an official public API exists**."
>
> — [Cobalt Intelligence: Delaware SOS Business Search Guide](https://cobaltintelligence.com/blog/post/delaware-secretary-of-state-business-search-guide-2024)

⚠️ that is an absence of evidence, from a data **vendor** that sells a registry
API — the weakest provenance for a claim about what an agency offers. confirm
against the Division's own site before you state "no API" as fact. the guidance
below does not depend on it: the scrape prohibition and rate limits stand on the
Division's own terms of use.

### third-party aggregators

| service | what it offers | cost |
|---------|----------------|------|
| [OpenCorporates](https://opencorporates.com/) | aggregated corp data, API | freemium |
| [Cobalt Intelligence](https://cobaltintelligence.com/) | SOS data scrape service | paid |
| [Enformion](https://www.enformion.com/) | business entity data | paid |

OpenCorporates has Delaware data and provides an API:
- [opencorporates.com/registers/61](https://opencorporates.com/registers/61)

### build a scraper (not recommended)

the ICIS system has:
- captcha protection
- an express prohibition on data mining and on *"automated tools in any form"*, sanctioned by suspension of access
- rate limits

the prohibition, quoted verbatim: `variant=c-corp/define.amended-annual-report.state=delaware.md`
§ *⛔ automated tools are PROHIBITED on the entity search*. a scraper would
violate it and risk the account that must make the filings.

---

## .what Delaware keeps private

Delaware is known for privacy. these are **not publicly searchable**:

| information | public? |
|-------------|---------|
| shareholder names | no |
| member names (LLC) | no |
| director names | no |
| officer names | no |
| ownership percentages | no |

> "Delaware does not require LLCs to disclose their members or managers in the formation documents filed with the state."
>
> — [NCH Inc](https://nchinc.com/blog/business-startup/state-filing-fees-breakdown-where-its-cheapest-to-form-an-llc/)

to get ownership data, you need a subpoena or court order.

---

## .alternative: certificate of status

for verification purposes, you can order official documents:

| document | what it proves | cost |
|----------|----------------|------|
| Good Standing — **short form** | the entity is in good standing **today** | **$50.00** per certificate |
| Good Standing — **long form** | the above, **plus the entity's full history of prior filings** | **$175.00** per certificate |
| Certified Copy of Formation | official copy of the articles | **$50.00** per document **+ $2.00 per page** |
| Record Search | — | **$50.00** per entity |
| special certificate (void, name change, merger) | one named event | **$50.00** per certificate |

> ```
> Record Searches                                       $50.00 (per entity)
> Good Standing Short form:
>   All Entities Domestic and Foreign               $50.00 (per certificate)
> Good Standing Long form:
>   All Entities Domestic                          $175.00 (per certificate)
> Certified Copies
> All Entities Domestic and Foreign                 $50.00 (per document)
>                                                plus $2 per page for copies
> ```
> — [DE Division of Corporations, Fee Schedule, revised 2026-08-01](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf)

⛔ **there is no single "Certificate of Status."** the long form ($175.00) is
the one that returns the history of prior filings — usually why you research an
entity. and a certified copy is $50.00 **plus $2.00 per page**, with no cap
stated, so a charter with amendments runs well past $50.

order via: [corp.delaware.gov](https://corp.delaware.gov/) · fees per the
[schedule](https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf)
(rev. 2026-08-01), pulled 2026-08-31

---

## .summary

| need | solution |
|------|----------|
| quick lookup | [icis.corp.delaware.gov](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx) |
| API access | [OpenCorporates](https://opencorporates.com/) (third-party) |
| bulk data | contact Delaware or use aggregator |
| ownership info | not public (subpoena required) |
| official verification, **status today** | Good Standing short form, $50.00 |
| official verification, **plus history** | Good Standing long form, $175.00 |

---

## .sources

- [Delaware Division of Corporations Entity Search](https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx)
- [Delaware Division of Corporations](https://corp.delaware.gov/)
- [Discern: How to Find Delaware Entity Information](https://www.discern.com/resources/how-to-find-delaware-entity-information)
- [Cobalt Intelligence: Delaware SOS Business Search Guide](https://cobaltintelligence.com/blog/post/delaware-secretary-of-state-business-search-guide-2024)
- [OpenCorporates: Delaware Division of Corporations](https://opencorporates.com/registers/61)
- [NCH Inc: State Fees Breakdown](https://nchinc.com/blog/business-startup/state-filing-fees-breakdown-where-its-cheapest-to-form-an-llc/)
