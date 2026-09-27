#!/usr/bin/env bash
# verify:changed – inner loop (SYSTEM.md §11): format + lint of the touched files, typecheck,
# tests related to the touched files, and the world check when world data changed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
base="${BASE_REF:-origin/main}"
git rev-parse --verify -q "$base" >/dev/null || base="HEAD"
mapfile -t changed < <( { git diff --name-only --diff-filter=ACMR "$base"; git ls-files --others --exclude-standard; } | sort -u)
code=(); src=()
for f in "${changed[@]}"; do
  [ -f "$f" ] || continue
  case "$f" in
    *.ts|*.tsx|*.mjs|*.css|*.json) code+=("$f") ;;
  esac
  case "$f" in
    src/*.ts|src/*.tsx) src+=("$f") ;;
  esac
done
if [ ${#code[@]} -gt 0 ]; then npx prettier --check --ignore-unknown "${code[@]}"; fi
lintable=()
for f in "${code[@]}"; do case "$f" in *.ts|*.tsx|*.mjs) lintable+=("$f") ;; esac; done
if [ ${#lintable[@]} -gt 0 ]; then npx eslint "${lintable[@]}"; fi
npx tsc --noEmit
if [ ${#src[@]} -gt 0 ]; then npx vitest related --run "${src[@]}"; fi
if printf '%s\n' "${changed[@]}" | grep -qE '^(world/|src/features/(world|render|logbook|routine)/)'; then npm run -s world:check; fi
echo "verify:changed green"
