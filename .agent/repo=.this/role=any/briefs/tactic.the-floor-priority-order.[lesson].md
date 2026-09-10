# tactic.the-floor-priority-order

## .what

the 🕶️ **obscure remainder** split out of the discovered TCPA floor — the two elements that are
**ours** rather than the law's: the **order** to stand the layers up in, and **which gap we rank
first**.

⭐ **scoped to one archetype: an online business that serves customers in all fifty states.** that is
not an incidental detail. an online business does not *choose* a footprint — the footprint is
wherever a customer signs up — so it is exposed to every state's mini-TCPA at once, and it acquires
consent through an **asynchronous written flow** rather than a conversation. both facts change the
order, and the second one produces a structural problem set out below.

⭐ **the split exists because a bundle costs the review.** per
`howto.discover-a-fullsun-floor.[lesson].md`, an artifact takes the most restrictive tag of any part
inside it — so two judgment sections held ~85% of a publishable floor out of daylight. they are here
instead.

⛔ **and this file lives OUTSIDE the packaged tree on purpose.** `src/domain.roles/**` is rsync'd into
`dist`, `dist` is in the package's `files`, and the package is public — so a 🕶️ brief left under
`src/` **ships**, and its tag records an intent the build never enforced. the
`non-fullsun-in-published-path` check now blocks exactly that, and this file's location is what
satisfies it.

⚠️ **"outside the package" is not "private."** the git repo is public, so this file is still
world-readable on the forge. it is withheld from **npm consumers**, not from the world. a document
that must not be seen at all belongs in neither tree.

> **recommendation disclaimer.** this priority order is offered to the best of our knowledge, based
> on the information found in research — it carries **no guarantee of success or outcome**, and it
> must be reviewed by a licensed professional (attorney / broker / licensed advisor) against your own
> real scenario and current law before any reliance. it is groundwork for that review, not a
> substitute for it.

> **not legal advice.** informational groundwork for counsel to validate.

---

## ⭐ the structural problem an online model creates

this is the result that most changes the picture for this archetype, and no single brief in the set
states it — it falls out of two facts held in different files.

**fact one, from the five-state sweep:** two of the five states demand a *live, per-call* consent.
California requires an *"unrecorded, natural voice announcement"* that must *"[i]nquire as to whether
the person called consents"* before a recorded message plays; Indiana offers a route where the
message is *"immediately preceded by a live operator who obtains the subscriber's consent."*

**fact two, from the model:** an online business acquires consent through a **web form**. there is no
operator, no call, and no moment at which a human could inquire.

⛔ **so this is not a records problem that a better schema fixes.** a written record is the *only*
artifact an online signup can produce, and in these states a written record is **not what the statute
asks for**. the gap sits between the acquisition model and the statute, not between the record and
the requirement.

⚠️ **and note which direction that cuts.** these provisions attach to the *outbound* message class,
so the practical consequence is likely a **channel restriction** in those states rather than a
consent redesign — but ⬜ **which messages are actually caught was not researched**, and that is the
question counsel should be asked first for this archetype.

⭐ **the same model that creates this problem hands you the strongest possible layer 5.** a signup
flow is a UI you control, and the formation case law turns on exactly that: a labeled button with
terms disclosed adjacent forms assent; a reference set apart from the act does not (`Soliman`). an
online business is better placed than almost any other to form an enforceable arbitration clause —
the layer that governs the size of the number.

---

## the order to stand them up in, and why

⚠️ **not by legal weight — by how hard each is to retrofit.** the layers are numbered per the floor
brief.

| # | stand up | why here |
|---|----------|----------|
| 1 | **layer 5** (the arbitration clause) | ⭐ it governs every message sent **after** it and cannot be applied backwards, so its cost grows daily. and for this archetype it is the cheapest layer to get right — it lives in a signup flow you already control |
| 2 | **layer 6** (cover) | ⛔ the only layer with a hard deadline set by someone else — a claim closes it permanently |
| 3 | **layers 1–2** (consent + revocation) | they gate the sends; every message before them is exposure a later fix does not reach |
| 4 | **layers 3–4** (suppression + registry scrub) | the program can stand up on an extant channel without a re-consent of the base |

⚠️ **this is a judgment, not a legal order of weight.** it follows from which layers are retroactive
(none are) and which have externally-set deadlines (layer 6), but the sources do not compel it, and a
different risk posture yields a different order.

## ⭐ which gap we rank first

the floor brief names its gaps without a priority, because a priority is an appetite statement. ours,
**for an all-states online business**:

