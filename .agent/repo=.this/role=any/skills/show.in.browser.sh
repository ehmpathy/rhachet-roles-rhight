#!/usr/bin/env bash
######################################################################
# .what = open a local file in the browser, from a path the browser
#         can actually reach
#
# .why  = Firefox here is a flatpak, so it is sandboxed and cannot read
#         most of the filesystem — including this repo. hand it an
#         in-repo path and it reports:
#
#           Firefox can't find the file at ~/git/.../thing.html
#
#         which reads like a broken artifact but is a permissions
#         result. the file was fine the whole time.
#
#         this skill drops the file into ~/Downloads (which flatpak
#         grants via xdg-download) and opens THAT, so the failure
#         cannot happen.
#
# usage:
#   show.in.browser.sh --file art/report.html                  # plan
#   show.in.browser.sh --file art/report.html --mode apply     # open it
#   show.in.browser.sh --file art/page.html --with art/logo.png --mode apply
#
# options:
#   --file    the file to open (required)
#   --with    a companion asset to drop beside it; repeatable.
#             use this for anything the file references RELATIVELY,
#             or the render breaks silently
#   --into    drop directory (default ~/Downloads)
#   --as      dropped filename (default: the file's own basename)
#   --mode    plan | apply (default plan)
#   --help    show usage and exit
#
# guarantee:
#   - never opens a path the browser cannot read
#   - plan mode shows the dropped paths and the launcher, opens no window
#   - a file already inside --into is opened where it lies, not copied
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ relative asset refs are the trap. an html that references
#    <img src="logo.png"> renders with an empty box unless logo.png is
#    dropped too — and an empty box looks like a DESIGN defect, not a
#    file-not-found. pass every referenced asset via --with.
######################################################################
set -euo pipefail

FILE=""
INTO="${HOME}/Downloads"
AS=""
MODE="plan"
WITH=()

# print the doc header, bounded by its own fences, so the help text
# can never drift out of sync with a hardcoded line range
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

print_blocked() {
  echo ""
  echo "🦅 that wont work..."
  echo ""
  echo "🔭 show.in.browser"
  echo "   └─ blocked: $1"
}

######################################################################
# parse args
######################################################################
while [[ $# -gt 0 ]]; do
  case $1 in
    --skill | --repo | --role) shift 2 ;;
    --file) FILE="${2:-}"; shift 2 ;;
    --with) WITH+=("${2:-}"); shift 2 ;;
    --into) INTO="${2:-}"; shift 2 ;;
    --as) AS="${2:-}"; shift 2 ;;
    --mode) MODE="${2:-}"; shift 2 ;;
    --help | -h) show_help; exit 0 ;;
    *)
      # allow a bare path as the first positional
      if [[ -z "$FILE" ]] && [[ "$1" != --* ]]; then
        FILE="$1"; shift
      else
        print_blocked "unknown argument: $1"; exit 2
      fi
      ;;
  esac
done

######################################################################
# validate
######################################################################
if [[ -z "$FILE" ]]; then
  print_blocked "--file is required"
  exit 2
fi
if [[ ! -f "$FILE" ]]; then
  print_blocked "not a file: $FILE"
  exit 2
fi
if [[ "$MODE" != "plan" ]] && [[ "$MODE" != "apply" ]]; then
  print_blocked "--mode must be plan or apply"
  exit 2
fi
for asset in "${WITH[@]+"${WITH[@]}"}"; do
  if [[ ! -f "$asset" ]]; then
    print_blocked "--with asset not a file: $asset"
    exit 2
  fi
done

######################################################################
# pick the launcher
#
# prefer the human's own `browser` wrapper when they have one — it
# already encodes how THEY want a browser opened, and second-guessing
# that is how you end up with two firefox profiles.
#
# a flatpak firefox has no `firefox` on PATH, so check flatpak next,
# then the native binary, then the desktop handler.
######################################################################
LAUNCHER=""
LAUNCHER_KIND=""
if command -v browser >/dev/null 2>&1; then
  LAUNCHER="browser"
  LAUNCHER_KIND="browser (the human's own wrapper)"
elif command -v flatpak >/dev/null 2>&1 &&
  flatpak info org.mozilla.firefox >/dev/null 2>&1; then
  LAUNCHER="flatpak run org.mozilla.firefox"
  LAUNCHER_KIND="firefox (flatpak, sandboxed)"
elif command -v firefox >/dev/null 2>&1; then
  LAUNCHER="firefox"
  LAUNCHER_KIND="firefox (native)"
elif command -v xdg-open >/dev/null 2>&1; then
  LAUNCHER="xdg-open"
  LAUNCHER_KIND="xdg-open (desktop default)"
else
  print_blocked "found no way to open a browser (no flatpak firefox, no firefox, no xdg-open)"
  exit 2
fi

######################################################################
# place the file where the browser can read it
######################################################################
if [[ -z "$AS" ]]; then AS="$(basename "$FILE")"; fi

FILE_ABS="$(cd "$(dirname "$FILE")" && pwd)/$(basename "$FILE")"
TARGET_ABS="${INTO%/}/${AS}"

PLACEMENT="copied"
if [[ "$FILE_ABS" == "$TARGET_ABS" ]]; then
  PLACEMENT="already in place"
fi

DROPPED_ASSETS=()
for asset in "${WITH[@]+"${WITH[@]}"}"; do
  DROPPED_ASSETS+=("${INTO%/}/$(basename "$asset")")
done

######################################################################
# report + act
######################################################################
echo ""
if [[ "$MODE" == "plan" ]]; then
  echo "🦅 heres what id open"
else
  echo "🦅 take a look"
fi
echo ""
echo "🔭 show.in.browser --mode $MODE"
echo "   ├─ file: $FILE"
echo "   ├─ launcher: $LAUNCHER_KIND"
echo "   ├─ dropped: $TARGET_ABS ($PLACEMENT)"
if [[ ${#DROPPED_ASSETS[@]} -gt 0 ]]; then
  echo "   ├─ assets"
  for i in "${!DROPPED_ASSETS[@]}"; do
    if [[ $i -eq $((${#DROPPED_ASSETS[@]} - 1)) ]]; then
      echo "   │  └─ ${DROPPED_ASSETS[$i]}"
    else
      echo "   │  ├─ ${DROPPED_ASSETS[$i]}"
    fi
  done
fi
echo "   └─ url: file://${TARGET_ABS}"

if [[ "$MODE" == "plan" ]]; then
  echo ""
  echo "   rerun with --mode apply to open it"
  echo ""
  exit 0
fi

mkdir -p "$INTO"
if [[ "$PLACEMENT" == "copied" ]]; then
  cp "$FILE" "$TARGET_ABS"
fi
for asset in "${WITH[@]+"${WITH[@]}"}"; do
  cp "$asset" "${INTO%/}/$(basename "$asset")"
done

# detach, so the browser outlives this process and never blocks it
nohup $LAUNCHER "$TARGET_ABS" >/dev/null 2>&1 &
disown || true

echo ""
echo "   opened. if no window appeared, the browser may already be up —"
echo "   check for a new tab."
echo ""
