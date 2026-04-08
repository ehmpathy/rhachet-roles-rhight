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

---

## fresh verification (2026-04-04)

### the core question restated

can a foreman with no prior context follow these instructions?

### walkthrough with fresh eyes

#### prerequisites

| item | followable? | why |
|------|-------------|-----|
| git repo | yes | states "any repo with `.git/`" — clear |
| API key | yes | provides exact URL for registration |
| rhachet | yes | states exact install command |

no ambiguity. foreman knows exactly what to prepare.

#### sandbox setup

```bash
mkdir -p .temp/playtest-patenter
cd .temp/playtest-patenter
git init
```

| question | answer |
|----------|--------|
| where to run? | from repo root |
| what gets created? | isolated `.temp/` directory |
| any risk to repo? | no — sandbox is separate |

#### happy path commands

| path | command complete? | can copy-paste? |
|------|-------------------|-----------------|
| 1. search | `rhx patent.priors.search --query "..."` | yes |
| 2. date filter | `rhx patent.priors.search --query "..." --since ... --limit ...` | yes |
| 3. fetch | `rhx patent.priors.fetch --exid US...` | yes |
| 4. propose | `rhx patent.propose` | yes |
| 5. open | `rhx patent.propose --open cat` | yes |

all commands are complete — no placeholders that would confuse foreman.

#### expected outcomes

each test specifies:
- what the output should contain
- what exit code to expect
- specific pass criteria

example from test 1:
```
- output starts with `🦅` mascot header
- shows `patent.priors.search` section
- lists query and result count
- exit code 0
```

foreman knows exactly what "success" looks like.

#### edge path commands

| path | command complete? | error message specified? |
|------|-------------------|--------------------------|
| e1 short query | yes | "too short" or "3 character" |
| e2 no query | yes | "query required" |
| e3 invalid exid | yes | "invalid" and "format" |
| e4 no API key | yes | "API key required" |
| e5 route extant | yes | "already" or "extant" |
| e6 no git | yes | "git repository" |
| e7 help | yes | "usage" |
| e8 long query | yes | "too long" or "1000" |
| e9 not found | yes | "not found" |

all edge cases specify both command and expected error.

#### cleanup

removes all three sandbox directories. foreman leaves no trace.

### what would make me fail this review?

| red flag | present? |
|----------|----------|
| placeholder commands like `<your-query>` | no — all concrete |
| vague outcomes like "should work" | no — all specific |
| hidden dependencies | no — prerequisites list all |
| commands that modify repo root | no — all in `.temp/` |

### conclusion

clear instructions: **confirmed with fresh trace**

the playtest is followable by someone with no prior context because:
1. prerequisites are explicit and complete
2. commands are copy-pasteable without modification
3. expected outcomes are observable and specific
4. pass/fail criteria are unambiguous
