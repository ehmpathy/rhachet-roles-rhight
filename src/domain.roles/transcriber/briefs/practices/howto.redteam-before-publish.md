# howto.redteam-before-publish

## .what

before a repo or package goes public, red-team it as a stranger would: can the published set identify a real person or entity, or arm a pretext against them?

four layers, cheapest first. each catches what the one before it structurally cannot.

```sh
rhx publish.redteam                                   # L1 + L2 over the published set
rhx publish.redteam --demo <dir> --history            # + demo verify, + every ref
rhx publish.redteam --emit-blind .temp/blind.md       # + the L3 prompt
rhx publish.redteam --mode plan                       # what would run, no scan
```

exit 0 clean · 2 findings · 1 malfunction. every value in the report is masked (`Ab***`).

## .why

a clean `pii.scan` says the **worktree** carries no known shape. a release ships something else:

- the **index**, not the worktree — a fix left unstaged ships the leak
- the **history** — a value scrubbed in the last commit is one `git log -p` away
- the **build** — `dist/` can be stale and carry what the source dropped
- the **transform** — a pseudonym whose offset is stated is reversible by arithmetic

> the pseudonym is rarely the protection. the author line, the LICENSE, or the issue tracker usually collapses the anonymity set to one. the real protection is that the **verification answers** — dates, amounts, file numbers, filed status — were never published.

## .the layers

| layer | what | catches | misses |
|---|---|---|---|
| **L1 deterministic** | roster over the index snapshot · shape detectors (`pii.scan`) · `doc.pseudonymize --verify` per demo | a known real value, in any file or path | a value nobody put in the roster |
| **L2 surface** | the publication checklist below | leaks no per-file scan can see | a fact harmless alone and fatal in combination |
| **L3 blind review** | a brain with no map, no history, no folders reads only the published set and builds a dossier | the combination; the join; the pretext | any file it was not handed |
| **L4 triage** | likelihood × impact → P0 / P1 / P2 | — | — |

⛔ **L3 is emit-only.** the skill holds the roster and the history, so it cannot be the stranger. `--emit-blind` writes the prompt and the published file list; run it in a fresh agent whose only access is that list.

## .the L2 checklist

| check | the question | severity |
|---|---|---|
| a. drift | is any path staged AND changed after? scan the staged blob (`git show :path`), not the file | P0 if the index leaks, else P1 |
| b. history | does any commit on any ref carry a roster value? is `origin/main` clean? | P1 — owner decision |
| c. dist | does the build output carry a roster value? rebuild, then rescan | P0 |
| d. transform | does published text state the size or shape of the pseudonym transform — a day count, an amount, *"weekday kept"*, *"fixed offset"*? | P0 with a magnitude, P2 hint |
| e. twins | is a real date published in another format? does a file hold a date pair that spans a mapped offset? | P0 / P2 |
| f. oracles | is there an md5 / sha1 / sha256 of a roster value? a digest of a short name is a confirmation oracle: guess, hash, compare | P0 |
| g. evidence | is every real-evidence dir ignored AND untracked, except the declared public demo? | P0 |
| h. money | does profit, loss, NOL, or filed status sit beside a depicted entity? | P2 — human review |

## .the blind-review prompt

the skill emits this; keep its shape if you write one by hand.

```md
you are a stranger with bad intent. you hold ONLY the listed files.

## constraints
- read only the listed paths
- forbidden: git history, other branches, stashes, any map or roster,
  ignored or untracked paths, scratch/temp dirs, local folders
- no web access. reason about what a search would return; do not run one
- mask any value that looks real: first two chars + ***

## output sections
1. depicted parties — every fact about each corp and person
2. re-identification — queries, and the anonymity set after each join
3. malicious uses — KBA answers, pretext calls, filings, reputational harm
4. top 10 — ranked by likelihood x impact, with paths
5. suspected real slips — masked, with path and reason

## the published set
- <one path per line, from `git ls-files`>
```

## .triage

| tier | means | examples |
|---|---|---|
| **P0** | fix before release | a roster value in the index or dist · a staged leak · a stated transform magnitude · an oracle · a tracked evidence dir |
| **P1** | owner decision | history that carries a value · drift the owner must settle |
| **P2** | human review | money terms beside an entity · a transform hint · a date-pair twin |

fix the clear defects in place. escalate these — none can be done from a branch:

- **history rewrite** — and even then, forks, clones, and `refs/pull/*` keep it
- **repo visibility** — private until the P1 set is settled
- **unpublish** a package version whose tarball carries a value
- **rotate** what can rotate; name what cannot (a birth date, an SSN)

## .the lessons

- **stage before you scan.** the commit ships the index. a scan of the worktree grades a tree nobody will publish
- **rebuild before you scan dist.** a stale build is a second, older copy of the source
- **never publish the transform.** say *"dates shifted, figures perturbed"* — never the size, never the shape (`rule.forbid.auth-escalation-disclosures`)
- **one real value beside its twin solves the offset.** a real date in a brief and its shifted twin in the demo publish the key
- **pseudonymize money? no — cut it.** a perturbed loss still says loss, and its order of magnitude (`rule.forbid.financial-position-disclosures`)
- **a guard that names what it guards is a leak.** an ignore line, a test regex, or a hash that spells the entity has published it
- **masks in reports only.** a red-team report is the output most likely to be pasted into an issue; the mask is fixed-width so its length is no clue
- **the author join collapses the set.** assume a stranger can name the person; protect the answers a support agent would ask

## .see also

- `rhx publish.redteam` — the entool of this brief
- `rule.require.pii-scan-before-commit` — the per-commit gate; this is the per-release red team
- `rule.forbid.auth-escalation-disclosures` — the verification answers L3 hunts for
- `rule.forbid.financial-position-disclosures` — what L2h flags for review
- `rule.require.provable-pseudonymization` — what L1's demo verify proves, and no more
- `rule.require.collision-checked-pseudonyms` — how the synthetic twins are chosen
