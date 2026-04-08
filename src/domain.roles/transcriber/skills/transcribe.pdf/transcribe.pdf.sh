#!/usr/bin/env bash
######################################################################
# .what = extract text from image-based PDFs via Google Cloud Vision OCR
#
# .why  = scanned documents (e.g., USPTO prosecution docs) contain no
#         embedded text. OCR is required to extract readable content.
#
# usage:
#   transcribe.pdf.sh document.pdf --into markdown
#   transcribe.pdf.sh --help
#
# guarantee:
#   - uses Google Cloud Vision API for OCR
#   - credentials from keyrack (GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS)
#   - outputs to stdout by default
#   - caches results alongside source PDF
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# defaults
PDF_PATH=""
OUTPUT_FORMAT="markdown"
CACHE_SKIP=false

######################################################################
# parse args
######################################################################
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --help|-h)
        print_usage
        exit 0
        ;;
      --into)
        OUTPUT_FORMAT="$2"
        shift 2
        ;;
      --cache)
        if [[ "$2" == "skip" ]]; then
          CACHE_SKIP=true
        fi
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
usage: transcribe.pdf.sh <pdf-path> [--into markdown]

extract text from image-based PDFs via Google Cloud Vision OCR.

args:
  <pdf-path>       path to the PDF file
  --into FORMAT    output format (default: markdown)
  --cache skip     bypass cache and force fresh OCR
  --help           show this help

examples:
  transcribe.pdf.sh document.pdf
  transcribe.pdf.sh document.pdf --into markdown
  transcribe.pdf.sh scanned.pdf --cache skip
EOF
}

######################################################################
# validate
######################################################################
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

validate_format() {
  if [[ "$OUTPUT_FORMAT" != "markdown" ]]; then
    print_blocked "unsupported format: $OUTPUT_FORMAT (only markdown supported)"
    exit 2
  fi
}

######################################################################
# credentials
######################################################################
check_credentials() {
  # check env var first (CI injects secret via env)
  if [[ -n "${GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS:-}" ]]; then
    SA_JSON="$GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS"
  else
    # fall back to keyrack (local dev)
    local keyrack_json
    keyrack_json=$(rhx keyrack get --key ehmpathy.test.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS --json 2>&1) || {
      print_blocked "keyrack failed: run 'rhx keyrack unlock --owner ehmpath --env test'"
      exit 2
    }

    SA_JSON=$(echo "$keyrack_json" | jq -r '.grant.key.secret')
    if [[ -z "$SA_JSON" || "$SA_JSON" == "null" ]]; then
      print_blocked "keyrack returned no secret"
      exit 2
    fi
  fi

  # write temp credentials file
  CREDS_FILE=$(mktemp)
  echo "$SA_JSON" > "$CREDS_FILE"
  trap 'rm -f "$CREDS_FILE"' EXIT
}

