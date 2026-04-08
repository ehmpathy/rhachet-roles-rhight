#!/usr/bin/env bash
######################################################################
# .what = fetch patent document by application number from USPTO
#
# .why  = retrieves full patent content for prior art analysis:
#         - claims (independent and dependent)
#         - specification text
#         - metadata (inventors, dates, classifications)
#
# usage:
#   patent.priors.fetch.sh --exid 19399196
#
# note:
#   - exid is the 8-digit APPLICATION number (not publication number)
#   - use search to find application numbers from keywords
#
# guarantee:
#   - validates exid format before fetch
#   - caches immutable patent data (never stale)
#   - treestruct output with eagle mascot
#   - exit 1 for malfunction, exit 2 for constraint
######################################################################
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output.sh"

# path to asStatusEmoji for status indicators
AS_STATUS_EMOJI_CMD="$SCRIPT_DIR/asStatusEmoji.sh"

# path to transcribe.pdf skill
# compute the domain.roles directory, then build path to transcriber skill
# this avoids issues with ../ traversal in paths
_DOMAIN_ROLES_DIR="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
TRANSCRIBE_CMD="$_DOMAIN_ROLES_DIR/transcriber/skills/transcribe.pdf/transcribe.pdf.sh"

# cache location for patent documents (repo-local)
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
CACHE_BASE="${GIT_ROOT}/.cache/patents"
# CACHE_DIR is set per-patent in main() as $CACHE_BASE/$PATENT_EXID/
CACHE_DIR=""

######################################################################
# parse_args
######################################################################
parse_args() {
  PATENT_EXID=""
  CACHE_SKIP="false"

  while [[ $# -gt 0 ]]; do
    case $1 in
      --exid)
        PATENT_EXID="$2"
        shift 2
        ;;
      --cache)
        if [[ "${2:-}" == "skip" ]]; then
          CACHE_SKIP="true"
          shift 2
        else
          echo "unknown --cache option: ${2:-}" >&2
          echo "valid options: skip" >&2
          exit 2
        fi
        ;;
      --skill|--repo|--role)
        # rhachet passes these - ignore them
        shift 2
        ;;
      --help|-h)
        echo "usage: patent.priors.fetch.sh --exid 19399196 [--cache skip]"
        echo ""
        echo "options:"
        echo "  --exid        8-digit USPTO application number (required)"
        echo "  --cache skip  bypass cache and force fresh API call"
        exit 0
        ;;
      *)
        echo "unknown argument: $1" >&2
        exit 2
        ;;
    esac
  done

  if [[ -z "$PATENT_EXID" ]]; then
    print_blocked "exid required"
    echo "" >&2
    echo "usage: patent.priors.fetch.sh --exid 19399196" >&2
    exit 2
  fi
}

######################################################################
# validate_exid - check format matches USPTO application number pattern
######################################################################
validate_exid() {
  # USPTO application number format: 8 digits (e.g., 19399196)
  # NOT publication number format (e.g., US7654321B2)
  if [[ ! "$PATENT_EXID" =~ ^[0-9]{8}$ ]]; then
    print_blocked "invalid application number format"
    echo "" >&2
    echo "expected format: 8-digit application number (e.g., 19399196)" >&2
    echo "received: $PATENT_EXID" >&2
    echo "" >&2
    echo "note: use application numbers, not publication numbers (US7654321B2)" >&2
    exit 2
  fi
}

######################################################################
# check_api_key - verify USPTO API key is available (lazy)
# checks env first, then keyrack; only checks once; sets USPTO_ODP_API_KEY global
######################################################################
USPTO_ODP_API_KEY="${USPTO_ODP_API_KEY:-}"
USPTO_ODP_API_KEY_CHECKED="false"

check_api_key() {
  # skip if already checked
  if [[ "$USPTO_ODP_API_KEY_CHECKED" == "true" ]]; then
    return 0
  fi
  USPTO_ODP_API_KEY_CHECKED="true"

  # check if already set in environment (e.g., from test harness)
  if [[ -n "$USPTO_ODP_API_KEY" ]]; then
    return 0
  fi

  # fall back to keyrack
  # use full slug format (org.env.KEY) to work from any directory
  local keyrack_json
  keyrack_json=$(rhx keyrack get --key ehmpathy.test.USPTO_ODP_API_KEY --json 2>&1) || {
    print_blocked "keyrack failed"
    echo ""
    echo "$keyrack_json"
    exit 2
  }

  USPTO_ODP_API_KEY=$(echo "$keyrack_json" | jq -r '.grant.key.secret')

  if [[ -z "$USPTO_ODP_API_KEY" || "$USPTO_ODP_API_KEY" == "null" ]]; then
    print_blocked "keyrack returned no secret"
    echo ""
    echo "response: $keyrack_json"
    exit 2
  fi
}

