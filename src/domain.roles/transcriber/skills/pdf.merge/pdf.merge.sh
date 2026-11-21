#!/usr/bin/env bash
######################################################################
# .what = concatenate several PDFs into one, in the order given
#
# .why  = an agency upload form often takes ONE file per request while
#         the request itself is several documents — a cover letter, then
#         the instrument, then an exhibit. the filer is left to fuse
#         them, and the fuse is where two silent defects live:
#
#         1. PAGE LOSS. a merge that drops a page writes a valid PDF at
#            a plausible size and reports success. so this skill counts
#            the pages of every input, counts the pages of the output,
#            and REFUSES if the two disagree. a merge you did not verify
#            is a claim, not a fact.
#
#         2. ORDER. on a filing the order is substantive — a cover
#            letter behind the instrument it transmits is a different
#            document. so the order is the ARGUMENT ORDER, never a sort,
#            and the skill prints the resulting sequence so a human can
#            read it back before the upload.
#
# usage:
#   pdf.merge.sh cover.pdf certificate.pdf --into packet.pdf
#   pdf.merge.sh a.pdf b.pdf c.pdf --into out.pdf --mode plan
#   pdf.merge.sh --help
#
# options:
#   <pdf-path>...  two or more PDFs, in the order they must appear
#   --into FILE    output path (required, must end in .pdf)
#   --mode MODE    plan (report what would happen, write no file)
#                  apply (default — write the file)
#   --help         show usage and exit
#
# guarantee:
#   - refuses a SIGNED input outright. pdfunite rewrites the document,
#     which voids a cryptographic signature while every visual check
#     still passes. see rule.forbid.rewrite-of-signed-documents
#   - verifies the output page count equals the sum of the inputs, and
#     exits 1 if it does not
#   - refuses when an input path is also the --into path
#   - writes exactly one file, at exactly the path you named
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ this concatenates. it does not re-paginate, re-number, or add a
#    transmittal page. the output is the inputs, in order, unaltered.
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# defaults
INPUTS=()
OUT_PATH=""
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
        INPUTS+=("$1")
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
  for tool in pdfunite pdfinfo; do
    if ! command -v "$tool" &>/dev/null; then
      print_blocked "$tool not found: install poppler-utils"
      exit 2
    fi
  done
}

validate_input() {
  if [[ "${#INPUTS[@]}" -lt 2 ]]; then
    print_blocked "need at least 2 PDFs to merge, got ${#INPUTS[@]}"
    exit 2
  fi

  local pdf
  for pdf in "${INPUTS[@]}"; do
    if [[ ! -f "$pdf" ]]; then
      print_blocked "file not found: $pdf"
      exit 2
    fi
    if [[ "${pdf##*.}" != "pdf" ]]; then
      print_blocked "not a PDF file: $pdf"
      exit 2
    fi
  done

  if [[ "$MODE" != "plan" ]] && [[ "$MODE" != "apply" ]]; then
    print_blocked "--mode must be plan or apply, got: $MODE"
    exit 2
  fi
}

# ⛔ a cryptographically signed PDF must not be rewritten.
#
#    pdfunite reads each input and emits a NEW document. the bytes the
#    signature was computed over do not survive that, so the signature
#    is destroyed — silently, while every visual check still passes and
#    the page count still reconciles.
#
#    detect it the same way rule.forbid.rewrite-of-signed-documents
#    prescribes: /ByteRange is the signature's own byte window, and
#    /Adobe.PPKLite is the standard signature handler.
check_unsigned() {
  local pdf
  for pdf in "${INPUTS[@]}"; do
    if grep -qa -e '/ByteRange' -e '/Adobe.PPKLite' "$pdf"; then
      print_blocked "$pdf carries a cryptographic signature — a merge would void it"
      exit 2
    fi
  done
}

