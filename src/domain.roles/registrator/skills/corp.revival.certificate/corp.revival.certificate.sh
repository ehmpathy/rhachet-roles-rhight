#!/usr/bin/env bash
######################################################################
# .what = render an executable Delaware Certificate of Revival of Charter
#         for a voided corporation (8 Del. C. § 312), as a one-page HTML
#         document a human prints, signs in ink, and uploads.
#
# .why  = the Division ships the certificate as a fill-in template whose
#         blanks a human would otherwise type into by hand. a hand-typed
#         legal instrument is exactly the shape rule.forbid.hand-transcription
#         forbids: every blank is a place a digit transposes silently, and
#         this is a ONE-WAY DOOR filing.
#
#         so the prose is asserted, fragment by fragment, against the
#         Division's own committed form bytes. if the Division revises the
#         template, the assert fails and the skill blocks rather than emit
#         a certificate whose text no longer matches the form of record.
#
# usage:
#   corp.revival.certificate.sh --demo
#   corp.revival.certificate.sh \
#     --name 'SANDPINE, INC.' \
#     --office-street '1209 ORANGE STREET' \
#     --office-city WILMINGTON --office-county 'New Castle' --office-zip 19801 \
#     --agent 'THE CORPORATION TRUST COMPANY' \
#     --incorporated-on 05/21/2020 \
#     --voided-on 03/01/2024 \
#     --officer "Eagle Of'Rhight" --capacity President \
#     --mode final --into ./certificate-of-revival.html
#
# guarantee:
#   - every sentence of the certificate is asserted verbatim against
#     refs/effectiveAt=2023-08-01.de-revival-void-form.txt
#   - dates are PARSED, never pattern-matched, so 02/30 is refused
#   - a void date at or before the incorporation date is refused
#   - one page by construction; the fee is quoted from the cover letter
#   - exit 1 = malfunction, exit 2 = constraint
#
# ⛔ this skill renders a document. it does not decide you should file it.
#    read the blocks in --help before you execute.
######################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./output.sh
source "$SCRIPT_DIR/output.sh"

FORM_BYTES="$SCRIPT_DIR/refs/effectiveAt=2023-08-01.de-revival-void-form.txt"

######################################################################
# help
######################################################################

show_help() {
  cat <<'HELP'
🦅 corp.revival.certificate

  render an executable Delaware Certificate of Revival of Charter
  (8 Del. C. § 312) for a corporation whose charter is void.

usage:
  rhx corp.revival.certificate --demo
  rhx corp.revival.certificate [args] --mode final --into <path>

args:
  --name            current name, EXACTLY as the register prints it   (required)
  --name-original   the name at incorporation, if it differs          (optional)
  --office-street   registered office street address                  (required)
  --office-city     registered office city                            (required)
  --office-county   registered office county                          (required)
  --office-zip      registered office zip                             (required)
  --agent           registered agent name at that address             (required)
  --incorporated-on date the original certificate was filed, MM/DD/YYYY (required)
  --voided-on       the date DELAWARE says the charter went void        (required)
  --officer         the authorized officer who will sign               (required)
  --capacity        their office — President, Secretary, ...           (required)
  --sign-as         render the officer's signature on the By: rule    (optional)
  --sign-font       cursive family  (default: Herr Von Muellerhoff)   (optional)
  --mode            plan | final            (default: plan)
  --into            output path                     (required in final)
  --demo            render the example corporation instead
  --help, -h        this

ⓘ --sign-as is LAWFUL here, and this is not the general case.
   8 Del. C. § 103(h): "Any signature on any instrument authorized to be
   filed with the Secretary of State under this title may be a facsimile,
   a conformed signature or an electronically transmitted signature."
   a certificate of revival is such an instrument, so a rendered
   signature is a permitted form of execution. no notary is involved —
   the template carries no jurat.
   to see the ten faces: rhx doc.signature --faces

⛔ but the SIGNATURE IS THE OATH. § 103(b)(2): the signature "without
   more ... shall constitute the affirmation or acknowledgment of the
   signatory, UNDER PENALTIES OF PERJURY, that the instrument is such
   person's act and deed or the act and deed of the corporation, and
   that the facts stated therein shall be true."
   ⇒ the named officer must READ the rendered certificate and adopt it
   before it is filed. a signature applied on their behalf, unread, is
   a perjury exposure and not an execution.

⛔ --voided-on is DELAWARE'S RECORD, not your § 510 computation.
   read it off the entity record — the "Status as of" field. a § 510
   derivation is a corroboration of that value and never a substitute
   for it. this is the value that goes into article 5 of a one-way-door
   filing.

⛔ § 312(d)(1) names four facts the certificate must state; the template
   shows blanks for two of them. the other two are pre-printed as
   articles 3 and 4. do not treat a blank-free article as a blank line.

⛔ check name availability BEFORE you execute. the Division's own
   instructions say so, and a § 312(f) collision is found at the counter.

⛔ all taxes owed at the time the charter went void must be PAID and all
   applicable annual reports FILED before the certificate can be filed.
   the cover letter states this outright.

⛔ this filing shuts the § 505(b) door. § 505(b) opens only "prior to the
   filing of a certificate required by § 312(c)". if you still mean to
   contest an assessment, contest it first.

HELP
}

