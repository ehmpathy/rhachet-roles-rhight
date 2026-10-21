# howto.correct-visibly-without-a-leak

## .what

a route that instructs *"record findings inline rather than absorb them silently"* is right — and
applied to a **shipped brief** it manufactures a publishability defect on every pass.

this brief scopes that instruction. **the correction is recorded visibly, in the route record. the
shipped brief carries the corrected state and no construction history.**

## .why

the instruction exists for a real reason: an agent that silently edits away its own error destroys
the evidence that the error happened, so the same error recurs and no reviewer can audit the fix. a
visible correction is what makes a long autonomous run trustworthy.

⛔ **but a shipped brief is a different artifact from a route record**, and
`rule.forbid.aggregation-index-build-narrative` is explicit: an index must read as *"a library of
legal topics"*, never as *"one program's build plan."* a construction diary is neither.

> ⭐ **the defect is not that any one correction block was written. it is that the instruction has no
> destination clause, so every block lands wherever the agent happened to be editing.**

## .the failure signature

this was found on a 16-file brief cluster after **twenty** review rounds. the numbers are the lesson:

| | |
|---|---|
| files with build narrative embedded in shipped briefs | **16 of 16** |
| occurrences | ~53–76 depending on the marker set |
| review rounds before anyone named the cause | 19 |
| rounds spent on the *output* (patch a file, re-tag a verdict) | ⛔ several |
| rounds spent on the *generator* | **1** |

⛔ **each round patched instances and left the instruction intact, so the next correction pass
regenerated the defect in a new spot.** a reviewer's own words: *"as long as the instruction stands,
round 21+ will find it."*

## .the rule

| where the correction goes | what it holds |
|---|---|
| ✅ **the route's build trail** — `.behavior/<route>/<stone>.build-trail.md` | the error, what it was, how it was found, the count before and after, the lesson |
| ✅ **the shipped brief** (`src/**`, `.agent/**/briefs/**`) | the **corrected state only** — the right citation, the right count, the right claim |

### ⛔⛔ name the destination file, and do NOT reuse the restricted-design one

⚠️ **a draft of this brief said "the route record, or a peer build-trail file" and named no concrete
target.** a reviewer caught what that would have caused: the only populated private artifact on the
route was a **restricted applied-design** file, so the sweep would have landed there.

⭐ **that would have been the same fusion defect one grain up.** the two private artifacts are not
two flavours of "the private file":

| | the restricted **design** file | the **build trail** |
|---|---|---|
| governed by | `rule.require.fullsun-facts-not-tactics` | `rule.forbid.aggregation-index-build-narrative` |
| holds | applied design, weak-spot assessment | construction history — counts, drift, corrections |
| audience | an **implementer** | a **reviewer of the work** |
| verdict | 🔒 **protect** — a leak is adversarially useful | 🕶️ **obscure** — a leak is merely noise |
| lifecycle | outlives the route | dies with the route |

> ⛔ **the fix for a fusion is never a different fusion.** create the build-trail file **before** the
> sweep runs; a sweep into the wrong artifact has to be re-done.

### ⛔⛔ apply the test per BLOCK, never per SECTION

⚠️ **one section routinely holds both kinds, in adjacent paragraphs.** a gap tracker is the canonical
case: its **rows** are open exposures a reader must know about (content), and the narrative about its
own miscounts is construction history.

⛔ **a section-grain sweep — *"every block under this header is build narrative, move it"* — deletes
content.** on one route that rule would have sent the shipped cluster's whole open-exposure catalogue
into a file that dies with the route, and the only way to rebuild it would be a hand re-grep of 16
files — the exact manual process that had already failed three times.

> ⭐ **and this binds any deterministic checker built to enforce this brief.** a checker keyed off
> section headers enforces the defect **at scale**, and that is worse than the manual failure it
> replaces — ⚠️ **because a hygiene check that lands wrong is trusted.**

**the test, applied to any block you are about to write into a shipped brief:**

> would a reader who wants this brief's **subject** care about this paragraph?

- yes → it is content; keep it
- no, it is about **how this file got here** → it belongs in the route record

## .the one exception, and it is narrow

a **retraction** stays in the shipped brief when a reader may have relied on the retracted claim —
a superseded rule, a reversed verdict, a definition that changed meaning. that is content: it tells a
reader their prior understanding is wrong.

| | goes in the brief | goes in the route record |
|---|---|---|
| *"this rule is superseded by X; do not apply it"* | ✅ | |
| *"the prior verdict said fullsun and was wrong; it is obscure"* | ✅ | |
| *"the count said 15 because the glob was not recursive"* | | ✅ |
| *"this source list was padded by three and the repair was productive"* | | ✅ |
| *"corrected in place, with the error visible"* as a section header | | ✅ |

⭐ **the discriminator is the audience, not the severity.** a retraction addresses the **reader of the
subject**; a construction record addresses the **reviewer of the work**.

## .how to apply it mid-run

1. when a correction surfaces, write the **full account** into the route yield — that is the visible
   record the instruction asks for
2. edit the shipped brief to the **corrected state**, with no narration of the change
3. if the brief needs to point at the account, one line: `> correction recorded in <route>/<pass>`

⚠️ **and if you are late** — the blocks are already in the briefs — the fix order is **generator
first**. a mechanical sweep of the blocks already on disk, run before the instruction is scoped, is
undone by the next pass.

## .enforcement

- a construction-history block in a shipped brief (`src/**`, `.agent/**/briefs/**`) = **blocker**
- a correction absorbed silently, with no record in the route = **blocker** (the original defect this
  instruction exists to stop)
- a sweep of the blocks already on disk, run **before** the instruction is scoped = **nitpick** — it
  is correct work in the wrong order, and it will be re-done

## .see also

- `rule.forbid.aggregation-index-build-narrative.[rule].md` — what a shipped index may not read as
- `rule.require.fullsun-facts-not-tactics.[rule].md` — the within-a-brief twin: facts, never decisions
- `howto.redact-obscure-to-legal-facts.[lesson].md` — the after-the-fact repair for one brief
- `howto.redact-completed-behavior-route.[lesson].md` — the route-side redaction, once approved

## .publishability

☀️ **fullsun** (share) — a **method** rule about where a correction is recorded. no client identity,
no engagement, no legal conclusion, and it settles no choice the law left open. the failure signature
above is de-identified: a file count and a round count, with no subject matter attached.
