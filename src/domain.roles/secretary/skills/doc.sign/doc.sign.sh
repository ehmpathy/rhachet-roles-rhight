#!/usr/bin/env bash
######################################################################
# .what = place a cursive signature (and a date) onto one page of a pdf
#
# .why  = e-filed returns and many agency forms arrive with the officer
#         signature block blank, because the wet signature lives on a
#         separate e-file authorization. when an agency asks for "the
#         signed copy", you need to put a signature on that exact line,
#         at that exact spot, without a $20/mo pdf editor and without a
#         re-type of the document.
#
#         doing it by hand in a gui is also how you end up with the
#         signature 40pt off the line, or on the preparer's line
#         instead of the officer's.
#
# usage:
#   doc.sign.sh --pdf return.pdf --name "Ada Lovelace" \
#     --sign-at 85,670 --date-at 262,670 --date 2026-01-15 \
#     --into return.signed.pdf
#
#   doc.sign.sh --pdf return.pdf --name "Ada Lovelace" \
#     --sign-at 85,670 --mode plan          # preview, marks the spot in red
#
# options:
#   --pdf       source pdf (required)
#   --name      the name to render in cursive (required)
#   --sign-at   "X,Y" in pdf points from the TOP-LEFT of the page.
#               Y is the y of the RULE LINE; the signature sits on it.
#   --date      date text; omit to leave the date blank
#   --date-at   "X,Y" for the date, same convention as --sign-at
#   --page      page number to sign (default 1)
#   --into      output pdf (default: <pdf-basename>.signed.pdf)
#   --font      cursive family (default: Herr Von Muellerhoff)
#   --size      signature point size (default 26)
#   --lift      points the signature's BOTTOM sits above the rule
#               (default 0 = rests on it; negative dips below, like a
#               real hand does). raise this and a high-ascender face
#               climbs into the text above the block.
#   --ink       stroke color (default #16264d)
#   --slant     degrees, negative leans right (default -2.5)
#   --dpi       raster resolution for the signed page (default 300)
#   --mode      plan | apply (default plan)
#   --help      show usage and exit
#
# guarantee:
#   - ONLY the signed page is rasterized; every other page is carried
#     through untouched, so no other page loses its text layer
#   - plan mode writes a preview PNG and marks the target spot, so you
#     can confirm the position BEFORE you commit a signature to a form
#   - the page count of the output is checked against the input
#   - the font is cached under ~/.rhachet/cache/fonts and fetched once
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ do NOT use this on a document that needs a NOTARIZED signature.
#    an affidavit needs a jurat — wet ink, in the notary's presence,
#    after the oath. this skill is for e-signature contexts only.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SKILL_DIR/output.sh"

FONT_CACHE="${HOME}/.rhachet/cache/fonts"

PDF=""
NAME=""
SIGN_AT=""
DATE_TEXT=""
DATE_AT=""
PAGE="1"
INTO=""
FONT="Herr Von Muellerhoff"
SIZE="26"
LIFT="0"
INK="#16264d"
SLANT="-2.5"
DPI="300"
MODE="plan"

# print the doc header, bounded by its own fences, so the help text
# can never drift out of sync with a hardcoded line range
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

######################################################################
# parse args
######################################################################
while [[ $# -gt 0 ]]; do
  case $1 in
    --skill | --repo | --role) shift 2 ;;
    --pdf) PDF="${2:-}"; shift 2 ;;
    --name) NAME="${2:-}"; shift 2 ;;
    --sign-at) SIGN_AT="${2:-}"; shift 2 ;;
    --date) DATE_TEXT="${2:-}"; shift 2 ;;
    --date-at) DATE_AT="${2:-}"; shift 2 ;;
    --page) PAGE="${2:-}"; shift 2 ;;
    --into) INTO="${2:-}"; shift 2 ;;
    --font) FONT="${2:-}"; shift 2 ;;
    --size) SIZE="${2:-}"; shift 2 ;;
    --lift) LIFT="${2:-}"; shift 2 ;;
    --ink) INK="${2:-}"; shift 2 ;;
    --slant) SLANT="${2:-}"; shift 2 ;;
    --dpi) DPI="${2:-}"; shift 2 ;;
    --mode) MODE="${2:-}"; shift 2 ;;
    --help | -h) show_help; exit 0 ;;
    *) print_blocked "unknown argument: $1"; exit 2 ;;
  esac
