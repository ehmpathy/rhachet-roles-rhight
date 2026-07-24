# howto.redact-completed-behavior-route

## .what

a procedure to redact client-identity material from a `.behavior/` engagement route **after** the
route is complete and a human has approved it for prune. the goal: keep the route as a **de-identified
engagement record** in the public repo — its structure, its generic legal groundwork, its process — while
the client's identity and secret sauce move to the client's private space.

this is **content-level** redaction: edit **within** each file. it is **not** a `git rm` of the route,
and **not** a `git rm --cached` untrack. the files stay tracked and on disk; only their client-specific
**contents** are scrubbed.

## .why

- a `.behavior/` route is the highest-density client leak in the repo: it holds the wish (often a
  **privileged** peer/counsel handoff), the vision (the full applied strategy), and the refs (clone
  inventories, repo pulls, protection-posture strategy). the publishability triage marks the whole route
  🔴 **protect**.
- but the route also has **reusable value** — the process, the generic legal groundwork, the
  research method — that is worth a keep in the public repo once de-identified.
- an untrack or a delete of the route throws away that value **and** is a blunt, error-prone move (it is
  easy to untrack the *whole* `.behavior/` dir by accident, or to drop files a human still needs). the
  safe, reversible move is **in-file redaction of the one approved route**.

## .the two preconditions — BOTH required before you touch a file

1. **the route is complete** — the work it drove is done; it is a record, not live work.
2. **a human has explicitly approved this route for prune** — the approval is **per-route**, on the
   record. a redact of a route no human approved is the same defect as a leak of one.

if either is absent, **stop**. do not redact on your own initiative.

## .scope discipline — ONE route, never the parent

redact **only** the single approved route directory
(`.behavior/v$date.$slug/`). never touch the `.behavior/` parent, never batch across routes — each
route needs its own human approval. confirm the exact directory before the first edit, and confine every
edit and every grep to that path.

> the blunt-instrument trap: `git rm -r --cached .behavior/` untracks **every** route at once, and a
> `.gitignore` of `.behavior` hides the whole class. neither is redaction — both are scope errors.
> stay inside the one approved `v$date.$slug/`.

## .the procedure

### step 1 — confirm preconditions + scope on the record

name the exact route path, confirm it is complete, and confirm the human's per-route prune approval. if
you cannot cite the approval, halt.

### step 2 — inventory the client tells inside the route

grep the **one route directory** (not the parent) for every client tell:

- the **client name** and its product/brand names
- **filenames** that embed the client name (these need a rename, not just a content edit)
- the **privileged handoff** block (the peer/counsel legal handoff — often flagged "available under
  privilege" in the wish)
- **strategy specifics**: fund-flow choreography, the applied mechanic, dollar figures, launch dates,
  clone/repo inventories, protection-posture memos

### step 3 — decide, per file, redact-in-place vs stub

| the file is… | action |
|--------------|--------|
| mostly process/groundwork with client tells sprinkled in | **redact in place** — swap the client name for a neutral placeholder, strip the privileged block, strip strategy specifics; keep the reusable structure |
| almost entirely client-secret (a clone inventory, a repo-pull dump, a protection-posture strategy memo) | **gut to a stub** — replace the body with a one-line note: `pruned: client-secret; held in the client's private repo`, keep the filename's structural role |
| named with the client in the **filename** | **rename** the file to a neutral name (mvsafe), then redact its contents |

### step 4 — redact the contents

- **client name → neutral placeholder** — a consistent stand-in (`the client`, `acme`) across the route.
  use `sedreplace` (plan then apply) for the bulk name swap; single-quote any globs; scope the glob to the
  one route.
- **privileged handoff → removed** — drop the block entirely; a de-identified record does not carry a
  privileged legal handoff (a leak of it can **waive privilege** — irreversible). leave a one-line note
  that a privileged handoff existed and was pruned.
- **strategy specifics → generalized or stubbed** — the applied fund-flow, the mechanic, the numbers, the
  dates: remove or reduce to the generic shape. keep only what a de-identified reader could learn without
  a reconstruct of the client's design.

### step 5 — verify the route is clean

- grep the one route directory again for the client name and product names → must return **zero**.
- confirm no filename under the route still embeds the client name.
- spot-read the wish and vision: the privileged handoff is gone, the strategy specifics are generalized.
- keep the files **tracked** — `git status` should show them **modified**, not deleted/untracked.

### step 6 — hand the full versions to the client's private space

the un-redacted originals are the client's moat + privileged material. ensure they live in the client's
**own private repo** (not this one) before the redaction lands. the public repo keeps only the
de-identified record.

## .what to KEEP vs REMOVE

| keep (de-identified record) | remove (to the client's private repo) |
|-----------------------------|----------------------------------------|
| the route structure (stones, guards, the process) | the client name + product/brand names |
| the generic legal groundwork + research method | the privileged peer/counsel handoff |
| the neutralized wish (the problem shape, de-identified) | the applied fund-flow / mechanic / dollar figures |
| a note that privileged/strategy content was pruned | clone inventories, repo pulls, protection-posture memos |

## .enforcement

- a redact of a route **without** a human's per-route prune approval = **blocker**
- an untrack/gitignore/rm of the `.behavior/` **parent** instead of the one approved route = **blocker**
- a privileged handoff left in a de-identified route = **blocker** (privilege-waiver risk)
- a route filename that still embeds the client name after redaction = **blocker**
- a delete/untrack of the route instead of a redact of its contents (when a record was intended) = **blocker**

## .see also

- `rule.require.publishability-triage.[rule].md` — the share/scrub/prune triage; the route is 🔴 protect
- `rule.require.fullsun-facts-not-tactics.[rule].md` — fullsun the facts, never the decisions
- `howto.redact-obscure-to-legal-facts.[lesson].md` — the obscure→facts redaction for individual briefs
- `howto.test-obscurity-via-blind-convergence.[lesson].md` — verify the de-identified result does not still leak the design
