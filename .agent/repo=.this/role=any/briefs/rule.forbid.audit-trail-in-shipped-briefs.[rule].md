# rule.forbid.audit-trail-in-shipped-briefs

# tldr

## severity: blocker

a shipped brief's `## .publishability` section carries ONLY the **generic header stamp** — the
posture tag, a one-line generic reason, and bare rule attributions. it must NEVER carry the
**internal audit trail**: the phase-1 declaration, the phase-2 red-team findings, a "blind re-read is
owed" process note, citation-quota arithmetic, the over-tag → retag sauce-test narrative, or any
mention of a withheld / held-internally file. that audit trail lives in the engagement **route**
(`.behavior/**`), where it was produced.

**why it is a blocker, not a nitpick:** the audit trail does not merely clutter a public brief — it
**implicitly re-leaks what the triage protected**. a QA note that says *"a remainder was split out
and is held internally — the sequence and the priority"* publishes the abstract of the secret it was
meant to withhold. a note that recounts what you protected, what leaked, and what is still withheld
is itself a fingerprint. the triage's own output must not defeat the triage.

---
---
---

# deets

## .what

the two-phase workflow of `rule.require.publishability-triage` **produces** an audit trail — a
phase-1 protect / obscure / fullsun declaration and a phase-2 blind red-team reconstruction. that
trail is real, valuable, and must be kept. this rule governs **where** it is kept.

| content | lives in | ships to npm / public? |
|---------|----------|------------------------|
| the **generic header stamp** — posture tag + one-line generic reason + bare rule attributions | the shipped brief | ✅ yes — preferred |
| the **internal audit trail** — declaration, red-team findings, "re-read owed", citation counts, over-tag narrative, withheld-file mentions | the engagement route (`.behavior/**`) | ❌ never |

### what the shipped stamp KEEPS — the preferred public practice

the header stamp is a good, consistent, public signal. keep it:

- the **posture tag + one-line generic reason**:
  `☀️ **fullsun** (share) — generic public-law hazard; no client identity or client-specific mechanic.`
- **bare rule attributions**: `authored in neutral legal voice per rule.require.fullsun-facts-not-tactics`
  · `triaged per rule.require.publishability-triage`. these name WHICH rules govern the brief. the rule
  names are already public in `.agent/**`, so the attribution leaks no secret — and it enforces a clear,
  consistent, auditable practice. **prefer to keep it on every shipped brief.**

### what the shipped stamp STRIPS — the trail moves to the route

- the **phase-1 declaration** — what sits on the protect / obscure / fullsun lists
- the **phase-2 red-team findings** — *"the red-team pass found leaks of voice and emphasis"*,
  *"both triage gates have run"*
- the **process-state note** — *"a confirmatory blind re-read is owed before publication"*
- the **citation-quota arithmetic** — *"≥ 7 distinct sources"*, the count math
- the **over-tag → retag narrative** — the sauce-test tables that recount
  *"this brief was first tagged 🕶️ obscure, and that was an over-tag…"*
- **any mention of a withheld / held-internally / internal-manifest file** — to name a withheld file
  and state its subject publishes that file's abstract (the same defect as
  `rule.forbid.aggregation-index-build-narrative`, at the single-brief grain)

## .why

- **the audit trail can implicitly re-leak.** the triage exists to withhold the protect / obscure
  set. a narrative that recounts *what was withheld, what leaked, and what is still held back* re-emits
  the very fingerprint the triage removed. the QA note is a second copy of the secret, in negative.
- **it is clutter for the consumer.** an npm consumer of a role wants the law and the not-advice
  frame — not the authoring pipeline's internal QA state, its red-team round history, or its citation
  math.
- **the route is the right home.** the audit trail was produced in the `.behavior/**` route and
  belongs there — that is where a later auditor looks to confirm the triage ran. the shipped brief is
  the **product**; the route is the **process**. keep the two apart.

## .the canonical shipped stamp

👎 **audit trail left in the shipped brief** (strip this):

```md
## .publishability

☀️ **fullsun** (share) — generic public-law hazard; no client identity, no client-specific mechanic.

authored in neutral legal voice per rule.require.fullsun-facts-not-tactics: each failure is stated as
what the text requires…

☀️ **both triage gates have run.** rule.require.publishability-triage requires a pre-authorship
declaration and a blind red-team read. both ran. the red-team pass found leaks of voice and emphasis —
never of fact — and this brief was revised to close them. ⚠️ one caveat stands: that pass graded the
set before those revisions, so a confirmatory re-read is owed before publication.
```

👍 **generic stamp only** (ship this; the trail moves to the route):

```md
## .publishability

☀️ **fullsun** (share) — generic public-law hazard; no client identity, no client-specific mechanic.
triaged per rule.require.publishability-triage; authored in neutral legal voice per
rule.require.fullsun-facts-not-tactics.
```

the red-team findings, the "re-read owed" state, the citation math, and any withheld-file note move to
the engagement route (e.g. `.behavior/<engagement>/5.1.publishability.redteam.md`), which is where
they were produced and where an auditor confirms the triage ran.

## severity: blocker

the audit trail is an implicit leak vector, and the whole point of the triage is to close leak
vectors. a shipped brief that recounts what it protected has re-opened the one it just closed. the
stamp is one clean line; the trail is a fingerprint — its presence in a shipped brief is a blocker.

## .where

applies to the `## .publishability` section of:

- every `*.md` brief under `src/domain.roles/**/briefs/**` (ships to npm)
- every `*.md` brief under `.agent/**` (ships in the public repo)

it does **not** apply to the audit trail in its rightful home — the `.behavior/**` engagement route —
where the full declaration, red-team rounds, and citation math SHOULD live.

## .how

on any brief bound for a public tree, reduce the `## .publishability` section to the generic stamp:
the posture tag + a one-line generic reason + bare rule attributions. move every other line — findings,
process state, counts, over-tag narrative, withheld-file mentions — into the engagement route's
publishability artifact. if there is no route (a standalone brief), delete the trail; do not ship it.

## .enforcement

- a shipped brief whose `## .publishability` section carries red-team findings, a "re-read owed" note,
  citation-quota arithmetic, or an over-tag → retag narrative = **blocker**
- a shipped brief that names a withheld / held-internally / internal-manifest file (or states its
  subject) = **blocker** — it publishes the withheld file's abstract
- a shipped brief with **no** `## .publishability` stamp at all = **blocker** (per
  `rule.require.publishability-triage` — the stamp itself is required; this rule bounds its content)
- a bare rule attribution (`per rule.require.fullsun-facts-not-tactics`) kept in the stamp = **not a
  violation** — it is the preferred, consistent, public practice

## .see also

- `rule.require.publishability-triage.[rule].md` — requires the stamp + runs the two-phase workflow that produces the trail this rule relocates
- `rule.require.briefs-integrity-gate.[rule].md` — the `briefs.integrity` gate; a `--check audit-trail-in-fullsun` is the natural mechanization of this rule
- `rule.require.fullsun-facts-not-tactics.[rule].md` — the neutral-voice rule the stamp attributes to
- `rule.forbid.aggregation-index-build-narrative.[rule].md` — the same "naming the withheld thing leaks it" defect, at the index grain
- `howto.redact-completed-behavior-route.[lesson].md` — how the route retains the audit trail this rule moves there