done

######################################################################
# validate
######################################################################
for tool in pdftoppm pdfinfo pdftotext convert identify gs curl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    print_blocked "$tool is required but was not found on PATH"
    exit 2
  fi
done

if [[ -z "$PDF" ]]; then print_blocked "--pdf is required"; exit 2; fi
if [[ ! -f "$PDF" ]]; then print_blocked "--pdf not found: $PDF"; exit 2; fi
if [[ -z "$NAME" ]]; then print_blocked "--name is required"; exit 2; fi
if [[ -z "$SIGN_AT" ]]; then print_blocked "--sign-at is required (e.g. --sign-at 85,670)"; exit 2; fi
if [[ ! "$SIGN_AT" =~ ^[0-9]+(\.[0-9]+)?,[0-9]+(\.[0-9]+)?$ ]]; then
  print_blocked "--sign-at must be X,Y in pdf points (e.g. 85,670)"
  exit 2
fi
if [[ -n "$DATE_TEXT" ]] && [[ -z "$DATE_AT" ]]; then
  print_blocked "--date needs --date-at"
  exit 2
fi
if [[ "$MODE" != "plan" ]] && [[ "$MODE" != "apply" ]]; then
  print_blocked "--mode must be plan or apply"
  exit 2
fi

# ⚠️ the read and the guard below are TWO statements on purpose.
#
#    written as one — `PAGES="$(pdfinfo … | awk …)"` — every guard that
#    follows is UNREACHABLE for a --pdf poppler cannot read. `set -e` plus
#    `pipefail` makes the assignment inherit the pipeline's non-zero status
#    and aborts on the assignment line itself. there is no `not a PDF file`
#    check above, so a .txt renamed .pdf reaches here and dies with no
#    treestruct refusal at all.
#
#    `|| _pdf_info=""` consumes the status so control reaches the guard.
#    the empty-count arm is exit 2: an unreadable --pdf is the CALLER's
#    input to fix, unlike the exit-1 post-condition further down, which
#    reports an output THIS skill produced.
_pdf_info="$(pdfinfo "$PDF" 2>&1)" || _pdf_info=""
PAGES="$(printf '%s\n' "$_pdf_info" | awk '/^Pages:/ { print $2 }')"
if [[ -z "$PAGES" ]]; then
  print_blocked "could not read the page count — is this a valid pdf? $PDF"
  exit 2
fi
if [[ "$PAGE" -lt 1 ]] || [[ "$PAGE" -gt "$PAGES" ]]; then
  print_blocked "--page $PAGE is out of range; the pdf has $PAGES pages"
  exit 2
fi

if [[ -z "$INTO" ]]; then
  INTO="${PDF%.pdf}.signed.pdf"
fi

######################################################################
# look up the font
#
# google fonts picks the format from the User-Agent. an UNKNOWN agent
# gets the ttf, which is what imagemagick needs. a modern agent gets
# woff2 and an MSIE agent gets eot — both useless here. so we ask with
# curl's own agent first, then an ancient Firefox, and never with a
# modern one.
######################################################################
FONT_SLUG="$(echo "$FONT" | tr ' ' '-')"
FONT_FILE="${FONT_CACHE}/${FONT_SLUG}.ttf"
FONT_SOURCE="cache"

