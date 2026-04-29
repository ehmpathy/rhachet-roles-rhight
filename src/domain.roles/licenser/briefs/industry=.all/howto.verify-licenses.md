# howto.verify-licenses

## .what

step-by-step process to verify a professional license is legitimate and unexpired.

## .the verification checklist

| step | question | where to find |
|------|----------|---------------|
| 1 | what type of license? | ask the practitioner |
| 2 | which jurisdiction controls it? | state, local, or federal |
| 3 | what's the license number? | ask practitioner or search by name |
| 4 | is status active? | official portal |
| 5 | when does it expire? | official portal |
| 6 | any disciplinary actions? | official portal |

## .step 1: identify the license type

different trades have different licenses:

| trade | common license types |
|-------|---------------------|
| contractor | general contractor, residential, commercial |
| electrician | journeyman, master, contractor |
| plumber | journeyman, master, contractor |
| HVAC | installer, contractor |

ask: "what license do you hold?"

## .step 2: identify the jurisdiction

### state-level licenses

check the state professional license agency:

| state | agency | portal |
|-------|--------|--------|
| Indiana | Professional Licensing Agency (PLA) | mylicense.in.gov |
| Ohio | various boards | license.ohio.gov |
| Illinois | IDFPR | idfpr.illinois.gov |

### local-level licenses

many contractor/trade licenses are city or county:

1. identify the city/county where they work
2. contact that jurisdiction's permit/license department
3. search their local portal (if one exists)

### federal licenses

rare for contractors, but examples:

| license | agency |
|---------|--------|
| aviation | FAA |
| radio | FCC |
| nuclear | NRC |

## .step 3: search the portal

most portals allow search by:
- license number (most reliable)
- name (may have duplicates)
- business name

### what to look for

| field | good sign | red flag |
|-------|-----------|----------|
| status | active | expired, suspended, revoked |
| expiration | future date | past date |
| discipline | none | any actions listed |

## .step 4: interpret the results

### green light

- status: **active**
- expiration: **future**
- discipline: **none**

proceed with normal due diligence (insurance, reviews, references).

### yellow light

- status: active but **discipline on record**

investigate further:
- what was the violation?
- how recent?
- how severe?

### red light

- status: **expired**, **suspended**, or **revoked**

do not hire. they cannot legally practice.

## .api access (for automation)

some states offer verification APIs:

### Indiana PLA API

- contact: madoades@pla.in.gov
- endpoint: mylicense.in.gov/everification API
- returns: license status, expiration, discipline

### general pattern

most state APIs require:
1. request credentials (email the agency)
2. agree to terms of use
3. receive API key
4. query by license number or name

## .when no portal exists

for local licenses without online lookup:

1. call the city/county license office
2. provide practitioner name or license number
3. ask: "is this license active and in good standing?"
4. request written confirmation if needed

## .document the verification

keep a record:

| field | value |
|-------|-------|
| practitioner name | |
| license type | |
| license number | |
| jurisdiction | |
| status | |
| expiration | |
| verified on | |
| verified via | |

## .red flags at verification

| red flag | possible issue |
|----------|----------------|
| "I don't need a license" | may be unlicensed or dishonest |
| refuses to provide number | may be expired/revoked |
| license is from another state | may not be valid locally |
| "just renewed" but portal shows expired | may be dishonest |

## .sources

### Indiana PLA verification

> "The Verification API can be accessed by requesting credentials from Matt Doades at madoades@pla.in.gov."
>
> — [PLA Online Services: Verification API](https://www.in.gov/pla/license/verification-api/)

### Indiana portal

- [Indiana License Verification Portal](https://mylicense.in.gov/everification/)

### consumer guidance

> "DPOR enforces standards of professional conduct by investigating reports against licensees, and by ensuring regulated professions are in compliance with state law and regulations."
>
> — [Consumer Resources, Virginia DPOR](https://www.dpor.virginia.gov/Consumers)

## .see also

- define.license-lifecycle — the states a license can be in
- define.who-controls-licenses — which jurisdiction to check