| rank | the gap | why we rank it here |
|------|---------|---------------------|
| **1** | ⭐ **forty-five states are unresearched** | the sweep covers **5 of 50** — 10% of this archetype's footprint. and ⛔ **the sample forbids extrapolation**: those five produced **three different consent architectures** (written record · live per-call · suppression-list), so the variance is a measured result rather than a worry. a uniform sample could be generalized; this one cannot |
| **2** | the **live-consent states**, now confirmed in footprint | CA and IN are served by definition, and no written record satisfies either. see the structural problem above — this is the gap most likely to demand a **channel** decision rather than a records one |
| **3** | ⭐ **attorney-general enforcement, in fifty jurisdictions** | the largest figures found carry **no private right**: Indiana's **$10,000 first / $25,000 each after** is the **attorney general's**, and California's is the **commission's**. for an all-states operator that is a regulator-relations exposure in every state, and an arbitration clause does **not** reach it — ⚠️ so layer 5, ranked first above, is no answer here |
| 4 | `§ 227(c)(5)`'s **unconstrued "due care"** | the layer with a named statutory defense is the one whose standard no read decision applies |
| 5 | the internal-list failure's **absent enumerated shelter** | per `Dish`, the FCC Rule safe harbour reached Registry Calls only |
| 6–8 | state case law · residential/wireless boundary · cover cost · officer exposure | real, but each is a **known unknown** rather than a live defeater |

⭐ **rank 1 and rank 3 are the two that moved on the all-states read**, and both moved *up*. in a
bounded-footprint posture the unresearched states are a completeness worry and the AG track is
secondary; for an online business they are the two largest live exposures.

⚠️ **rank 1 is arithmetic; the rest is appetite.** "5 of 50, with 3 architectures in the 5" is a
measured fact anyone can check. that it therefore outranks the others is our call, and a reader who
sends far less volume than they hold customer relationships might reasonably put rank 3 first.

## ⚠️ what this order implies that the research does not cover

- ⬜ **the 45-state sweep itself.** the honest consequence of rank 1 is that the deliverable is
  incomplete for this archetype, and no re-order fixes that. the sweep is the fix
- ⬜ **which outbound message classes the live-consent provisions actually catch** — the question the
  structural problem above turns on
- ⬜ **AG enforcement practice** — how often these penalties are actually pursued, and against whom.
  the *authority* is located; the *practice* is not

## .publishability

🕶️ **obscure** (scrub) — this file exists **because** it is the obscure part. it is the residue of a
split, and it holds exactly the two elements that failed checks 2 and 3 of the sauce test in
`howto.discover-a-fullsun-floor`: a choice the sources do not force, and a statement of what we rank
first.

⭐ **no fact in this file is withheld from the floor brief.** every gap named here is named there;
every layer referenced here is set out there in full. what is withheld is **the priority** — and a
priority is an appetite, which is ours rather than the law's.

☀️ **one section is a graduation candidate.** the structural problem — that a live-per-call statute
and an asynchronous signup are incompatible — is a **derivable observation**, not an appetite: it
falls out of the statutes plus the acquisition model, and a second researcher reaches it. ⬜ it is
held here only because it has not been separately verified against which message classes the
provisions catch. once that is researched, it belongs in the ☀️ floor.

⭐ **note what this file is NOT.** it names no company, no volume, and no served-state list — it is
scoped to a **generic archetype**, which is why it is 🕶️ (ours) and not 🔒 (a client's). an artifact
that named a specific business would be a third tier, and this repo is public, so no such artifact
belongs in either tree here.

## .see also

- `../../../../src/domain.roles/counselor/briefs/market/comms/tactic.the-discovered-floor-against-a-tcpa-claim.[lesson].md` — ☀️ the floor itself; read it first
- `../../../../src/domain.roles/counselor/briefs/market/comms/ref.mini-tcpa-five-state.[ref].md` — the rank-1 and rank-2 gaps, and the three-architecture result
- `../../../../src/domain.roles/counselor/briefs/market/comms/ref.tcpa-exposure-tracks.[ref].md` — the rank-3 government track
- `../../../../src/domain.roles/counselor/briefs/market/comms/define.boundary.formation-not-customer-status-is-the-axis.[lesson].md` — why a signup flow is the strongest layer-5 position
- `howto.discover-a-fullsun-floor.[lesson].md` — the split method that placed this file here

## .sources

⚠️ **this file makes no independent factual claim** — it orders and prioritizes claims established
elsewhere, so it inherits its citations from the floor brief it splits from (per
`rule.require.seven-distinct-citations`'s exception for artifacts that carry no independent claim).
the primary sources are listed there.

## .date researched

2026-08-03
