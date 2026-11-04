#!/usr/bin/env bash
######################################################################
# .what = produce a one-page document on company letterhead, with an
#         optional notarial certificate copied from the statute
#
# .why  = a corporate statement bound for an agency has to satisfy two
#         readers at once: a clerk who wants a "simple letter on company
#         letterhead", and a notary who must find a certificate that
#         carries every element their state makes mandatory.
#
#         hand-built, those two pull apart. the letterhead grows, the
#         certificate slides onto page 2, and a jurat split from the
#         statement it certifies is a document many notaries refuse.
#         so the page is a flex column whose height is derived from the
#         @page margins, and the certificate is anchored to the foot.
#
# usage:
#   doc.letterhead.sh --entity 'SANDPINE, INC.' --title 'Statement of Issued Shares'
#   doc.letterhead.sh --entity 'SANDPINE, INC.' --variant jurat --signer 'Eagle Of'"'"'Rhight'
#   doc.letterhead.sh --variants                          # list the variants
#   doc.letterhead.sh --demo jurat --into ./demo.html     # write a worked example
#
# options:
#   --entity     entity name, printed as the wordmark (required)
#   --addr       address line under the wordmark
#   --title      document title
#   --ref        a reference line under the title, e.g. a file number
#   --body       a body paragraph; repeatable, or @stdin for one blob
#   --signer     the person who signs
#   --capacity   the signer's office, e.g. President
#   --variant    plain | jurat | acknowledgment | acknowledgment-rep
#                (default: plain)
#   --state      jurisdiction of the notarial ACT (default: florida)
#   --mode       draft | final  (default: draft — prints the banner)
#   --accent     css color for the wordmark and rules (default: #1f2937)
#   --accent2    css color for the lower rule (default: #9ca3af)
#   --into       output html path (default: ./letterhead.<slug>.html)
#   --variants   list the variants and exit
#   --demo       write a worked, pseudonymized example of a variant
#   --help       show usage and exit
#
# guarantee:
#   - output is a SELF-CONTAINED html file. no image refs, so it cannot
#     render with a broken logo box wherever it is copied
#   - the notarial certificate is copied from the statute, verbatim
#   - REFUSES a notarial variant for any state whose form is not cited
#     with committed source bytes. see ⛔ below
#   - REFUSES --capacity on a jurat, which has no capacity slot by design
#   - never writes outside the path you name
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⛔ THE STATE GUARD IS THE POINT OF THIS SKILL.
#
#    a jurat is NOT portable. "State of ___, County of ___ / Sworn to and
#    subscribed before me" looks universal and is not — it drops elements
#    two states make mandatory, and the venue names a different party in a
#    third. a certificate carried across a state line is the single most
#    common defect on a notarized corporate document.
#
#    so this skill ships ONE cited jurisdiction and refuses the rest,
#    rather than emit a certificate it cannot source.
#
# ⚠️ the certificate follows the law of the state where the ACT happens —
#    never the entity's address of record, never the destination agency.
#    Delaware says so itself: a certificate is sufficient if it "Is in a
#    form permitted by the law applicable in the jurisdiction in which the
#    notarial act was performed." — 29 Del. C. §4328(c)(3)
#
# ⚠️ do NOT sign a jurat document before the appointment. a jurat requires
#    the signature to happen in the notary's presence, after the oath.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SKILL_DIR/output.sh"

######################################################################
# the variants
#
# each row = slug|needs a notary?|capacity slot?|statutory cite|note
######################################################################
VARIANTS=(
  "plain|no|n/a|—|letterhead only, no notarial block"
  "jurat|yes|no|Fla. Stat. §117.05(13)(a)|a SWORN statement; sign before the notary"
  "acknowledgment|yes|no|Fla. Stat. §117.05(13)(b)|signature only; may be pre-signed"
  "acknowledgment-rep|yes|YES|Fla. Stat. §117.05(13)(c)|the ONLY form with a capacity slot"
)

# the states whose forms are cited with committed source bytes.
# ⛔ do NOT add a row here without an inventory brief and refs/ bytes.
STATES_CITED=("florida")

ENTITY=""
ADDR=""
TITLE=""
REF=""
SIGNER=""
CAPACITY=""
VARIANT="plain"
STATE="florida"
MODE="draft"
ACCENT="#1f2937"
ACCENT2="#9ca3af"
INTO=""
DEMO=""
BODIES=()

# print the doc header, bounded by its own fences, so the help text
# can never drift out of sync with a hardcoded line range
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

