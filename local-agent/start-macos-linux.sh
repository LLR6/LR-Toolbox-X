#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v ollama >/dev/null 2>&1; then
  echo 'Install Ollama from https://ollama.com/download, then run this launcher again.'
  exit 1
fi
exec python3 start.py
