#!/usr/bin/env bash
# Редеплой нової версії (гілка feat/mvp-redesign-roles) на node-auto.
# Контейнер shkolyaryk-dev-web (nginx) віддає ./html через cloudflared-тунель.
# URL: https://shkolyaryk-dev.kuznya.studio/
# Bind-mount html:ro → оновлення файлів підхоплюється без рестарту.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ build…"
npm run build

echo "▶ pack + upload…"
tar -czf /tmp/shk-dist.tgz -C dist .
scp /tmp/shk-dist.tgz node-auto:/tmp/shk-dist.tgz

echo "▶ extract on node-auto…"
ssh node-auto 'D=~/docker/shkolyaryk-dev; rm -rf "$D/html"/*; tar -xzf /tmp/shk-dist.tgz -C "$D/html"; echo "  html files: $(ls "$D/html" | wc -l)"'

echo "✅ deployed → https://shkolyaryk-dev.kuznya.studio/"
