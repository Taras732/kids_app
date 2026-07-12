#!/usr/bin/env bash
# Розшифрувати secrets/dev.env (SOPS+age) -> .env у корені репозиторію.
# Працює на будь-якому вузлі: Windows (git-bash), node-auto, Paperclip-контейнер.
# Використання: bash scripts/load-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Знайти age-ключ: спершу постійний шлях контейнера, потім дефолт хоста.
if [ -z "${SOPS_AGE_KEY_FILE:-}" ]; then
  if [ -f /paperclip/.config/sops/age/keys.txt ]; then
    export SOPS_AGE_KEY_FILE=/paperclip/.config/sops/age/keys.txt
  elif [ -f "$HOME/.config/sops/age/keys.txt" ]; then
    export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/keys.txt"
  elif [ -f "$APPDATA/sops/age/keys.txt" ]; then
    export SOPS_AGE_KEY_FILE="$APPDATA/sops/age/keys.txt"
  fi
fi

if [ ! -f "${SOPS_AGE_KEY_FILE:-/nonexistent}" ]; then
  echo "ERROR: age key not found. Set SOPS_AGE_KEY_FILE or place keys.txt." >&2
  exit 1
fi

sops -d "$ROOT/secrets/dev.env" > "$ROOT/.env"
echo "OK: .env generated from secrets/dev.env"
