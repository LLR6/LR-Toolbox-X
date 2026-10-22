#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo 'Install Node.js 24 LTS: https://nodejs.org'; exit 1; }
if [ ! -d node_modules ]; then npm ci; fi
exec npm run dev
