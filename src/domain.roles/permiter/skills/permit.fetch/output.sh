#!/usr/bin/env bash
######################################################################
# .what = treestruct output for permit.fetch
######################################################################

# emit blocked message for permit fetch
emit_blocked() {
  local permit_id="$1"

  cat <<EOF
🦅 the record is blocked...

🏛️ permit.fetch
   ├─ permit
   │  └─ id: ${permit_id}
   └─ ✋ BLOCKED: requires Accela API access

todo: use rhachet-roles-kermet to webscrape

see: .behavior/v2026_04_09.permit-required/blocker.goal2.md
EOF
}