######################################################################
# check_vision_api_key - verify Google Cloud Vision API key for OCR (lazy)
# checks env first, then keyrack; provisions credentials file if needed
######################################################################
VISION_API_KEY_CHECKED="false"
VISION_CREDS_TEMP_FILE=""

check_vision_api_key() {
  # skip if already checked
  if [[ "$VISION_API_KEY_CHECKED" == "true" ]]; then
    return 0
  fi
  VISION_API_KEY_CHECKED="true"

  # check if Google Cloud credentials already set in environment
  if [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" && -f "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
    return 0
  fi

  # fetch from keyrack and provision credentials file
  # use full slug format (org.env.KEY) to work from any directory
  local keyrack_json
  keyrack_json=$(rhx keyrack get --key ehmpathy.test.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS --json 2>&1) || {
    print_blocked "vision API keyrack failed"
    echo "" >&2
    echo "OCR requires Google Cloud Vision API credentials." >&2
    echo "" >&2
    echo "run: rhx keyrack unlock --owner ehmpath --env test" >&2
    echo "" >&2
    echo "keyrack response:" >&2
    echo "$keyrack_json" >&2
    exit 2
  }

  local secret
  secret=$(echo "$keyrack_json" | jq -r '.grant.key.secret')

  if [[ -z "$secret" || "$secret" == "null" ]]; then
    print_blocked "vision API key not found in keyrack"
    echo "" >&2
    echo "OCR requires GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS in keyrack." >&2
    echo "" >&2
    echo "ask a human to run: rhx keyrack fill --owner ehmpath" >&2
    exit 2
  fi

  # write credentials to temp file and export for child processes
  VISION_CREDS_TEMP_FILE=$(mktemp --suffix=.json)
  echo "$secret" > "$VISION_CREDS_TEMP_FILE"
  export GOOGLE_APPLICATION_CREDENTIALS="$VISION_CREDS_TEMP_FILE"
}

# cleanup temp credentials file on exit
cleanup_vision_creds() {
  if [[ -n "$VISION_CREDS_TEMP_FILE" && -f "$VISION_CREDS_TEMP_FILE" ]]; then
    rm -f "$VISION_CREDS_TEMP_FILE"
  fi
}
trap cleanup_vision_creds EXIT

######################################################################
# get_status_emoji - convert patent status to emoji indicator
######################################################################
get_status_emoji() {
  local status="${1:-}"
  "$AS_STATUS_EMOJI_CMD" "$status"
}

######################################################################
# is_application_document - check if document code is an application doc
# application docs: SPEC, CLM, ABST, DRW (the original submission)
######################################################################
is_application_document() {
  local code="$1"
  case "$code" in
    SPEC|CLM|ABST|DRW|DRW.SUPP|APP.TEXT)
      return 0 ;;
    *)
      return 1 ;;
  esac
}

######################################################################
# doc_code_to_slug - map USPTO document codes to readable slugs
######################################################################
doc_code_to_slug() {
  local code="$1"
  case "$code" in
    CTFR)       echo "final-rejection" ;;
    CTNF)       echo "non-final-rejection" ;;
    CT*|OA*)    echo "office-action" ;;
    A.*|RESP)   echo "response" ;;
    NOA|MN/=.)  echo "notice-of-allowance" ;;
    ISSUE.NTF)  echo "issue-notification" ;;
    DRW.SUPP)   echo "drawings-supplemental" ;;
    DRW)        echo "drawings" ;;
    SPEC)       echo "specification" ;;
    CLM*)       echo "claims" ;;
    ABST)       echo "abstract" ;;
    APP.TEXT)   echo "application" ;;
    AMD*)       echo "amendment" ;;
    TRAN*)      echo "transmittal" ;;
    *FEE|FEE*)  echo "fee" ;;
    N[0-9]*)    echo "notice" ;;
    *)          echo "document" ;;
  esac
}