if [[ ! -f "$FONT_FILE" ]]; then
  FONT_SOURCE="fetched"
  mkdir -p "$FONT_CACHE"
  FONT_QUERY="$(echo "$FONT" | tr ' ' '+')"
  CSS_URL="https://fonts.googleapis.com/css?family=${FONT_QUERY}"

  TTF_URL=""
  for agent in "" "Mozilla/5.0 (X11; U; Linux i686; en-US) Gecko/20100101 Firefox/3.6"; do
    if [[ -z "$agent" ]]; then
      CSS="$(curl -sfL "$CSS_URL" || true)"
    else
      CSS="$(curl -sfL -A "$agent" "$CSS_URL" || true)"
    fi
    TTF_URL="$(echo "$CSS" | grep -o 'https://[^)]*\.ttf' | head -1 || true)"
    if [[ -n "$TTF_URL" ]]; then break; fi
  done

  if [[ -z "$TTF_URL" ]]; then
    print_blocked "could not find a ttf for font '$FONT'"
    echo ""
    echo "   three causes, in order of likelihood:"
    echo "      1. no network reachable from here"
    echo "      2. '$FONT' is not a Google Fonts family (check the exact name)"
    echo "      3. Google served woff2/eot instead of ttf"
    echo ""
    echo "   to sidestep all three, drop a ttf at:"
    echo "      $FONT_FILE"
    echo ""
    exit 2
  fi

  if ! curl -sfL "$TTF_URL" -o "$FONT_FILE"; then
    print_blocked "could not download the ttf for '$FONT' from $TTF_URL"
    exit 1
  fi
fi

######################################################################
# geometry
#
# --sign-at / --date-at are in pdf points from the top-left.
# scale = dpi / 72 converts points to raster pixels.
######################################################################
SCALE="$(awk -v d="$DPI" 'BEGIN { printf "%.6f", d / 72 }')"

IFS=',' read -r SIGN_X_PT SIGN_Y_PT <<<"$SIGN_AT"
SIGN_X_PX="$(awk -v v="$SIGN_X_PT" -v s="$SCALE" 'BEGIN { printf "%d", v * s }')"
SIGN_Y_PX="$(awk -v v="$SIGN_Y_PT" -v s="$SCALE" 'BEGIN { printf "%d", v * s }')"

# how far the signature's BOTTOM sits above the rule.
#
# 0 rests it on the line; a negative value dips it below, which is what
# a real hand does. a large positive value floats the whole mark up into
# whatever text sits above the block — with a high-ascender face like
# Herr Von Muellerhoff that reads as "too high" even at a modest size,
# because the trimmed box is mostly ascender.
LIFT_PX="$(awk -v v="$LIFT" -v s="$SCALE" 'BEGIN { printf "%d", v * s }')"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

######################################################################
# render the signature to a transparent, trimmed png
######################################################################
SIZE_PX="$(awk -v v="$SIZE" -v s="$SCALE" 'BEGIN { printf "%d", v * s }')"

convert -background none -fill "$INK" \
  -font "$FONT_FILE" -pointsize "$SIZE_PX" \
  label:"$NAME" \
  -trim +repage \
  -background none -rotate "$SLANT" \
  -trim +repage \
  "$WORK/sig.png"

SIG_H="$(identify -format '%h' "$WORK/sig.png")"

# place so the signature's bottom sits just above the rule
SIG_OFF_X="$SIGN_X_PX"
SIG_OFF_Y="$((SIGN_Y_PX - SIG_H - LIFT_PX))"

######################################################################
# rasterize the target page
######################################################################
pdftoppm -f "$PAGE" -l "$PAGE" -r "$DPI" -png -singlefile "$PDF" "$WORK/page"

######################################################################
# compose
######################################################################
COMPOSE_ARGS=("$WORK/page.png" "$WORK/sig.png" -geometry "+${SIG_OFF_X}+${SIG_OFF_Y}" -composite)