show_variants() {
  print_eagle_header "pick a shape"
  print_tree_start "doc.letterhead --variants"
  local total=${#VARIANTS[@]}
  local index=0
  for row in "${VARIANTS[@]}"; do
    index=$((index + 1))
    IFS='|' read -r slug notary capslot cite note <<<"$row"
    # the detail hangs under its OWN branch, and carries the continuation
    # bar while siblings remain below it. with a flat indent the detail
    # reads as a sibling of the tree root rather than a property of the
    # variant above it.
    if [[ $index -eq $total ]]; then
      print_tree_leaf "$slug" "$note"
      echo "         notary: $notary · capacity slot: $capslot · $cite"
    else
      print_tree_branch "$slug" "$note"
      echo "   │     notary: $notary · capacity slot: $capslot · $cite"
    fi
  done
}

# escape the three characters that would otherwise open a tag or an entity
as_html() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'
}

# lowercase a value, so --variant JURAT and --state Florida both work
as_lower() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]'
}

# turn an entity name into a filename-safe slug
as_slug() {
  printf '%s' "$1" |
    tr '[:upper:]' '[:lower:]' |
    sed -e 's/[^a-z0-9]\+/-/g' -e 's/^-//' -e 's/-$//'
}

######################################################################
# parse args
######################################################################
while [[ $# -gt 0 ]]; do
  case $1 in
    --skill | --repo | --role)
      shift 2
      ;;
    --entity)
      ENTITY="${2:-}"
      shift 2
      ;;
    --addr)
      ADDR="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --ref)
      REF="${2:-}"
      shift 2
      ;;
    --body)
      if [[ "${2:-}" == "@stdin" ]]; then
        BODIES+=("$(cat)")
      else
        BODIES+=("${2:-}")
      fi
      shift 2
      ;;
    --signer)
      SIGNER="${2:-}"
      shift 2
      ;;
    --capacity)
      CAPACITY="${2:-}"
      shift 2
      ;;
    --variant)
      VARIANT="$(as_lower "${2:-}")"
      shift 2
      ;;
    --state)
      STATE="$(as_lower "${2:-}")"
      shift 2
      ;;
    --mode)
      MODE="$(as_lower "${2:-}")"
      shift 2
      ;;
    --accent)
      ACCENT="${2:-}"
      shift 2
      ;;
    --accent2)
      ACCENT2="${2:-}"
      shift 2
      ;;
    --into)
      INTO="${2:-}"
      shift 2
      ;;
    --demo)
      DEMO="$(as_lower "${2:-}")"
      shift 2
      ;;
    --variants)
      show_variants
      exit 0
      ;;
    --help | -h)
      show_help
      exit 0
      ;;
    *)
      print_blocked "unknown argument: $1 (try --help)"
      exit 2
      ;;
  esac
done

