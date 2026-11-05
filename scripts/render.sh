#!/usr/bin/env bash
# Render an SVG or HTML file to PNG at an exact size with headless Chrome.
# Usage: scripts/render.sh <input.svg|input.html> <width> <height> <output.png>
set -euo pipefail
in="$1"; w="$2"; h="$3"; out="$4"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || CHROME="$(command -v google-chrome || command -v chromium)"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
abs_in="$(cd "$(dirname "$in")" && pwd)/$(basename "$in")"
case "$in" in
  *.svg)
    page="$tmp/page.html"
    printf '<html><body style="margin:0;background:transparent"><img src="file://%s" width="%s" height="%s" style="display:block"></body></html>' \
      "$abs_in" "$w" "$h" > "$page" ;;
  *) page="$abs_in" ;;
esac

"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=${SCALE:-1} \
  --default-background-color=00000000 --allow-file-access-from-files \
  --user-data-dir="$tmp/profile" --window-size="$w,$h" ${CHROME_FLAGS:-} \
  --screenshot="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")" "file://$page" >/dev/null 2>&1
echo "rendered $out (${w}x${h})"
