# review: has-pruned-backcompat (r2)

deeper review after code inspection.

---

## code inspection findings

reviewed both shell scripts line by line:
- `patent.priors.search.sh` (321 lines)
- `patent.priors.fetch.sh` (285 lines)

### potential backwards compat concerns examined

| concern | code location | assessment |
|---------|---------------|------------|
| exid format regex | fetch.sh:68 | accepts US + 7-11 digits + optional kind code. this is correct USPTO format, not compat |
| cache path | fetch.sh:25 | `~/.cache/rhachet/patents/` is new path, no prior version |
| API endpoint | both scripts | PatentsView API is new integration |
| exit codes | both scripts | semantic codes (0, 1, 2) follow rhachet convention |
| rhachet args | both scripts | ignores --skill, --repo, --role per convention |

### why no backwards compat exists

1. **new role** — patenter is v1, no prior version to maintain compat with
2. **new API** — PatentsView integration is first version
3. **new cache** — cache directory is first version
4. **new output** — treestruct format is standard, not legacy

### what could look like backwards compat but isn't

1. **multiple exid formats** (US12345678A1, US20210234567A1, US7654321B2)
   - these aren't for backwards compat with prior versions
   - they're for correct domain model: USPTO uses multiple format variants

2. **retry logic with exponential backoff**
   - not backwards compat, just robust error recovery

3. **rhachet arg passthrough** (--skill, --repo, --role)
   - not backwards compat, just rhachet convention that all skills follow

---

## conclusion

**zero backwards compat concerns found.**

this is greenfield code with:
- no prior version to maintain compat with
- no legacy API to support
- no deprecated formats to handle

the code is clean and focused on v1 requirements only.
