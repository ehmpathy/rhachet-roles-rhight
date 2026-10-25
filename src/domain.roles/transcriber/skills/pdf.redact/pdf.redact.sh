#!/usr/bin/env bash
######################################################################
# .what = redact sensitive data from text OR from a PDF (deterministic)
#
# .why  = documents (e.g., tax returns) often carry PII. a deterministic
#         redact masks it before the doc is shared or lands in a repo.
#         no brains, no wire, offline.
#
# usage:
#   # text mode (stdin/file -> stdout/file):
#   cat doc.md | pdf.redact.sh --what ssn
#   pdf.redact.sh --what ssn --from doc.md --into redacted.md
#
#   # pdf mode (locate -> cover -> flatten):
#   pdf.redact.sh --what ssn --from return.pdf --into return.redacted.pdf
#
# what:
#   ssn   US social security numbers (123-45-6789)
#         text mode -> ***-**-**** ; pdf mode -> opaque box + flatten
#
# pdf mode method (generic + corruption-safe):
#   1. locate each SSN word's bounding box via pdftotext -bbox
#   2. rasterize pages via pdftoppm (destroys the text layer)
#   3. paint an opaque box over each SSN box via imagemagick
#   4. reassemble pages into a new PDF
#   => the SSN is neither extractable text nor visible pixels.
#   tradeoff: the output PDF's pages become images (not selectable).
#
# guarantee:
#   - deterministic, offline
#   - masks the full value (no digits retained)
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# defaults
WHAT=""
FROM_PATH=""
OUT_PATH=""
# tape is the default on purpose: a plain black box is indistinguishable
# from a printer artifact, a scan defect, or a form field that was simply
# left empty. the hazard stripe + "redacted" label says a human removed
# a value deliberately — which is what a recipient needs to know, and what
# keeps a clerk from treating the gap as an incomplete submission.
STYLE="tape"
DPI=200
# literal phrases to redact (pdf mode); each is tokenized into words
TEXT_TERMS=()

# workdir cleanup (global; removed on exit)
# note: must return 0 — an EXIT trap's final status clobbers the exit code
WORKDIR=""
cleanup() {
  [[ -n "$WORKDIR" ]] && rm -rf "$WORKDIR"
  return 0
}
trap cleanup EXIT

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --what)
        WHAT="$2"
        shift 2
        ;;
      --from)
        FROM_PATH="$2"
        shift 2
        ;;
      --into)
        OUT_PATH="$2"
        shift 2
        ;;
      --style)
        STYLE="$2"
        shift 2
        ;;
      --text)
        TEXT_TERMS+=("$2")
        shift 2
        ;;
      --skill|--repo|--role)
        # rhachet passes these, ignore
        shift 2
        ;;
      -*)
        print_blocked "unknown option: $1"
        exit 2
        ;;
      *)
        print_blocked "unexpected argument: $1"
        exit 2
        ;;
    esac
  done
}

print_usage() {
  cat <<'EOF'
usage:
  # text mode
  cat return.md | pdf.redact.sh --what ssn
  pdf.redact.sh --what ssn --from return.md --into return.redacted.md

  # pdf mode (locate -> cover -> flatten)
  pdf.redact.sh --what ssn --from return.pdf --into return.redacted.pdf

args:
  --what KIND    what to redact (currently: ssn)
  --text PHRASE  redact any occurrence of PHRASE (pdf mode; repeatable)
                 each word of the phrase is matched case-insensitively
  --from FILE    read from FILE (default: stdin, text mode only)
  --into FILE    write to FILE (default: stdout, text mode only)
  --style STYLE  pdf mode box style: tape (default) or solid
                 tape  = diagonal hazard-stripe "redacted" banner
                 solid = plain black box; use only when a visible
                         redaction marker would itself be a problem
  --help         show this help

notes:
  - pdf mode requires --from *.pdf and --into *.pdf
  - pdf mode flattens pages to images (target gone as text AND pixels)
  - both styles paint an opaque base, so no pixels show through
  - combine --what ssn with one or more --text to scrub extra PII, e.g.:
      pdf.redact.sh --what ssn --text 'JOHN DOE' --text '123 Main St' \
        --from return.pdf --into return.redacted.pdf --style tape
EOF
}

