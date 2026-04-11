# howto.prove-permit-required

## .what

process to determine and prove whether a permit is required for a specific work type in a given postal code.

## .why

- permit requirements vary by jurisdiction
- state codes adopt base codes (IRC, IBC) with amendments
- local jurisdictions (city, county) may further amend
- proof requires citation to exact code text, not summaries

## .the proof chain

a complete proof requires both sides:

```
1. BASELINE: prove permits ARE required (IRC R105.1)
2. EXEMPTIONS: prove work is NOT exempt (IRC R105.2)
3. CONCLUSION: work not exempt → permit required
```

**critical**: most searches only find R105.2 (exemptions). you must also cite R105.1 (baseline requirement) to complete the chain.

## .the process

### step 1: identify jurisdiction hierarchy

| level | example | where to find |
|-------|---------|---------------|
| postal code | 46220 | user input |
| city | Indianapolis | USPS lookup or web search |
| county | Marion County | web search "[city] county" |
| state | Indiana | implicit from postal code |

### step 2: identify adopted code

search: `[state] residential code [year]` or `[state] building code adoption`

| state | typical adoption | base code |
|-------|------------------|-----------|
| Indiana | Indiana Residential Code 2020 | IRC 2018 |
| California | California Residential Code | IRC with CA amendments |
| Texas | varies by jurisdiction | IRC or local |

key sources:
- state fire marshal / building safety commission
- UpCodes: https://up.codes/codes/[state]
- ICC: https://codes.iccsafe.org

### step 3: find baseline permit requirement (IRC R105.1)

the base IRC establishes that permits ARE required in Section R105.1. search for:

```
"R105.1" "Required" "electrical" IRC
```

**IRC R105.1 Required** (verbatim):
> "Any owner or authorized agent who intends to construct, enlarge, alter, repair, move demolish, or change the occupancy of a building or structure, or to erect, install, enlarge, alter, repair, remove, convert or replace any electrical, gas, mechanical or plumbing system, or to cause any such work to be done, shall first make application to the building official and obtain the required permit."

key phrase: **"install, enlarge, alter, repair, remove, convert or replace any electrical... system"**

this establishes: all electrical system work requires a permit by default.

### step 4: find permit exemptions (IRC R105.2)

the base IRC then defines exempt work in Section R105.2. search for:

```
"R105.2" "work exempt from permit" [state]
```

or use UpCodes:
- https://up.codes/s/work-exempt-from-permit

### step 5: check state amendments

states may delete, modify, or add to IRC R105.2. search:

```
[state] residential code R105.2 amendments deleted
```

example: Indiana deleted certain IRC sections but retained R105.2 permit exemptions.

### step 6: check local amendments

cities and counties may further amend. search:

```
[city] [county] building code electrical permit required
```

or find local code via:
- Municode: https://library.municode.com
- city/county official website

### step 7: extract exact quotes

the proof requires verbatim code text, not summaries.

sources for exact text:
- UpCodes viewers (free, partial)
- ICC Digital Codes (subscription, complete)
- local government PDF publications
- Municode (free, searchable)

### step 8: document with citations

format the finding as a brief with:

| section | content |
|---------|---------|
| .what | yes/no permit required + work type + jurisdiction |
| .applicable code | state code name, base code, local code section |
| .code text | verbatim quote of exemption list |
| .analysis | does work appear on exemption list? |
| .sources | URLs to authoritative sources |
| .date researched | when research was conducted |

## .example: electrical panel upgrade

**question**: is a permit required to upgrade a fuse box to breaker panel in 46220 (Indianapolis, IN)?

**step 1**: 46220 → Indianapolis → Marion County → Indiana

**step 2**: Indiana adopts Indiana Residential Code 2020 (based on IRC 2018)

**step 3**: IRC R105.1 establishes baseline — permits required for:
> "install, enlarge, alter, repair, remove, convert or replace any electrical... system"

panel upgrade = "replace... electrical... system" → **permit required by default**

**step 4**: IRC R105.2 electrical exemptions:
> 1. "Listed cord-and-plug connected temporary decorative lighting."
> 2. "Reinstallation of attachment plug receptacles but not the outlets therefor."
> 3. "Replacement of branch circuit overcurrent devices of the required capacity in the same location."
> 4. "Electrical wiring, devices, appliances, apparatus or equipment operating at less than 25 volts and not capable of supplying more than 50 watts of energy."
> 5. "Minor repair work, including the replacement of lamps or the connection of approved portable electrical equipment to approved permanently installed receptacles."

**step 5**: Indiana retains these exemptions per Indiana Residential Code 2020.

**step 6**: Indianapolis enforces via Chapter 536 of Marion County Code, Section 536-201.

**step 7**: panel upgrade / fuse-to-breaker conversion **not listed** in exemptions.

**answer**: **yes, permit required**.

## .authoritative sources

| source type | url pattern |
|-------------|-------------|
| IRC base code | https://up.codes/s/work-exempt-from-permit |
| state codes | https://up.codes/codes/[state] |
| local codes | https://library.municode.com/[state]/[jurisdiction] |
| ICC official | https://codes.iccsafe.org |
| permit guidance | https://permitmint.com/permits/[state]/[city]/[trade]/ |

## .common pitfalls

| pitfall | fix |
|---------|-----|
| trust summaries without code text | always cite verbatim quote |
| assume state code = local code | check for local amendments |
| confuse IRC edition years | verify which edition state adopted |
| rely on contractor advice | verify against published code |
| PDFs do not render in web fetch | try UpCodes or Municode HTML viewers |

## .key insight

the proof chain has two parts:

1. **R105.1** proves permits ARE required for electrical work (baseline)
2. **R105.2** lists what is EXEMPT from that requirement

if work is not on the exemption list, the baseline applies: **permit required**.

most searches only find R105.2. always cite both to complete the proof.
