#!/bin/bash
# Kökten www/ ve ios/App/App/public/'e kopyala + cap sync + doğrula (CLAUDE.md §1)
cd "$(dirname "$0")"
for f in "$@"; do mkdir -p "www/$(dirname "$f")" "ios/App/App/public/$(dirname "$f")"; cp "$f" "www/$f"; cp "$f" "ios/App/App/public/$f"; done
./node_modules/.bin/cap sync ios >/dev/null 2>&1
ok=1; for f in "$@"; do diff -q "$f" "www/$f" >/dev/null && diff -q "$f" "ios/App/App/public/$f" >/dev/null || { echo "DIFF $f"; ok=0; }; done
[ $ok = 1 ] && echo SYNC_OK
