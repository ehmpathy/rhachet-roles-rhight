# rule.forbid.live-uspto-api-for-now

> ⚠️ **not legal advice.** this brief sets a test scope; it says naught about patent law.

## .what

the live USPTO api is **unsupported for now**. so:

- its live cases are **out of scope**, and never a gate
- a `403` from it is **no defect to chase**
- no key hunt, no retry, no re-diagnosis — the question is settled until this brief is retired

## .why

- the live cases depend on a credential this repo does not hold in a working state
- each red run reopened the same question, and each reopen cost a round with no new fact
- a scope decision that lives only in a conversation gets relitigated. a brief stops it

## .scope

| in scope — still a gate | out of scope — skipped by declaration |
|---|---|
| every hermetic case: `--help`, arg-parse arms, curl refusals, keyrack refusals | every case labeled `(LIVE API)` in `patent.priors.search` and `patent.priors.fetch` |
| the deterministic cached flow, which reads a fixture and makes no api call | |

the skip is **declared, never silent** (`rule.forbid.test-skip`, human-authorized exception):

- each test file declares one scope constant that names this brief by path, and skips its live cases through it
- a `[scope]` case in each file asserts this brief exists, so the skip prints its reason on every run, and goes red if the brief is deleted without the skips undone

## .the cues

| when… | then… |
|---|---|
| CI is red on a USPTO `403` | 🔴 not a defect. a live case escaped the scope; skip it through the declared constant |
| you would add a new live USPTO case | add it through the declared scope, so it skips with the rest |
| you would fill, rotate, or chase `USPTO_ODP_API_KEY` to turn CI green | stop. CI does not need it while this brief stands |
| you would write a hermetic case that fakes the api boundary | ✅ in scope. hermetic cases still gate |

## .how to retire it

1. a human declares the live USPTO api supported again
2. swap each declared skip back to a plain `given`
3. delete the `[scope]` case in each test file, then this brief
4. run the live cases with a valid key, and expect them green

## .date researched

2026-10-25

(the date of the owner decision this brief records; no external source was consulted.)

## .publishability

☀️ **fullsun** (share) — a test-scope decision over a public api; no client identity, no credential, no internal path.

## .see also

- `../skills/patent.priors/patent.priors.search.integration.test.ts` — the declared scope, search side
- `../skills/patent.priors/patent.priors.fetch.integration.test.ts` — the declared scope, fetch side
