#!/usr/bin/env bash
######################################################################
# .what = render one page of a PDF to a PNG you can actually look at
#
# .why  = some checks cannot be done on extracted text. a redaction box
#         painted at the wrong coordinates still passes a `grep` over
#         the text layer, because the text layer was destroyed either
#         way. the only way to know the box landed on the value is to
#         LOOK at the page.
#
#         same for a signature placed by coordinate, a form field that
#         may or may not have printed, or a scan whose quality you need
#         to judge before you spend money on OCR.
#
#         this exists so that "verify visually" is a real step with a
#         real command, rather than an instruction with no tool behind
#         it.
#
# usage:
#   pdf.render.sh return.pdf --page 7 --into check.png
#   pdf.render.sh return.pdf --page 1 --dpi 300 --into hi-res.png
#   pdf.render.sh return.pdf --page 1 --crop 60,640,420,90 --into sig.png
#   pdf.render.sh --help
#
# options:
#   <pdf-path>     path to the PDF file (required)
#   --page N       which page to render (default 1)
#   --dpi N        resolution (default 150; use 300 to read fine print)
#   --crop X,Y,W,H crop box in PIXELS at the chosen --dpi, measured from
#                  the TOP-LEFT of the page. use this — a full page at
#                  readable dpi is a large image, and most checks need
#                  one band of it
#   --into FILE    output png path (default <pdf-basename>.p<N>.png in cwd)
#   --help         show usage and exit
#
# guarantee:
#   - fails loud (exit 2) if the page is out of range. pdftoppm alone
#     writes no file and exits 0 in that case, which reads as "the page
#     is blank" when it actually means "that page does not exist"
#   - reports pixel dimensions and byte size, so a caller can tell an
#     empty render from a real one without opening it
#   - writes exactly one file, at exactly the path you named
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ this renders. it does not read. to get the TEXT of a page use
#    pdf.transcribe — never read a value off a render by eye, per
#    rule.forbid.hand-transcription.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# defaults
PDF_PATH=""
PAGE=1
DPI=150
CROP=""
OUT_PATH=""

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        show_help
        exit 0
        ;;
      --page)
        PAGE="$2"
        shift 2
        ;;
      --dpi)
        DPI="$2"
        shift 2
        ;;
      --crop)
        CROP="$2"
        shift 2
        ;;
      --into)
        OUT_PATH="$2"
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
        if [[ -z "$PDF_PATH" ]]; then
          PDF_PATH="$1"
        else
          print_blocked "unexpected argument: $1"
          exit 2
        fi
        shift
        ;;
    esac
  done
}

# render the header block above as help.
# bounded by its OWN fences, not a hardcoded line count, so the help
# cannot drift out of sync when the header grows.
# note: `/^#####/` not `/^#{5,}/` — mawk (the default awk on debian and
# ubuntu) does not support interval expressions. the pattern would not
# error; it would silently match no line and dump the whole executable.
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

check_tools() {
  local tool
  for tool in pdftoppm pdfinfo; do
    if ! command -v "$tool" &>/dev/null; then
      print_blocked "$tool not found: install poppler-utils"
      exit 2
    fi
  done
}

validate_input() {
  if [[ -z "$PDF_PATH" ]]; then
    print_blocked "no PDF path given"
    exit 2
  fi
  if [[ ! -f "$PDF_PATH" ]]; then
    print_blocked "file not found: $PDF_PATH"
    exit 2
  fi
  if [[ "${PDF_PATH##*.}" != "pdf" ]]; then
    print_blocked "not a PDF file: $PDF_PATH"
    exit 2
  fi

  if [[ ! "$PAGE" =~ ^[0-9]+$ ]] || [[ "$PAGE" -lt 1 ]]; then
    print_blocked "--page must be a positive integer, got: $PAGE"
    exit 2
  fi
  if [[ ! "$DPI" =~ ^[0-9]+$ ]] || [[ "$DPI" -lt 1 ]]; then
    print_blocked "--dpi must be a positive integer, got: $DPI"
    exit 2
  fi
  if [[ -n "$CROP" ]] && [[ ! "$CROP" =~ ^[0-9]+,[0-9]+,[0-9]+,[0-9]+$ ]]; then
    print_blocked "--crop must be X,Y,W,H in pixels, got: $CROP"
    exit 2
  fi
}

