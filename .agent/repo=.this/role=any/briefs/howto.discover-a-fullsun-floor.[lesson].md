# howto.discover-a-fullsun-floor

# tldr

## severity: nitpick

a **floor** is the best-found minimum stack for a problem, where every element traces to a named
authority. a **fullsun floor** is one that ships in daylight — so outsiders can review it, test it
against their own facts, and **break it**.

⭐ **the default for a floor built entirely on public law is ☀️ fullsun, not 🕶️ obscure.** the
obscure part is almost never the floor — it is the **instantiation**: your schema, your vendor, your
volume, your risk appetite. a floor assembled from public sources contains no secret to protect.

⚠️ **the common failure here is the over-tag, not the leak.** a 🕶️ tag on a derivable artifact feels
safe and costs the review that would have improved it.

⚠️ **a floor is never a peak, never a guarantee, and always dated.** every published floor carries
a standing frame that says so, because a floor read as a peak is worse than no floor at all.

---
---
---

# deets

## .what

three artifacts are easy to confuse, and only one of them is a floor:

| artifact | what it claims | can it ship ☀️? |
|----------|----------------|-----------------|
| a **fact brief** | the law says X | ✅ yes — it restates a mandate |
| a **floor** | ⭐ given the tracks, these are the minimum defenses, each with an authority, and here is where they still fail | ✅ **usually yes — see the sauce test** |
| an **instantiation** | *our* schema, *our* vendor, *our* thresholds, *our* trade | ⛔ no |

## .why

⭐ **an obscure floor cannot be reviewed by anyone outside, so it never improves.** that is the whole
cost, and it is larger than it looks:

- a floor you keep is a floor **only you** have stress-tested
- a floor you publish draws counter-examples from people who know things you do not
- ⭐ **the counter-example is the deliverable.** a floor's value concentrates in where it breaks, and
  you cannot find your own blind spot by a re-read of your own file

## ⭐ the sauce test — is there anything here only we know?

this is the question that decides the tag, and it is **not** "is this a tactic?"

> **does this artifact disclose anything a competent stranger could not have derived from public
> sources?**

three checks. if all three are **no**, the artifact is ☀️ fullsun **even though it is a tactic**:

| # | check | if yes → |
|---|-------|----------|
| 1 | does it name a **client, campaign, volume, vendor, schema, or config**? | 🕶️ / 🔒 |
| 2 | does it disclose a **choice we made** that the sources do not force? | 🕶️ |
| 3 | does it disclose our **risk appetite** — what we were willing to accept or trade? | 🕶️ |

⭐ **a tactic assembled entirely from public law is not secret sauce — it is a literature review with
an opinion attached. the sauce is what you cook with it.**

⚠️ **this is a real correction to how `rule.require.fullsun-facts-not-tactics` gets applied in
practice.** that rule's line — facts fullsun, tactics obscure — is sound where the tactic encodes a
business decision. it is **over-read** when it is applied to a synthesis whose every input is
public. the rule protects the decision, not the reading list.

### ⛔ a worked over-tag, from this repo

`counselor/briefs/market/comms/tactic.the-discovered-floor-against-a-tcpa-claim` was tagged 🕶️
**obscure** on the reasoning that a stack is a tactic. run the sauce test on it honestly:

| check | the file | verdict |
|-------|----------|---------|
| names a client, campaign, volume, vendor, schema, or config? | **no** — no company, no send volume, no record schema, no product | ✅ clean |
| discloses a choice the sources do not force? | ⚠️ **partly** — the stand-up order, and the "which gap matters most" call | 🕶️ |
| discloses risk appetite? | ⚠️ **partly** — the same two elements imply what we rank first | 🕶️ |

so **the six layers, their authorities, each layer's failure mode, and every named gap are all
derivable and disclose no sauce.** what is genuinely ours is **two elements**: the order, and the
gap ranking. **the file was tagged in full for the sake of two sections**, and the review that a
published floor attracts was the price.

⭐ **the fix is a split, not a tag.** publish the derived floor ☀️; hold the order and the ranking
🕶️. see the split table below.

## ⭐ the split — bundle it and you ship none of it

the move that changes the outcome, and it is almost always skipped.