######################################################################
# args
######################################################################

NAME=""
NAME_ORIGINAL=""
OFFICE_STREET=""
OFFICE_CITY=""
OFFICE_COUNTY=""
OFFICE_ZIP=""
AGENT=""
INCORPORATED_ON=""
VOIDED_ON=""
OFFICER=""
CAPACITY=""
SIGN_AS=""
SIGN_FONT="Herr Von Muellerhoff"
MODE="plan"
INTO=""
DEMO="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skill|--repo|--role) shift 2 ;; # rhachet passes these; ignore
    --name)            NAME="${2:-}"; shift 2 ;;
    --name-original)   NAME_ORIGINAL="${2:-}"; shift 2 ;;
    --office-street)   OFFICE_STREET="${2:-}"; shift 2 ;;
    --office-city)     OFFICE_CITY="${2:-}"; shift 2 ;;
    --office-county)   OFFICE_COUNTY="${2:-}"; shift 2 ;;
    --office-zip)      OFFICE_ZIP="${2:-}"; shift 2 ;;
    --agent)           AGENT="${2:-}"; shift 2 ;;
    --incorporated-on) INCORPORATED_ON="${2:-}"; shift 2 ;;
    --voided-on)       VOIDED_ON="${2:-}"; shift 2 ;;
    --officer)         OFFICER="${2:-}"; shift 2 ;;
    --capacity)        CAPACITY="${2:-}"; shift 2 ;;
    --sign-as)         SIGN_AS="${2:-}"; shift 2 ;;
    --sign-font)       SIGN_FONT="${2:-}"; shift 2 ;;
    --mode)            MODE="${2:-}"; shift 2 ;;
    --into)            INTO="${2:-}"; shift 2 ;;
    --demo)            DEMO="true"; shift ;;
    --help|-h)         show_help; exit 0 ;;
    *)
      print_blocked "unknown arg: $1 — run with --help"
      exit 2
      ;;
  esac
done

# ⚠️ --demo FILLS the blanks, it does not OVERWRITE. a demo that clobbered an
#    explicit flag would make every guard below untestable in isolation — the
#    caller could never hold ten values steady and vary the eleventh.
if [[ "$DEMO" == "true" ]]; then
  # ⚠️ an apostrophe inside ${VAR:-...} OPENS A QUOTE, even within double
  #    quotes — so `${OFFICER:-Eagle Of'Rhight}` swallows the rest of the
  #    file and breaks the parse ~350 lines later, at the first bare `(`.
  #    bind the value in a plain assignment first, where quotes behave.
  DEMO_OFFICER="Eagle Of'Rhight"

  NAME="${NAME:-SANDPINE, INC.}"
  OFFICE_STREET="${OFFICE_STREET:-1209 ORANGE STREET}"
  OFFICE_CITY="${OFFICE_CITY:-WILMINGTON}"
  OFFICE_COUNTY="${OFFICE_COUNTY:-New Castle}"
  OFFICE_ZIP="${OFFICE_ZIP:-19801}"
  AGENT="${AGENT:-THE CORPORATION TRUST COMPANY}"
  INCORPORATED_ON="${INCORPORATED_ON:-05/21/2020}"
  VOIDED_ON="${VOIDED_ON:-03/01/2024}"
  OFFICER="${OFFICER:-$DEMO_OFFICER}"
  CAPACITY="${CAPACITY:-President}"
fi

######################################################################
# guards — inputs
######################################################################

if [[ "$MODE" != "plan" && "$MODE" != "final" ]]; then
  print_blocked "--mode must be plan or final, got: $MODE"
  exit 2
