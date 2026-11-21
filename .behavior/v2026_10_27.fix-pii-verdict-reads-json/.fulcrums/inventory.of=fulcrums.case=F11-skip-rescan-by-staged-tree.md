# F11 — skip husky's second pass by staged-tree hash

- **the fork**: `husky.sh` re-execs `pre-commit`, which sources `check.pii.sh` again: two paid reviews per commit. options: (a) skip when `husky_skip_init` is set; (b) record the staged tree (`git write-tree`) after a clean scan and skip only when the same tree is seen; (c) leave the double run.
- **taken**: (b). **why**: (a) is a bypass — `husky_skip_init=1 git commit` would skip the gate. (b) skips only a tree already scanned clean in this chain; a changed set rescans (`[case12][t1]`). the argv build moved into a function so `set --` stays local (`[case12][t2]`).
- **rework**: clean — one block in the hook.
- **confidence**: 82%. `git write-tree` writes the index tree object a commit writes anyway; a hand-set `PII_SCAN_CLEAN_TREE` equal to the staged tree hash skips the scan, a deliberate act on par with `--no-verify`.