# ⚠️ the read and the guard are TWO statements on purpose.
#
#    written as one — `n="$(pdfinfo … | awk …)"` — the guard below is
#    UNREACHABLE: `set -e` plus `pipefail` aborts on the assignment line
#    itself, so the refusal never prints and the caller gets a bare exit
#    code with no reason attached. the same trap pdf.render documents.
page_count_of() {
  local pdf="$1"
  local info
  info="$(pdfinfo "$pdf" 2>/dev/null)" || info=""
  local n
  n="$(printf '%s\n' "$info" | awk '/^Pages:/ { print $2 }')"
  if [[ -z "$n" ]]; then
    print_blocked "could not read page count — is this a valid PDF? $pdf"
    exit 1
  fi
  printf '%s\n' "$n"
}

tally_inputs() {
  PAGE_COUNTS=()
  EXPECTED_PAGES=0
  local pdf n
  for pdf in "${INPUTS[@]}"; do
    n="$(page_count_of "$pdf")"
    PAGE_COUNTS+=("$n")
    EXPECTED_PAGES=$((EXPECTED_PAGES + n))
  done
}

get_out_path() {
  if [[ -z "$OUT_PATH" ]]; then
    print_blocked "no --into given: name the output path"
    exit 2
  fi
  if [[ "${OUT_PATH##*.}" != "pdf" ]]; then
    print_blocked "--into must end in .pdf, got: $OUT_PATH"
    exit 2
  fi

  local out_dir
  out_dir="$(dirname "$OUT_PATH")"
  if [[ ! -d "$out_dir" ]]; then
    print_blocked "output directory does not exist: $out_dir"
    exit 2
  fi

  # an input that is also the output would be read and rewritten in the
  # same breath. pdfunite's behavior there is undefined, and the failure
  # mode is a truncated SOURCE document rather than a bad output — so it
  # destroys an input the caller still needs.
  local pdf
  for pdf in "${INPUTS[@]}"; do
    if [[ "$pdf" -ef "$OUT_PATH" ]]; then
      print_blocked "--into is also an input: $OUT_PATH"
      exit 2
    fi
  done
}

merge() {
  local err
  err="$(pdfunite "${INPUTS[@]}" "$OUT_PATH" 2>&1)" || {
    print_blocked "pdfunite failed: $err"
    exit 1
  }

  if [[ ! -f "$OUT_PATH" ]]; then
    print_blocked "pdfunite wrote no file — expected $OUT_PATH"
    exit 1
  fi
}

# 🎯 THE RECONCILIATION — this is the whole reason the skill exists.
#
#    a merge that drops a page emits a valid PDF at a plausible size and
#    reports success. the only way to know every page survived is to
#    count them on the far side and compare.
verify_output() {
  ACTUAL_PAGES="$(page_count_of "$OUT_PATH")"
  if [[ "$ACTUAL_PAGES" -ne "$EXPECTED_PAGES" ]]; then
    print_blocked "page count mismatch: expected $EXPECTED_PAGES, output has $ACTUAL_PAGES"
    exit 1
  fi
  BYTES="$(wc -c < "$OUT_PATH" | tr -d ' ')"
}

main() {
  parse_args "$@"
  check_tools
  validate_input
  check_unsigned
  tally_inputs
  get_out_path

  local i

  if [[ "$MODE" == "plan" ]]; then
    print_eagle_header "heres the plan,"
    print_tree_start "pdf.merge --mode plan"
    for i in "${!INPUTS[@]}"; do
      print_tree_branch "$((i + 1)). ${INPUTS[$i]}" "${PAGE_COUNTS[$i]} page(s)"
    done
    print_tree_branch "would total" "$EXPECTED_PAGES page(s)"
    print_tree_leaf "would write" "$OUT_PATH"
    exit 0
  fi

  merge
  verify_output

  print_eagle_header "bound together,"
  print_tree_start "pdf.merge"
  for i in "${!INPUTS[@]}"; do
    print_tree_branch "$((i + 1)). ${INPUTS[$i]}" "${PAGE_COUNTS[$i]} page(s)"
  done
  print_tree_branch "pages" "$ACTUAL_PAGES of $EXPECTED_PAGES expected ✅"
  print_tree_branch "bytes" "$BYTES"
  print_tree_leaf "into" "$OUT_PATH"
}

main "$@"