# failfast on an out-of-range page.
# pdftoppm asked for page 99 of an 8-page pdf writes no file and exits 0.
# without this check the caller sees no output and concludes the page
# was blank, which is a different and much more alarming fact.
#
# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one — `PAGE_COUNT="$(pdfinfo … | awk …)"` — the guard
#    below is UNREACHABLE. `set -e` plus `pipefail` makes the assignment
#    inherit the pipeline's non-zero status and aborts on the assignment
#    line itself, so the refusal never prints. the caller then gets an
#    EMPTY stdout, an empty stderr (pdfinfo's own message is discarded
#    here), and a bare exit code with no reason attached to it.
#
#    that failure also LOOKED correct: poppler happens to exit 1 on an
#    unreadable file, which is the very code this arm means to return —
#    so an exit-code assertion passes by coincidence while the human is
#    told no reason at all. observed 2026-09-02.
#
#    `|| info=""` is what makes the failure survivable: it consumes the
#    non-zero status so control reaches the guard that explains it.
validate_page_range() {
  local info
  info="$(pdfinfo "$PDF_PATH" 2>/dev/null)" || info=""
  PAGE_COUNT="$(printf '%s\n' "$info" | awk '/^Pages:/ { print $2 }')"
  if [[ -z "$PAGE_COUNT" ]]; then
    print_blocked "could not read page count — is this a valid PDF? $PDF_PATH"
    exit 1
  fi
  if [[ "$PAGE" -gt "$PAGE_COUNT" ]]; then
    print_blocked "page $PAGE is out of range — the document has $PAGE_COUNT page(s)"
    exit 2
  fi
}

get_out_path() {
  if [[ -z "$OUT_PATH" ]]; then
    local base
    base="$(basename "$PDF_PATH" .pdf)"
    OUT_PATH="./${base}.p${PAGE}.png"
  fi
  if [[ "${OUT_PATH##*.}" != "png" ]]; then
    print_blocked "--into must end in .png, got: $OUT_PATH"
    exit 2
  fi

  local out_dir
  out_dir="$(dirname "$OUT_PATH")"
  if [[ ! -d "$out_dir" ]]; then
    print_blocked "output directory does not exist: $out_dir"
    exit 2
  fi
}

render() {
  # -singlefile makes pdftoppm write exactly "<root>.png" instead of
  # "<root>-07.png" with a zero-padded page suffix whose width varies
  # with the document's page count. without it the output path is not
  # predictable from the arguments.
  local root="${OUT_PATH%.png}"

  local args=(-png -r "$DPI" -f "$PAGE" -l "$PAGE" -singlefile)
  if [[ -n "$CROP" ]]; then
    local x y w h
    IFS=, read -r x y w h <<<"$CROP"
    args+=(-x "$x" -y "$y" -W "$w" -H "$h")
  fi

  local err
  err="$(pdftoppm "${args[@]}" "$PDF_PATH" "$root" 2>&1)" || {
    print_blocked "pdftoppm failed: $err"
    exit 1
  }

  if [[ ! -f "$OUT_PATH" ]]; then
    print_blocked "pdftoppm wrote no file — expected $OUT_PATH"
    exit 1
  fi
}

# report size so a caller can tell a real render from an empty one
# without a viewer. a page that rendered to a few hundred bytes is a
# blank page; a page that rendered to hundreds of kb has ink on it.
describe_output() {
  # pdfinfo prints the size two different ways, and which one you get
  # depends on the document rather than on the flags:
  #   uniform pages  ->  "Page size:      612 x 792 pts (letter)"
  #   mixed pages    ->  "Page    7 size: 612 x 792 pts"
  # so anchor on the "size:" token and read the two numbers after it,
  # instead of on a fixed field index. a fixed index matched only the
  # second form and silently reported "unknown" for every ordinary
  # letter-size document.
  DIMENSIONS="$(pdfinfo -f "$PAGE" -l "$PAGE" "$PDF_PATH" 2>/dev/null \
    | awk '/size:/ {
             for (i = 1; i <= NF; i++)
               if ($i == "size:") { print $(i+1) " x " $(i+3) " pt"; exit }
           }')"
  [[ -n "$DIMENSIONS" ]] || DIMENSIONS="unknown"

  BYTES="$(wc -c < "$OUT_PATH" | tr -d ' ')"
}

main() {
  parse_args "$@"
  check_tools
  validate_input
  validate_page_range
  get_out_path
  render
  describe_output

  print_eagle_header "have a look,"
  print_tree_start "pdf.render"
  print_tree_branch "source" "$PDF_PATH"
  print_tree_branch "page" "$PAGE of $PAGE_COUNT"
  print_tree_branch "dpi" "$DPI"
  if [[ -n "$CROP" ]]; then
    print_tree_branch "crop" "$CROP (x,y,w,h px)"
  fi
  print_tree_branch "page size" "$DIMENSIONS"
  print_tree_branch "bytes" "$BYTES"
  print_tree_leaf "into" "$OUT_PATH"
}

main "$@"
