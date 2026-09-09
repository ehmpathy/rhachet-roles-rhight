# rule.require.briefs-integrity-gate

# tldr

## severity: blocker

`briefs.integrity` is the **standing automated gate** for the publishability rules — it is what turns
`rule.require.publishability-triage` and `rule.forbid.audit-trail-in-shipped-briefs` from prose into a
build-time check. it MUST stay wired into `build:verify:publishability`, that step MUST stay in
`build:complete`, and the gate MUST pass before any publish or release.

a publishability rule a human has to remember to run is a rule that eventually ships a leak. the gate
is the memory. **never unwire it, never downgrade its severity below blocker, and run it before you
ship a brief.**

---
---
---

# deets

## .what

the `briefs.integrity` skill (`src/domain.roles/counselor/skills/briefs.integrity/`) scans the brief
tree for publishability defects and exits non-zero on a blocker. it is wired into the build:

```
build:verify:publishability  →  briefs.integrity.sh --check non-fullsun-in-published-path \
                                                     --check internal-scaffold-leaked-in-fullsun \
                                                     --severity blocker
build:complete               →  npm run build:verify:publishability && … (dist + repo)
build                        →  … && npm run build:complete --if-present
prepublish / preversion      →  npm run build   (so the gate runs before every publish + version)
```

so the gate already fires before publish. this rule makes that wiring **load-bearing and durable** —
a fact of record, not an accident of a build step nobody may touch.

## .why

- **a manual gate is a leak with a delay.** the whole point of `rule.require.publishability-triage`
  and `rule.forbid.audit-trail-in-shipped-briefs` is to keep client-specific and process-exhaust
  content out of the public tree. a check a human runs by memory is skipped the one time it matters.
- **the gate is the enforcement arm of the publishability rules.** those rules state WHAT is
  forbidden; `briefs.integrity` is what DETECTS it, repeatably, on every build. unwire it and the
  rules become aspirational.
- **it must sit in the publish path, not only in CI.** `prepublish` and `preversion` both route
  through `npm run build`, so the gate guards the npm publish and the release-version bump directly —
  the two moments a leak actually reaches the public.

## .what the gate MUST keep

| invariant | why |
|-----------|-----|
| `build:verify:publishability` invokes `briefs.integrity.sh` at `--severity blocker` | a non-blocker gate does not stop a publish |
| `build:complete` runs `build:verify:publishability` **first** | a leak must fail the build before dist is assembled |
| `build` runs `build:complete` | so `prepublish` / `preversion` inherit the gate |
| every new publishability rule that is mechanizable gets a `--check` | the gate must grow with the rules, or it drifts behind them |

## .how — run it before you ship a brief

do not wait for CI. when you author or edit a shipped brief, run the gate locally:

```sh
# the whole publish gate (both checks, blocker severity)
npm run build:verify:publishability

# scoped to one folder, json output (allowlisted invocations)
./src/domain.roles/counselor/skills/briefs.integrity/briefs.integrity.sh \
  --path src/domain.roles/counselor/briefs/market/comms --format json

# one check only
./src/domain.roles/counselor/skills/briefs.integrity/briefs.integrity.sh \
  --path src/domain.roles/counselor/briefs/market/comms \
  --check source-anchor-unreferenced --format json
```

## .the growth mandate

when a new publishability rule lands and its defect is mechanically detectable, add a `--check` to
`briefs.integrity` and wire it into `build:verify:publishability`. a publishability rule with a
mechanizable defect and no gate check is a **gap**: it relies on a reviewer catching by eye what a
gate could catch every build.

⚠️ **known open extension:** `rule.forbid.audit-trail-in-shipped-briefs` is enforced today by review,
not by a `briefs.integrity` check. its audit-trail phrases (red-team findings, "re-read owed",
citation-quota arithmetic, withheld-file mentions) are detectable, so a `--check
audit-trail-in-fullsun` is a natural next check to add.

## .enforcement

- a change that removes `briefs.integrity` from `build:verify:publishability`, or removes
  `build:verify:publishability` from `build:complete` = **blocker**
- a downgrade of the gate below `--severity blocker` = **blocker**
- a shipped brief authored or edited without running the gate, that then fails it in CI = **blocker**
  (the gate exists precisely so this is caught locally first)
- a new mechanizable publishability rule shipped with no corresponding `--check` = **nitpick**
  (a gap to close, tracked, not a release-stopper on its own)

## .see also

- `rule.require.publishability-triage.[rule].md` — the two-phase triage this gate mechanizes
- `rule.forbid.audit-trail-in-shipped-briefs.[rule].md` — the strip rule; a natural next `--check`
- `rule.require.fullsun-facts-not-tactics.[rule].md` — the neutral-voice rule the fullsun checks defend
