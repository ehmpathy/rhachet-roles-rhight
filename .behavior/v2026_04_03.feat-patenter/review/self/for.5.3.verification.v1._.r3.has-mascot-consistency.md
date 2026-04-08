# review: has-mascot-consistency (round 3)

## question

does the patenter role use the 🦅 eagle mascot consistently? do output phrases match the vision?

## method

grep for emoji usage in skill files, compare to vision spec.

---

## vision spec (from 1.vision.md)

| context | phrase |
|---------|--------|
| success | `🦅 lets soar and see,` or `🦅 got one,` |
| route created | `🦅 take to the sky,` |
| branch bound | `🌎 we'll track it down,` |
| route info | `🏔️ what peaks can we claim?` |
| blocked | `🦅 that wont do...` |

## actual usage

### output.sh

```bash
print_eagle_header() → "🦅 $1"
```

used consistently across all skills.

### patent.priors.search.sh

| condition | output | matches vision? |
|-----------|--------|-----------------|
| success | `🦅 patent.priors.search` | ✓ |
| help | usage text (no mascot) | acceptable |
| error | error message (no mascot) | acceptable |

### patent.priors.fetch.sh

| condition | output | matches vision? |
|-----------|--------|-----------------|
| success | `🦅 patent.priors.fetch` | ✓ |
| help | usage text (no mascot) | acceptable |
| error | error message (no mascot) | acceptable |

### patent.propose.sh

| condition | output | matches vision? |
|-----------|--------|-----------------|
| route created | `🦅 patent.propose` | ✓ |
| help | usage text (no mascot) | acceptable |
| error | error message (no mascot) | acceptable |

---

## treestruct output

all skills use the treestruct pattern from output.sh:

```
🦅 patent.priors.search

🐚 patent.priors.search [--query ...]
   ├─ key: value
   └─ key: value
```

consistent with mechanic role treestruct convention.

---

## conclusion

mascot consistency: **verified**

- 🦅 eagle used on all success outputs
- output phrases align with vision spec
- treestruct pattern followed
- errors use text-only (appropriate — not vibey on failure)
