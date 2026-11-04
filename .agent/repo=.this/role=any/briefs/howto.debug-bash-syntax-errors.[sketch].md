# howto: debug bash syntax errors faster

## .what

when tests fail with exit code 2 and empty stdout, check stderr for syntax errors before investigating logic.

## .the pattern

symptoms:
- tests fail with exit code 2
- stdout is empty (no error messages printed)
- skill never reaches any output statements

diagnosis:
```typescript
// always capture stderr in integration tests
const result = spawnSync('bash', [skillPath, ...args], {
  cwd: tempDir,
  encoding: 'utf-8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

// check stderr FIRST when debugging
console.log('stderr:', result.stderr);
console.log('stdout:', result.stdout);
console.log('status:', result.status);
```

## .root cause

bash `set -euo pipefail` causes shell to exit immediately on syntax error — before any output statements run. exit code 2 from bash indicates syntax error.

## .common bash syntax traps

### regex with parentheses

```bash
# 🚫 broken — `)` inside [^)] confuses bash
if [[ "$HEADER" =~ ^[a-z]+\(([^)]+)\): ]]; then

# ✓ use sed instead
SCOPE=$(echo "$HEADER" | sed -n 's/^[a-z]*(\([^)]*\)):.*/\1/p')
```

### awk interval expressions match no line, silently

`awk` on Debian/Ubuntu is usually **mawk**, which does not support `{n,m}`
interval expressions. the pattern does not error — it simply never matches, so
a guard clause quietly does no work and the whole input falls through.

```bash
# 🚫 matches no line under mawk — no error, no warn, wrong result
awk '/^#{10,}$/ { exit }' file.sh

# ✓ works under both mawk and gawk
awk '/^#####/ { exit }' file.sh
```

the tell: an awk filter that should stop early instead emits the whole input
(measured: a `--help` renderer that dumped the whole executable).

**this failure has no exit code and no stderr**, so the flow below misses it.
suspect it whenever awk output is *too long* rather than absent.

### an apostrophe inside `${var:-word}` — even within double quotes

`${var:-word}` performs **quote removal on `word`**, and it does so even when
the whole expansion sits inside double quotes. so a lone `'` in a default value
opens a single-quoted string that runs to the end of the file.

```bash
# 🚫 breaks the PARSE. the ' opens a string that never closes
SIGNER="${SIGNER:-Eagle Of'Rhight}"

# ✓ hold the default in its own variable, where the normal quote rules apply
DEMO_SIGNER="Eagle Of'Rhight"
SIGNER="${SIGNER:-$DEMO_SIGNER}"
```

the error points at the **end of file**, not the line that broke:

```
line 913: unexpected EOF while looking for matching `''
```

on a 930-line file that reads as a corrupt tail rather than a bad default on
line 400.

**the tell is the pass/fail pattern.** paths that `exec`/`exit` out *before* the
broken line (`--help`, `--variants`) still pass; every case past it fails at once.
a genuinely corrupt tail would fail all of them. measured: 22 of 26 tests red
from one apostrophe in a demo name.

### character classes with special chars

```bash
# 🚫 broken — `]` and `)` need special handling in []
if [[ "$x" =~ [^)]+]]; then

# ✓ escape or use different approach
if [[ "$x" =~ [^[:punct:]]+ ]]; then
```

## .faster debug flow

1. **check exit code** — if 2, suspect syntax error
2. **check stderr first** — bash syntax errors go to stderr
3. **look for line number** — bash error messages include line number
4. **validate skill** — run `bash -n skill.sh` to check syntax without executing

```bash
# validate syntax without running
bash -n git.commit.set.sh
```

## .prevention

1. use `bash -n` in CI to catch syntax errors before tests run
2. prefer sed/awk for complex regex instead of bash `[[ =~ ]]`
3. test regex patterns in isolation before embedding in shell code

## .see also

- howto.debug-hooks.[lesson].md