######################################################################
# the demo — a worked, pseudonymized example
#
# ⛔ SANDPINE, INC. and Eagle Of'Rhight are the repo's default example
#    entity and person. the entity must read PLAUSIBLE and the person
#    must read FAKE. see rule.require.collision-checked-pseudonyms.
######################################################################
if [[ -n "$DEMO" ]]; then
  # ⚠️ the default signer is held in its own variable ON PURPOSE.
  #
  #    written inline as "${SIGNER:-Eagle Of'Rhight}", the apostrophe
  #    breaks the PARSE — inside ${var:-word} the word still undergoes
  #    quote removal even within double quotes, so the lone ' opens a
  #    single-quoted string that runs to the end of the file:
  #
  #      line 913: unexpected EOF while looking for matching `''
  #
  #    the tell is that the error points at EOF rather than at the real
  #    line, and that every case which reaches this block fails at once
  #    while --help and --variants still pass.
  DEMO_SIGNER="Eagle Of'Rhight"

  VARIANT="$DEMO"
  ENTITY="${ENTITY:-SANDPINE, INC.}"
  ADDR="${ADDR:-1 Dunes Road, Suite 200 · Wilmington, DE 19801}"
  TITLE="${TITLE:-Statement of Issued Shares}"
  REF="${REF:-Delaware File #0000000}"
  SIGNER="${SIGNER:-$DEMO_SIGNER}"
  if [[ "$VARIANT" != "jurat" ]]; then
    CAPACITY="${CAPACITY:-President}"
  fi
  if [[ ${#BODIES[@]} -eq 0 ]]; then
    BODIES+=("As of December 31, 2024, the total number of issued shares of ${ENTITY} was 8,000,000, all of which were shares of Common Stock.")
    BODIES+=("Those shares were the Corporation's initial issuance of stock. The Corporation has issued no additional shares, and has not repurchased, retired or cancelled any shares, at any time from that date through the date of this statement.")
  fi
fi

######################################################################
# validate
######################################################################
validate_args() {
  if [[ -z "$ENTITY" ]]; then
    print_blocked "entity required — pass --entity 'SANDPINE, INC.'"
    exit 2
  fi

  # the variant must be one we ship
  local known="no"
  local cite=""
  for row in "${VARIANTS[@]}"; do
    IFS='|' read -r slug _notary _rowcap rowcite _note <<<"$row"
    if [[ "$slug" == "$VARIANT" ]]; then
      known="yes"
      cite="$rowcite"
    fi
  done
  if [[ "$known" != "yes" ]]; then
    print_blocked "unknown --variant: $VARIANT (run --variants to list them)"
    exit 2
  fi

  if [[ "$MODE" != "draft" && "$MODE" != "final" ]]; then
    print_blocked "unknown --mode: $MODE (want draft or final)"
    exit 2
  fi

  # ⛔ THE STATE GUARD. a notarial variant for an uncited state is refused
  #    outright, rather than emitted from a template we cannot source.
  if [[ "$VARIANT" != "plain" ]]; then
    local cited="no"
    for one in "${STATES_CITED[@]}"; do
      [[ "$one" == "$STATE" ]] && cited="yes"
    done
    if [[ "$cited" != "yes" ]]; then
      {
        print_eagle_header "that wont work..."
        print_tree_start "doc.letterhead"
        print_tree_leaf "blocked" "no cited notarial form for state: $STATE"
        print_tree_note ""
        print_tree_note "a jurat is NOT portable. a certificate carried across a"
        print_tree_note "state line drops elements the new state makes mandatory,"
        print_tree_note "and its venue may name a different party entirely."
        print_tree_note ""
        print_tree_note "the rule that resolves it:"
        print_tree_note "  --state names where the SIGNER and NOTARY will be,"
        print_tree_note "  never where the document is bound. a certificate"
        print_tree_note "  follows the law of the state where the ACT happens"
        print_tree_note "  (29 Del. C. 4328(c)(3), and its counterparts)."
        print_tree_note ""
        print_tree_note "so a signer in $STATE wants a $STATE form -- which is"
        print_tree_note "what this repo lacks, and NOT a reason to borrow one"
        print_tree_note "of the states below."
        print_tree_note ""
        print_tree_note "cited states: ${STATES_CITED[*]}"
        print_tree_note ""
        print_tree_note "pick one:"
        print_tree_note "  --state ${STATES_CITED[0]}    ONLY if the notary is there"
        print_tree_note "  --variant plain    letterhead only; attach a loose"
        print_tree_note "                     certificate the notary supplies"
        print_tree_note "                     -- the safe default for $STATE"
      } >&2
      exit 2
    fi
  fi

  # ⛔ CAPACITY HAS NO SLOT IN A JURAT, AND THAT IS BY DESIGN.
  #
  #    an acknowledgment certifies a signature was made in a stated
  #    capacity. a jurat certifies a named HUMAN took an oath — and an
  #    oath is a personal act; a corporation cannot swear. five states
  #    for five prescribe no representative-capacity jurat.
  #
  #    so capacity goes in the DOCUMENT (the lead sentence and the
  #    signature caption), never in the certificate. this skill puts it
  #    there and refuses to put it anywhere else.
  if [[ -n "$CAPACITY" && "$VARIANT" == "jurat" ]]; then
    {
      print_eagle_header "that wont work..."
      print_tree_start "doc.letterhead"
      print_tree_leaf "blocked" "a jurat has no capacity slot — $cite"
      print_tree_note ""
      print_tree_note "capacity belongs in the DOCUMENT, never in a jurat."
      print_tree_note "a jurat certifies the person who swore; capacity is an"
      print_tree_note "acknowledgment concept. a notary who adds 'as President'"
      print_tree_note "produces a certificate no statute prescribes, and some"
      print_tree_note "states train them to refuse exactly that."
      print_tree_note ""
      print_tree_note "pick one:"
      print_tree_note "  --variant acknowledgment-rep   the ONE form with a slot"
      print_tree_note "  drop --capacity                keep it in --body and"
      print_tree_note "                                 the signature caption"
    } >&2
    exit 2
  fi

  if [[ "$VARIANT" == "acknowledgment-rep" && -z "$CAPACITY" ]]; then
    print_blocked "--variant acknowledgment-rep needs --capacity (its form has a slot to fill)"
    exit 2
  fi
}

validate_args

######################################################################
# emit
######################################################################
if [[ -z "$INTO" ]]; then
  INTO="./letterhead.$(as_slug "$ENTITY").html"
fi

BODY_CLASS=""
[[ "$MODE" == "draft" ]] && BODY_CLASS=' class="draft"'

# the venue and certificate sentence, per variant. every one is copied
# from the statute; see the cite on each.
emit_certificate() {
  [[ "$VARIANT" == "plain" ]] && return 0

  cat <<'CERT_HEAD'

  <div class="gap"></div>
  <div class="divider"></div>
  <div class="gap"></div>

  <div class="notary">
CERT_HEAD

  cat <<'CERT_NOTE'
    <!--
      🚫 THE NOTARIAL BLOCK CARRIES NO TITLE, deliberately.

      surveyed: 13 of 14 executed documents untitled; 4 of 4 on
      letterhead untitled; 5 of 5 official SOS blank-form families
      untitled. the 1 titled instance was a COMMERCIAL LOOSE
      CERTIFICATE — a product name on a page that holds no document.
      and across Florida's own four sources: 23 certificate blocks,
      0 titled.

      what DOES carry a title, 14 of 14, is the DOCUMENT.

      🎯 the title was never load-bearing anyway. "Sworn to (or
         affirmed) and subscribed before me" is unambiguously a jurat
         and cannot be read as an acknowledgment. the certificate
         language is what tells a notary which act is wanted.

      see notary/briefs/jurats/inventory.of=jurat.jurisdiction=usa-florida.md

      ⛔ "STATE OF FLORIDA" IS PRE-PRINTED, NOT A BLANK. the venue names
         where the NOTARY sat, so a Florida notary can only ever produce
         a Florida venue. under RON the notary must be in Florida while
         the signer may be anywhere (§117.209(3)), so this line does NOT
         track the signer and must not look as though it might.
    -->
    <p class="venue">STATE OF FLORIDA</p>
    <p class="venue">COUNTY OF <span class="blank">&nbsp;</span></p>
CERT_NOTE

  case "$VARIANT" in
    jurat)
      cat <<'CERT_JURAT'

    <!--
      ✅ Fla. Stat. §117.05(13)(a), copied exactly.

      ⚠️ THE FORM READS OPTIONAL AND IS NOT. §117.05(13) closes with
         "The specification of forms under this subsection does not
         preclude the use of other forms" — but §117.05(4) runs first
         and says the certificate "shall contain the following
         elements", (a) through (i). another FORM is allowed; an absent
         ELEMENT is not.

      🎯 the three an out-of-state template drops, all present below:
         (c) physical presence vs audio-video  -> the two ☐ boxes
         (f) the identification relied upon    -> the two ID lines
         (h) the notary's name BELOW the sig   -> the second stacked line
    -->
    <p>
      Sworn to (or affirmed) and subscribed before me by means of
      <span class="box"></span>physical presence or
      <span class="box"></span>online notarization, this
      <span class="blank day">&nbsp;</span> day of
      <span class="blank mo">&nbsp;</span>,
      <span class="blank yr">&nbsp;</span> (year), by
      <span class="blank name">&nbsp;</span>
      (name of person making statement).
    </p>
CERT_JURAT
      ;;
    acknowledgment)
      cat <<'CERT_ACK'

    <!--
      ✅ Fla. Stat. §117.05(13)(b) — acknowledgment, individual capacity.

      ⚠️ THE CHECKBOX IS PRESENT ON PURPOSE, AND THE STATE'S OWN TWO
         PUBLICATIONS DISAGREE ABOUT IT:

           EOG Manual (2019-12-17)   -> prints the ☐ physical presence /
                                        ☐ online notarization boxes
           DOS samples (2020-01-01)  -> omits them on THIS form, while
                                        it prints them on the jurat and
                                        on the representative-capacity
                                        form

         the boxes stay. §117.05(4) makes the presence-vs-online
         disclosure element (c) of "a jurat or notarial certificate" —
         it is not scoped to jurats, so an acknowledgment needs it too.
         the DOS omission is a defect of the same class as the stale
         court form, not a permission.
    -->
    <p>
      The foregoing instrument was acknowledged before me by means of
      <span class="box"></span>physical presence or
      <span class="box"></span>online notarization, this
      <span class="blank day">&nbsp;</span> day of
      <span class="blank mo">&nbsp;</span>,
      <span class="blank yr">&nbsp;</span> (year), by
      <span class="blank name">&nbsp;</span>
      (name of person acknowledging).
    </p>
CERT_ACK
      ;;
    acknowledgment-rep)
      cat <<'CERT_ACKREP'

    <!--
      ✅ Fla. Stat. §117.05(13)(c) — acknowledgment, REPRESENTATIVE
         capacity. this is the ONLY one of Florida's three forms that
         carries a capacity slot, which is why a corporate signer who
         needs their office on the certificate must use this act.

      ⚠️ it is an ACKNOWLEDGMENT, not an oath. if what you need is a
         SWORN statement, this is the wrong act — use --variant jurat
         and put the capacity in the document instead.
    -->
    <p>
      The foregoing instrument was acknowledged before me by means of
      <span class="box"></span>physical presence or
      <span class="box"></span>online notarization, this
      <span class="blank day">&nbsp;</span> day of
      <span class="blank mo">&nbsp;</span>,
      <span class="blank yr">&nbsp;</span> (year), by
      <span class="blank name">&nbsp;</span>
      (name of person) as
      <span class="blank name">&nbsp;</span>
      (type of authority, e.g. officer, trustee, attorney in fact) for
      <span class="blank wide">&nbsp;</span>
      (name of party on behalf of whom instrument was executed).
    </p>