| part of a floor | derived or ours | tag |
|-----------------|-----------------|-----|
| the list of **tracks** (what can hurt you) | derived — the statutes enumerate them | ☀️ |
| the **mechanism** that defeats each track | derived — the authority names it | ☀️ |
| ⭐ each mechanism's **own failure mode** | derived — the case law states it | ☀️ |
| the **gaps** — what no authority closes | derived — a null is a research result | ☀️ |
| the **order** to stand them up in | ⛔ ours — a business judgment | 🕶️ |
| ⭐ **which gap matters most** | ⛔ ours — a risk-appetite call | 🕶️ |
| **our** schema, vendor, thresholds, volume | ⛔ ours | 🕶️ / 🔒 |

⚠️ **the lesson is about *when*, not *what*.** the split is cheap before you write and expensive
after, because a bundled file's prose interleaves the two kinds. **decide the split in the phase-1
declaration** `rule.require.publishability-triage` already demands.

## how to discover a floor — five moves

### 1. enumerate the **tracks**, never the solutions

start from what can hurt you, not from what you might do. a solutions-first list is an instantiation
in a floor's clothes.

### 2. for each track, find the mechanism that defeats **that** track

one at a time. each mechanism must cite the authority that names it.

### 3. ⭐ cross-check — for each mechanism, name a track it does **not** defeat

**this is the move that produces the floor's real content.** the standard failure is to solve one
track and assume the mechanism carries. if you cannot name a track a mechanism fails to reach, you
have not tested it — you have asserted it.

### 4. for each mechanism, find its **own** failure mode

what defeats the defense. a mechanism with no stated failure mode is one nobody stress-tested.

### 5. the floor is what survives; the **gaps are what moves 3 and 4 surfaced**

⭐ **the gaps are part of the floor, not an appendix to it.** a floor published without its gaps is a
peak in disguise.

## the four tests a floor must pass to ship ☀️

| # | test | it fails when |
|---|------|---------------|
| 1 | **reconstruction** — could a second researcher derive each published element from the cited sources alone? | an element requires *our* judgment to reach |
| 2 | **track-crossing** — does every mechanism state at least one track it does **not** reach? | a mechanism is presented as general |
| 3 | **named null** — is every gap a *stated* null with a reason, never silence? | an absence reads as a non-issue |
| 4 | **decay** — does the floor name what new fact would change it? | it is dated but not falsifiable |

test 1 is the inverse of the blind red-team in `howto.test-obscurity-via-blind-convergence`: that
test asks *can a reader **recover** something withheld?*; this asks *can a reader **independently
derive** what is published?* ⭐ **an element that passes reveals no secret, because a reader could
have reached it without us.**

⚠️ **test 3 is the one that gets skipped.** silence about a gap is indistinguishable from a finding
that no gap exists, and a reader cannot tell which they hold. same defect as `rule.forbid.failhide`,
in prose.

## the standing frame every published floor must carry

verbatim, near the top, above the content:

```md
> ⚠️ **this is a floor, not a peak.** it is the best minimum we have found so far, and every
> element traces to a cited authority. it is **not** a guarantee, **not** a certification, and
> **not** complete — the gaps below are named because we found them, not because they are the only
> ones that exist. it is dated, and the law it rests on moves. **treat a counter-example as the most
> valuable reply this document can receive.**
```

⭐ **the last sentence is load-bearing.** it converts the artifact from a claim into an invitation,
which is the reason to publish a floor at all.

## .enforcement

- a floor published without the standing frame = **blocker**
- a floor whose gaps are absent rather than named (test 3) = **blocker**
- ⭐ a floor tagged 🕶️ in full where the sauce test returns clean on checks 1–3 = **nitpick**, and the
  fix is a **split**, not a re-tag of the whole
- a mechanism presented with no track it fails to reach (test 2) = **nitpick**

## .see also

- `rule.require.publishability-triage.[rule].md` — the two-phase workflow; the split belongs in **phase 1**
- `rule.require.fullsun-facts-not-tactics.[rule].md` — the fact/tactic line this brief bounds; ⚠️ it protects the **decision**, not the reading list
- `howto.test-obscurity-via-blind-convergence.[lesson].md` — the inverse test; run both
- `howto.redact-obscure-to-legal-facts.[lesson].md` — how to demote a bundled artifact after the fact
- `rule.require.bhrowser-citations.[rule].md` — a floor is only as publishable as its weakest citation
- `counselor/briefs/market/comms/tactic.the-discovered-floor-against-a-tcpa-claim.[lesson].md` — the worked over-tag this brief audits

## .the mantra

> a floor you keep is a floor only you have tested.
>
> a tactic built from public law is not sauce — it is a reading list with an opinion.
> the sauce is your schema, your volume, your appetite. publish the rest and let them break it.
>
> the gaps are the artifact. the counter-example is the reply you want.