fi

require_arg() {
  local flag="$1" value="$2"
  if [[ -z "$value" ]]; then
    print_blocked "$flag is required — run with --help, or use --demo"
    exit 2
  fi
}

require_arg --name            "$NAME"
require_arg --office-street   "$OFFICE_STREET"
require_arg --office-city     "$OFFICE_CITY"
require_arg --office-county   "$OFFICE_COUNTY"
require_arg --office-zip      "$OFFICE_ZIP"
require_arg --agent           "$AGENT"
require_arg --incorporated-on "$INCORPORATED_ON"
require_arg --voided-on       "$VOIDED_ON"
require_arg --officer         "$OFFICER"
require_arg --capacity        "$CAPACITY"

if [[ "$MODE" == "final" && -z "$INTO" ]]; then
  print_blocked "--into is required when --mode final"
  exit 2
fi

# ⛔ the By: rule and the Name: rule name the SAME person. a signature that
#    disagrees with the printed name is a document that contradicts itself on
#    its own execution block — the one place a clerk always reads.
if [[ -n "$SIGN_AS" && "$SIGN_AS" != "$OFFICER" ]]; then
  print_blocked "--sign-as ($SIGN_AS) must match --officer ($OFFICER) — the By: and Name: rules are one person"
  exit 2
fi

if [[ ! "$OFFICE_ZIP" =~ ^[0-9]{5}(-[0-9]{4})?$ ]]; then
  print_blocked "--office-zip must be 5 digits or ZIP+4, got: $OFFICE_ZIP"
  exit 2
fi

######################################################################
# guards — dates
#
# .note = PARSE, never pattern-match. 02/30/2024 matches every
#         MM/DD/YYYY regex ever written and is not a day.
######################################################################

as_iso() { date -d "$1" +%Y-%m-%d 2>/dev/null || true; }

INCORPORATED_ISO="$(as_iso "$INCORPORATED_ON")"
if [[ -z "$INCORPORATED_ISO" ]]; then
  print_blocked "--incorporated-on is not a real date: $INCORPORATED_ON"
  exit 2
fi

VOIDED_ISO="$(as_iso "$VOIDED_ON")"
if [[ -z "$VOIDED_ISO" ]]; then
  print_blocked "--voided-on is not a real date: $VOIDED_ON"
  exit 2
fi

# ⛔ a charter cannot go void before it exists. catches a transposed pair of flags.
if [[ ! "$VOIDED_ISO" > "$INCORPORATED_ISO" ]]; then
  print_blocked "--voided-on ($VOIDED_ISO) is not after --incorporated-on ($INCORPORATED_ISO)"
  exit 2
fi

TODAY_ISO="$(date +%Y-%m-%d)"
if [[ "$VOIDED_ISO" > "$TODAY_ISO" ]]; then
  print_blocked "--voided-on ($VOIDED_ISO) is in the future"
  exit 2
fi

######################################################################
# guards — FIDELITY
#
# .what = assert every sentence we render is present, verbatim, in the
#         Division's own committed form bytes.
#
# .why  = the alternative is a hand-typed legal instrument. a template
#         revision would otherwise pass unnoticed and we would file a
#         certificate whose text no longer matches the form of record.
######################################################################

if [[ ! -f "$FORM_BYTES" ]]; then
  print_blocked "form bytes absent: $FORM_BYTES"
  exit 1
fi

# the packet holds a cover letter and an instruction sheet whose prose would
# satisfy needles it should not. slice the certificate out first, and REFUSE
# on a missed marker — a silent fall-through would assert against the packet.
#
# ⚠️ the start marker is the ALL-CAPS heading on the line ABOVE the title.
#    an earlier cut opened at "CERTIFICATE FOR REVIVAL OF CHARTER" and so
#    excluded "STATE OF DELAWARE" by one line — which made the very first
#    assert fail, and made every later refusal quote the wrong fragment.
#    read the HEAD of a slice, not only its tail.
FORM_SLICE="$(
  awk '
    /STATE OF DELAWARE/ { on = 1 }
    on { print }
    /Print or Type/ { if (on) exit }
  ' "$FORM_BYTES"
)"
if [[ -z "$FORM_SLICE" ]]; then
  print_blocked "could not slice the certificate out of the form bytes — markers moved"
  exit 1
fi

