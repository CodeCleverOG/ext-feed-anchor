#!/usr/bin/env bash
# Build dist/feed-anchor-<version>.zip from src/ for upload to the Chrome Web Store
set -euo pipefail
cd "$(dirname "$0")/.."
version="$(jq -r .version src/manifest.json)"
out="dist/feed-anchor-$version.zip"
mkdir -p dist
rm -f "$out"
(cd src && zip -r -X -q "../$out" . -x '.*' -x '*/.*')
echo "Built $out"
unzip -l "$out"
