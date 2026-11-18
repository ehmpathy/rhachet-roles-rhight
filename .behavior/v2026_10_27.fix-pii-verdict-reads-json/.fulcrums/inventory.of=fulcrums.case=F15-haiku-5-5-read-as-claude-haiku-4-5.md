# F15 — read "haiku 5-5" as `anthropic/claude/haiku`, which resolves to haiku 4.5

- **the fork**: the commander rule names "haiku 5-5". the installed `rhachet-brains-anthropic@0.4.3` catalog holds no haiku 5.5; `claude/haiku` maps to `claude-haiku-4-5-20251001` (`BrainAtom.config.js:258`), the cheapest model it offers. options: (a) take the alias, which moves with upstream; (b) pin `claude/haiku/v4.5`; (c) halt for a 5.5 slug that does not exist.
- **taken**: (a). the rule's intent is the cheapest haiku; the alias follows upstream to a haiku 5.5 the day the catalog ships one, with no edit here.
- **rework**: clean — one string in `DEFAULT_BRAINS`.
- **confidence**: 85%: "5-5" may name a model this catalog does not yet hold.
- **where**: `pii.scan.via.brain.sh` `DEFAULT_BRAINS`; clamp `the default reviewer is haiku, never a pricier model`.
