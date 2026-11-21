#!/usr/bin/env bash
######################################################################
# .what = render a typed name as a cursive signature, in html
#
# .why  = a typed-name-in-cursive signature is the same instrument
#         DocuSign generates from a typed name. it is valid for
#         e-signature under ESIGN / UETA. this skill lets anyone
#         produce one from their own name, and choose the face
#         they want, without a subscription or an upload of their
#         name to a third party.
#
# usage:
#   doc.signature.sh --name "Ada Lovelace"                    # picker, all faces
#   doc.signature.sh --name "Ada Lovelace" --pick 5           # one face, tight crop
#   doc.signature.sh --name "Ada Lovelace" --into sig.html    # choose output path
#   doc.signature.sh --name "Ada Lovelace" --ink '#101010'    # choose ink color
#   doc.signature.sh --faces                                  # list the faces
#
# options:
#   --name    the name to render (required, except with --faces)
#   --pick    face number 1-10; omit to render the full picker
#   --into    output html path (default: ./signature.<slug>.html)
#   --ink     css color for the strokes (default: #16264d, a legal-blue)
#   --slant   degrees of slant, negative leans right (default: -2.5)
#   --faces   list the available faces and exit
#   --help    show usage and exit
#
# guarantee:
#   - output is a self-contained html file; fonts load from Google Fonts
#     on first open, so the first render needs internet
#   - never writes outside the path you name
#   - exit 0 success, exit 1 malfunction, exit 2 constraint
#
# ⚠️ do NOT use the output on a notarized affidavit. an affidavit needs a
#    jurat — you must sign in wet ink, in the notary's presence, after the
#    oath. a pre-signed affidavit can be refused.
######################################################################
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SKILL_DIR/output.sh"

######################################################################
# the faces
#
# each row = number|css family|google fonts family param|px size|note
######################################################################
FACES=(
  "1|Great Vibes|Great+Vibes|52|formal copperplate · a safe default"
  "2|Allura|Allura|56|flowing, wide loops"
  "3|Alex Brush|Alex+Brush|56|brush-pen, natural stroke variation"
  "4|Mrs Saint Delafield|Mrs+Saint+Delafield|60|looks the most hand-written"
  "5|Herr Von Muellerhoff|Herr+Von+Muellerhoff|64|thin, elegant, very slanted"
  "6|Sacramento|Sacramento|54|casual, even weight"
  "7|Parisienne|Parisienne|48|compact, tidy"
  "8|Dancing Script|Dancing+Script:wght@500|44|bolder, more legible when small"
  "9|Petit Formal Script|Petit+Formal+Script|42|upright, restrained"
  "10|Italianno|Italianno|62|long, sweeping"
)

NAME=""
PICK=""
INTO=""
INK="#16264d"
SLANT="-2.5"

# print the doc header, bounded by its own fences, so the help text
# can never drift out of sync with a hardcoded line range
show_help() {
  awk '
    NR == 1 { next }
    /^#####/ { fence++; if (fence == 2) exit; next }
    { sub(/^# ?/, ""); print }
  ' "${BASH_SOURCE[0]}"
}

show_faces() {
  print_eagle_header "pick a hand"
  print_tree_start "doc.signature --faces"
  local total=${#FACES[@]}
  local index=0
  for row in "${FACES[@]}"; do
    index=$((index + 1))
    IFS='|' read -r num family _param _size note <<<"$row"
    if [[ $index -eq $total ]]; then
      print_tree_leaf "$num" "$family — $note"
    else
      print_tree_branch "$num" "$family — $note"
    fi
  done
}

######################################################################
# parse args
######################################################################
while [[ $# -gt 0 ]]; do
  case $1 in
    --skill | --repo | --role)
      shift 2
      ;;
    --name)
      NAME="${2:-}"
      shift 2
      ;;
    --pick)
      PICK="${2:-}"
      shift 2
      ;;
    --into)
      INTO="${2:-}"
      shift 2
      ;;
    --ink)
      INK="${2:-}"
      shift 2
      ;;
    --slant)
      SLANT="${2:-}"
      shift 2
      ;;
    --faces)
      show_faces
      exit 0
      ;;
    --help | -h)
      show_help
      exit 0
      ;;
    *)
      print_blocked "unknown argument: $1"
      exit 2
      ;;
  esac
