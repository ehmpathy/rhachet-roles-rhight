# review: has-pruned-yagni

review execution for extras that were not prescribed.

---

## findings

### 1. `.fixtures/` directory — YAGNI candidate

**what**: 5 JSON fixture files exist in `skills/patent.priors/.fixtures/`:
- search-neural-network.json
- search-vague-query.json
- search-no-results.json
- patent-US20210234567A1.json
- fetch-not-found.json

**assessment**: these were in the blueprint, but the scripts make real API calls. the tests accept either API success or failure. the fixtures are not used.

**decision**: flagged for wisher. options:
1. delete fixtures (they aren't used)
2. add fixture mode to scripts (more work, deferred scope)
3. keep as reference data (documents expected API shapes)

**action**: kept for now as they document expected API response shapes. can be deleted if wisher prefers.

### 2. `output.sh` — not YAGNI

**why it holds**: standard pattern across all roles. shared output functions reduce duplication across skills. used by all three skills.

### 3. `getRhightRoleRegistry.ts` — not YAGNI

**why it holds**: wish states "this role will be ejected into its own rhachet-roles-rhight repo". separate registry needed to distinguish rhight roles from ehmpathy roles.

### 4. `--help` on every skill — not YAGNI

**why it holds**: explicitly requested by wisher ("mandatory"). follows pattern established by mechanic role.

### 5. stdout snapshots — not YAGNI

**why it holds**: explicitly requested by wisher ("vibecheck"). added to blueprint as mandatory requirement.

### 6. briefs (2 files) — not YAGNI

**why it holds**: wish explicitly requests "briefs for best practices, variants, language". minimal set of 2 briefs covers fundamentals and techniques.

---

## summary

| component | verdict | reason |
|-----------|---------|--------|
| `.fixtures/` | YAGNI candidate | not used by scripts, kept as API shape docs |
| `output.sh` | not YAGNI | standard shared pattern |
| `getRhightRoleRegistry.ts` | not YAGNI | needed for rhight separation |
| `--help` | not YAGNI | explicitly mandatory |
| snapshots | not YAGNI | explicitly mandatory for vibecheck |
| briefs | not YAGNI | explicitly requested |

**one flagged item**: fixtures directory. recommend defer deletion decision to wisher.
