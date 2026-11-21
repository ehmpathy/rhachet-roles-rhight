# F10 — keep route paperwork in the brain's scope; cut lockfiles

- **the fork**: `rhx review` drops route paperwork, dreams, and lockfiles from scope by default. a commit of only such paths — the wish's own `.route/…/blocker/5.briefs.short.md` — resolves to zero files, prints no `logs:` line, and blocks as a malfunction; a mixed commit hides them from the brain. options: (a) keep every polluter; (b) keep the default, and read the zero-scope refusal as a pass; (c) keep route paperwork and dreams, cut lockfiles.
- **taken**: (c). `--polluters keep` plus `--paths-wout '**/pnpm-lock.yaml' '**/package-lock.json' '**/yarn.lock'`, and the gate splits cut paths (lockfiles, dirs) off before its own empty check, so a set made only of them passes with each path named.
- **why**: route paperwork and dreams are prose a human writes, so they can carry PII; (b) would wave them past the brain unread. a lockfile holds names and hashes, the regex pass skips it by default, and it rides to the brain as its full body (`rhachet-roles-bhrain/dist/domain.operations/review/asTargetSection.js:28`), so it alone overflows the window: this route's staged set measured 111.4% of the opus window with it, 66.5% without.
- **evidence**: real `rhx review`: default → `✋ ConstraintError: combined scope resolves to zero files`, no logs line; keep → a logs line and a 0/0 json. clamps: `[case26]` (route file alone), `[case32]` (lockfile alone, dir symlink alone, lockfile beside a letter), each red on the prior skill and green on the cure.
- **rework**: clean — two flags and one split in `main`.
- **confidence**: 90%. a new lockfile name (e.g. `bun.lockb`) would ride along until added to `LOCKFILE_GLOBS`; the overflow refusal names it if so (`[case28]`).
- **verdict**: (c) stands.
