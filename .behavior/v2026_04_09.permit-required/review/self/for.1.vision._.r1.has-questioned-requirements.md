# review: has-questioned-requirements

## requirement 1: thought route for permit determination

**who said this was needed?** the wish explicitly requests it, modeled after patenter's patent.propose.

**what evidence supports this?** we already created briefs (howto.prove-permit-required, ref files) that document the manual process. a route would formalize this.

**what if we didn't do this?** users would have briefs but no structured workflow. they'd need to manually follow the howto.

**is the scope right?** potentially too ambitious. "any postal & service in the usa" = 50 states × thousands of localities × dozens of work types. should start narrow (e.g., indianapolis electrical) and expand.

**simpler way?** yes — start with a single `permit.required` skill that follows the howto, not a full multi-stone route. route can come later when patterns emerge.

**verdict**: **scope down**. start with skill, not route. prove the pattern works for one jurisdiction first.

---

## requirement 2: shell skill to search permit database

**who said this was needed?** wish requests it explicitly, with indianapolis as the target.

**what evidence supports this?** the ref doc in the wish shows API options (Accela blocked, web scrape possible, manual fallback).

**what if we didn't do this?** users would search manually via the portal. not scalable, but works.

**is the scope right?** yes — indianapolis is a concrete, bounded target.

**simpler way?** manual portal is simplest. but skill adds value for repeated lookups. web scrape is fragile but feasible.

**verdict**: **holds**. start with indianapolis. accept scrape fragility. document fallback to manual.

---

## requirement 3: full proof chain (R105.1 + R105.2)

**who said this was needed?** emerged from earlier conversation — user pointed out that only citing exemptions is incomplete.

**what evidence supports this?** legal defensibility requires showing: (1) work IS covered by default, (2) work is NOT exempt. missing either = incomplete proof.

**what if we didn't do this?** proofs would be legally weak. "not on exemption list" is meaningless without the baseline.

**is the scope right?** yes — two sections is minimal viable proof.

**simpler way?** no. both are required for complete chain.

**verdict**: **holds**. this is the core insight. must keep.

---

## requirement 4: generalize to any postal/service in USA

**who said this was needed?** wish: "reusable thought route... for any postal & service in the usa"

**what evidence supports this?** none yet. we only have indianapolis examples.

**what if we didn't do this?** limited to indianapolis. that's fine for v1.

**is the scope right?** too large for initial implementation.

**simpler way?** yes — start with indianapolis, document the pattern, generalize later when we understand jurisdiction variance.

**verdict**: **scope down**. v1 = indianapolis only. generalization is v2+.

---

## summary of changes

| requirement | verdict | action |
|-------------|---------|--------|
| thought route for permits | scope down | start with skill, not full route |
| permit search skill | holds | implement for indianapolis |
| full proof chain | holds | R105.1 + R105.2 mandatory |
| generalize to any postal | scope down | v1 = indianapolis only |

---

## what i learned

- the wish was ambitious. scope it to provable first steps.
- proof chain insight (baseline + exemptions) is the real value. keep it.
- indianapolis is a good bounded target for v1.
- routes are for patterns that repeat. we don't know the pattern yet. start with skills.
