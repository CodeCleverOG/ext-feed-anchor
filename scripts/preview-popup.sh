#!/usr/bin/env bash
# Render the popup to PNG with fake data. Usage: scripts/preview-popup.sh <out.png> [query] [height]
set -euo pipefail
cd "$(dirname "$0")/.."
out="$1"; query="${2:-}"; h="${3:-360}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
cp -R src/. "$tmp/"
cp store/preview/stub.js "$tmp/stub.js"
# Load the fake chrome API before anything else
sed 's#<head>#<head><script src="stub.js"></script>#' src/popup.html > "$tmp/popup.html"
printf '<html><body style="margin:0"><iframe src="popup.html%s" style="border:0;width:300px;height:%spx;display:block"></iframe></body></html>' "${query:+?$query}" "$h" > "$tmp/wrap.html"
scripts/render.sh "$tmp/wrap.html" 300 "$h" "$out"
