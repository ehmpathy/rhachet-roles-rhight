# self-review: has-pruned-backcompat (r2)

## verdict: pass

## the question

> did we add backwards compatibility code that was not explicitly requested?

## my reflection

i paused. i slowed down. i re-read the guide.

the guide asks me to look for backwards compat that we added "to be safe" without the wisher's request.

in this case, this is a **greenfield implementation**. the permiter role did not exist before. there are no prior callers. there is no prior API. there is no one to break.

## what i checked

### domain objects

| file | compat code? | why it holds |
|------|-------------|--------------|
| Permit.ts | none | no prior version exists |
| PermitJurisdiction.ts | none | no prior version exists |
| PermitCodeSection.ts | none | no prior version exists |
| PermitDetermination.ts | none | no prior version exists |
| PermitWorkDescription.ts | none | no prior version exists |
| PermitCodeCitation.ts | none | no prior version exists |

no `@deprecated` fields. no `legacyX` fields. no version discriminators.

### domain operations

| file | compat code? | why it holds |
|------|-------------|--------------|
| parsePermitWorkDescription.ts | none | first implementation |
| computePermitDetermination.ts | none | first implementation |
| searchPermits.ts | none | stub only |
| fetchPermit.ts | none | stub only |

no `if (version === 1)` branches. no old/new field fallbacks.

### shell scripts

the `.js/.ts` conditional in shell scripts is **not backwards compat**:

```bash
if [[ -f "$SKILL_DIR/permit.check.required.js" ]]; then
  RESULT=$(node "$SKILL_DIR/permit.check.required.js" ...)
else
  RESULT=$(npx tsx "$SKILL_DIR/permit.check.required.ts" ...)
fi
```

this is build artifact detection for dev/prod modes. both paths are current and correct. this is not "old API support".

## conclusion

no backwards compat code was added because there is no prior version to maintain compatibility with.

**why it holds**: greenfield implementation. first version. no prior callers.

## open questions for wisher

none. there is no backwards compat concern in a greenfield implementation.
