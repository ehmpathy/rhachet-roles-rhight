# review: has-clear-instructions (round 1)

## question

are the instructions followable? can the foreman follow without prior context? are commands copy-pasteable? are expected outcomes explicit?

## method

walked through each instruction in the playtest, verified commands are complete and outcomes are specified.

---

## instruction-by-instruction review

### prerequisites section

```markdown
- git repository (any repo with `.git/` directory)
- `PATENTSVIEW_API_KEY` environment variable set (get key at https://patentsview.org/apis/keyrequest)
- rhachet installed (`npm install` in rhachet-roles-rhight)
```

| criteria | pass? | notes |
|----------|-------|-------|
| no prior context needed | yes | explains what's needed |
| copy-pasteable | yes | URL provided for API key |
| explicit outcome | yes | lists all prerequisites |

---

### sandbox section

```bash
# create sandbox
mkdir -p .temp/playtest-patenter
cd .temp/playtest-patenter
git init
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | commands run as written |
| sandbox path | yes | uses `.temp/` not repo root |
| clear purpose | yes | comment explains intent |

---

### happy path 1: search for prior art

**command:**
```bash
rhx patent.priors.search --query "neural network model compression"
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | complete command |
| expected outcome explicit | yes | lists 5 specific outcomes |
| pass criteria explicit | yes | 3 specific checks |

---

### happy path 2: search with date filters

**command:**
```bash
rhx patent.priors.search --query "machine learning" --since 2020-01-01 --limit 5
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | complete command with flags |
| expected outcome explicit | yes | 3 specific outcomes |
| pass criteria explicit | yes | 2 specific checks |

---

### happy path 3: fetch a patent

**command:**
```bash
rhx patent.priors.fetch --exid US20210234567A1
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | complete command with example exid |
| expected outcome explicit | yes | 4 specific outcomes |
| pass criteria explicit | yes | 3 specific checks |

note: includes comment "use an exid from search results, or use known valid exid"

---

### happy path 4: propose new route

**commands:**
```bash
cd .temp/playtest-patenter
rhx patent.propose
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | complete commands |
| sandbox path | yes | uses `.temp/` |
| expected outcome explicit | yes | 5 specific outcomes |
| pass criteria explicit | yes | lists exact files to check |

---

### happy path 5: propose with --open

**commands:**
```bash
mkdir -p .temp/playtest-patenter-open
cd .temp/playtest-patenter-open
git init
rhx patent.propose --open cat
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | complete setup + command |
| sandbox path | yes | separate `.temp/` directory |
| clever test | yes | uses `cat` as harmless "editor" |
| expected outcome explicit | yes | 3 specific outcomes |

---

### edge paths e1-e7

all edge paths follow the same pattern:
- copy-pasteable command
- expected behavior described
- pass criteria with specific checks
- exit code specified (exit 2 for errors)

| edge path | command complete? | expected explicit? | pass criteria? |
|-----------|-------------------|-------------------|----------------|
| e1 short query | yes | yes | yes |
| e2 no query | yes | yes | yes |
| e3 invalid exid | yes | yes | yes |
| e4 no API key | yes | yes | yes |
| e5 route extant | yes | yes | yes |
| e6 no git | yes | yes | yes |
| e7 help flags | yes | yes | yes |

---

### cleanup section

```bash
rm -rf .temp/playtest-patenter
rm -rf .temp/playtest-patenter-open
rm -rf .temp/playtest-nogit
```

| criteria | pass? | notes |
|----------|-------|-------|
| copy-pasteable | yes | complete commands |
| removes all sandboxes | yes | matches all created directories |

---

### pass/fail summary table

| test | pass if | fail if |
|------|---------|---------|
| search | results or empty with 🦅 header | error, no mascot, exit != 0 |

| criteria | pass? | notes |
|----------|-------|-------|
| explicit pass criteria | yes | specific observable outcomes |
| explicit fail criteria | yes | specific failure indicators |

---

## why it holds

1. **no prior context needed**: prerequisites list all that is needed
2. **copy-pasteable**: every command is complete and runnable
3. **expected outcomes explicit**: each step has specific outcomes listed
4. **pass criteria explicit**: each step has specific checks
5. **sandbox protected**: all file operations target `.temp/`
6. **cleanup provided**: removes all created directories

the foreman can follow these instructions without prior codebase knowledge.

---

## conclusion

clear instructions: **verified**

all 12 test steps (5 happy + 7 edge) have:
- complete commands
- explicit expected outcomes
- specific pass/fail criteria
