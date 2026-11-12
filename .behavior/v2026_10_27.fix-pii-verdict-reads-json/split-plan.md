# split plan: rhight#54 → eight layer prs

#54 at head `c0e1735`: 112 files, +8449 / −413 vs `origin/main`. ~105 min of review. bar: 30 min per pr.

cut: eight layer prs, base first. each ≤ 24 min. each merges green alone, then the next rebases on it.

## .the review-time model

rates per changed line (added + deleted), set so #54 sums to ~105 min:

| kind | rate | #54 lines | #54 min |
|---|---|---|---|
| prod (sh, ts, yml, json) | 25 / min | 864 | 34.6 |
| tests | 70 / min | 3401 | 48.6 |
| snapshots | 150 / min | 1524 | 10.2 |
| docs (route, dreams, briefs) | 250 / min | 3073 | 12.3 |
| lockfile (generated, skimmed) | 150 / min | 553 | 3.7 |

a split file's lines are apportioned by function or test case span; those counts are estimates to ±10%.

## .the layers, in merge order

| pr | layer | depends on | prod | test | snap | docs | est. min |
|---|---|---|---|---|---|---|---|
| L1 | install repair | — | 83 + 553 lock | 0 | 0 | 9 | 7.1 |
| L2 | regex pass | L1 | 18 | 72 | 107 | 0 | 2.4 |
| L3a | brain verdict read (the #52 core + clamp) | L1 | ~250 | ~660 | 228 | 0 | 20.9 |
| L3b | brain verdict edge cases | L3a | ~150 | ~919 | 233 | 0 | 20.7 |
| L3c | brain malfunction remedies | L3b | ~165 | ~778 | 368 | 0 | 20.2 |
| L4 | pre-commit hook | L3c | 174 | 780 | 588 | 0 | 21.9 |
| L5 | cost bound + ci tiers | L4 | ~26 | 191 | 0 | 44 | 4.0 |
| L6 | route docs + dreams | L5 | 0 | 0 | 0 | 3023 | 12.1 |
| | **total** | | | | | | **109.3** |

L2 is independent of L3a–L5; it may merge in parallel after L1. the L3 chain stays serial: all three touch `run_one_reviewer` and `main` in `pii.scan.via.brain.sh`, so a parallel cut would collide.

## .L1 — install repair (base)

the tree must install and boot before any skill change can be tested.

| file | + | − |
|---|---|---|
| `package.json` | 16 | 6 |
| `pnpm-lock.yaml` | 553 diff lines (marked binary in numstat) | |
| `.depcheckrc.yml` | 5 | 0 |
| `src/domain.roles/{accountant,counselor,insurer,licenser,patenter,permiter,transcriber}/get*Role.ts` (7 files, drop self-boot onBoot, F1) | 7 | 49 |
| `.route/v2026_10_27.package.install/3.reason.for_rhachet-brains-openrouter.yield.md` (F2) | 9 | 0 |

## .L2 — regex pass

| file | + | − |
|---|---|---|
| `src/domain.roles/transcriber/skills/pii.scan/pii.scan.via.regex.sh` | 8 | 8 |
| `src/domain.roles/transcriber/skills/pii.scan/pii.scan.sh` | 1 | 1 |
| `…/pii.scan/pii.scan.via.regex.integration.test.ts` | 72 | 0 |
| `…/pii.scan/__snapshots__/pii.scan.via.regex.integration.test.ts.snap` | 107 | 0 |

## .L3a — brain verdict read (closes #52)

the wish itself: the verdict comes from `<logs>/output.response.json`. absent, unparseable, or non-array json → malfunction. batches union. carries the three clamp cases, and the red/green clamp quote moves to this pr's body.

`pii.scan.via.brain.sh` hunks (~250 lines):
- `get_verdict_of_review` (86) · `as_logs_dir_of_review` (4)
- the verdict read in `run_one_reviewer`; the regex parse goes (~80)
- the union over reviewers in `main`, plus the jq precondition (~60)
- the header comment for the verdict contract (~20)

`pii.scan.via.brain.integration.test.ts` (~660 lines):
- fakes `asFakeReviewBody`, `genRhxThatAnswers`, `genRhxThatAnswersPerBrain`, each with its `.mock` / `.why` / `.real` (~200)
- case 18 digit path vs verdict, the clamp (153)
- case 19 untrusted json: absent, unparseable, non-array (180)
- case 20 three reviewers union (127)

snapshot slice: keys `[case18]`–`[case20]` (228 lines).

## .L3b — brain verdict edge cases

edges of the same read: retry, skip, stale logs, lockfile cuts, renames.

`pii.scan.via.brain.sh` hunks (~150 lines):
- `as_skip_kind_of_review` (13) · `print_skipped_branch` (16) · `del_content_of_review_logs` (20)
- `LOCKFILE_GLOBS`, `--paths-wout`, `--polluters keep` (F10) in `collect_files` and `main` (~50)
- the retry on no verdict in `run_one_reviewer` (~30)
- `scope_label` edits (~20)

test (~919 lines): fake `genRhxThatSkips` plus the other fixture edits (~100) · cases 21 retry (81), 23 echoed logs line (110), 25 reviewer contract of the installed bhrain (95), 26 route-file digit (57), 29 renamed verdict json (56), 31 log dir after the read (151), 32 lockfile cut whole (125), 35 prior report (42), 36 run from a subdir (36), 38 staged rename (66).

snapshot slice: keys `[case21]`, `[case23]`, `[case26]`, `[case29]`, `[case31]`, `[case32]`, `[case35]`, `[case36]`, `[case38]` (233 lines).

## .L3c — brain malfunction remedies

every refusal names its cause and its fix.

`pii.scan.via.brain.sh` hunks (~165 lines):
- `need_value` (15) · `as_tree_tail_closed` (19) · `asBrainKeyName` (6)
- `parse_args` / `validate` / `print_usage` edits (~80)
- cause-kind remedy lines in `run_one_reviewer` (~30)
- the rhx precondition (~10)

test (~778 lines): cases 22 no jq (41), 24 flag value absent (53), 27 empty scope (50), 28 overflow (69), 30 unlisted refusal header (58), 33 no rhx (37), 34 absent brain key (103), 37 crash stack trace (56) · the snapshot thens and edits on cases 1–17 (~311).

snapshot slice: keys `[case1]`–`[case17]` (176), plus `[case22]`, `[case24]`, `[case27]`, `[case28]`, `[case30]`, `[case33]`, `[case34]`, `[case37]` (192) = 368 lines.

## .L4 — pre-commit hook

| file | + | − |
|---|---|---|
| `.husky/check.pii.sh` | 123 | 48 |
| `.gitignore` (pii-review ignore) | 3 | 0 |
| `.husky/check.pii.integration.test.ts` | 606 | 61 |
| `.husky/check.pii.guarantee.integration.test.ts` | 98 | 15 |
| `.husky/__snapshots__/check.pii.integration.test.ts.snap` | 421 | 0 |
| `.husky/__snapshots__/check.pii.guarantee.integration.test.ts.snap` | 167 | 0 |

## .L5 — cost bound + ci tiers

| file | + | − |
|---|---|---|
| `pii.scan.via.brain.sh` — the haiku default + cost-bound comment in `main` (F15) | ~5 | ~1 |
| `src/.test/RUN_BRAIN_TEST.ts` (F16) | 10 | 0 |
| `…/pii.scan/pii.scan.via.brain.live.integration.test.ts` | 156 | 35 |
| `.github/workflows/{.test,publish,test}.yml` — anthropic secret cut | 0 | 7 |
| `.agent/keyrack.yml` | 3 | 1 |
| `.agent/repo=.this/role=any/briefs/rule.require.live-brain-cost-bound.md` | 41 | 0 |
| `.agent/repo=.this/role=any/boot.yml` | 3 | 0 |

## .L6 — route docs + dreams

| path | lines |
|---|---|
| `.behavior/v2026_10_27.fix-pii-verdict-reads-json/**` (wish, vision, 5.1, 5.3, seeds, fulcrums, passage, dream links, this plan) | 2793 |
| `.dream/**` (10 dreams) | 230 |

## .rules for each layer pr

- each layer's tree holds only its own snapshot keys. a key whose case lands later stays out, or `jest --ci` fails on an unwritten snapshot
- each layer runs `npm run test` green on its own tree before its pr opens. the brain tests stay on the fake `rhx` (tier 1); no live call in ci
- each commit passes the pii pre-commit gate on haiku via the api key. no `--no-verify`
- a layer that runs > 30 min on a re-measure splits again by case span before it opens; it never ships over the bar
- none merges; the commander reviews each

## .kept out of every layer

| path | reason |
|---|---|
| `.agent/.actors/**` | box-local actor config (settings, gitignore, settings.of.repo.json*) |
| `.claude` (link) | host-only link to the actor's brain dir |
| ` D .claude/settings.json` | host-only: the link replaced the tracked file on this box |
| `.behavior/…/.goals/` | achiever memory of this seat, untracked, never in #54 |

## .what becomes of #54

it stays open, untouched, as the reference until L1 opens; then it closes as superseded by L1–L6. each layer pr cites #54 and its own position (`layer N of 8`).

fulcrum: F17 (the review-time rates and the hunk apportionment).
