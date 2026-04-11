# blocker: goal 2 — permit.search and permit.fetch

## status

**BLOCKED** — requires Accela API access or webscrape capability

## what is blocked

goal 2 of the permit-required behavior:
- `permit.search` — search for permits by address in Indianapolis-Marion County
- `permit.fetch` — fetch full permit details by permit ID

## why blocked

Indianapolis uses **Accela** for permits. API access requires **agency registration** which is not public.

| approach | status |
|----------|--------|
| Accela API | blocked — requires Indianapolis DBNS partnership |
| Open Indy Data Portal | limited — permit records not exposed |
| webscrape | deferred — requires rhachet-roles-kermet |

## what we need

to unblock via webscrape:
1. rhachet-roles-kermet (or similar webscrape capability)
2. headless browser to navigate Accela portal
3. address search automation
4. result table parse

target portal:
```
https://aca-prod.accela.com/INDY/Cap/CapHome.aspx?module=Permits
```

## todo

use rhachet-roles-kermet to webscrape

## what works (goal 1)

`permit.check.required` works — uses local computation with IRC code citations to determine if a permit is required. no API needed.

## files affected

stub implementations (exit 2 until unblocked):
- `src/domain.roles/permiter/skills/permit.search/permit.search.sh`
- `src/domain.roles/permiter/skills/permit.fetch/permit.fetch.sh`
- `src/domain.operations/permit/searchPermits.ts`
- `src/domain.operations/permit/fetchPermit.ts`

## reference

- `src/domain.roles/permiter/briefs/howto.indianapolis-permit-api-search.[ref].md`
