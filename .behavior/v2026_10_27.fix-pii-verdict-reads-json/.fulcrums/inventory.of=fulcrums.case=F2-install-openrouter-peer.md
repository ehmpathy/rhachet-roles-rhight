# F2 — install `rhachet-brains-openrouter@0.1.4`

- **the fork**: every route peer review malfunctioned: `brain 'openrouter/deepseek/flash' is not registered`. options: (a) install the peer bhrain 0.42.4 declares (`rhachet-brains-openrouter >=0.1.3`); (b) pass `--brain` with a registered brain in each guard; (c) pin bhrain back.
- **taken**: (a) at bhrain's own dev pin, 0.1.4. **why**: it is a declared peer, unmet; (b) edits generated guards; (c) undoes the upgrade.
- **rework**: clean — one devDependency.
- **confidence**: 90%. it adds a dependency the wish did not mention; it also makes the commit gate's sibling tooling work in this tree.
- **also**: `.depcheckrc.yml` ignores the brain (loaded by bhrain, not imported here), and ignores `.agent/.actors` + `.claude`, the local actor dirs `rhx enroll` links in.
