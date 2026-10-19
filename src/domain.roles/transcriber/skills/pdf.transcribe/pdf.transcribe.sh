#!/usr/bin/env bash
######################################################################
# .what = transcribe a PDF to markdown, one page at a time, routing
#         each page to the method it actually needs
#
# .why  = documents are not uniformly digital or uniformly scanned. a
#         DE-certified certificate of incorporation is a TEXT cover
#         sheet stapled in front of SCANNED body pages. a court filing
#         is a digital brief with a scanned exhibit. a tax return is
#         digital until someone faxes an attachment into it.
#
#         a whole-document check gets these wrong, and gets them wrong
#         SILENTLY:
#
#           - "does this file have text?" -> yes, the cover sheet does
#             -> extract text from every page
#             -> the scanned pages come back EMPTY, at exit 0
#             -> you conclude those pages carry no content
#
#         that exact failure happened with SANDPINE's
#         certificate of incorporation: page 1 returned Delaware's
#         certification in full, pages 2-4 returned empty, and it read
#         like the certificate body was blank.
#
#         this dispatcher asks the question PER PAGE, so an empty page
#         is either a genuinely blank page or an OCR'd one — never an
#         unexamined one.
#
# usage:
#   pdf.transcribe.sh document.pdf                     # -> stdout
#   pdf.transcribe.sh document.pdf --into out.md       # -> file
#   pdf.transcribe.sh document.pdf --via textual       # force, no OCR
#   pdf.transcribe.sh document.pdf --via optical       # force OCR
#   pdf.transcribe.sh document.pdf --mode plan         # route only
#   pdf.transcribe.sh --help
#
# options:
#   <pdf-path>   path to the PDF file (required)
#   --into FILE  write markdown to FILE (default: stdout)
#   --via WAY    auto (default) | textual | optical
#                auto     route each page by whether it has a text layer
#                textual  every page via pdftotext; fail loud on any
#                         page that lacks text, rather than emit a
#                         silent blank
#                optical  every page via OCR, even pages that have text
#   --mode MODE  plan | apply (default apply)
#                plan shows the per-page routing and the OCR page count
#                WITHOUT spending anything on OCR. run it first on a
#                document you have not seen — OCR costs money per page
#   --help       show usage and exit
#
# guarantee:
#   - every page is accounted for. a page is textual, optical, or
#     reported blank — never silently empty
#   - the per-page routing is printed, so the provenance of any line in
#     the output is checkable
#   - --via textual never reaches the network and never spends money
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ OCR costs money per page and needs credentials. `--mode plan`
#    tells you how many pages would be sent before any are.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="pdf.transcribe"
source "$SCRIPT_DIR/output.sh"

VIA_TEXTUAL="$SCRIPT_DIR/pdf.transcribe.via.textual.sh"
VIA_OPTICAL="$SCRIPT_DIR/pdf.transcribe.via.optical.sh"

# defaults
PDF_PATH=""
OUT_PATH=""
VIA="auto"
MODE="apply"

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        show_help
        exit 0
        ;;
      --into)
        OUT_PATH="$2"
        shift 2
        ;;
      --via)
        VIA="$2"
        shift 2
        ;;
      --mode)
        MODE="$2"
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
# bounded by its OWN fences, not a hardcoded line count.
# note: `/^#####/` not `/^#{5,}/` — mawk (the default awk on debian and
# ubuntu) does not support interval expressions. that pattern would not
# error; it would match no line and dump the whole executable.
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

check_tools() {
  local tool
  for tool in pdftotext pdfinfo; do
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
  case "$VIA" in
    auto|textual|optical) ;;
    *)
      print_blocked "--via must be auto, textual or optical, got: $VIA"
      exit 2
      ;;
  esac
  case "$MODE" in
    plan|apply) ;;
    *)
      print_blocked "--mode must be plan or apply, got: $MODE"
      exit 2
      ;;
  esac
}

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
get_page_count() {
  local info
  info="$(pdfinfo "$PDF_PATH" 2>/dev/null)" || info=""
  PAGE_COUNT="$(printf '%s\n' "$info" | awk '/^Pages:/ { print $2 }')"
  if [[ -z "$PAGE_COUNT" ]]; then
    print_blocked "could not read page count — is this a valid PDF? $PDF_PATH"
    exit 1
  fi
}

