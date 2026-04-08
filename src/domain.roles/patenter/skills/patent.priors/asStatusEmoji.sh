#!/usr/bin/env bash
######################################################################
# .what = convert patent application status to emoji
#
# .why  = visual indicator of application lifecycle stage:
#         🌱 = new/docketed (early stage)
#         ⏳ = in process (dispatched, preexam, non-final action)
#         🚫 = final rejection
#         ✨ = notice of allowance
#         🏆 = patented
#         💀 = abandoned
#         📋 = other/unknown
#
# usage:
#   asStatusEmoji.sh "Docketed New Case - Ready for Examination"
#   asStatusEmoji.sh "Non Final Action Mailed"
#
# guarantee:
#   - always outputs exactly one emoji
#   - unknown statuses get 📋
#   - exit 0 always
######################################################################
set -euo pipefail

main() {
  local status="${1:-}"

  case "$status" in
    *"New Case"*|*"Ready for Examination"*)
      echo "🌱" ;;
    *"Dispatched"*|*"Not Yet Docketed"*|*"Preexam"*|*"Non Final Action"*|*"Non-Final Action"*)
      echo "⏳" ;;
    *"Final Rejection"*|*"Final Action"*)
      echo "🚫" ;;
    *"Notice of Allowance"*)
      echo "✨" ;;
    *"Patented"*|*"Patent Issued"*)
      echo "🏆" ;;
    *"Abandoned"*)
      echo "💀" ;;
    *)
      echo "📋" ;;
  esac
}

main "$@"
