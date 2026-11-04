# rule.require.live-brain-cost-bound

> **a live-brain call in this repo spends only where a safety guard needs it, on haiku, under $0.50 per run. tests spend naught by default.**

## .the three tiers

| tier | what | where the real brain runs |
|---|---|---|
| 1. safety guard | the pre-commit pii gate (`pii.scan --via brain`) | at commit, on `ANTHROPIC_API_KEY` |
| 1. its tests | `pii.scan.via.brain.integration.test.ts`, `.husky/check.pii*.integration.test.ts` | never: a fake `rhx` / stub brain, each marked `.mock` / `.why` / `.real` |
| 3. every other live test | `pii.scan.via.brain.live.integration.test.ts` | only when `BRAIN_LIVE=true` targets it (`src/.test/RUN_BRAIN_TEST.ts`) |

tier 2 (acceptance smoke tests against a real brain) belongs to rhachet, not this repo.

ci holds no anthropic key. no workflow passes `ANTHROPIC_API_KEY`.

## .the cost bound

- model: `anthropic/claude/haiku`, the cheapest in the catalog. never a pricier default
- context: the staged diff plus the pii rubric and the role's briefs, in push mode
- spend: under $0.50 per run, by construction. `rhx review` refuses a prompt past 150k tokens; at $1/MTok in and $5/MTok out one attempt costs ~$0.15 plus cents, and the gate makes at most two
- auth: the api key. never an oauth token, in the gate or in a test

## .the test, before you add or grow a live call

does it replace spend, or add it? add → forbidden. a larger model, a wider prompt, or a new live test needs a matched cut elsewhere.

before a spend ask (out of credit): read who spent the key, rank the callers, test the path that costs naught. no caller read → no ask.

## .enforcement

- a live-brain test that runs on a ci push = blocker
- a gate default above haiku, or a run whose bound tops $0.50 = blocker
- a stubbed brain with no `.mock` / `.why` / `.real` = blocker
- an anthropic key wired into a ci workflow = blocker
- a spend ask with no caller table = blocker

## .see also

- `rule.forbid.test-skip.[rule].md` — the `BRAIN_LIVE` gate is its human-authorized exception: named flag, documented reason, clear path to run
- `howto.mock-cli-via-path.[lesson].md` — how the fake `rhx` rides PATH
