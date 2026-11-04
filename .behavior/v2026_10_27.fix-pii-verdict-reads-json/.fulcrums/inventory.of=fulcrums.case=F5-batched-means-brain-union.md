# F5 — "batched runs union per batch, as today"

- **the fork**: the gate has no batch loop. options: (a) read it as the extant union across `--brain` reviewers; (b) build per-batch reads.
- **taken**: (a). **why**: `rhx review` splits only on declared partitions; the gate passes no `--partition` and writes `--output` to a temp path with no route identity, so `getAllPartitionFlagsOfReviewRun` returns `[]`. one run, one json. "as today" = leave the union untouched.
- **rework**: clean — a per-partition read would be additive.
- **confidence**: 92%. only the wisher knows if "batch" pointed elsewhere.