CERT_ACKREP
      ;;
  esac

  cat <<'CERT_FOOT'

    <!--
      seal LEFT, signature RIGHT. element (i) puts the seal "below or to
      either side of" the signature, so beside is expressly allowed — and
      it costs over an inch of height that a stacked seal area would take,
      which is what keeps the certificate on the same sheet as the
      statement it certifies.

      ⚠️ CLEAR SPACE FOR THE SEAL — do not fill it, do not delete it.

      > "(3)(a) A notary public seal shall be affixed to all notarized
      >  paper documents and shall be of the rubber stamp type and
      >  shall include the words 'Notary Public-State of Florida.' The
      >  seal shall also include the name of the notary public, the
      >  date of expiration of the commission of the notary public,
      >  and the commission number."
      > — Fla. Stat. §117.05(3)(a)

      🚩 this quote used to open with an ellipsis that sat exactly on
         "affixed to all notarized PAPER documents and" — the scope of
         the whole sentence. it is quoted whole now. the seal box below
         is sized for a PAPER seal; for a RON the same rule reaches the
         act only by construction, per the certificate note further
         down.

      two consequences, and the second sizes this box:
        1. rubber stamp + four data points = a RECTANGLE of text, never
           a circle. the 2in circular seal some states permit is not a
           shape a Florida stamp takes
        2. no maximum is stated, so there is no Florida cap to size
           against. 1.0in x 2.6in clears the largest RECTANGULAR cap in
           any of the five jurisdictions inventoried — Tex. Gov't Code
           §406.013(b), "not more than one inch in width and 2-1/2
           inches in length" — with slack on both axes

      🚩 this figure is DERIVED FROM A CAP, not quoted from a rule. no
         state found so far mandates a minimum reserved area; they cap
         the seal (or, in Florida, do not) and require legibility plus
         non-overlap.
    -->
    <div class="notary-foot">
      <div class="seal-slot">
        <div class="seal-box"><p class="seal">notarial seal</p></div>
      </div>
      <div class="notary-sign">
        <div class="long"></div>
        <p class="sig-caption">Signature of Notary Public &mdash; State of Florida</p>
        <!--
          element (h) puts the printed name BELOW the signature, so the
          order is not a layout choice.

          🎯 THE CONTRAST IS THE INSTRUCTION. if the second line were
             also meant to be a signature there would be no reason for a
             second line. a notary reads the pair and knows — which is
             what guards against a CURSIVE second signature, the actual
             risk element (h) exists to prevent.

             "printed" here means HAND-PRINTED and satisfies (h): the
             state's own manual uses the same verb for a physical act
             by a human, and the caption is an imperative ("Print, Type,
             or Stamp"). a hand-printed name is fine; a cursive one is
             a second signature and defeats the element.
        -->
        <div class="long stacked"></div>
        <p class="sig-caption">Commissioned Name of Notary Public &mdash; State of Florida</p>
      </div>
    </div>

    <!--
      element (f) — the identification basis. two lines, because the
      statutory form is two lines: which basis, then which document.

      🚫 there is NO "My commission expires" line, and its absence is
         deliberate. it is not among the (a)–(i) elements and not in the
         printed form — Florida carries the expiration on the SEAL,
         §117.05(3)(a), along with the commission number.

         ⚠️ THE DELAWARE SEAM IS CLOSED BY THE SEAL, NOT BY THIS FORM.
            29 Del. C. §4328(a)(5) requires the expiry on the certificate,
            and §4328(c) is a CONJUNCTION — "sufficient if it meets the
            requirements of subsections (a) and (b) ... AND any of the
            following: ... (3) is in a form permitted by the law
            applicable in the jurisdiction in which the notarial act was
            performed." so (c)(3) accepts the foreign FORM and grants no
            relief from the (a) elements.

            the expiry therefore has to arrive via the seal. it does —
            for PAPER. §117.05(3)(a) is drafted for "notarized paper
            documents" of the "rubber stamp type."

         🚩 FOR A RON, THAT IS A CONSTRUCTION AND NOT A QUOTE.
            §117.05(3)(a) reaches an online act only through §117.265(8)
            ("the provisions of part I of this chapter apply to an online
            notarization"). §117.021(2), which governs the electronic
            signature, is silent as to any expiry.

            ⛔ do NOT add a "My commission expires" line here to cover it.
               that would emit a form no Florida statute prescribes, which
               is the exact defect this file exists to avoid.

            ✅ instead: when the executed PDF comes back, confirm the
               electronic seal renders the commission expiration date.
               it is the one element a Delaware filing is likely to be
               refused on. see the notary role —
               briefs/jurats/inventory.of=jurat.jurisdiction=usa-delaware.md
    -->
    <div class="idlines">
      <p>
        Personally Known <span class="blank id">&nbsp;</span>
        &nbsp;OR&nbsp;
        Produced Identification <span class="blank id">&nbsp;</span>
      </p>
      <p>
        Type of Identification Produced <span class="blank wide">&nbsp;</span>
      </p>
    </div>
  </div>
CERT_FOOT
}

emit_body_paragraphs() {
  local para
  for para in "${BODIES[@]+"${BODIES[@]}"}"; do
    printf '  <p class="body">%s</p>\n' "$(as_html "$para")"
  done
}

emit_signature_block() {
  [[ -z "$SIGNER" ]] && return 0
  local caption
  caption="$(as_html "$SIGNER")"
  if [[ -n "$CAPACITY" ]]; then
    caption="$caption, $(as_html "$CAPACITY") &mdash; $(as_html "$ENTITY")"
  fi
  cat <<SIG

  <p class="sig-label">Respectfully submitted,</p>
  <div class="sig-line"></div>
  <p class="sig-caption">$caption</p>
SIG
}

{
  cat <<HTML_HEAD
<!DOCTYPE html>
<!--
  generated by: rhx doc.letterhead --variant $VARIANT --state $STATE --mode $MODE

  ✅ SELF-CONTAINED — no image files, no relative asset refs, so this
     cannot render with a broken logo box no matter where it is copied.

  📋 DRAFT vs FINAL is one word:
       <body class="draft">   -> prints the DRAFT banner
       <body>                 -> prints clean
-->
<html lang="en">
<head>
<meta charset="utf-8">
<title>$(as_html "$ENTITY")$([[ -n "$TITLE" ]] && printf ' — %s' "$(as_html "$TITLE")")</title>
<style>
  :root {
    --accent: $ACCENT;
    --accent2: $ACCENT2;
    --ink: rgba(0, 0, 0, 0.87);
    --ink-soft: rgba(0, 0, 0, 0.6);

    /*
      a neutral furniture gray, for rules that STRUCTURE the page rather
      than ask for input. deliberately far from --ink so a reader never
      mistakes one for a line to write on.
    */
    --rule-soft: #BFC3CB;
  }

  @page { size: letter; margin: 0.7in 1in 0.7in 1in; }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: var(--ink);
    max-width: 6.5in;
    margin: 0 auto;

    /*
      the page is a FLEX COLUMN, and that is what anchors the certificate.

      letter (11in) minus the 0.7in top and 0.7in bottom @page margins
      leaves 9.6in of content box. the column is held to that height, so
      the two .gap elements can split whatever slack the body leaves.

      ⛔ THIS NUMBER IS DERIVED FROM @page. it is not a free choice.

         min-height = 11in − (top margin) − (bottom margin)

         change either margin and change this in the same edit. they are
         two halves of one measurement and no rule couples them — set
         them out of step and the symptom is subtle: the certificate
         drifts off the bottom edge, or floats mid-page, with no error.

      why not a fixed margin above the certificate: the body text is not
      fixed. if the statement gains a sentence, a hardcoded gap pushes
      the certificate onto page 2 and it parts company with what it
      certifies. flex slack takes up the change instead.
    */
    display: flex;
    flex-direction: column;
    min-height: 9.6in;
  }

  .letterhead { text-align: center; }
  .letterhead .name {
    font-size: 23pt;
    font-weight: 700;
    letter-spacing: 7px;
    line-height: 1;
    /* the tracked-out right edge adds extra air after the final letter;
       pulled back here so the wordmark centers on the ink, not the box */
    margin: 0 -7px 0 0;
    color: var(--accent);
  }
  .letterhead .addr {
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--ink-soft);
    margin: 11px 0 0;
    text-transform: uppercase;
  }
  /*
    the two rules ABUT — zero gap. they read as one banded rule rather
    than two rules with a white sliver between them. the sliver reads as
    a defect at print size, because it is thinner than either rule.
  */
  .letterhead .heavy { border-bottom: 3px solid var(--accent); margin: 11px 0 0; }
  .letterhead .thin  { border-bottom: 2.5px solid var(--accent2); margin-bottom: 22px; }

  h1.doc-title {
    text-align: center;
    font-size: 15pt;
    font-weight: 700;
    letter-spacing: 4px;
    text-indent: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 6px;
  }
  p.doc-ref {
    text-align: center;
    font-size: 9.5pt;
    color: var(--ink-soft);
    letter-spacing: 1px;
    margin: 0 0 22px;
  }

  p.body { text-align: justify; margin: 0 0 13px; }
  .who { font-weight: 700; }

  /*
    top margin is 7px, not 20px. a flex column does NOT collapse adjacent
    margins, so a larger value stacks onto the previous paragraph's 13px
    rather than absorbs into it.
  */
  .sig-label { margin: 7px 0 26px; }
  .sig-line { border-bottom: 1px solid var(--ink); width: 3.6in; margin-bottom: 4px; }
  .sig-caption { font-size: 9.5pt; color: var(--ink-soft); margin: 4px 0 0; }

  /*
    min-height is the FLOOR, for the case where body text consumes all
    slack. deliberately small: if the gaps floor out the divider is no
    longer optically centered, but the page still holds one sheet, which
    matters more.
  */
  .gap { flex: 1 1 0; min-height: 7px; }
  /*
    ⚠️ THE DIVIDER IS NOT INK. as \`1px solid var(--ink)\` it is the exact
    same rule as .sig-line and .blank, which makes it read as a THIRD
    fill-in line set in open space with no caption — and invites a signer
    to write on it. a section divider is furniture, not a field.
  */
  .divider { border-top: 1px solid var(--rule-soft); }

  /* the certificate must never split from the statement it certifies */
  .notary { break-inside: avoid; }
  .notary .venue { letter-spacing: 0.5px; }
  .notary p { margin: 0 0 7px; }

  .notary .blank {
    border-bottom: 1px solid var(--ink);
    display: inline-block;
    min-width: 1.6in;
  }
  /*
    ⚠️ the date is THREE blanks, not one — "this ___ day of ___, ___".

    a collapse to a single blank is defensible on §117.05(4)(d), which
    demands only "the exact date" and is silent as to shape. it is the
    wrong trade: the cost of the extra blanks is two more chances to
    leave one empty; the cost of a departure from the printed form is a
    certificate a clerk can question at all.
  */
  .notary .blank.day  { min-width: 0.5in; }
  .notary .blank.mo   { min-width: 1.35in; }
  .notary .blank.yr   { min-width: 0.6in; }
  .notary .blank.name { min-width: 2.4in; }
  .notary .blank.id   { min-width: 0.85in; }
  .notary .blank.wide { min-width: 2.6in; }

  /*
    the ☐ is DRAWN, not typed. U+2610 BALLOT BOX is absent from most
    webfonts, so a literal ☐ renders as a fallback glyph or a tofu box —
    and this checkbox is a mandatory ELEMENT under §117.05(4)(c), not
    decoration. a border prints identically everywhere.
  */
  .notary .box {
    display: inline-block;
    width: 0.85em;
    height: 0.85em;
    border: 1px solid var(--ink);
    vertical-align: -0.06em;
    margin-right: 3px;
  }

  .notary-foot { display: flex; align-items: flex-end; gap: 0.3in; margin-top: 14px; }
  .seal-slot { flex: 0 0 2.6in; }
  .notary-sign { flex: 1 1 auto; }
  /*
    position:relative so the caption can pin INSIDE, top-left. the
    caption is absolutely positioned, so it adds no height — the slot is
    exactly 1in and the footer got shorter rather than taller.
  */
  .seal-box { height: 1in; width: 2.6in; position: relative; }
  /*
    the guide border prints on the DRAFT only. on the final it is
    invisible clear space, because a border is printed matter and the
    point is to hand the notary an area with none.
  */
  body.draft .seal-box { border: 1px dashed #C2C5D1; border-radius: 3px; }
  /*
    ⚠️ THE SEAL CAPTION MUST STAY LIGHT. a rubber stamp lands on top of
    these words, and §117.05(3)(a) requires the seal be
    "photographically reproducible". black 8.5pt under a black stamp
    would fight it; a light grey does not. the constraint is CONTRAST,
    not placement — Florida constrains the INK, never the background.
  */
  .seal {
    position: absolute;
    top: 3px;
    left: 5px;
    margin: 0;
    font-size: 8.5pt;
    color: var(--ink-soft);
    font-style: italic;
  }

  .notary .long { border-bottom: 1px solid var(--ink); width: 100%; height: 1.15em; margin-top: 20px; }
  .notary .long.stacked { margin-top: 16px; }
  .notary .idlines { margin-top: 11px; }
  .notary .idlines p { margin: 0 0 6px; }

  .draft-banner { display: none; }
  body.draft .draft-banner {
    display: block;
    border: 2px solid #b45309;
    border-radius: 6px;
    background: #fff4e5;
    color: #7c2d12;
    padding: 7px 14px;
    margin: 0 0 16px;
    font-size: 9.5pt;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: center;
    text-transform: uppercase;
  }
</style>
</head>
<body$BODY_CLASS>

  <div class="draft-banner">
    Draft for review &mdash; not yet signed$([[ "$VARIANT" != "plain" ]] && printf ' or notarized')
  </div>

  <div class="letterhead">
    <p class="name">$(as_html "$ENTITY")</p>
HTML_HEAD

  [[ -n "$ADDR" ]] && printf '    <p class="addr">%s</p>\n' "$(as_html "$ADDR")"

  cat <<'HTML_RULES'
    <div class="heavy"></div>
    <div class="thin"></div>
  </div>
HTML_RULES

  if [[ -n "$TITLE" ]]; then
    printf '\n  <h1 class="doc-title">%s</h1>\n' "$(as_html "$TITLE")"
  fi
  if [[ -n "$REF" ]]; then
    printf '  <p class="doc-ref">%s</p>\n' "$(as_html "$REF")"
  fi

  # the lead sentence is where CAPACITY lives on a jurat — never in the
  # certificate. see the capacity guard above.
  if [[ -n "$SIGNER" && -n "$CAPACITY" ]]; then
    printf '\n  <p class="body">I, <span class="who">%s</span>, %s of <span class="who">%s</span>, state as follows:</p>\n' \
      "$(as_html "$SIGNER")" "$(as_html "$CAPACITY")" "$(as_html "$ENTITY")"
  fi

  emit_body_paragraphs
  emit_signature_block
  emit_certificate

  cat <<'HTML_FOOT'

</body>
</html>
HTML_FOOT
} >"$INTO"

######################################################################
# report
######################################################################
CITE="—"
for row in "${VARIANTS[@]}"; do
  IFS='|' read -r slug _n _c rowcite _note <<<"$row"
  [[ "$slug" == "$VARIANT" ]] && CITE="$rowcite"
done

print_eagle_header "on letterhead,"
print_tree_start "doc.letterhead"
print_tree_branch "entity" "$ENTITY"
print_tree_branch "variant" "$VARIANT"
print_tree_branch "form" "$CITE"
print_tree_branch "mode" "$MODE"
print_tree_leaf "wrote" "$INTO"

if [[ "$VARIANT" == "jurat" ]]; then
  print_tree_note ""
  print_tree_note "⚠️ do NOT sign before the appointment. a jurat requires the"
  print_tree_note "   signature to happen in the notary's presence, after the oath."
fi
if [[ "$MODE" == "draft" ]]; then
  print_tree_note ""
  print_tree_note "this is a DRAFT — it prints a banner and a dashed seal guide."
  print_tree_note "re-run with --mode final for the copy you hand over."
fi
