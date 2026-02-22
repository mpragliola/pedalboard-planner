#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-src}"

echo "Scanning $ROOT for likely repeated linear scans..."
rg -n "\\.(find|filter|some)\\(" "$ROOT" \
  -g '*.{ts,tsx}' \
  -g '!**/*.test.*' \
  -g '!**/__tests__/**'