######################################################################
# cache_check_meta - check if metadata is cached
######################################################################
cache_check_meta() {
  if [[ "$CACHE_SKIP" == "true" ]]; then
    return 1
  fi

  local meta_path="$CACHE_DIR/0.overview.meta.json"

  if [[ -f "$meta_path" ]]; then
    cat "$meta_path"
    return 0
  fi

  return 1
}

######################################################################
# cache_check_doc - check if document XML is cached
######################################################################
cache_check_doc() {
  if [[ "$CACHE_SKIP" == "true" ]]; then
    return 1
  fi

  local doc_path="$CACHE_DIR/0.grant.document.xml"

  if [[ -f "$doc_path" ]]; then
    cat "$doc_path"
    return 0
  fi

  return 1
}

######################################################################
# fetch_metadata - fetch from USPTO API
######################################################################
fetch_metadata() {
  local url="https://api.uspto.gov/api/v1/patent/applications/${PATENT_EXID}"

  local response http_code body
  response=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -H "X-Api-Key: $USPTO_ODP_API_KEY" \
    "$url")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  case "$http_code" in
    200)
      echo "$body"
      ;;
    404)
      print_blocked "patent not found"
      echo ""
      echo "application number $PATENT_EXID does not exist"
      exit 2
      ;;
    429)
      print_blocked "rate limited"
      echo ""
      echo "USPTO API rate limit exceeded. please wait and retry."
      exit 1
      ;;
    *)
      print_blocked "API error"
      echo ""
      echo "status: $http_code"
      echo "response: ${body:0:200}"
      exit 1
      ;;
  esac
}

######################################################################
# extract_document_uri - get fileLocationURI from metadata
######################################################################
extract_document_uri() {
  local metadata="$1"

  # the document URI is nested under patentFileWrapperDataBag[0].grantDocumentMetaData.fileLocationURI
  local uri
  uri=$(echo "$metadata" | jq -r '.patentFileWrapperDataBag[0].grantDocumentMetaData.fileLocationURI // empty')

  if [[ -n "$uri" && "$uri" != "null" ]]; then
    echo "$uri"
    return 0
  fi

  # application not yet granted - no document URI available
  return 1
}

######################################################################
# fetch_document_xml - fetch full patent document with retry on 429
######################################################################
fetch_document_xml() {
  local uri="$1"
  local max_retries=3
  local retry_count=0

  while [[ $retry_count -lt $max_retries ]]; do
    local response http_code body
    response=$(curl -s -L -w "\n%{http_code}" --max-time 60 \
      -H "X-Api-Key: $USPTO_ODP_API_KEY" \
      "$uri")

    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')

    case "$http_code" in
      200)
        echo "$body"
        return 0
        ;;
      404)
        # document not available yet
        return 1
        ;;
      429)
        # rate limited - retry with exponential backoff
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
          local wait_time=$((retry_count * 5))
          echo "rate limited (429), will retry in ${wait_time}s (attempt $((retry_count + 1))/$max_retries)" >&2
          sleep "$wait_time"
          continue
        fi
        echo "document fetch failed: $http_code (rate limited, max retries exhausted)" >&2
        return 1
        ;;
      *)
        # non-fatal: log and continue with metadata only
        echo "document fetch failed: $http_code" >&2
        return 1
        ;;
    esac
  done

  return 1
}

######################################################################
# extract_figure_uris - find figure references in document XML
######################################################################
extract_figure_uris() {
  local doc_xml="$1"

  # extract figure URIs from XML (various formats)
  # look for img/@src, figure/@file, etc.
  echo "$doc_xml" | grep -oE 'src="[^"]+\.(png|tiff|tif|jpg|jpeg|gif)"' | \
    sed 's/src="//g; s/"//g' | sort -u || true
}

