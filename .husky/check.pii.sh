#!/bin/sh

# .what = block a commit — or a push — that would capture PII
#
# .why  = the commit object is the irreversible boundary. once a real
#         SSN is committed it gets pushed, cloned, and cached, and the
#         cheap fix (edit a file) becomes a history rewrite.
#
# ⚠️ unlike check.yalc.sh, which only warns, this one EXITS NON-ZERO.
#    a warn is the wrong shape here: the whole value of the gate is
#    that the commit does not happen.
#
# ⚠️ COMMIT is the only boundary this repo gates, deliberately. a
#    pre-push hook was built and then removed: it would fire on every
#    push of an already-clean branch, and the branch was already scanned
#    at each commit that built it. the residual it covered — a
#    `--no-verify` commit — is a deliberate act, and CI catches it at
#    the PR while the branch is still rewritable.
#
#    so there is no scope knob. the scope is the staged set, and a
#    parameter with one caller is a second place for the guarantee to
#    drift.
#
# ⚠️ the scanner is invoked BY PATH, not through the rhachet registry.
#    routed invocation needs a current build plus `rhachet roles link`,
#    so a stale or failed build turns the gate into a hard block with a
#    misleading reason. this hook guards THIS repo, and the executable
#    is always right there beside it — so the direct path is both
#    simpler and the one with fewer ways to be wrong.

# ⚠️ POSIX sh ONLY, no bashisms. `pre-commit` is #!/bin/sh, /bin/sh is
#    dash on many machines, and husky re-execs the whole chain under
#    `sh -e`. an earlier draft used ${BASH_SOURCE[0]} to find the
#    scanner beside this file; under dash that is a "Bad substitution",
#    which left the path empty, sent the lookup to the wrong directory,
#    and made EVERY commit fail with "scanner not found" — a gate that
#    blocked clean commits and never once scanned. it passed every test
#    that invoked the hook directly under bash.
#
# so anchor to the repo top-level instead. git runs hooks from there,
# and check.yalc.sh already leans on the same guarantee.
REPO_TOP="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SCANNER="$REPO_TOP/src/domain.roles/transcriber/skills/pii.scan/pii.scan.sh"

if [ ! -f "$SCANNER" ]; then
    echo ""
    echo "✋ commit blocked: the PII scan could not run."
    echo ""
    echo "   the scanner was not found at:"
    echo "     $SCANNER"
    echo ""
    echo "   a gate that could not run must never look like a gate that"
    echo "   passed, so this blocks rather than waves it through."
    echo ""
    exit 1
fi

# ⚠️ `|| status=$?` carries weight here, it is not style. husky
#    re-execs under `sh -e`, so a BARE command that fails aborts the
#    shell on the spot — git would still block, but the hook's own
#    verdict would never print. inside a tested command, errexit stands
#    down.

# the roster is optional and LOCAL — it is the re-identification key,
# so it is gitignored and a fresh clone has none. where it exists it
# carries the values no regex can see: names, an address with no unit
# word, a derived IRS name control.
ROSTER_ARG=""
if [ -f "$REPO_TOP/.pii-map" ]; then
    ROSTER_ARG="--roster $REPO_TOP/.pii-map"
fi

# a LOCAL allowlist, gitignored like the roster. it holds the public
# values that happen to equal a roster value — a statute date, a state
# name, a fee. those cannot go in the tracked .pii-allow: a published
# line that mutes a plain public value says the value is on the roster.
# where it exists, it merges with .pii-allow for this one scan.
ALLOW_ARG=""
if [ -f "$REPO_TOP/.pii-allow.local" ]; then
    ALLOW_MERGED="$(mktemp)"
    cat "$REPO_TOP/.pii-allow" "$REPO_TOP/.pii-allow.local" > "$ALLOW_MERGED" 2>/dev/null
    # the scanner skips only the allow file it was handed, so name the
    # tracked one here, or its own entries read as hits
    ALLOW_ARG="--allow $ALLOW_MERGED --paths-wout .pii-allow"
fi

# ⚠️ ONE call, on purpose. `pii.scan` is a dispatcher: it runs the
#    deterministic pass first, and asks the brains only on a set that
#    pass already called clean. that SEQUENCE is the safety property —
#    a probabilistic reviewer must never be able to overturn a
#    deterministic hit — and it lives inside the skill precisely so no
#    caller can get it wrong. a hook that sequenced the two mechanisms
#    by hand would be a second place for that guarantee to drift.
#
# the scope flag is `rhx review`'s, verbatim: --diffs since-staged.
status=0
# shellcheck disable=SC2086 # ROSTER_ARG and ALLOW_ARG are flag pairs, not paths
bash "$SCANNER" --diffs since-staged $ROSTER_ARG $ALLOW_ARG || status=$?
[ -n "${ALLOW_MERGED:-}" ] && rm -f "$ALLOW_MERGED"

if [ $status -eq 0 ]; then
    return 0 2>/dev/null || exit 0
fi

# 2 = PII was found — by the regexes, by the roster, or by a brain.
# the skill's own output above already names which mechanism caught it.
if [ $status -eq 2 ]; then
    echo ""
    echo "✋ commit blocked: the staged set carries PII."
    echo ""
    echo "   if a DETECTOR or the ROSTER caught it: fix the value, or —"
    echo "   where it is synthetic or public — add it to .pii-allow with"
    echo "   a reason."
    echo ""
    echo "   if a BRAIN caught it: the regexes passed, so this is a value"
    echo "   with no fixed shape — a name, an address, a derived id — or"
    echo "   a set of harmless facts that together name one person. add"
    echo "   the pair to .pii-map, and the roster catches it exactly and"
    echo "   offline from now on."
    echo ""
    echo "   to bypass in a genuine emergency: git commit --no-verify."
    echo "   this is the LAST local gate — after it, the next check is CI"
    echo "   on the PR, and by then the value sits in a commit object."
    echo ""
    exit 2
fi

# every other code = a mechanism could not run. report THAT, not PII: to
# claim a leak that was never detected sends someone off to hunt for a
# value that may not exist, and teaches them to distrust the gate.
echo ""
echo "✋ commit blocked: the PII scan could not run (exit $status)."
echo ""
echo "   this is a MALFUNCTION, not a detected leak — the staged set was"
echo "   never fully examined. a gate that could not run must never look"
echo "   like a gate that passed."
echo ""
echo "   most often: keyrack is locked, so the brain pass could not ask."
echo "   unlock and retry:"
echo "     rhx keyrack unlock --owner ehmpath --env test"
echo ""
echo "   for the free, offline half only, add: --via regex"
echo ""
exit 1
