#!/usr/bin/env bash
# Regenerate src/icons/*.png from assets/*.svg
set -euo pipefail
cd "$(dirname "$0")/.."
scripts/render.sh assets/icon-small.svg 16 16 src/icons/icon16.png
scripts/render.sh assets/icon-small.svg 32 32 src/icons/icon32.png
scripts/render.sh assets/icon.svg 48 48 src/icons/icon48.png
scripts/render.sh assets/icon.svg 128 128 src/icons/icon128.png
