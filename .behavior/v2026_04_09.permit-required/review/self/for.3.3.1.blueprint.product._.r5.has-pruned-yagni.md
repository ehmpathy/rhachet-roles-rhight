# self-review: has-pruned-yagni (round 5)

## reviewer
mechanic (self)

## date
2026-04-10

## stone
3.3.1.blueprint.product.yield.md

---

## deeper reflection: premature optimization check

### optimization 1: file-based cache

**what we built**: cache permits, jurisdictions, code sections to local files

**was this requested?**
- vision does not explicitly request cache
- vision does mention "cached query < 5s" as target

**is this premature optimization?**
- no. without cache, every `permit.check.required` hits the portal
- portal scrape is slow (30+ seconds)
- cache is minimal implementation (file write after scrape)

**verdict**: not premature. cache is essential for usable response times.

### optimization 2: separate operation files

**what we built**: one file per operation (getOnePermit.ts, setPermit.ts, etc.)

**was this requested?**
- not explicitly, but mechanic pattern requires it
- follows `rule.require.sync-filename-opname`

**is this premature optimization?**
- no. single-responsibility is a code quality requirement, not optimization

**verdict**: not premature. follows established patterns.

### optimization 3: selector versioning

**what we built**: `indianapolis.accela.v2026-04.ts` instead of just `indianapolis.ts`

**was this requested?**
- not explicitly

**is this premature optimization?**
- potentially. we added version suffix "in case portal changes"
- but: the file is tiny (one selector map), version adds near-zero overhead
- and: research identified portal fragility as a known risk

**verdict**: borderline, but acceptable. version suffix is one line of filename, protects against known risk.

### optimization 4: both `.integration.test.ts` and `.play.integration.test.ts`

**what we built**: two test files per skill

**was this requested?**
- yes, per mechanic `rule.require.test-coverage-by-grain`
- and `rule.require.snapshots`

**is this premature optimization?**
- no. unit assertions verify correctness, play tests capture aesthetics
- both are established mechanic patterns

**verdict**: not premature. required by mechanic briefs.

### optimization 5: output.sh files

**what we built**: separate output.sh per skill for treestruct format

**was this requested?**
- not explicitly

**is this premature optimization?**
- potentially. could inline format in main skill
- but: separation enables reuse if format needs update
- and: follows patenter pattern (patent.priors has output.sh)

**verdict**: borderline, but acceptable. follows established patenter pattern.

---

## what could we delete?

| candidate | delete? | why |
|-----------|---------|-----|
| selector version suffix | no | one line, protects against known portal fragility |
| output.sh files | no | follows patenter pattern, enables format reuse |
| separate test files | no | required by mechanic briefs |

**no items to delete**. borderline cases follow established patterns or protect against known risks.

---

## conclusion

examined five potential optimizations. three are required by mechanic patterns. two are borderline (selector versioning, output.sh) but follow established patenter patterns and protect against documented risks. no premature optimization identified that should be deleted.

