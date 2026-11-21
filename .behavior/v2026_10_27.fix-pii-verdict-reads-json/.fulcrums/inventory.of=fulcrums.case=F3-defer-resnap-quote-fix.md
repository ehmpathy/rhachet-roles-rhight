# F3 — defer the `RESNAP` quote fix

- **the fork**: `[ -n $RESNAP ]` unquoted is always true, so every test run passes `--updateSnapshot`. the one-line quote fix makes 4 extant snapshots in other roles' tests go red (dates and temp paths baked in). options: (a) fix it here and mask those tests; (b) defer.
- **taken**: (b), with a caught dream: `dreams/v2026_10_27.defect.test-scripts-always-update-snapshots.md`. **why**: SAFE yes, CLEAN no — it ripples into patent.propose, transcribe.pdf, and an unwalked acceptance suite, far from the pii gate.
- **cost of the deferral**: in CI, the new pii snapshots are writes, not checks. the clamp keeps its teeth via its explicit assertions: with the cure reverted, 8 non-snapshot assertions went red.
- **rework**: clean to un-defer — the dream holds the fix's shape.
- **confidence**: 85%. a reviewer could fairly say a snapshot gate that never fails is worth the ripple now.
