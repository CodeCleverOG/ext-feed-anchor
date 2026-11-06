#!/usr/bin/env bash
# Regenerate Chrome Web Store images in store/ (screenshots 1280x800, promo tile 440x280)
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
LIGHT="--blink-settings=preferredColorScheme=1"
DARK="--blink-settings=preferredColorScheme=0"

SCALE=2 CHROME_FLAGS="$LIGHT" scripts/preview-popup.sh "$tmp/on.png" "tabs=2,1" 278
SCALE=2 CHROME_FLAGS="$DARK"  scripts/preview-popup.sh "$tmp/off.png" "enabled=0&tabs=2,1" 278

enc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }
shot() { # out theme img headline text
  local page="store/preview/screenshot.html?theme=$2&img=$(enc "file://$3")&h=$(enc "$4")&p=$(enc "$5")"
  local wrap="$tmp/wrap-$(basename "$1" .png).html"
  printf '<html><body style="margin:0"><iframe src="file://%s/%s" style="border:0;width:1280px;height:800px;display:block"></iframe></body></html>' "$PWD" "$page" > "$wrap"
  CHROME_FLAGS="" scripts/render.sh "$wrap" 1280 800 "$1"
}
shot store/screenshot-1.png light "$tmp/on.png" \
  "Your feed stays where you left it." \
  "Switch tabs, come back, keep scrolling. Feed Anchor stops the automatic refresh that throws away what you were reading."
shot store/screenshot-2.png dark "$tmp/off.png" \
  "Pause it with one tap." \
  "Turn protection off and on anytime. It applies instantly, with no page reload."

scripts/render.sh store/preview/promo.html 440 280 store/promo-440x280.png
