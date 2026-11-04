# F6 — read the LAST `├─ logs: ` line

- **the fork**: stdout may hold more than one `logs:` substring (an echoed path could contain one). options: first match; last match; anchored or not.
- **taken**: last match of `├─ logs: `. **why**: `rhx review` prints it in its closing `🔍 review` block (`genReviewOutputStdout.js:64`), after any echoed path. the glyph anchor narrows forgery further.
- **rework**: clean.
- **confidence**: 90%. a future `--partition` would print several dirs; noted in the yield.