if [[ -n "$DATE_TEXT" ]]; then
  IFS=',' read -r DATE_X_PT DATE_Y_PT <<<"$DATE_AT"
  DATE_X_PX="$(awk -v v="$DATE_X_PT" -v s="$SCALE" 'BEGIN { printf "%d", v * s }')"
  DATE_Y_PX="$(awk -v v="$DATE_Y_PT" -v s="$SCALE" 'BEGIN { printf "%d", v * s }')"
  # the date stays in a plain face — a date on a tax form must be legible
  DATE_SIZE_PX="$(awk -v s="$SCALE" 'BEGIN { printf "%d", 11 * s }')"
  DATE_LIFT="$(awk -v s="$SCALE" 'BEGIN { printf "%d", 4 * s }')"
  COMPOSE_ARGS+=(
    -fill "$INK" -pointsize "$DATE_SIZE_PX"
    -annotate "+${DATE_X_PX}+$((DATE_Y_PX - DATE_LIFT))" "$DATE_TEXT"
  )
fi

if [[ "$MODE" == "plan" ]]; then
  # mark the target rule in red so the position can be confirmed
  RULE_END="$(awk -v v="$SIGN_X_PX" -v s="$SCALE" 'BEGIN { printf "%d", v + 180 * s }')"
  COMPOSE_ARGS+=(
    -stroke red -strokewidth 2
    -draw "line ${SIGN_X_PX},${SIGN_Y_PX} ${RULE_END},${SIGN_Y_PX}"
    -stroke none
  )
fi

convert "${COMPOSE_ARGS[@]}" "$WORK/signed.png"

######################################################################
# emit
######################################################################
if [[ "$MODE" == "plan" ]]; then
  PREVIEW="${INTO%.pdf}.plan.png"
  # crop a band around the signature so the preview is easy to read
  BAND_LIFT="$(awk -v s="$SCALE" 'BEGIN { printf "%d", 60 * s }')"
  BAND_H="$(awk -v s="$SCALE" 'BEGIN { printf "%d", 100 * s }')"
  BAND_Y="$((SIGN_Y_PX - BAND_LIFT))"
  mkdir -p "$(dirname "$PREVIEW")"
  convert "$WORK/signed.png" -crop "x${BAND_H}+0+${BAND_Y}" +repage "$PREVIEW"

  print_eagle_header "heres where it lands"
  print_tree_start "doc.sign --mode plan"
  print_tree_branch "pdf" "$PDF ($PAGES pages)"
  print_tree_branch "page" "$PAGE"
  print_tree_branch "name" "$NAME"
  print_tree_branch "font" "$FONT ($FONT_SOURCE)"
  print_tree_branch "sign at" "${SIGN_X_PT},${SIGN_Y_PT} pt from top-left"
  if [[ -n "$DATE_TEXT" ]]; then
    print_tree_branch "date" "$DATE_TEXT at ${DATE_AT} pt"
  else
    print_tree_branch "date" "(none)"
  fi
  print_tree_branch "preview" "$PREVIEW"
  print_tree_leaf "next" "confirm the red rule sits under the signature, then rerun with --mode apply"
  echo ""
  exit 0
fi

# png -> single page pdf, at the right physical size
convert "$WORK/signed.png" -density "$DPI" -units PixelsPerInch "$WORK/signed-page.pdf"

# carry every other page through untouched
MERGE_INPUTS=()
if [[ "$PAGE" -gt 1 ]]; then
  gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
    -dFirstPage=1 -dLastPage=$((PAGE - 1)) \
    -sOutputFile="$WORK/before.pdf" "$PDF"
  MERGE_INPUTS+=("$WORK/before.pdf")
fi
MERGE_INPUTS+=("$WORK/signed-page.pdf")
if [[ "$PAGE" -lt "$PAGES" ]]; then
  gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
    -dFirstPage=$((PAGE + 1)) -dLastPage="$PAGES" \
    -sOutputFile="$WORK/after.pdf" "$PDF"
  MERGE_INPUTS+=("$WORK/after.pdf")
fi

