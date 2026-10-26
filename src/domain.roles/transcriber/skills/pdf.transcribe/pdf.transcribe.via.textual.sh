#!/usr/bin/env bash
######################################################################
# .what = convert a text-based PDF to markdown (deterministic, no OCR)
#
# .why  = many PDFs already contain embedded text (digital, not scanned).
#         for these, OCR is unnecessary and wasteful — a deterministic
#         text extract is faster, free, offline, and exact. no brains,
#         no network, no third-party wire.
#
# usage:
#   pdf.transcribe.via.textual.sh document.pdf                 # -> stdout as markdown
#   pdf.transcribe.via.textual.sh document.pdf --into out.md   # -> write to file
#   pdf.transcribe.via.textual.sh document.pdf --page 3        # -> one page only
#   pdf.transcribe.via.textual.sh --help
#
# guarantee:
#   - uses pdftotext (poppler-utils) — deterministic, offline
#   - fails fast (exit 2) if the PDF has no embedded text (needs OCR)
#   - preserves page breaks as markdown "## page N" headers
#   - exit 1 for malfunction, exit 2 for constraint
#
# ⚠️ THIS LEAF IS ALL-OR-NONE, BY DESIGN. its guard fires only when the
#    WHOLE document lacks a text layer. a mixed document — a text cover
#    sheet in front of scanned body pages — passes the guard and returns
#    the scanned pages as EMPTY, at exit 0.
#
#    that is not a defect to fix here; a leaf that silently OCR'd would
#    stop being deterministic and offline. it is the reason the
#    pdf.transcribe dispatcher exists: it checks EVERY page and routes
#    each one. prefer `pdf.transcribe` unless you specifically want the
#    guarantee that no page was OCR'd.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="pdf.transcribe.via.textual"
source "$SCRIPT_DIR/output.sh"

# defaults
PDF_PATH=""
OUT_PATH=""
PAGE=""

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --into)
        OUT_PATH="$2"
        shift 2
        ;;
      --page)
        PAGE="$2"
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

print_usage() {
  cat <<'EOF'
usage: pdf.transcribe.via.textual.sh <pdf-path> [--into out.md]

convert a text-based (digital) PDF to markdown. deterministic, offline, no OCR.

args:
  <pdf-path>     path to the PDF file
  --into FILE    write markdown to FILE (default: stdout)
  --help         show this help

notes:
  - for scanned/image-based PDFs (no embedded text), use pdf.transcribe.via.optical (OCR) instead
  - requires pdftotext (poppler-utils)

examples:
  pdf.transcribe.via.textual.sh return.pdf
  pdf.transcribe.via.textual.sh return.pdf --into return.md
EOF
}

validate_pdf() {
  if [[ -z "$PDF_PATH" ]]; then
    print_blocked "no PDF path provided"
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
}

check_tool() {
  if ! command -v pdftotext &>/dev/null; then
    print_blocked "pdftotext not found: install poppler-utils"
    exit 2
  fi
}

######################################################################
# extract: pure text read + markdown conversion
######################################################################

# read raw text from the PDF (pure: only echoes extracted text)
read_pdf_text() {
  # -layout preserves column layout; -enc UTF-8 for safe text
  if [[ -n "$PAGE" ]]; then
    pdftotext -layout -enc UTF-8 -f "$PAGE" -l "$PAGE" "$PDF_PATH" - 2>/dev/null
  else
    pdftotext -layout -enc UTF-8 "$PDF_PATH" - 2>/dev/null
  fi
}

# convert raw text (with \f page breaks) into markdown page headers
# each \f starts the next page
#
# ⚠️ TWO traps live here, and each one CORRUPTS THE RECORD rather than
#    breaks the run — so both are silent at exit 0.
#
#    1. the first page is numbered $PAGE, not 1. with --page 3 the
#       extract holds page 3's text, and a header that said "## page 1"
#       would have a reader cite page 1 for text that was never on it.
#
#    2. pdftotext terminates EVERY page with a form feed, THE LAST ONE
#       INCLUDED, so a naive split yields one more page than exists. the
#       header for it carries an empty body — and an empty page reads as
#       "this page is blank" rather than "this page is not there", which
#       is the one confusion this whole skill family was built to
#       prevent. so a page whose body is all whitespace emits no header.
to_markdown() {
  awk -v start="${PAGE:-1}" '
    function flush() {
      if (buf ~ /[^ \t\r\n]/) {
        printf "%s## page %d\n\n%s", (emitted ? "\n\n" : ""), page, buf
        emitted = 1
      }
    }
    BEGIN { page = start; buf = ""; emitted = 0 }
    {
      n = split($0, parts, "\f")
      for (i = 1; i <= n; i++) {
        if (i > 1) { flush(); buf = ""; page++ }
        buf = buf parts[i] "\n"
      }
    }
    END { flush() }
  '
}

main() {
  parse_args "$@"
  validate_pdf
  check_tool

  # read raw text (fail loud if pdftotext itself errors)
  local raw
  raw=$(read_pdf_text) || {
    print_blocked "pdftotext failed to read: $PDF_PATH"
    exit 1
  }

  # failfast: no embedded text -> image-based PDF -> needs OCR
  local stripped
  stripped=$(printf '%s' "$raw" | tr -d '[:space:]')
  if [[ -z "$stripped" ]]; then
    print_blocked "no embedded text found — this looks image-based; use pdf.transcribe.via.optical (OCR) instead"
    exit 2
  fi

  # build markdown with page headers
  local markdown
  markdown=$(printf '%s' "$raw" | to_markdown)

  if [[ -n "$OUT_PATH" ]]; then
    printf '%s\n' "$markdown" > "$OUT_PATH"
    print_eagle_header "read it,"
    print_tree_start "pdf.transcribe.via.textual"
    print_tree_branch "source" "$PDF_PATH"
    print_tree_leaf "into" "$OUT_PATH"
  else
    printf '%s\n' "$markdown"
  fi
}

main "$@"
