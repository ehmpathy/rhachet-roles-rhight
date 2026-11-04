#!/bin/sh

# .what = block a commit that would capture PII
#
# .why  = the commit object is the irreversible boundary. once a real
#         SSN is committed it gets pushed, cloned, and cached, and the
#         cheap fix (edit a file) becomes a history rewrite.
#
# ⚠️ this hook EXITS NON-ZERO, never warns: the whole value of the gate
#    is that the commit does not happen.
#
# ⚠️ COMMIT is the only boundary this repo gates. a branch is scanned at
#    each commit that builds it, so a push gate would rescan a clean
#    branch. a `--no-verify` commit is a deliberate act, and CI catches
#    it at the PR while the branch is still rewritable.
#
#    so there is no scope knob. the scope is the staged set, and a
#    parameter with one caller is a second place for the guarantee to
#    drift.
#
# ⚠️ the scanner is invoked BY PATH, not through the rhachet registry.
#    routed invocation needs a current build plus `rhachet roles link`,
#    so a stale or failed build turns the gate into a hard block with a
#    misleading reason. this hook guards THIS repo, and the executable
#    sits at a fixed path under the repo top — so the direct path is
#    both simpler and the one with fewer ways to be wrong.

# ⚠️ POSIX sh ONLY, no bashisms. `pre-commit` is #!/bin/sh, /bin/sh is
#    dash on many machines, and husky re-execs the whole chain under
#    `sh -e`. a bashism such as ${BASH_SOURCE[0]} is a "Bad substitution"
#    under dash: the scanner path goes empty and every commit fails with
#    "scanner not found", a gate that blocks clean commits and never
#    scans. a test that runs the hook under bash cannot see it.
#
# so anchor to the repo top-level, which git names. a git that cannot
# name it is its own cause, never a scanner that went absent.
if ! REPO_TOP="$(git rev-parse --show-toplevel)"; then
    echo ""
    echo "💥 MalfunctionError: the PII scan could not run, so the commit is blocked."
    echo ""
    echo "   git could not name the repo top (git rev-parse --show-toplevel"
    echo "   failed; its error is above). run the commit from inside the repo."
    echo ""
    exit 1
fi
SCANNER="$REPO_TOP/src/domain.roles/transcriber/skills/pii.scan/pii.scan.sh"

# ⚠️ husky re-runs the whole pre-commit chain (`sh -e "$0" "$@"`), and
#    this file is sourced ABOVE the husky guard, so it runs in both
#    passes. a second paid review of the same staged set adds no safety.
#    so a clean scan records the staged tree, and a pass that sees that
#    same tree skips. a staged set that changed, or a var set by hand to
#    any other tree, scans as normal.
TREE_STAGED="$(git write-tree 2>/dev/null || true)"
if [ -n "$TREE_STAGED" ] && [ "${PII_SCAN_CLEAN_TREE:-}" = "$TREE_STAGED" ]; then
    return 0 2>/dev/null || exit 0
fi

if [ ! -f "$SCANNER" ]; then
    echo ""
    echo "💥 MalfunctionError: the PII scan could not run, so the commit is blocked."
    echo ""
    echo "   the scanner was not found at:"
    echo "     $SCANNER"
    echo "   restore it from git (git checkout -- that path), or reinstall"
    echo "   the role package, then retry."
    echo ""
    echo "   a gate that could not run must never look like a gate that"
    echo "   passed, so this blocks rather than waves it through."
    echo "   to bypass in a genuine emergency: git commit --no-verify. CI"
    echo "   scans the PR, while the branch is still rewritable."
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
ROSTER_FILE=""
if [ -f "$REPO_TOP/.pii-map" ]; then
    ROSTER_FILE="$REPO_TOP/.pii-map"
fi

