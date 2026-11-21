# F12 — run the live suite on an openrouter brain

- **the fork**: the live suite asked `anthropic/claude/haiku`; this box holds no prep anthropic key, so the one suite that reads a real verdict json had never passed. options: (a) switch the suite to `openrouter/deepseek/flash`; (b) leave it until a human fills the anthropic key.
- **taken**: (a). **why**: the suite proves the harness reads a real json off a real `rhx review` run; any API brain proves that. 8/8 passed on the switch. the gate's default brain is unchanged.
- **rework**: clean — one constant.
- **confidence**: 85%. the suite no longer exercises the anthropic adapter the gate itself boots.
- **verdict**: reversed in round i007. CI passes the integration suites `ANTHROPIC_API_KEY` alone (`.github/workflows/.test.yml:243`; the repo and org secrets hold no openrouter key), and this box holds `ehmpathy.test.ANTHROPIC_API_KEY`, which the integration runner unlocks. the suite asks `anthropic/claude/haiku` again and passes 9/9, the wish's own route-file commit among them (`[case3]`).