# does this ONE page carry a text layer?
# the whole point of the dispatcher: asked per page, never per file.
page_has_text() {
  local page="$1"
  local raw
  raw="$(pdftotext -layout -enc UTF-8 -f "$page" -l "$page" "$PDF_PATH" - 2>/dev/null || true)"
  local stripped
  stripped="$(printf '%s' "$raw" | tr -d '[:space:]')"
  [[ -n "$stripped" ]]
}

# decide the route for every page before any work is done, so plan mode
# and apply mode agree by construction rather than by parallel logic.
plan_routes() {
  ROUTES=()
  PAGES_TEXTUAL=0
  PAGES_OPTICAL=0

  local page
  for ((page = 1; page <= PAGE_COUNT; page++)); do
    local route
    case "$VIA" in
      textual) route="textual" ;;
      optical) route="optical" ;;
      auto)
        if page_has_text "$page"; then route="textual"; else route="optical"; fi
        ;;
    esac
    ROUTES+=("$route")
    if [[ "$route" == "textual" ]]; then
      PAGES_TEXTUAL=$((PAGES_TEXTUAL + 1))
    else
      PAGES_OPTICAL=$((PAGES_OPTICAL + 1))
    fi
  done
}

# --via textual on a document with image pages is a request the leaf
# cannot honor without a silent blank. name the pages and refuse.
guard_forced_textual() {
  [[ "$VIA" == "textual" ]] || return 0

  local blanks=()
  local page
  for ((page = 1; page <= PAGE_COUNT; page++)); do
    if ! page_has_text "$page"; then blanks+=("$page"); fi
  done

  if [[ ${#blanks[@]} -gt 0 ]]; then
    print_blocked "--via textual, but these pages have no text layer: ${blanks[*]}"
    echo ""
    echo "   they would come back empty, which reads as a blank page."
    echo "   use --via auto to OCR only those pages, or --via optical for all."
    echo ""
    exit 2
  fi
}

transcribe_page() {
  local page="$1"
  local route="$2"

  if [[ "$route" == "textual" ]]; then
    bash "$VIA_TEXTUAL" "$PDF_PATH" --page "$page" \
      | sed '/^## page /d'
    return
  fi

  # optical: the leaf prints its own treestruct banner to stdout ahead
  # of the text, so keep only what follows its "## Page N" header.
  bash "$VIA_OPTICAL" "$PDF_PATH" --page "$page" \
    | awk '/^## Page /{ seen = 1; next } seen { print }'
}

emit_markdown() {
  local page
  for ((page = 1; page <= PAGE_COUNT; page++)); do
    local route="${ROUTES[$((page - 1))]}"
    printf '## page %d\n\n' "$page"
    printf '<!-- via: %s -->\n\n' "$route"
    transcribe_page "$page" "$route"
    printf '\n'
  done
}

print_routes() {
  local page
  for ((page = 1; page <= PAGE_COUNT; page++)); do
    local route="${ROUTES[$((page - 1))]}"
    if [[ "$page" -eq "$PAGE_COUNT" ]]; then
      echo "      └─ page $page: $route"
    else
      echo "      ├─ page $page: $route"
    fi
  done
}

main() {
  parse_args "$@"
  check_tools
  validate_input
  get_page_count
  guard_forced_textual
  plan_routes

  if [[ "$MODE" == "plan" ]]; then
    print_eagle_header "heres how I'd read it,"
    print_tree_start "pdf.transcribe --mode plan"
    print_tree_branch "source" "$PDF_PATH"
    print_tree_branch "via" "$VIA"
    print_tree_branch "pages" "$PAGE_COUNT"
    print_tree_branch "textual" "$PAGES_TEXTUAL (free, offline)"
    print_tree_branch "optical" "$PAGES_OPTICAL (costs per page, needs creds)"
    print_tree_leaf "routes" ""
    print_routes
    exit 0
  fi

  local markdown
  markdown="$(emit_markdown)"

  if [[ -n "$OUT_PATH" ]]; then
    printf '%s\n' "$markdown" > "$OUT_PATH"
    print_eagle_header "read it,"
    print_tree_start "pdf.transcribe"
    print_tree_branch "source" "$PDF_PATH"
    print_tree_branch "via" "$VIA"
    print_tree_branch "pages" "$PAGE_COUNT ($PAGES_TEXTUAL textual, $PAGES_OPTICAL optical)"
    print_tree_leaf "into" "$OUT_PATH"
  else
    printf '%s\n' "$markdown"
  fi
}

main "$@"
