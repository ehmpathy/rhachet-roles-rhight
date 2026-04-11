# self-review: has-consistent-mechanisms (r3)

## verdict: pass

## deeper investigation (updated 2026-04-11)

i slowed down. searched the codebase more thoroughly.

**key context**: goal 2 is BLOCKED. scrape utilities were NOT created. only stubs exist.

### domain-objects usage - consistent with library patterns

examined each domain object against domain-objects library conventions:

| object | base class | unique key | rationale |
|--------|------------|------------|-----------|
| Permit | DomainEntity | permitNumber | has identity, can be updated |
| PermitDetermination | DomainEntity | work+jurisdictionSlug | has identity |
| PermitCodeSection | DomainEntity | codeRef | has identity |
| PermitJurisdiction | DomainEntity | slug | has identity |
| PermitWorkDescription | DomainLiteral | (all fields) | value object, immutable |
| PermitCodeCitation | DomainLiteral | (all fields) | value object, immutable |

**why it holds**: DomainEntity used for objects with identity (can be found/updated). DomainLiteral used for value objects (compared by all fields). this follows the library's intended usage.

### transcriber role - examined for shared patterns

found: `src/domain.roles/transcriber/` has minimal structure:
- getTranscriberRole.ts
- skills/transcribe.pdf/

no shared utilities extracted from transcriber that permiter should reuse.

### patenter role - examined for shared patterns

found patterns in patenter:
1. `output.sh` with `print_eagle_header()`, `print_tree_start()`, etc.
2. skill structure: `{skill}.sh` + `output.sh` + `{skill}.ts`

permiter goal 2 stubs follow same structure:
1. `output.sh` with `emit_blocked()`
2. skill structure: `permit.search.sh` + `output.sh`

**why it holds**: stubs mirror patenter pattern. when unblocked via kermet, they will use same structure.

### could we consolidate output utilities?

patenter uses generic tree functions. permiter stubs use simpler `emit_blocked()`.

when goal 2 is unblocked, permiter output.sh will evolve. consolidation decision can be made then.

**why it holds**: premature to consolidate when one side is stubs.

### web scrape utilities - NOT created

the original blueprint included scrape utilities:
```
src/utils/scrape/
├── launchBrowser.ts
├── navigateToPortal.ts
├── fillForm.ts
├── extractTable.ts
└── portals/indianapolis.accela.selectors.ts
```

these were **pruned** because goal 2 is blocked. todo: use rhachet-roles-kermet to webscrape.

**why it holds**: no duplication possible for code that was not created. when kermet is available, scrape utilities will live in kermet (shared browser automation role).

## conclusion

mechanisms are consistent with extant patterns:
1. domain-objects usage follows library conventions
2. skill structure mirrors patenter pattern
3. scrape utilities pruned (blocked, will use kermet)
4. domain-specific output functions are intentional

no changes needed.