done

######################################################################
# validate
######################################################################
if [[ -z "$NAME" ]]; then
  print_blocked "--name is required (try: --name 'Ada Lovelace')"
  exit 2
fi

if [[ -n "$PICK" ]]; then
  if ! [[ "$PICK" =~ ^[0-9]+$ ]] || [[ "$PICK" -lt 1 ]] || [[ "$PICK" -gt ${#FACES[@]} ]]; then
    print_blocked "--pick must be a number 1-${#FACES[@]} (try --faces to see them)"
    exit 2
  fi
fi

# derive a filename slug from the name when no --into was given
if [[ -z "$INTO" ]]; then
  SLUG="$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//; s/-$//')"
  if [[ -n "$PICK" ]]; then
    INTO="./signature.${SLUG}.pick${PICK}.html"
  else
    INTO="./signature.${SLUG}.picker.html"
  fi
fi

######################################################################
# assemble the font url
#
# when a face is picked we request only that face, so the page loads fast
# and works offline once the browser has cached the one font
######################################################################
FONT_PARAMS=""
for row in "${FACES[@]}"; do
  IFS='|' read -r num _family param _size _note <<<"$row"
  if [[ -n "$PICK" ]] && [[ "$num" != "$PICK" ]]; then continue; fi
  FONT_PARAMS="${FONT_PARAMS}family=${param}&"
done
FONT_URL="https://fonts.googleapis.com/css2?${FONT_PARAMS}display=swap"

######################################################################
# build the cards
######################################################################
CARDS=""
for row in "${FACES[@]}"; do
  IFS='|' read -r num family param size note <<<"$row"
  if [[ -n "$PICK" ]] && [[ "$num" != "$PICK" ]]; then continue; fi
  WEIGHT=""
  if [[ "$param" == *"wght@500"* ]]; then WEIGHT="font-weight: 500;"; fi
  CARDS="${CARDS}
  <div class=\"card\">
    <div class=\"meta\"><span class=\"n\">${num} — ${family}</span><span>${note}</span></div>
    <div class=\"sig slant\" style=\"font-family: '${family}', cursive; font-size: ${size}px; ${WEIGHT}\">${NAME}</div>
  </div>
"
done

# initials, only on the full picker
INITIALS=""
if [[ -z "$PICK" ]]; then
  MARK="$(echo "$NAME" | awk '{ out=""; for (i=1; i<=NF; i++) out = out substr($i,1,1) "."; print out }')"
  INITIALS="
  <p class=\"initials\">initials only — for page corners or small boxes</p>

  <div class=\"card\">
    <div class=\"meta\"><span class=\"n\">${MARK} — Great Vibes</span><span></span></div>
    <div class=\"sig slant\" style=\"font-family: 'Great Vibes', cursive; font-size: 52px;\">${MARK}</div>
  </div>

  <div class=\"card\">
    <div class=\"meta\"><span class=\"n\">${MARK} — Mrs Saint Delafield</span><span></span></div>
    <div class=\"sig slant\" style=\"font-family: 'Mrs Saint Delafield', cursive; font-size: 60px;\">${MARK}</div>
  </div>
"
fi

######################################################################
# emit
######################################################################
mkdir -p "$(dirname "$INTO")"

cat >"$INTO" <<HTMLDOC
<!DOCTYPE html>
<!--
  .what = signature renderer for ${NAME}, in cursive typefaces
  .why  = a typed-name-in-cursive signature is the same instrument DocuSign
          generates. valid for e-signature under ESIGN / UETA.

  generated by: rhx doc.signature (repo=rhight, role=secretary)

  howto use:
    1. open in a browser (needs internet on first load, for the webfonts)
    2. pick the variant you like
    3. right-click that signature -> "Take Screenshot" (Firefox)
       or screenshot-crop it, or print the page to PDF and crop
    4. keep the crop as signature.png for reuse

  ⚠️ DO NOT use this on a notarized affidavit. an affidavit needs a
     jurat — you must sign in wet ink, in the notary's presence, after
     they administer the oath. a pre-signed affidavit can be refused.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<title>signature — ${NAME}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_URL}" rel="stylesheet">
<style>
  :root { --ink: ${INK}; }

  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    background: #f6f7f9;
    color: #222;
    margin: 0;
    padding: 32px 20px 60px;
  }
  .wrap { max-width: 880px; margin: 0 auto; }

  h1 { font-size: 19px; margin: 0 0 4px; }
  .sub { color: #666; font-size: 13px; margin: 0 0 22px; }

  .warn {
    background: #fff4e5;
    border: 2px solid #b45309;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 0 0 26px;
    font-size: 13px;
    line-height: 1.55;
    color: #7c2d12;
  }
  .warn strong { display: block; margin-bottom: 4px; }

  .card {
    background: #fff;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    margin: 0 0 14px;
    overflow: hidden;
  }
  .card .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafbfc;
    border-bottom: 1px solid #eceff2;
    padding: 7px 14px;
    font-size: 11px;
    color: #667;
    letter-spacing: .4px;
    text-transform: uppercase;
  }
  .card .meta .n { font-weight: 700; color: #334; }

  .sig {
    color: var(--ink);
    padding: 26px 30px 30px;
    white-space: nowrap;
    line-height: 1.35;
  }
  .sig.slant { transform: rotate(${SLANT}deg); transform-origin: left center; }

  .initials { font-size: 13px; color: #667; margin: 34px 0 10px; font-weight: 600; }

  .howto {
    background: #fff;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    padding: 16px 20px;
    margin-top: 30px;
    font-size: 13px;
    line-height: 1.7;
  }
  .howto h2 { font-size: 14px; margin: 0 0 8px; }
  .howto ol { margin: 0; padding-left: 20px; }
  code { background: #eef1f4; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
</style>
</head>
<body>
<div class="wrap">

  <h1>signature — ${NAME}</h1>
  <p class="sub">your own name, rendered in cursive. the same instrument DocuSign generates from a typed name — valid under ESIGN / UETA.</p>

  <div class="warn">
    <strong>⚠️ not for a notarized affidavit</strong>
    an affidavit needs a <em>jurat</em>: the notary administers an oath, then watches you sign in wet ink. a pre-signed affidavit can be refused, and the defect can be raised later. use this only where a typed e-signature is accepted.
  </div>
${CARDS}${INITIALS}
  <div class="howto">
    <h2>how to turn one into a reusable PNG</h2>
    <ol>
      <li>pick a variant above</li>
      <li>Firefox: right-click the signature → <em>Take Screenshot</em> → drag the region.<br>
          any browser: OS screenshot tool, crop tight to the strokes</li>
      <li>save as <code>signature.png</code> beside this file</li>
      <li>optional — drop the white background: open in GIMP, <em>Layer → Transparency → Color to Alpha</em>, pick white</li>
    </ol>
  </div>

</div>
</body>
</html>
HTMLDOC

######################################################################
# report
######################################################################
BYTES="$(wc -c <"$INTO" | tr -d ' ')"

print_eagle_header "sign right here"
print_tree_start "doc.signature"
print_tree_branch "name" "$NAME"
if [[ -n "$PICK" ]]; then
  for row in "${FACES[@]}"; do
    IFS='|' read -r num family _param _size _note <<<"$row"
    if [[ "$num" == "$PICK" ]]; then print_tree_branch "face" "$PICK — $family"; fi
  done
else
  print_tree_branch "faces" "${#FACES[@]} (all)"
fi
print_tree_branch "ink" "$INK"
print_tree_branch "bytes" "$BYTES"
print_tree_leaf "wrote" "$INTO"
echo ""
echo "   open it with:"
echo "      file://$(cd "$(dirname "$INTO")" && pwd)/$(basename "$INTO")"
echo ""
echo "   ⚠️ if your browser is sandboxed (flatpak/snap), copy it to ~/Downloads first"
echo ""
