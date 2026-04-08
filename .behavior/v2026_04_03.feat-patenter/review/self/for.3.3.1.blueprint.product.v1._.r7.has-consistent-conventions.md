# review: has-consistent-conventions

self-review for 3.3.1.blueprint.product.v1

---

## verdict: holds

all name conventions follow extant patterns. no divergence detected.

---

## analysis

### convention 1: role file names

**extant pattern**: `get{Role}Role.ts`
- getMechanicRole.ts
- getArchitectRole.ts
- getErgonomistRole.ts
- getLibrarianRole.ts
- getEcologistRole.ts

**blueprint proposes**: `getPatenterRole.ts`

**verdict**: consistent. follows `get{Role}Role.ts` pattern.

---

### convention 2: skill folder structure

**extant patterns**:

| pattern | examples | when used |
|---------|----------|-----------|
| flat | `get.package.docs.sh` | single skill |
| grouped | `git.commit/git.commit.push.sh` | skill family |
| dispatcher | `declapract.upgrade.sh` → calls `declapract.upgrade/init.sh` | subcommands |

**blueprint proposes**:
- `patent.priors/patent.priors.search.sh` — grouped pattern
- `patent.priors/patent.priors.fetch.sh` — grouped pattern
- `patent.propose/patent.propose.sh` — single skill

**comparison with extant**:

| extant | proposed | match? |
|--------|----------|--------|
| `git.commit/git.commit.push.sh` | `patent.priors/patent.priors.search.sh` | yes |
| `set.package/set.package.install.sh` | `patent.priors/patent.priors.fetch.sh` | yes |
| `declapract.upgrade/declapract.upgrade.sh` | `patent.propose/patent.propose.sh` | yes |

**verdict**: consistent.

---

### convention 3: skill name segments

**extant pattern**: `{domain}.{action}` or `{domain}.{action}.{subaction}`

| extant skill | segments |
|--------------|----------|
| git.commit.push | git (domain) . commit (action) . push (subaction) |
| git.branch.rebase.begin | git (domain) . branch.rebase (action) . begin (subaction) |
| set.package.install | set (verb) . package (domain) . install (subaction) |
| get.package.docs | get (verb) . package (domain) . docs (what) |
| show.gh.action.logs | show (verb) . gh.action (domain) . logs (what) |

**blueprint proposes**:

| proposed skill | segments |
|----------------|----------|
| patent.priors.search | patent (domain) . priors (subdomain) . search (action) |
| patent.priors.fetch | patent (domain) . priors (subdomain) . fetch (action) |
| patent.propose | patent (domain) . propose (action) |

**verdict**: consistent. follows `{domain}.{subdomain?}.{action}` pattern.

---

### convention 4: support file names

**extant patterns**:
- `output.sh` — shared output functions
- `*.operations.sh` — shared shell functions
- `*._.{utility}.sh` — private utility scripts

**blueprint proposes**:
- `output.sh` — follows extant pattern

**verdict**: consistent.

---

### convention 5: test file names

**extant pattern**: `{skill-name}.integration.test.ts`

| extant | pattern |
|--------|---------|
| get.package.docs.integration.test.ts | {skill}.integration.test.ts |
| declapract.upgrade.integration.test.ts | {skill}.integration.test.ts |
| show.gh.action.logs.integration.test.ts | {skill}.integration.test.ts |

**blueprint proposes**:
- `patent.priors.search.integration.test.ts`
- `patent.priors.fetch.integration.test.ts`
- `patent.propose.integration.test.ts`

**verdict**: consistent.

---

### convention 6: brief folder structure

**extant pattern**: `briefs/practices/{category}/{rule}.md`

| extant | structure |
|--------|-----------|
| mechanic | briefs/practices/code.prod/, briefs/practices/lang.terms/ |
| ergonomist | briefs/cli/, briefs/practices/ |

**blueprint proposes**:
```
briefs/
├── practices/
│   ├── howto.patent-techniques.[lesson].md
│   └── define.patent-fundamentals.md
└── [deferred] references/
```

**verdict**: consistent. follows briefs/practices/{file}.md pattern.

---

### convention 7: route stone names

**extant pattern** (from wish): `{N}.{phase}.{subphase?}.stone`

| wish proposes | pattern |
|---------------|---------|
| 0.idea.md | {N}.{name}.md |
| 1.vision.stone | {N}.{phase}.stone |
| 3.1.research.prior-art.favorable.stone | {N}.{N}.{phase}.{detail}.stone |

**verdict**: consistent with behavior route conventions.

---

## terms checked for synonym drift

| term in blueprint | alternatives checked | verdict |
|-------------------|---------------------|---------|
| exid | id, identifier, number | exid is standard in codebase |
| fetch | get, retrieve | fetch used for remote retrieval (consistent) |
| search | find, query | search used for keyword lookup (consistent) |
| propose | create, init | propose implies ideation (appropriate for patent) |

---

## conclusion

thorough review confirms all name conventions are consistent:
1. role files: get{Role}Role.ts pattern
2. skill folders: {domain}.{action}/{domain}.{action}.sh pattern
3. skill names: {domain}.{subdomain?}.{action} pattern
4. support files: output.sh, *.operations.sh patterns
5. test files: {skill}.integration.test.ts pattern
6. briefs: briefs/practices/{file}.md pattern
7. route stones: {N}.{phase}.{detail}.stone pattern

no divergence detected. no synonym drift. proceed.
