# self-review: has-pruned-backcompat (round 6)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: why backcompat doesn't apply

### the core question

did we add backwards compatibility that wasn't explicitly requested?

### greenfield evidence

**1. this is the first version of permiter**

checked `src/domain.roles/permiter/`:
- directory is new (staged, not committed)
- no prior `getPermiterRole.ts` exists on main
- no prior permit skills exist

**2. the wish explicitly requests creation, not modification**

from `0.wish.md`:
- "create a thought route" (new)
- "create a shell skill to search" (new)

no mention of prior behavior to preserve.

**3. the vision describes net-new functionality**

from `1.vision.yield.md`:
- "homeowner runs `rhx permit.check.required`" (new command)
- "v1 scope" table shows three new skills
- "future" section for `permit.check.granted` (not yet built)

there is no prior version of these skills.

### what backcompat would look like

if backcompat were a concern, we'd see:
- deprecation notices
- alias mappings (old name → new name)
- migration paths
- version checks
- "supports both" logic

**none of these exist in the blueprint** — and they shouldn't, because there's no prior version.

### convention vs backcompat distinction

| pattern in blueprint | type | why not backcompat |
|----------------------|------|-------------------|
| patenter-style skill structure | convention | parallel role, not prior version |
| rhachet boot.yml format | convention | standard format, not old permiter format |
| domain-objects library usage | dependency | library API, not prior domain model |
| treestruct output format | convention | shared format, not to preserve old output |

these are all **forward conventions** (how new things should be built), not **backward compatibility** (to preserve how old things worked).

---

## conclusion

no backwards compatibility concerns identified because there is no prior version. permiter is greenfield. the blueprint follows conventions (patenter, rhachet, domain-objects) but these are design patterns for new code, not preservation of old behavior.

