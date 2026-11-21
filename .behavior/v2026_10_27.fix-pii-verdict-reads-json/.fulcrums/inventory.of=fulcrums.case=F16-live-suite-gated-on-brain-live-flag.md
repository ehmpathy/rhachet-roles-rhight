# F16 — gate the live suite on `BRAIN_LIVE=true`, and drop the anthropic secret from ci

- **the fork**: the bulletin puts a safety guard's real brain at precommit and its ci test on a mock; any other live test runs only when a named flag targets it. `rule.forbid.test-skip` forbids `given.runIf` absent a human-authorized, documented exception. options: (a) `given.runIf(RUN_BRAIN_TEST)` on the live suite, the flag bhuild already uses (`BRAIN_LIVE`); (b) move the file out of the integration glob into a separate jest config; (c) leave it in ci.
- **taken**: (a), plus the anthropic secret cut from all three workflows, so ci cannot spend the key even by accident. the commander rule is the human authorization; the reason and the run path sit in the suite and in `src/.test/RUN_BRAIN_TEST.ts`.
- **rework**: clean — one wrapper and one flag file; (b) is a config move.
- **confidence**: 85%: (b) avoids a skip construct, but splits from the fleet's flag.
- **where**: `pii.scan.via.brain.live.integration.test.ts`; `src/.test/RUN_BRAIN_TEST.ts`; `.github/workflows/`.
