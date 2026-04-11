# self-review: has-ergonomics-reviewed (round 2)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.2.distill.repros.experience._.yield.md

---

## deeper ergonomics review

### re-examined: pit of success principles

#### intuitive design: can users succeed without documentation?

**permit.check.required**: yes. `--postal` and `--work` are self-explanatory. the output (determination + proof chain) is readable without prior knowledge.

**permit.search**: mostly yes. `--address` and `--postal` are clear. `--since`, `--until`, `--limit` follow common CLI patterns.

**permit.fetch**: partially. user must know the permit ID format, which varies by jurisdiction. **this is an intentional constraint** — the ID comes from a prior search, not user memory.

#### convenient: can we infer inputs rather than require them?

**issue found in r1**: postal could be inferred from address.

**deeper look**: is this actually a problem?

consider: "123 Main St, Indianapolis, IN 46220"
- to parse this reliably requires geocode API or address parser
- adds dependency and latency
- edge cases: malformed addresses, ambiguous cities

**resolution**: keep postal required for v1. explicit > implicit for legal research. user knows their ZIP; require them to type it to prevent address parse errors.

**verdict**: no change. explicit postal is correct for v1.

#### expressive: does it allow expression of differences?

**permit.search**: yes. filters (`--since`, `--until`, `--limit`) allow refinement without complexity.

**permit.check.required**: yes. `--work` is free text — user can describe work however they want.

**permit.fetch**: no filters needed — it's an exact lookup.

**verdict**: holds. expressiveness is appropriate for each skill.

#### composable: can this be combined with other operations easily?

**search → fetch**: yes. search returns permit IDs, fetch accepts permit IDs. natural composition.

**check.required → search**: less natural. if permit is required, user may want to see if one exists. could add `--then-search` flag in future.

**verdict**: core composition (search → fetch) is solid. check → search composition is a v2 enhancement.

#### lower trust contracts: do we validate at boundaries?

**postal**: must be 5-digit US ZIP. validated before research.

**work**: free text, but empty string rejected. no further validation — interpretation happens at research time.

**address**: format-validated as non-empty string. actual address validation happens at portal.

**permit ID**: format-validated per jurisdiction pattern.

**verdict**: holds. validation at boundaries is appropriate.

#### deeper behavior: do we handle edge cases gracefully?

| edge case | how handled |
|-----------|-------------|
| work ambiguous | determination = "unclear" + suggested questions |
| address not found | error with format hint |
| permit ID not found | error with format hint |
| portal unavailable | error with retry hint |
| code behind paywall | cite as "not publicly available" |

**verdict**: all edge cases have graceful degradation.

---

## new issues found in round 2

none. r1 already identified the key friction points:
1. pagination cursor alias (improvement)
2. postal inference (v2 enhancement)

---

## why design holds

1. **explicit postal** is correct for legal research — user should confirm their jurisdiction, not rely on address parser.

2. **permit ID opacity** is acceptable — the search → fetch journey is natural.

3. **"unclear" determination** is the right escape hatch — forced guesses are worse than honest uncertainty.

4. **treestruct output** is scannable and consistent with other rhight skills (patenter).

---

## conclusion

round 2 review complete. design holds. no new issues found. r1 improvements (pagination cursor) remain valid.