mkdir -p "$(dirname "$INTO")"
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
  -sOutputFile="$INTO" "${MERGE_INPUTS[@]}"

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one — `OUT_PAGES="$(pdfinfo … | awk …)"` — the guard below
#    is UNREACHABLE on the very input it exists for. `set -e` plus
#    `pipefail` makes the assignment inherit the pipeline's non-zero status
#    and aborts on the assignment line itself, so the refusal never prints.
#
#    and that is the worst possible place for it: an unreadable $INTO means
#    the merge above produced a BROKEN pdf, which is exactly what this
#    post-condition is here to refuse. instead the caller gets a bare exit
#    code, no reason, and a file on disk we never vouched against.
#
#    the exit code is no help either — poppler exits 1 on an unreadable
#    file, which is the same code this arm returns, so an exit-code
#    assertion passes whether or not the guard ever ran. observed
#    2026-09-02, `rule.require.assertions-that-discriminate` leak 6.
_out_info="$(pdfinfo "$INTO" 2>&1)" || _out_info=""
OUT_PAGES="$(printf '%s\n' "$_out_info" | awk '/^Pages:/ { print $2 }')"
if [[ -z "$OUT_PAGES" ]]; then
  print_blocked "could not read the page count of the output — refusing to vouch for this output: $INTO"
  exit 1
fi
if [[ "$OUT_PAGES" != "$PAGES" ]]; then
  print_blocked "page count changed: $PAGES in, $OUT_PAGES out — refusing to vouch for this output"
  exit 1
fi

######################################################################
# the text-layer guarantee — checked, not asserted
#
# ⚠️ the page count above CANNOT see the defect this guards. a raster
#    page is still a page, so `3 in, 3 out` stays green while every
#    carried-through page has silently lost its text. that guard counts
#    a proxy the defect does not move.
#
#    the cost is real: a return whose other pages lost their text layer
#    reads as BLANK to `pdf.transcribe --via textual` — the exact defect
#    `rule.forbid.hand-transcription` exists to prevent, and it would
#    arrive out of the skill meant to prevent it.
#
# ⛔ a PRESENCE test — "does each other page yield text?" — is the WRONG
#    check. a scanned document has no text layer on any page, so it would
#    refuse correct output, and a guard that blocks valid work gets
#    disabled. compare the INPUT to the OUTPUT instead: a page blank in
#    both is fine, a page that HAD text and lost it is the defect.
#
# .note = whitespace is normalized because a gs round-trip can reflow
#    line breaks and add a form feed at the end without a change to any
#    character. no normalization can hide a page whose text vanished.
######################################################################
asComparableText() {
  pdftotext -f "$2" -l "$2" "$1" - 2>/dev/null | tr -s '[:space:]' ' '
}

# .note = the refusal below declines to VOUCH; it does not clean up, so a
#   caller who ignores exit 1 can still open "$INTO". that limit is asserted
#   as a case rather than left in prose — see [case5] of the integration
#   test — because a limit in a comment drifts on the next edit. the page
#   count guard above behaves the same way.

TEXT_KEPT=0
for p in $(seq 1 "$PAGES"); do
  [[ "$p" == "$PAGE" ]] && continue
  if [[ "$(asComparableText "$PDF" "$p")" != "$(asComparableText "$INTO" "$p")" ]]; then
    print_blocked "page $p lost or changed its text layer — refusing to vouch for this output"
    exit 1
  fi
  TEXT_KEPT=$((TEXT_KEPT + 1))
done

BYTES="$(wc -c <"$INTO" | tr -d ' ')"

print_eagle_header "signed, sealed"
print_tree_start "doc.sign --mode apply"
print_tree_branch "pdf" "$PDF"
print_tree_branch "page" "$PAGE of $PAGES"
print_tree_branch "name" "$NAME"
print_tree_branch "font" "$FONT ($FONT_SOURCE)"
print_tree_branch "sign at" "${SIGN_X_PT},${SIGN_Y_PT} pt from top-left"
if [[ -n "$DATE_TEXT" ]]; then
  print_tree_branch "date" "$DATE_TEXT"
fi
print_tree_branch "pages kept" "$OUT_PAGES (verified)"
print_tree_branch "text kept" "$TEXT_KEPT other page(s), byte-for-byte (verified)"
print_tree_branch "bytes" "$BYTES"
print_tree_leaf "wrote" "$INTO"
echo ""
echo "   ⚠️ page $PAGE is now a raster — the signature costs that page its text layer"
echo ""
