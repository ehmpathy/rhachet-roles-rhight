#!/usr/bin/env bash
######################################################################
# .what = treestruct output for permit.search
######################################################################

# emit blocked message for permit search
emit_blocked() {
  local address="$1"
  local postal="$2"

  cat <<EOF
🦅 the view is blocked...

🏛️ permit.search
   ├─ query
   │  ├─ address: ${address}
   │  └─ postal: ${postal}
   ├─ source
   │  ├─ jurisdiction: Indianapolis-Marion County
   │  └─ portal: Accela
   └─ ✋ BLOCKED: requires Accela API access

todo: use rhachet-roles-kermet to webscrape

see: .behavior/v2026_04_09.permit-required/blocker.goal2.md
EOF
}