get_access_token() {
  # extract service account email and private key
  local sa_email
  local private_key
  sa_email=$(echo "$SA_JSON" | jq -r '.client_email')
  private_key=$(echo "$SA_JSON" | jq -r '.private_key')

  # create JWT header and claim set
  local header
  local now
  local exp
  local claim
  header=$(echo -n '{"alg":"RS256","typ":"JWT"}' | base64 -w0 | tr '/+' '_-' | tr -d '=')
  now=$(date +%s)
  exp=$((now + 3600))
  claim=$(echo -n "{\"iss\":\"$sa_email\",\"scope\":\"https://www.googleapis.com/auth/cloud-vision\",\"aud\":\"https://oauth2.googleapis.com/token\",\"iat\":$now,\"exp\":$exp}" | base64 -w0 | tr '/+' '_-' | tr -d '=')

  # sign JWT with private key
  local signature
  local jwt
  signature=$(echo -n "$header.$claim" | openssl dgst -sha256 -sign <(echo "$private_key") | base64 -w0 | tr '/+' '_-' | tr -d '=')
  jwt="$header.$claim.$signature"

  # exchange JWT for access token
  local token_response
  token_response=$(curl -s -X POST https://oauth2.googleapis.com/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$jwt")

  ACCESS_TOKEN=$(echo "$token_response" | jq -r '.access_token')
  if [[ -z "$ACCESS_TOKEN" || "$ACCESS_TOKEN" == "null" ]]; then
    print_blocked "failed to get access token: $(echo "$token_response" | jq -r '.error_description // .error // "unknown error"')"
    exit 1
  fi
}

######################################################################
# OCR
######################################################################
convert_pdf_to_images() {
  # create temp dir for images
  TEMP_DIR=$(mktemp -d)
  trap 'rm -rf "$TEMP_DIR"; rm -f "$CREDS_FILE"' EXIT

  # convert PDF to PNG images (300 DPI for good OCR quality)
  if ! command -v pdftoppm &>/dev/null; then
    print_blocked "pdftoppm not found: install poppler-utils"
    exit 2
  fi

  local pdftoppm_err
  pdftoppm_err=$(pdftoppm -png -r 300 "$PDF_PATH" "$TEMP_DIR/page" 2>&1) || {
    print_blocked "failed to convert PDF to images: $pdftoppm_err"
    exit 1
  }

  # count pages
  PAGE_COUNT=$(ls "$TEMP_DIR"/page-*.png 2>/dev/null | wc -l)
  if [[ "$PAGE_COUNT" -eq 0 ]]; then
    print_blocked "no pages extracted from PDF"
    exit 1
  fi
}

ocr_image() {
  local image_path="$1"
  local base64_image
  base64_image=$(base64 -w0 "$image_path")

  # create request payload file (avoids bash issues with large base64)
  local payload_file
  payload_file=$(mktemp)
  cat > "$payload_file" <<EOF
{
  "requests": [{
    "image": {"content": "$base64_image"},
    "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
  }]
}
EOF

  local response
  local http_code
  response=$(curl -s -w "\n%{http_code}" "https://vision.googleapis.com/v1/images:annotate" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$payload_file")

  rm -f "$payload_file"

  # extract http code from last line
  http_code=$(echo "$response" | tail -n1)
  response=$(echo "$response" | sed '$d')

  # check for HTTP error
  if [[ "$http_code" != "200" ]]; then
    # check for billing error
    local billing_error
    billing_error=$(echo "$response" | jq -r '.error.details[]? | select(.reason == "BILLING_DISABLED") | .reason' 2>/dev/null)
    if [[ "$billing_error" == "BILLING_DISABLED" ]]; then
      local console_url
      console_url=$(echo "$response" | jq -r '.error.details[]?.metadata?.consoleUrl // empty' 2>/dev/null | head -1)
      print_blocked "billing not enabled" >&2
      echo "" >&2
      echo "the Google Cloud project needs billing enabled for Vision API OCR." >&2
      echo "" >&2
      echo "enable at: $console_url" >&2
      echo "" >&2
      echo "raw response:" >&2
      echo "$response" | jq -c '.' >&2
      echo "" >&2
      exit 2
    fi

    # other HTTP errors
    local error_msg
    error_msg=$(echo "$response" | jq -r '.error.message // empty' 2>/dev/null)
    print_blocked "Vision API error (HTTP $http_code): $error_msg" >&2
    echo "" >&2
    echo "raw response:" >&2
    echo "$response" | jq -c '.' >&2
    echo "" >&2
    exit 1
  fi

  # check for per-image error in response
  local image_error
  image_error=$(echo "$response" | jq -r '.responses[0].error.message // empty' 2>/dev/null)
  if [[ -n "$image_error" ]]; then
    print_blocked "OCR failed: $image_error" >&2
    echo "" >&2
    echo "raw response:" >&2
    echo "$response" | jq -c '.' >&2
    echo "" >&2
    exit 1
  fi

  # extract text
  echo "$response" | jq -r '.responses[0].fullTextAnnotation.text // ""' 2>/dev/null
}

######################################################################
# cache
######################################################################
get_cache_path() {
  # cache alongside source PDF
  local pdf_dir
  local pdf_name
  pdf_dir=$(dirname "$PDF_PATH")
  pdf_name=$(basename "$PDF_PATH" .pdf)
  echo "$pdf_dir/$pdf_name.md"
}

check_cache() {
  if [[ "$CACHE_SKIP" == "true" ]]; then
    return 1
  fi

  local cache_path
  cache_path=$(get_cache_path)
  if [[ -f "$cache_path" ]]; then
    return 0
  fi
  return 1
}

######################################################################
# main
######################################################################
main() {
  parse_args "$@"
  validate_pdf
  validate_format

  # check cache first
  if check_cache; then
    local cache_path
    cache_path=$(get_cache_path)
    print_eagle_header "found in cache,"
    print_tree_start "transcribe.pdf"
    print_tree_branch "source" "$PDF_PATH"
    print_tree_branch "cached" "$cache_path"
    print_tree_leaf "format" "$OUTPUT_FORMAT"
    echo ""
    cat "$cache_path"
    exit 0
  fi

  # get credentials and token
  check_credentials
  get_access_token

  # convert PDF to images
  convert_pdf_to_images

  print_eagle_header "let me read that,"
  print_tree_start "transcribe.pdf"
  print_tree_branch "source" "$PDF_PATH"
  print_tree_branch "pages" "$PAGE_COUNT"
  print_tree_leaf "format" "$OUTPUT_FORMAT"
  echo ""

  # OCR each page
  local all_text=""
  local page_num=0
  for image in "$TEMP_DIR"/page-*.png; do
    page_num=$((page_num + 1))
    echo "# Page $page_num" >&2
    local page_text
    page_text=$(ocr_image "$image")
    all_text+="## Page $page_num"$'\n\n'"$page_text"$'\n\n'
  done

  # output
  echo "$all_text"

  # cache result
  local cache_path
  cache_path=$(get_cache_path)
  echo "$all_text" > "$cache_path"
}

main "$@"