######################################################################
# fetch_figures - download figure images
######################################################################
fetch_figures() {
  local doc_xml="$1"
  local fig_num=1

  local figure_uris
  figure_uris=$(extract_figure_uris "$doc_xml")

  if [[ -z "$figure_uris" ]]; then
    return 0
  fi

  while IFS= read -r fig_uri; do
    if [[ -z "$fig_uri" ]]; then
      continue
    fi

    # determine extension
    local ext
    ext=$(echo "$fig_uri" | grep -oE '\.[a-zA-Z]+$' | sed 's/\.//')
    if [[ -z "$ext" ]]; then
      ext="png"
    fi

    local fig_path="$CACHE_DIR/0.overview.fig-${fig_num}.${ext}"

    # skip if already cached (unless CACHE_SKIP)
    if [[ -f "$fig_path" && "$CACHE_SKIP" != "true" ]]; then
      fig_num=$((fig_num + 1))
      continue
    fi

    # fetch figure (non-fatal if fails)
    curl -s --max-time 30 -o "$fig_path" "$fig_uri" 2>/dev/null || true

    fig_num=$((fig_num + 1))
  done <<< "$figure_uris"
}

######################################################################
# fetch_document_list - get prosecution documents list from API with retry
######################################################################
fetch_document_list() {
  local url="https://api.uspto.gov/api/v1/patent/applications/${PATENT_EXID}/documents"
  local max_retries=3
  local retry_count=0

  while [[ $retry_count -lt $max_retries ]]; do
    local response http_code body
    response=$(curl -s -w "\n%{http_code}" --max-time 30 \
      -H "X-Api-Key: $USPTO_ODP_API_KEY" \
      "$url")

    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')

    case "$http_code" in
      200)
        echo "$body"
        return 0
        ;;
      404)
        # no documents available
        return 1
        ;;
      429)
        # rate limited - retry with exponential backoff
        retry_count=$((retry_count + 1))
        if [[ $retry_count -lt $max_retries ]]; then
          local wait_time=$((retry_count * 5))
          echo "rate limited (429), will retry in ${wait_time}s (attempt $((retry_count + 1))/$max_retries)" >&2
          sleep "$wait_time"
          continue
        fi
        echo "document list fetch failed: $http_code (rate limited, max retries exhausted)" >&2
        return 1
        ;;
      *)
        # non-fatal: log and continue
        echo "document list fetch failed: $http_code" >&2
        return 1
        ;;
    esac
  done

  return 1
}

######################################################################
# fetch_application_documents - fetch original submission docs (SPEC, CLM, ABST as XML; DRW as PDF)
######################################################################
fetch_application_documents() {
  local docs_json="$1"

  # extract application document entries (SPEC, CLM, ABST, DRW)
  local app_entries
  app_entries=$(echo "$docs_json" | jq -c '
    [.documentBag // .documents // [] | .[] |
     select(.documentCode == "SPEC" or .documentCode == "CLM" or .documentCode == "ABST" or
            .documentCode == "DRW" or .documentCode == "DRW.SUPP" or .documentCode == "APP.TEXT")]
  ' 2>/dev/null)

  if [[ -z "$app_entries" || "$app_entries" == "[]" ]]; then
    APPLICATION_DOC_COUNT=0
    return 0
  fi

  APPLICATION_DOC_COUNT=$(echo "$app_entries" | jq 'length')
  echo "   │  ├─ application: $APPLICATION_DOC_COUNT documents"

  # process each application document
  local doc_index=0
  echo "$app_entries" | jq -c '.[]' | while IFS= read -r doc_entry; do
    if [[ -z "$doc_entry" ]]; then continue; fi

    local doc_code doc_date slug
    doc_code=$(echo "$doc_entry" | jq -r '.documentCode // "UNK"')
    doc_date=$(echo "$doc_entry" | jq -r '.officialDate // ""' | cut -d'T' -f1)
    slug=$(doc_code_to_slug "$doc_code")

    # determine format: XML for SPEC/CLM/ABST, PDF for DRW
    local use_xml="false"
    case "$doc_code" in
      SPEC|CLM|ABST|APP.TEXT)
        use_xml="true" ;;
    esac

    local base_path file_ext doc_uri retrieval_status

    if [[ "$use_xml" == "true" ]]; then
      # find XML download URL
      doc_uri=$(echo "$doc_entry" | jq -r '.downloadOptionBag[] | select(.mimeTypeIdentifier == "XML") | .downloadUrl' | head -1)
      file_ext="xml"
      base_path="${CACHE_DIR}/0.application.${slug}"
    else
      # use PDF for drawings
      doc_uri=$(echo "$doc_entry" | jq -r '.downloadOptionBag[] | select(.mimeTypeIdentifier == "PDF") | .downloadUrl' | head -1)
      file_ext="pdf"
      base_path="${CACHE_DIR}/0.application.${slug}"
    fi

    local file_path="${base_path}.${file_ext}"
    local doc_name="0.application.${slug}.${file_ext}"

    # check cache
    if [[ -f "$file_path" && "$CACHE_SKIP" != "true" ]]; then
      retrieval_status="cached"
    else
      if [[ -z "$doc_uri" || "$doc_uri" == "null" ]]; then
        retrieval_status="unavailable"
      else
        check_api_key
        if curl -s -L --max-time 30 \
          -H "X-Api-Key: $USPTO_ODP_API_KEY" \
          -o "$file_path" "$doc_uri" 2>/dev/null && [[ -s "$file_path" ]]; then
          retrieval_status="fetched"
        else
          retrieval_status="failed"
          rm -f "$file_path"
        fi
      fi
    fi

    # emit tree output
    local is_last=$((doc_index == APPLICATION_DOC_COUNT - 1))
    local prefix="   │  │  ├─"
    if [[ $is_last -eq 1 ]]; then
      prefix="   │  │  └─"
    fi

    echo "${prefix} $doc_name"
    if [[ "$use_xml" == "true" ]]; then
      echo "   │  │  │  └─ retrieval: $retrieval_status"
    else
      # drawings need OCR
      echo "   │  │  │  ├─ retrieval: $retrieval_status"
      local md_path="${base_path}.md"
      local transcription_status
      if [[ -f "$md_path" && "$CACHE_SKIP" != "true" ]]; then
        transcription_status="cached"
      elif [[ "$retrieval_status" == "fetched" || "$retrieval_status" == "cached" ]]; then
        check_vision_api_key
        if bash "$TRANSCRIBE_CMD" "$file_path" --into markdown >/dev/null 2>&1; then
          transcription_status="fetched"
        else
          transcription_status="failed"
        fi
      else
        transcription_status="skipped"
      fi
      echo "   │  │  │  └─ transcription: $transcription_status"
    fi

    doc_index=$((doc_index + 1))
  done
}