# collapse the fill-in rules, then the wrap. ⚠️ length-UNSTABLE, so this copy
# is COMPARE-ONLY — no rendered text is ever taken from it.
FORM_COMPARABLE="$(printf '%s' "$FORM_SLICE" | tr '\n' ' ' | sed 's/_\{2,\}/ /g' | tr -s ' ')"
PACKET_COMPARABLE="$(tr '\n' ' ' < "$FORM_BYTES" | tr -s ' ')"

assert_verbatim() {
  local fragment="$1"
  if [[ "$FORM_COMPARABLE" != *"$fragment"* ]]; then
    print_blocked "form text drifted — this fragment is absent from the committed bytes: \"${fragment:0:60}…\""
    exit 1
  fi
}

assert_in_packet() {
  local fragment="$1"
  if [[ "$PACKET_COMPARABLE" != *"$fragment"* ]]; then
    print_blocked "packet text drifted — absent from the committed bytes: \"${fragment:0:60}…\""
    exit 1
  fi
}

# the certificate itself
assert_verbatim 'STATE OF DELAWARE'
assert_verbatim 'CERTIFICATE FOR REVIVAL OF CHARTER'
assert_verbatim 'The corporation organized under the laws of the State of Delaware, the charter of which was voided for non-payment of taxes and/or for failure to file a complete annual report, now desires to procure a revival of its charter pursuant to Section 312 of the General Corporation Law of the State of Delaware, and hereby certifies as follows:'
assert_verbatim 'The name of the corporation is'
assert_verbatim 'and, if different, the name under which the corporation was originally incorporated'
assert_verbatim 'The Registered Office of the corporation in the State of Delaware is located at'
assert_verbatim '(street),'
assert_verbatim 'in the City of'
assert_verbatim 'County of'
assert_verbatim 'Zip Code'
assert_verbatim 'The name of the Registered Agent at such address upon whom process against this Corporation may be served is'
assert_verbatim 'The date of filing of the Corporation'
assert_verbatim 'original Certificate of Incorporation in Delaware was'
assert_verbatim 'The corporation desiring to be revived and so reviving its certificate of incorporation was organized under the laws of this State.'
assert_verbatim 'The corporation was duly organized and carried on the business authorized by its charter until the'
assert_verbatim 'day of'
assert_verbatim 'A.D.'
assert_verbatim 'at which time its charter became inoperative and void for non-payment of taxes and/or failure to file a complete annual report and the certificate of revival is filed by authority of the duly elected directors of the corporation in accordance with the laws of the State of Delaware.'
assert_verbatim 'Authorized Officer'
assert_verbatim 'Print or Type'

# the fee, quoted in the footer — lives in the cover letter, not the slice
assert_in_packet 'The fee to file the Certificate is $189.00.'
assert_in_packet 'please include $9.00 for each additional page'
assert_in_packet 'rev. 08/2023'

######################################################################
# values
######################################################################

as_ordinal() {
  local n="$1"
  local suffix="th"
  case "$n" in
    11|12|13) suffix="th" ;;
    *1) suffix="st" ;;
    *2) suffix="nd" ;;
    *3) suffix="rd" ;;
  esac
  printf '%s%s' "$n" "$suffix"
}

VOID_DAY="$(date -d "$VOIDED_ISO" +%-d)"
VOID_MONTH="$(date -d "$VOIDED_ISO" +%B)"
VOID_YEAR="$(date -d "$VOIDED_ISO" +%Y)"
VOID_DAY_ORDINAL="$(as_ordinal "$VOID_DAY")"

# long form, deliberately — a clerk cannot misread it as DD/MM
INCORPORATED_LONG="$(date -d "$INCORPORATED_ISO" '+%B %-d, %Y')"

######################################################################
# the payload
#
# ⛔ VALUES ONLY. the map from a value to a widget name lives in fill.js,
#    beside the sha256 pin, so a form revision moves the pin and the map
#    together. this file never names a field.
######################################################################

# § 103(h) permits "a facsimile, a conformed signature or an electronically
# transmitted signature". the conformed form is the typed name — which is
# exactly what the Division's own `signature of authorized officer` widget
# takes. an unsigned render leaves that widget blank for wet ink.
SIGNATURE_VALUE="${SIGN_AS}"

# ⛔ --name-original is passed through EMPTY when absent, which leaves the
#    Division's own "and, if different" blank on the page, blank. an earlier
#    rebuild DELETED that line because an empty rule looked untidy — a deleted
#    blank is a modified agency form. rule.forbid.reproduce-a-supplied-form.


######################################################################
# emit
######################################################################

