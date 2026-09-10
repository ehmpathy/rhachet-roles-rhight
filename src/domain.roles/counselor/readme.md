## ⚖️ counselor

- **scale**: transaction-level, risk advisory
- **focus**: contracts, liability mechanisms, protection structure, dispute resolution
- **maximizes**: a defensible position, stated from the law rather than from preference

used to advise on the mechanisms that allocate legal risk — what a rule requires, what it costs to
miss it, and what defenses the same rule names.

## scope

counselor spans **two subject folders**, each with its own index:

| folder | subject | the question it answers |
|--------|---------|-------------------------|
| `briefs/practices/` | homeowner ↔ contractor transactions | "how do I protect myself when I hire?" |
| `briefs/market/` | referrals, rewards, reviews, comms — promotion law | "is this promotion structure lawful?" — see `market/_taxonomy/_.glossary` |

within `market/`, the subject folders split on two axes:

| folder | axis | the question |
|--------|------|--------------|
| `market/referrals/` · `market/rewards/` · `market/reviews/` | **structure** | "is this promotion structure lawful?" |
| `market/comms/` | **channel** | "may I contact this number, and what if I cannot prove consent?" — see `market/comms/_taxonomy/_.glossary` |

⭐ **`comms/` sits under `market/` because a message is market conduct either way** — the federal
written-consent standard attaches to *telemarketing*, and a transactional message exists to
facilitate the transaction the rest of the folder governs.

within the transactions folder, counselor advises **which mechanisms to use** and **how to structure
protection**:

| mechanism | what it is | counselor's role |
|-----------|------------|----------------|
| insurance | risk transfer | advise what coverage to require |
| bonds | surety guarantee | advise to verify, how to claim |
| contracts | enforceable terms | advise structure, payment gates |
| lien waivers | liability release | advise to require |
| license boards | regulatory enforcement | advise as leverage/recourse |
| small claims | judicial enforcement | advise when/how to pursue |

⚠️ **the two axes do NOT share a state basis.** `market/`'s structure folders run the five-state
baseline (TX · IN · FL · CA · NY). `market/comms/` is **federal-first** — its five-state sweep is
carried by one brief and is statutory text only. a reader who assumes the baseline covers `comms/`
the way it covers `rewards/` will be wrong.

## skills

### `briefs.integrity`

check every markdown brief against the mechanical invariants — the checks the automated peer
reviewers structurally cannot run, because their globs are `**/*.{ts,sh}` and a brief corpus is
markdown.

```sh
rhx briefs.integrity                                        # the whole roles tree
rhx briefs.integrity --path src/domain.roles/counselor      # one role
rhx briefs.integrity --severity blocker --format json       # for a hook or a gate
```

| check | what it catches |
|-------|-----------------|
| `see-also-target-absent` | a `.see also` link that does not open (usually a wrong `../` depth) |
| `sources-below-seven` | under the citation floor |
| `source-anchor-unreferenced` | a numbered source no body sentence uses — a pad |
| `not-advice-callout-absent` | no `not legal advice` callout |
| `date-researched-absent` | no `## .date researched` section |
| `publishability-tag-absent` | no triage tag |
| `absence-claim-falsified-exact` | a file that claims text is absent while it holds that text |
| `fullsun-names-non-fullsun` | ⭐ a public brief that names a withheld one — the leak a blind red-team found four times |

exit `0` = no blocker · `1` = malfunction · `2` = blocker detected, or bad input.

⚠️ **the default scope is the whole roles tree, on purpose.** the cross-file check can only see the
set it is given, so a narrower default would leave it silently weaker than it looks. `--path` narrows
it and says so on stderr.

## relationship to other roles

| role | scope | handoff |
|------|-------|---------|
| **permiter** | permit requirements, code citations | "is permit required?" |
| **insurer** | coverage analysis, claim defense | "will policy cover this?" |
| **counselor** | protection structure, recourse | "how do I protect myself?" |

## disclaimer

> this content is for informational purposes only and does not constitute legal advice. consult a licensed attorney for advice specific to your situation.
