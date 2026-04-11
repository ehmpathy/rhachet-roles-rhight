# self-review: has-consistent-mechanisms (r2)

## verdict: pass

## analysis (updated 2026-04-11)

reviewed for duplication of extant mechanisms.

**key context**: goal 2 (permit.search, permit.fetch) is BLOCKED. scrape utilities were NOT created. only stubs exist.

### goal 1 mechanisms - no duplication

| permiter operation | parallel patenter operation? |
|-------------------|----------------------------|
| parsePermitWorkDescription | no equivalent (permits parse work, patents parse claims) |
| computePermitDetermination | no equivalent (permits determine requirement, patents search prior art) |

**why it holds**: permit and patent domains are semantically different. these are new domain-specific operations.

### goal 2 stubs - parallel patterns

| permiter stub | parallel patenter operation |
|--------------|----------------------------|
| searchPermits.ts (throws blocked) | patent.priors.search (functional) |
| fetchPermit.ts (throws blocked) | patent.priors.fetch (functional) |
| permit.search.sh (exit 2) | patent.priors.search.sh (functional) |
| permit.fetch.sh (exit 2) | patent.priors.fetch.sh (functional) |

**why it holds**: stubs follow the same structure as patenter skills. when unblocked via kermet, they will parallel the patenter pattern.

### output.sh - parallel patterns, not duplication

compared patenter and permiter output.sh:

| patenter | permiter |
|----------|----------|
| `print_eagle_header()` | `emit_blocked()` |
| `print_tree_start()` | inline treestruct |
| generic tree functions | domain-specific emit |

**why it holds**: both use eagle mascot + treestruct. permiter output.sh is simpler because it only emits blocked message. this is appropriate for stubs.

### domain objects - no duplication

reviewed permit domain objects against patent domain objects:
- Permit vs (no direct equivalent)
- PermitDetermination vs (no direct equivalent)
- PermitCodeSection vs (no direct equivalent)
- PermitJurisdiction vs (no direct equivalent)
- PermitWorkDescription vs (no direct equivalent)
- PermitCodeCitation vs (no direct equivalent)

**why it holds**: these are new domain concepts specific to permits. no extant objects to reuse.

### web scrape utilities - NOT created

the original blueprint included scrape utilities. they were pruned because goal 2 is blocked.

**why it holds**: no duplication possible when code was not created.

## conclusion

no duplication found. goal 1 mechanisms are domain-specific. goal 2 stubs parallel patenter structure and will use shared kermet when unblocked.