# a LOCAL allowlist, gitignored like the roster. it holds the public
# values that happen to equal a roster value — a statute date, a state
# name, a fee. those cannot go in the tracked .pii-allow: a published
# line that mutes a plain public value says the value is on the roster.
# where it exists, it merges with .pii-allow for this one scan.
ALLOW_MERGED=""
if [ -f "$REPO_TOP/.pii-allow.local" ]; then
    # a temp file that cannot be made must say so; under `sh -e` a bare
    # failed assignment would exit with no message
    # untested on purpose: a failed mktemp needs a full or read-only temp
    # dir, which no hermetic case can stage without root
    if ! ALLOW_MERGED="$(mktemp)"; then
        echo ""
        echo "💥 MalfunctionError: the PII scan could not run, so the commit is blocked."
        echo ""
        echo "   no temp file for the merged allowlist (mktemp failed; its"
        echo "   error is above). check that TMPDIR is writable, then retry."
        echo ""
        exit 1
    fi
    # merge each allowlist that exists. a read that fails must block: a
    # partial allowlist turns a muted public value into a false PII hit
    for ALLOW_FILE in "$REPO_TOP/.pii-allow" "$REPO_TOP/.pii-allow.local"; do
        [ -f "$ALLOW_FILE" ] || continue
        if ! cat "$ALLOW_FILE" >> "$ALLOW_MERGED"; then
            rm -f "$ALLOW_MERGED"
            echo ""
            echo "💥 MalfunctionError: the PII scan could not run, so the commit is blocked."
            echo ""
            echo "   the allowlist could not be read:"
            echo "     $ALLOW_FILE"
            echo "   fix its permissions, then retry."
            echo ""
            exit 1
        fi
    done
fi

# .what = run the scanner on the staged set, with the roster and allowlist
# .why  = the argv is built in "$@", the one POSIX array, so a repo top or
#         temp dir with a space or a glob stays one argument. inside a
#         function "$@" is local, so the caller's args (husky re-execs
#         with them) are never touched
run_pii_scan() {
    set -- --diffs since-staged
    if [ -n "$ROSTER_FILE" ]; then
        set -- "$@" --roster "$ROSTER_FILE"
    fi
    # the scanner skips only the allow file it was handed, so name the
    # tracked one here, or its own entries read as hits
    if [ -n "$ALLOW_MERGED" ]; then
        set -- "$@" --allow "$ALLOW_MERGED" --paths-wout .pii-allow
    fi
    bash "$SCANNER" "$@"
}

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
run_pii_scan || status=$?
if [ -n "$ALLOW_MERGED" ]; then rm -f "$ALLOW_MERGED"; fi

if [ $status -eq 0 ]; then
    PII_SCAN_CLEAN_TREE="$TREE_STAGED"
    export PII_SCAN_CLEAN_TREE
    return 0 2>/dev/null || exit 0
fi

# 2 = the scanner blocked: PII found — by the regexes, the roster, or a
# brain — or an input it refused. both are the caller's to fix, and the
# skill's own output above names which one it was.
if [ $status -eq 2 ]; then
    echo ""
    echo "✋ ConstraintError: the PII scan blocked the commit."
    echo ""
    echo "   commit blocked: the staged set carries PII, or the scanner"
    echo "   refused an input. the scan output above names which, and the"
    echo "   fix that fits it."
    echo ""
    echo "   if a detector or the roster caught it: fix the value, or —"
    echo "   where it is synthetic or public — add it to .pii-allow with"
    echo "   a reason."
    echo ""
    echo "   if a brain caught it: the regexes passed, so this is a value"
    echo "   with no fixed shape — a name, an address, a derived id — or"
    echo "   a set of harmless facts that together name one person. fix"
    echo "   the value, or add it to .pii-map as a line of the real value,"
    echo "   a tab, and its stand-in; the roster then catches it exactly"
    echo "   and offline from now on."
    echo ""
    echo "   if the scanner refused an input: the refusal above names the"
    echo "   flag or file at fault. fix it, then retry."
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
echo "💥 MalfunctionError: the PII scan could not run, so the commit is blocked."
echo ""
echo "   the scan exited $status. this is a malfunction, not a PII hit:"
echo "   the staged set was never fully examined. a gate that could not"
echo "   run must never look like a gate that passed."
echo ""
echo "   the scan output above names the cause and the fix that fits it."
echo "   if it names none, the scan died before it could say; the most"
echo "   common cause is a locked keyrack, so unlock it and retry:"
echo "     rhx keyrack unlock --owner ehmpath --env prep"
echo ""
echo "   to bypass in a genuine emergency: git commit --no-verify. CI"
echo "   scans the PR, while the branch is still rewritable."
echo ""
echo "   to run the free, offline regex pass by hand:"
echo "     bash $SCANNER --diffs since-staged --via regex"
echo ""
exit 1
