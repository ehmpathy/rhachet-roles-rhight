# review: has-exit-code-semantics (round 3)

## question

do skills use semantic exit codes? 0=success, 1=malfunction, 2=constraint?

## method

read each skill, traced exit paths.

---

## exit code audit

### patent.priors.search.sh

| condition | exit code | correct? |
|-----------|-----------|----------|
| success (results found) | 0 | ✓ |
| success (no results, valid query) | 0 | ✓ |
| query too short | 2 | ✓ constraint |
| query too long | 2 | ✓ constraint |
| no query provided | 2 | ✓ constraint |
| API key not set | 2 | ✓ constraint |
| network failure | 1 | ✓ malfunction |
| API rate limit | 1 | ✓ malfunction |

### patent.priors.fetch.sh

| condition | exit code | correct? |
|-----------|-----------|----------|
| success (patent fetched) | 0 | ✓ |
| invalid exid format | 2 | ✓ constraint |
| no exid provided | 2 | ✓ constraint |
| API key not set | 2 | ✓ constraint |
| patent not found (404) | 2 | ✓ constraint |
| network failure | 1 | ✓ malfunction |
| API rate limit | 1 | ✓ malfunction |

### patent.propose.sh

| condition | exit code | correct? |
|-----------|-----------|----------|
| success (route created) | 0 | ✓ |
| not in git repo | 2 | ✓ constraint |
| route already extant | 2 | ✓ constraint |
| editor not found | 2 | ✓ constraint |
| mkdir fails | 1 | ✓ malfunction |
| template copy fails | 1 | ✓ malfunction |

---

## conclusion

exit code semantics: **verified**

all skills follow the convention:
- 0 = success
- 1 = malfunction (external error, network, filesystem)
- 2 = constraint (user must fix input or state)