print_eagle_header "the charter remembers..."
print_tree_start "corp.revival.certificate --mode ${MODE}"
print_tree_branch "name" "$NAME"
if [[ -n "$NAME_ORIGINAL" ]]; then
  print_tree_branch "name (original)" "$NAME_ORIGINAL"
fi
print_tree_branch "office" "${OFFICE_STREET}, ${OFFICE_CITY}, ${OFFICE_COUNTY} ${OFFICE_ZIP}"
print_tree_branch "agent" "$AGENT"
print_tree_branch "art 3 — incorporated" "$INCORPORATED_LONG"
print_tree_branch "art 5 — void" "${VOID_DAY_ORDINAL} day of ${VOID_MONTH} A.D. ${VOID_YEAR}"
print_tree_branch "officer" "${OFFICER} (${CAPACITY})"
if [[ -n "$SIGN_AS" ]]; then
  print_tree_branch "execution" "conformed signature — § 103(h)"
else
  print_tree_branch "execution" "blank rule — sign in ink, or rerun with --sign-as"
fi
print_tree_branch "fidelity" "23 fragments matched the rev. 08/2023 bytes"
print_tree_branch "artifact" "the Division's own fillable form, rev. 08/2023"

if [[ "$MODE" == "plan" ]]; then
  print_tree_leaf "planned" "no file written — rerun with --mode final --into <path>"
  echo ""
  exit 0
fi

######################################################################
# fill — the AGENCY'S file, never a rebuild of it
#
# ⛔ rule.forbid.reproduce-a-supplied-form. the Division ships this form
#    with 26 named AcroForm widgets. we supply values into their page.
#
# ⚠️ the payload goes via a FILE, never argv. a corporate name carries
#    commas, ampersands and apostrophes, and an officer's name may carry
#    any of them — argv is where those corrupt silently.
######################################################################

PAYLOAD="$(mktemp -t corp.revival.payload.XXXXXX.json)"
trap 'rm -f "$PAYLOAD"' EXIT

as_json_string() {
  # ⚠️ escape the two characters JSON cannot carry raw, in this order —
  #    backslash FIRST, or the escape of a quote gets re-escaped.
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  printf '%s' "$s"
}

cat > "$PAYLOAD" <<JSON
{
  "name": "$(as_json_string "$NAME")",
  "nameOriginal": "$(as_json_string "$NAME_ORIGINAL")",
  "officeStreet": "$(as_json_string "$OFFICE_STREET")",
  "officeCity": "$(as_json_string "$OFFICE_CITY")",
  "officeCounty": "$(as_json_string "$OFFICE_COUNTY")",
  "officeZip": "$(as_json_string "$OFFICE_ZIP")",
  "agent": "$(as_json_string "$AGENT")",
  "incorporatedOn": "$(as_json_string "$INCORPORATED_LONG")",
  "voidDay": "$(as_json_string "$VOID_DAY_ORDINAL")",
  "voidMonth": "$(as_json_string "$VOID_MONTH")",
  "voidYear": "$(as_json_string "$VOID_YEAR")",
  "signature": "$(as_json_string "$SIGNATURE_VALUE")",
  "printedName": "$(as_json_string "$OFFICER")",
  "flatten": true,
  "into": "$(as_json_string "$INTO")"
}
JSON

if ! FILL_RESULT="$(node "$SCRIPT_DIR/fill.js" "$PAYLOAD")"; then
  print_blocked "the fill refused — see the error above"
  exit 1
fi

FIELDS_SET="$(printf '%s' "$FILL_RESULT" | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d));
  process.stdin.on("end", () => {
    const r = JSON.parse(s);
    process.stdout.write(`${r.fieldsSet} of ${r.fieldsInForm} widgets`);
  });
')"

print_tree_leaf "wrote" "$INTO"
print_tree_sub "filled ${FIELDS_SET}, flattened"
if [[ -n "$SIGN_AS" ]]; then
  print_tree_sub "READ it — the signature is an oath under § 103(b)(2)"
else
  print_tree_sub "print it, sign the By: rule in ink — or rerun with --sign-as"
fi
print_tree_sub "LOOK at it: rhx pdf.render '${INTO}' --page 1 --into /tmp/check.png"
print_tree_sub "\$189.00 — card/ACH via the upload service, or a check to \"Delaware Secretary of State\""
print_tree_sub_last "upload: corp.delaware.gov/document-upload-service-information/"
echo ""
