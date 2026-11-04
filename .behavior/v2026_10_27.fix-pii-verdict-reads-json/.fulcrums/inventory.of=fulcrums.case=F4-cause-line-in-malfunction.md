# F4 — a per-cause line in the malfunction report

- **the fork**: the wish asks that absent/unparseable/non-array json block; it does not ask the report to say which. options: (a) reuse the generic `no readable verdict` line; (b) add one `cause:` line per unread state.
- **taken**: (b): `no logs: line — the review skipped, or crashed before it wrote logs` · `no verdict json at <path>` · `verdict json unparseable at <path>` · `verdict json lacks .blockers/.nitpicks arrays at <path>`. **why**: a sharp path must teach its fix; an upstream rename and a locked keyrack need opposite fixes.
- **rework**: clean — one `echo` and four strings.
- **confidence**: 90%.
