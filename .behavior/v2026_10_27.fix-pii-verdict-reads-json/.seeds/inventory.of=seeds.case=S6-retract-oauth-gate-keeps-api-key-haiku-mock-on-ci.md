# S6 — retract the oauth order: the gate keeps the api key on haiku; ci runs a documented mock

## .said

RETRACTION. the 2026-10-30 order to run the pii gate on CLAUDE_CODE_OAUTH_TOKEN / ambient auth is void. commander rule: the pii gate is a safety guard, so it keeps its real-brain run at precommit on the api key, haiku 5-5, a narrow context, under $0.50 per run. on cicd its integration test runs on a documented mock (.mock/.why/.real), not a warn-and-pass. drop the todos "gate reviews on ambient auth" and "api key absent on CI: warn loudly"; your commits 2 and 3 go through the gate on the api-key path, then push (rhight is pii: push at done). full rule: bulletin live-brain-tests-three-tiers. reply with the plan and an hour.

## .settled

- S5's oauth path is void; the gate stays on `ANTHROPIC_API_KEY`
- the gate's real brain runs at precommit only, on haiku, narrow context, under $0.50 per run
- ci runs the gate's stubbed suites, each fake marked `.mock` / `.why` / `.real`; no warn-and-pass
- the ambient-auth and warn-on-ci todos are dropped
- commits 2 and 3 pass the gate on the api key, then push

## .landed

| where | what |
|---|---|
| `pii.scan.via.brain.sh` `DEFAULT_BRAINS` | `anthropic/claude/haiku`; cost bound stated by construction (F15) |
| `pii.scan.via.brain.live.integration.test.ts` | runs only under `BRAIN_LIVE=true` (F16) |
| `.github/workflows/{test,publish,.test}.yml` | no anthropic secret |
| stubbed suites | `.mock` / `.why` / `.real` at each fake |
| `.agent/repo=.this/role=any/briefs/rule.require.live-brain-cost-bound.md` | the repo's cost bound, enbriefed |
| commits 2 and 3 | held: test key out of credit (probe 2026-10-31), prep holds no anthropic key |