validate() {
  # need at least one target: --what ssn and/or one or more --text
  if [[ -z "$WHAT" && ${#TEXT_TERMS[@]} -eq 0 ]]; then
    print_blocked "no target given: pass --what ssn and/or --text PHRASE"
    exit 2
  fi
  if [[ -n "$WHAT" && "$WHAT" != "ssn" ]]; then
    print_blocked "unsupported --what: $WHAT (currently: ssn)"
    exit 2
  fi
  # --text only applies in pdf mode
  if [[ ${#TEXT_TERMS[@]} -gt 0 ]]; then
    if [[ -z "$FROM_PATH" ]] || ! is_pdf_path "$FROM_PATH"; then
      print_blocked "--text requires --from <file>.pdf (pdf mode only)"
      exit 2
    fi
  fi
  if [[ -n "$FROM_PATH" && ! -f "$FROM_PATH" ]]; then
    print_blocked "file not found: $FROM_PATH"
    exit 2
  fi
  if [[ "$STYLE" != "solid" && "$STYLE" != "tape" ]]; then
    print_blocked "unsupported --style: $STYLE (solid | tape)"
    exit 2
  fi
}

is_pdf_path() {
  [[ "${1##*.}" == "pdf" ]]
}

######################################################################
# text redact: mask 123-45-6789 -> ***-**-****
######################################################################
redact_ssn_text() {
  sed -E 's/\b[0-9]{3}[- ][0-9]{2}[- ][0-9]{4}\b/***-**-****/g'
}

######################################################################
# pdf redact: locate -> cover -> flatten
######################################################################
check_pdf_tools() {
  for tool in pdftoppm pdftotext convert; do
    if ! command -v "$tool" &>/dev/null; then
      print_blocked "$tool not found (need poppler-utils + imagemagick)"
      exit 2
    fi
  done
}

# emit "page pxMin pyMin pxMax pyMax" (image pixels) for each target word
# reads a pdftotext -bbox XML file; scales point coords by DPI/72
# args: bbox_xml  want_ssn(0|1)  tokens(space-joined, lowercased)
find_boxes() {
  local bbox_xml="$1" want_ssn="$2" tokens="$3"
  awk -v dpi="$DPI" -v want_ssn="$want_ssn" -v tokens=" $tokens " '
    function attrval(line, name,    re, s) {
      re = name "=\"[0-9.]+\""
      if (match(line, re)) {
        s = substr(line, RSTART, RLENGTH)
        gsub(/^.*="/, "", s)
        gsub(/"$/, "", s)
        return s + 0
      }
      return -1
    }
    /<page/ { page++ }
    /<word/ {
      txt = $0
      sub(/^.*<word[^>]*>/, "", txt)
      sub(/<\/word>.*$/, "", txt)

      hit = 0
      # SSN shape: NNN-NN-NNNN (explicit classes; no interval syntax reliance)
      if (want_ssn == 1 && txt ~ /^[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]$/)
        hit = 1
      # literal token match: lowercase the word, strip edge punctuation,
      # then check if it appears as a whole token in the tokens list
      if (!hit && tokens != "  ") {
        low = tolower(txt)
        gsub(/[.,;:()]+$/, "", low)
        gsub(/^[.,;:()]+/, "", low)
        if (low != "" && index(tokens, " " low " ") > 0)
          hit = 1
      }

      if (hit) {
        x1 = attrval($0, "xMin") * dpi / 72
        y1 = attrval($0, "yMin") * dpi / 72
        x2 = attrval($0, "xMax") * dpi / 72
        y2 = attrval($0, "yMax") * dpi / 72
        # pad the box: 2px sides (cover glyph edges) + 6px top/bottom
        printf "%d %d %d %d %d\n", page, x1 - 2, y1 - 6, x2 + 2, y2 + 6
      }
    }
  ' "$bbox_xml"
}

# find which png a given page number maps to (pdftoppm zero-pads by count)
page_png_for() {
  local dir="$1" page="$2"
  # match page-1.png or page-01.png etc
  local match
  for f in "$dir"/page-*.png; do
    local base="${f##*/page-}"
    base="${base%.png}"
    if [[ "$((10#$base))" == "$page" ]]; then
      match="$f"
      break
    fi
  done
  printf '%s' "$match"
}

# build a hazard-banner fill of size WxH: diagonal yellow/dark caution stripes
# with a centered white "REDACTED" label on top
# args: outfile W H workdir
# method (deterministic, reads at any size):
#   1. build a vertical stripe unit (one yellow band atop one dark band)
#   2. tile it to fill a square larger than the box diagonal
#   3. rotate 45deg so the bands run diagonally (classic hazard look)
#   4. crop to the box size => an opaque diagonal-striped banner
#   5. overlay centered white "REDACTED" (dark stroke keeps it legible)
build_hazard_banner() {
  local out="$1" w="$2" h="$3" workdir="$4"

  # stripe band thickness (px); bigger = thicker, fewer stripes
  local band=16
  # slightly-lighter off-black for the dark bands
  local dark='#1a1a1a'
  # dim, muted yellow — reads as a more translucent yellow against the dark
  local yellow='#9c8b48'

  # one pale-yellow band over one dark band => a vertical stripe unit
  local unit="$workdir/hazard_unit.png"
  convert \( -size "14x${band}" xc:"$yellow" \) \
          \( -size "14x${band}" xc:"$dark" \) \
          -append "$unit"

  # a square big enough that a 45deg rotation still covers the box
  local side=$(( w + h + 20 ))

  # tile stripes -> rotate 45 -> crop to the box (opaque throughout)
  convert -size "${side}x${side}" "tile:$unit" \
    -rotate 45 -gravity center -extent "${w}x${h}" \
    "$out"

  # render "redacted" to its own transparent image, then scale it to fill
  # most of the box and composite it dead-center. scale-to-fit guarantees the
  # label is centered; the target size below controls how large it reads.
  local label="$workdir/hazard_label.png"
  convert -background none -weight Bold \
    -stroke "$dark" -strokewidth 3 -fill white -pointsize 48 \
    label:'redacted' \
    -stroke none -fill white -pointsize 48 -weight Bold \
    label:'redacted' -gravity center -composite \
    -trim +repage \
    "$label"

  # target: 78% of box width, 58% of box height (slightly smaller, small margin)
  local tw=$(( w * 78 / 100 )) th=$(( h * 58 / 100 ))
  (( tw < 1 )) && tw=1
  (( th < 1 )) && th=1

  convert "$out" \
    \( "$label" -resize "${tw}x${th}" \) \
    -gravity center -composite \
    "$out"
}

# paint one redaction box on a page png, per STYLE
# args: png x1 y1 x2 y2 workdir
paint_box() {
  local png="$1" x1="$2" y1="$3" x2="$4" y2="$5" workdir="$6"
  local w=$((x2 - x1)) h=$((y2 - y1))
  (( w < 1 )) && w=1
  (( h < 1 )) && h=1

  if [[ "$STYLE" == "tape" ]]; then
    # build an opaque hazard-stripe banner sized to the box, then paint an
    # opaque black base first (belt-and-suspenders: no pixels show through)
    local banner="$workdir/hazard_banner.png"
    build_hazard_banner "$banner" "$w" "$h" "$workdir"
    convert "$png" -fill black -draw "rectangle $x1,$y1 $x2,$y2" \
      \( "$banner" \) -geometry "+${x1}+${y1}" -composite \
      "$png"
  else
    convert "$png" -fill black -draw "rectangle $x1,$y1 $x2,$y2" "$png"
  fi
}

redact_ssn_pdf() {
  local src="$1" dst="$2"

  check_pdf_tools

  # use the global WORKDIR so the EXIT trap can clean it up
  WORKDIR=$(mktemp -d)
  local workdir="$WORKDIR"

  # 1. rasterize pages (this alone destroys the text layer)
  if ! pdftoppm -r "$DPI" -png "$src" "$workdir/page" 2>/dev/null; then
    print_blocked "failed to rasterize PDF: $src"
    exit 1
  fi

  # 2. locate target boxes (ssn pattern and/or --text tokens)
  pdftotext -bbox "$src" "$workdir/bbox.xml" 2>/dev/null || {
    print_blocked "failed to read PDF text layer: $src"
    exit 1
  }
  # build a lowercase, space-joined token list from every --text phrase
  local want_ssn=0
  [[ "$WHAT" == "ssn" ]] && want_ssn=1
  local tokens=""
  local term
  for term in "${TEXT_TERMS[@]}"; do
    tokens+=" $(printf '%s' "$term" | tr '[:upper:]' '[:lower:]')"
  done
  find_boxes "$workdir/bbox.xml" "$want_ssn" "$tokens" > "$workdir/boxes.txt"

  local box_count
  box_count=$(wc -l < "$workdir/boxes.txt" | tr -d ' ')

  # 3. paint opaque boxes on the pages that carry an SSN
  local page x1 y1 x2 y2 png
  while read -r page x1 y1 x2 y2; do
    [[ -z "$page" ]] && continue
    png=$(page_png_for "$workdir" "$page")
    [[ -z "$png" ]] && continue
    paint_box "$png" "$x1" "$y1" "$x2" "$y2" "$workdir"
  done < "$workdir/boxes.txt"

  # 4. reassemble pages into a new PDF (pages are now flat images)
  if ! convert "$workdir"/page-*.png "$dst" 2>/dev/null; then
    print_blocked "failed to reassemble PDF"
    exit 1
  fi

  # describe targets: ssn and/or N text phrases
  local targets=""
  [[ "$WHAT" == "ssn" ]] && targets="ssn"
  if [[ ${#TEXT_TERMS[@]} -gt 0 ]]; then
    [[ -n "$targets" ]] && targets+=" + "
    targets+="${#TEXT_TERMS[@]} text phrase(s)"
  fi

  print_eagle_header "redacted,"
  print_tree_start "pdf.redact"
  print_tree_branch "what" "$targets"
  print_tree_branch "mode" "pdf (cover + flatten)"
  print_tree_branch "style" "$STYLE"
  print_tree_branch "from" "$src"
  print_tree_branch "boxes" "$box_count"
  print_tree_leaf "into" "$dst"
}

main() {
  parse_args "$@"
  validate

  # pdf mode: --from is a pdf
  if [[ -n "$FROM_PATH" ]] && is_pdf_path "$FROM_PATH"; then
    if [[ -z "$OUT_PATH" ]] || ! is_pdf_path "$OUT_PATH"; then
      print_blocked "pdf mode requires --into <file>.pdf"
      exit 2
    fi
    redact_ssn_pdf "$FROM_PATH" "$OUT_PATH"
    return
  fi

  # text mode
  if [[ -n "$FROM_PATH" ]]; then
    if [[ -n "$OUT_PATH" ]]; then
      redact_ssn_text < "$FROM_PATH" > "$OUT_PATH"
      print_eagle_header "redacted,"
      print_tree_start "pdf.redact"
      print_tree_branch "what" "$WHAT"
      print_tree_branch "from" "$FROM_PATH"
      print_tree_leaf "into" "$OUT_PATH"
    else
      redact_ssn_text < "$FROM_PATH"
    fi
  else
    if [[ -n "$OUT_PATH" ]]; then
      redact_ssn_text > "$OUT_PATH"
    else
      redact_ssn_text
    fi
  fi
}

main "$@"
