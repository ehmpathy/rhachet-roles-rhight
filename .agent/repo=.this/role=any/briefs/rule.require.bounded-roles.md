# rule.require.bounded-roles

## .what

every brief and every skill has **exactly one home role** — the role whose domain
owns it. domains do not overlap. a role that *consumes* another role's artifact
gets a **pointer**, never a copy.

this is `rule.require.bounded-contexts` (architect) applied one level up. that
rule bounds a *code* domain; this one bounds a *role* domain. the failure mode is
identical and so is the cure.

## .why

a role is a claim about a domain. the moment two roles both plausibly own an
artifact, three things break at once:

| break | what it costs |
|-------|---------------|
| **discovery** | a reader hunts two roles for one fact, and finds the stale copy |
| **boot cost** | the same brief loads twice, in two `boot.yml` files |
| **authority** | when the copies drift, neither is canonical and both are cited |

and the drift is not hypothetical. two copies of a rule diverge on the first
correction, because the corrector fixes the copy in front of them.

> a domain boundary is only real if something is on the **wrong** side of it.
> a boundary that never rejects anything is a decoration.

## 🚩 how domains actually creep: the circular citation

domains do not creep by a big wrong decision. they creep **one justification at
a time**, and the justification is almost always a prior placement.

> measured: a `define.stock-ledger` brief was placed under `secretary`, on the
> authority of a `secretary/readme.md` row that listed *"minutes, resolutions,
> the stock ledger, certified copies"* — a row the same author had written days
> earlier, offhand. the first overlap authorized the second.
>
> the human caught it in one sentence — *"why would the generic secretary care
> anything about a registration specific stock ledger?"*

### the fix has two halves — the second is the one skipped

```
1. move the artifact to its real home
2. retract every line that claimed it
```

a cure that moves the **artifact** and leaves the **citation** that authorized
it leaves the circular authority loaded for the next author. measured: the brief
moved to `registrator/…/variant=c-corp/`, while the readme row and a second list
in `define.why-secretary` still claimed it a week later. retract such lines **in
place**, with a note, per `rule.require.permanent-yields`.

### the tell

> **if the reason an artifact belongs to role X is that something else already
> in role X mentions it, you have not made a placement decision. you have
> inherited one.**

a readme is a description of a boundary, not the boundary itself. so is a
`boot.yml`, a `see also`, and an offhand table row. none of them can authorize
the next placement.

## .the test — follow the presupposition chain to its root

the reliable test asks what the artifact **presupposes**, then walks that chain
until it stops moving. the role that owns the **root** owns the artifact.

worked, on the same example:

```
a stock ledger        presupposes  stock
stock                 presupposes  a stock corporation
a stock corporation   presupposes  a choice of entity type at registration
                                   └─ owned by: registrator          ← root
```

the chain never passes through the calendar, document production, or the minute
book — the things `secretary` actually owns. so the ledger was never a secretary
artifact, whatever a readme line said about it.

the same test, run the other way, confirms it: **a nonprofit has a secretary and
has no stock ledger.** an artifact that vanishes when you change the entity type
is an entity-type artifact.

### the vanish test, stated generally

> **change one fact about the domain. if the artifact disappears, the role that
> owns that fact owns the artifact.**

## .when two roles both seem to want it

that is a signal the **boundary is wrong**, not that the artifact should be
duplicated. fix the boundary; never settle the tie with a copy.

| what you observe | what it means |
|------------------|---------------|
| one artifact, two plausible homes | the presupposition test has not been run |
| many artifacts pulled both ways | the two roles are one role, or a third role is absent |
| one role constantly cites the other | that is a **consumer**, and it needs a pointer |

## .the pointer pattern

a consumer role never holds a copy. it holds the **consequence**, and points at
the definition:

```
registrator/briefs/.../define.stock-ledger.md        ← the definition, one home
accountant/briefs/.../howto.substantiate-expenses.md ← "see registrator/…" + why
                                                       IT cares, in one line
```

what the consumer may hold is the **fact about its own domain** that the artifact
implies — never a restatement of the artifact. "the ledger is the evidence
§504(d) names" is a franchise-tax fact and belongs to the consumer. "a ledger
carries holder, count, class, date" is the definition and does not.

for skills, the pointer is literal — a symlink, per
`rule.require.skill-placement-by-portability`.

## .the flag duty

when you find an artifact outside its domain, **say so out loud.** do not route
around it, and do not add a second copy in the right place.

the report names three things:

1. the artifact and its current home
2. the presupposition chain, and the root role it lands on
3. whether the fix is a **move**, or a **move plus a pointer** for a real consumer

silence here is how the second overlap gets authorized by the first.

## .what this rule does NOT say

it does not govern the **tier** an artifact lives at — published
`src/domain.roles/**` versus repo-local `.agent/`. that is
`rule.require.skill-placement-by-portability`, and it is orthogonal. an artifact
has a role *and* a tier, and the two questions are answered separately.

it does not forbid a role from **referencing** another role. cross-role pointers
are the intended shape and are free.

it does not demand a boundary be right on the first try. it demands that when a
boundary is found to be wrong, the artifact **moves** rather than multiplies.

## .enforcement

- the same brief or skill under two roles = **blocker**
- a placement justified by a prior placement, with no presupposition chain = **blocker**
- an artifact whose presupposition chain roots in another role = **blocker** (move it)
- a consumer role that restates a definition instead of a pointer = **blocker**
- an out-of-domain artifact noticed and not flagged = **blocker**
- a readme or `boot.yml` line that claims an artifact the role does not own = **nitpick** (fix the line)

## .see also

- `rule.require.skill-placement-by-portability` — the orthogonal **tier** axis
- `rule.require.bounded-contexts` (architect) — the same rule, one level down, for code
- `rule.prefer.most-common-denominator` (architect) — where shared artifacts get lifted,
  and why a shared artifact is a signal about the domain rather than a placement problem
- `philosophy.roles.[philosophy]` (enroller) — why roles crystallize at all
