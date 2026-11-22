#!/usr/bin/env bash
# Link this folder into your agent's skills directory so `git pull` updates it in place.
#
#   ./install.sh                 Claude Code  (~/.claude/skills/inimitable)
#   ./install.sh --codex         Codex        (~/.codex/skills/inimitable)
#   ./install.sh --dir <path>    any agent that reads SKILL.md folders
#   ./install.sh --uninstall     remove the link(s) this script made
#   ./install.sh --check         check Node, Chrome and Python without installing
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
targets=()
uninstall=0
check=0

while [ $# -gt 0 ]; do
  case "$1" in
    --codex) targets+=("$HOME/.codex/skills/inimitable") ;;
    --dir) shift; targets+=("${1:?--dir needs a path}/inimitable") ;;
    --uninstall) uninstall=1 ;;
    --check) check=1 ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done
[ ${#targets[@]} -eq 0 ] && targets=("$HOME/.claude/skills/inimitable")

report() { printf '  %-8s %s\n' "$1" "$2"; }

check_tools() {
  echo "Checking what the scripts need"
  if command -v node >/dev/null 2>&1; then
    major="$(node -p 'process.versions.node.split(".")[0]')"
    if [ "$major" -ge 22 ]; then report "node" "$(node -v)"; else report "node" "$(node -v), needs 22 or newer"; fi
  else report "node" "not found, needs 22 or newer"; fi

  chrome=""
  if [ -n "${CHROME_PATH:-}" ] && [ -x "$CHROME_PATH" ]; then chrome="$CHROME_PATH"; fi
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Applications/Chromium.app/Contents/MacOS/Chromium" \
           "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
           /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/microsoft-edge; do
    [ -z "$chrome" ] && [ -x "$c" ] && chrome="$c"
  done
  if [ -n "$chrome" ]; then report "chrome" "$chrome"; else report "chrome" "not found, install Chrome, Edge or Chromium (or set CHROME_PATH)"; fi

  if command -v python3 >/dev/null 2>&1; then report "python3" "$(python3 -V 2>&1) (only for terminal screenshots)"; else report "python3" "not found (only needed for terminal screenshots)"; fi
}

if [ "$check" -eq 1 ]; then check_tools; exit 0; fi

for target in "${targets[@]}"; do
  if [ "$uninstall" -eq 1 ]; then
    if [ -L "$target" ]; then rm "$target"; echo "Removed $target"; else echo "Nothing to remove at $target"; fi
    continue
  fi
  mkdir -p "$(dirname "$target")"
  if [ -L "$target" ]; then
    rm "$target"
  elif [ -e "$target" ]; then
    echo "$target already exists and is not a link. Move it aside and run this again." >&2
    exit 1
  fi
  ln -s "$here" "$target"
  echo "Linked $target -> $here"
done

[ "$uninstall" -eq 0 ] && check_tools
[ "$uninstall" -eq 0 ] && echo "Done. Start a new session so the skill is loaded."
exit 0