######################################################################
# fetch_prosecution_documents - download prosecution PDFs in parallel
######################################################################
fetch_prosecution_documents() {
  local docs_json="$1"

  # extract prosecution document entries (exclude application docs: SPEC, CLM, ABST, DRW)
  # USPTO returns documentBag array with nested downloadOptionBag
  local doc_entries
  doc_entries=$(echo "$docs_json" | jq -c '
    [.documentBag // .documents // [] | .[] |
     select(.documentCode != "SPEC" and .documentCode != "CLM" and .documentCode != "ABST" and
            .documentCode != "DRW" and .documentCode != "DRW.SUPP" and .documentCode != "APP.TEXT")] |
    sort_by(.officialDate // "9999") |
    .[]
  ' 2>/dev/null) || return 0

  if [[ -z "$doc_entries" ]]; then
    return 0
  fi

  # pre-scan to determine which API keys are needed
  local needs_uspto_key="false"
  local needs_vision_key="false"
  local prescan_index=0
  local max_docs=20

  while IFS= read -r doc_entry; do
    if [[ -z "$doc_entry" ]]; then continue; fi
    if [[ $prescan_index -ge $max_docs ]]; then break; fi

    local doc_code doc_date doc_uri
    doc_code=$(echo "$doc_entry" | jq -r '.documentCode // "UNK"')
    doc_date=$(echo "$doc_entry" | jq -r '.officialDate // ""' | cut -d'T' -f1)
    doc_uri=$(echo "$doc_entry" | jq -r '.downloadOptionBag[0].downloadUrl // empty')

    if [[ -z "$doc_uri" || "$doc_uri" == "null" ]]; then continue; fi
    if [[ -z "$doc_date" ]]; then doc_date="unknown"; fi

    local slug base_path pdf_path md_path
    slug=$(doc_code_to_slug "$doc_code")
    base_path="${CACHE_DIR}/1.event.${doc_date}.${slug}"
    pdf_path="${base_path}.pdf"
    md_path="${base_path}.md"

    # check if PDF fetch needed
    if [[ ! -f "$pdf_path" || "$CACHE_SKIP" == "true" ]]; then
      needs_uspto_key="true"
    fi
    # check if OCR needed
    if [[ ! -f "$md_path" || "$CACHE_SKIP" == "true" ]]; then
      needs_vision_key="true"
    fi

    prescan_index=$((prescan_index + 1))
  done <<< "$doc_entries"

  # check API keys only if needed (lazy check)
  if [[ "$needs_uspto_key" == "true" ]]; then
    check_api_key
  fi
  if [[ "$needs_vision_key" == "true" ]]; then
    check_vision_api_key
  fi

  # create temp dir for parallel job status files
  local parallel_tmp
  parallel_tmp=$(mktemp -d)
  trap "rm -rf '$parallel_tmp'" EXIT

  # phase 1: analyze all documents and start parallel fetches
  local doc_index=0
  local doc_names=()

  while IFS= read -r doc_entry; do
    if [[ -z "$doc_entry" ]]; then
      continue
    fi

    if [[ $doc_index -ge $max_docs ]]; then
      break
    fi

    local doc_code doc_date doc_uri
    doc_code=$(echo "$doc_entry" | jq -r '.documentCode // "UNK"')
    doc_date=$(echo "$doc_entry" | jq -r '.officialDate // ""' | cut -d'T' -f1)
    doc_uri=$(echo "$doc_entry" | jq -r '.downloadOptionBag[0].downloadUrl // empty')

    if [[ -z "$doc_uri" || "$doc_uri" == "null" ]]; then
      continue
    fi

    if [[ -z "$doc_date" ]]; then
      doc_date="unknown"
    fi

    local slug
    slug=$(doc_code_to_slug "$doc_code")

    local base_path="${CACHE_DIR}/1.event.${doc_date}.${slug}"
    local pdf_path="${base_path}.pdf"
    local json_path="${base_path}.json"
    local md_path="${base_path}.md"
    local doc_name="1.event.${doc_date}.${slug}.pdf"

    doc_names+=("$doc_name")
    local status_file="$parallel_tmp/${doc_index}.status"

    # start parallel job for this document
    (
      local retrieval_status="fetched"
      local transcription_status="fetched"
      local error=""

      # check if PDF cached
      if [[ -f "$pdf_path" && "$CACHE_SKIP" != "true" ]]; then
        retrieval_status="cached"
      else
        # save metadata JSON
        echo "$doc_entry" | jq '.' > "$json_path"

        # fetch PDF
        if ! curl -s -L --max-time 15 \
          -H "X-Api-Key: $USPTO_ODP_API_KEY" \
          -o "$pdf_path" "$doc_uri" 2>/dev/null; then
          echo "retrieval:failed|transcription:skipped|error:fetch failed (network)" > "$status_file"
          rm -f "$json_path"
          exit 1
        fi

        # verify not empty
        if [[ ! -s "$pdf_path" ]]; then
          echo "retrieval:failed|transcription:skipped|error:fetch failed (empty response)" > "$status_file"
          rm -f "$pdf_path" "$json_path"
          exit 1
        fi
      fi

      # check if markdown cached
      if [[ -f "$md_path" && "$CACHE_SKIP" != "true" ]]; then
        transcription_status="cached"
      else
        # OCR the PDF (use absolute path to transcribe.pdf for cwd independence)
        local transcribe_err
        transcribe_err=$(bash "$TRANSCRIBE_CMD" "$pdf_path" --into markdown 2>&1 >/dev/null) || {
          echo "retrieval:${retrieval_status}|transcription:failed|error:transcribe failed: $transcribe_err" > "$status_file"
          exit 1
        }
      fi

      echo "retrieval:${retrieval_status}|transcription:${transcription_status}|error:" > "$status_file"
    ) &

    doc_index=$((doc_index + 1))
  done <<< "$doc_entries"

  # wait for all parallel jobs to complete
  wait

  # phase 2: report results in order and check for errors
  local fetched_count=0
  local skipped_count=0

  for i in "${!doc_names[@]}"; do
    local doc_name="${doc_names[$i]}"
    local status_file="$parallel_tmp/${i}.status"

    echo "   │  │  ├─ $doc_name"

    if [[ -f "$status_file" ]]; then
      local status_line
      status_line=$(cat "$status_file")

      local retrieval_status transcription_status error_msg
      retrieval_status=$(echo "$status_line" | sed 's/.*retrieval:\([^|]*\).*/\1/')
      transcription_status=$(echo "$status_line" | sed 's/.*transcription:\([^|]*\).*/\1/')
      error_msg=$(echo "$status_line" | sed 's/.*error:\(.*\)/\1/')

      echo "   │  │  │  ├─ retrieval: $retrieval_status"
      echo "   │  │  │  └─ transcription: $transcription_status"

      # failfast on error
      if [[ -n "$error_msg" ]]; then
        print_blocked "$error_msg: $doc_name"
        rm -rf "$parallel_tmp"
        exit 1
      fi

      if [[ "$retrieval_status" == "cached" ]]; then
        skipped_count=$((skipped_count + 1))
      else
        fetched_count=$((fetched_count + 1))
      fi
    else
      # job did not complete (should not happen after wait)
      echo "   │  │  │  ├─ retrieval: unknown"
      echo "   │  │  │  └─ transcription: unknown"
      print_blocked "job failed: $doc_name"
      rm -rf "$parallel_tmp"
      exit 1
    fi
  done

  rm -rf "$parallel_tmp"
  trap - EXIT

  # return counts via global variables
  PROSECUTION_FETCHED=$fetched_count
  PROSECUTION_SKIPPED=$skipped_count
}

######################################################################
# parse_claims_from_xml - extract claims from document XML
######################################################################
parse_claims_from_xml() {
  local doc_xml="$1"

  # patent XML uses <claim-text> elements for claim content
  # extract claim text, one per line, clean up whitespace
  echo "$doc_xml" | \
    grep -oP '(?<=<claim-text>)[^<]+' 2>/dev/null | \
    sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | \
    grep -v '^$' | \
    head -20 || true
}

######################################################################
# parse_abstract_from_xml - extract abstract from document XML
######################################################################
parse_abstract_from_xml() {
  local doc_xml="$1"

  # patent XML uses <abstract><p>...</p></abstract> structure
  # extract text between <p> tags inside abstract
  echo "$doc_xml" | \
    grep -oP '(?<=<abstract[^>]*>).*?(?=</abstract>)' 2>/dev/null | \
    sed 's/<[^>]*>//g' | \
    sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | \
    tr '\n' ' ' | \
    head -c 500 || true
}

######################################################################
# parse_description_from_xml - extract description from document XML
######################################################################
parse_description_from_xml() {
  local doc_xml="$1"

  # patent XML uses <description> or <us-description> element
  # just get a preview (first 500 chars)
  echo "$doc_xml" | \
    grep -oE '<description[^>]*>.*?</description>' 2>/dev/null | \
    sed 's/<[^>]*>//g' | \
    sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | \
    head -c 500 || true
}

######################################################################
# emit_document_header - treestruct output header and status section
######################################################################
emit_document_header() {
  local metadata="$1"
  local has_grant="${2:-false}"

  # extract metadata fields
  local meta_path='.patentFileWrapperDataBag[0].applicationMetaData'
  local title date_filed date_published patent_number inventor status_text

  title=$(echo "$metadata" | jq -r "${meta_path}.inventionTitle // \"unknown\"")
  date_filed=$(echo "$metadata" | jq -r "${meta_path}.filingDate // \"unknown\"")
  date_published=$(echo "$metadata" | jq -r "${meta_path}.earliestPublicationDate // empty")
  patent_number=$(echo "$metadata" | jq -r "${meta_path}.patentNumber // empty")
  inventor=$(echo "$metadata" | jq -r "${meta_path}.firstInventorName // \"unknown\"")
  status_text=$(echo "$metadata" | jq -r "${meta_path}.applicationStatusDescriptionText // empty")

  # get status emoji
  local status_emoji
  status_emoji=$(get_status_emoji "$status_text")

  # build resolved args string
  local resolved_args="--exid $PATENT_EXID"
  if [[ "$CACHE_SKIP" == "true" ]]; then
    resolved_args="$resolved_args --cache skip"
  fi

  print_eagle_header "got one,"
  print_tree_start "patent.priors.fetch $resolved_args"
  print_tree_branch "title" "$title"
  print_tree_branch "inventor" "$inventor"

  # status section with emoji indicators
  echo "   ├─ status"
  echo "   │  ├─ $status_emoji $status_text"
  echo "   │  ├─ filed on = $date_filed"
  if [[ -n "$date_published" && "$date_published" != "null" ]]; then
    echo "   │  ├─ published on = $date_published"
  else
    echo "   │  ├─ published on = not yet published"
  fi
  if [[ -n "$patent_number" && "$patent_number" != "null" ]]; then
    echo "   │  └─ granted on = $patent_number"
  else
    echo "   │  └─ granted on = not yet granted"
  fi
}

######################################################################
# emit_document_footer - cache and hint lines
######################################################################
emit_document_footer() {
  print_tree_branch "cache" ".cache/patents/${PATENT_EXID}/"
  echo "   └─ hint: tree -f .cache/patents/${PATENT_EXID}"
}

######################################################################
# main
######################################################################
main() {
  parse_args "$@"
  validate_exid

  # note: API keys are checked lazily, only when a fetch is needed
  # this allows cached-only runs to work without credentials

  # set cache directory per patent
  CACHE_DIR="${CACHE_BASE}/${PATENT_EXID}"
  mkdir -p "$CACHE_DIR"

  local metadata doc_xml="" has_doc="false" has_prosecution="false"

  # phase 1: metadata
  if metadata=$(cache_check_meta); then
    : # cached metadata loaded
  else
    # need API key for fetch
    check_api_key
    print_progress "fetch metadata"
    metadata=$(fetch_metadata)
    print_progress_done

    # cache raw metadata response
    echo "$metadata" > "$CACHE_DIR/0.overview.meta.json"
  fi

  # phase 2: document XML
  local doc_uri
  if doc_uri=$(extract_document_uri "$metadata"); then
    if doc_xml=$(cache_check_doc); then
      has_doc="true"
    else
      # need API key for fetch
      check_api_key
      print_progress "fetch document"
      if doc_xml=$(fetch_document_xml "$doc_uri"); then
        has_doc="true"
        # cache raw document XML
        echo "$doc_xml" > "$CACHE_DIR/0.grant.document.xml"
      fi
      print_progress_done
    fi
  fi

  # phase 3: figures (if document available)
  if [[ "$has_doc" == "true" && -n "$doc_xml" ]]; then
    fetch_figures "$doc_xml"
  fi

  # phase 4: prosecution documents
  local docs_list_path="$CACHE_DIR/0.overview.docs.json"
  local docs_json=""

  # check cache first
  if [[ -f "$docs_list_path" && "$CACHE_SKIP" != "true" ]]; then
    docs_json=$(cat "$docs_list_path")
    has_prosecution="true"
  else
    # need API key for fetch
    check_api_key
    print_progress "fetch document list"
    if docs_json=$(fetch_document_list); then
      # cache document list
      echo "$docs_json" > "$docs_list_path"
      has_prosecution="true"
    fi
    print_progress_done
  fi

  # emit header with status section
  emit_document_header "$metadata" "$has_doc"

  # documents section
  echo "   ├─ documents"

  # application documents (SPEC, CLM, ABST as XML; DRW as PDF+OCR)
  APPLICATION_DOC_COUNT=0
  if [[ "$has_prosecution" == "true" && -n "$docs_json" ]]; then
    fetch_application_documents "$docs_json"
  fi

  # prosecution documents (PDF+OCR, excludes application docs)
  PROSECUTION_DOC_COUNT=0
  if [[ "$has_prosecution" == "true" && -n "$docs_json" ]]; then
    PROSECUTION_FETCHED=0
    PROSECUTION_SKIPPED=0
    # count prosecution docs (excluding application docs)
    PROSECUTION_DOC_COUNT=$(echo "$docs_json" | jq '
      [.documentBag // .documents // [] | .[] |
       select(.documentCode != "SPEC" and .documentCode != "CLM" and .documentCode != "ABST" and
              .documentCode != "DRW" and .documentCode != "DRW.SUPP" and .documentCode != "APP.TEXT")] |
      length' 2>/dev/null || echo "0")
    if [[ "$PROSECUTION_DOC_COUNT" -gt 20 ]]; then
      PROSECUTION_DOC_COUNT=20  # capped at 20
    fi
    echo "   │  ├─ prosecution: $PROSECUTION_DOC_COUNT documents"
    fetch_prosecution_documents "$docs_json"
  fi

  # grant document (if available)
  if [[ "$has_doc" == "true" ]]; then
    echo "   │  └─ grant: available"
    echo "   │     └─ 0.grant.document.xml"
    echo "   │        └─ retrieval: cached"
  else
    echo "   │  └─ grant: unavailable (not yet granted)"
  fi

  # emit cache and hint (footer)
  emit_document_footer
}

main "$@"
