#!/usr/bin/env bash
# Scrub leaked plaintext password from Git history WITHOUT changing the database password
# Usage: bash scripts/scrub_sensitive_history.sh
# Requirements: python + git-filter-repo installed (https://github.com/newren/git-filter-repo)

set -euo pipefail

# Read leaked value from env or prompt (do not hardcode secrets here)
LEAKED_VALUE="${LEAKED_VALUE:-}"
if [ -z "${LEAKED_VALUE}" ]; then
  read -s -p "Enter the exact leaked value to scrub: " LEAKED_VALUE
  echo
fi
LEAKED_FILE="supabase/migrations/20250808171016_847cc5ce-25ad-4b73-b94b-e6ac3fb12210.sql"
REPLACEMENT="${REPLACEMENT:-REDACTED}"

command -v git >/dev/null 2>&1 || { echo "git is required"; exit 1; }

# Ensure git-filter-repo is available
if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo is not installed. Install it first:"
  echo "  pip install git-filter-repo"
  exit 1
fi

# Confirm current directory is a git repo
if [ ! -d .git ]; then
  echo "This script must be run from the root of your git repository."; exit 1;
fi

# Safety confirmation
cat <<EOW
About to rewrite repository history to:
  - Remove file: ${LEAKED_FILE}
  - Replace all occurrences of the leaked password with: ${REPLACEMENT}

This will require a force-push and will rewrite commit hashes.
Make sure all collaborators are informed and have no unpushed work.
EOW

read -p "Type 'YES' to proceed: " CONFIRM
if [ "${CONFIRM}" != "YES" ]; then
  echo "Aborted."; exit 1;
fi

TMPDIR=$(mktemp -d)
trap 'rm -rf "${TMPDIR}"' EXIT

# Prepare replace-text map
printf "%s==>%s\n" "${LEAKED_VALUE}" "${REPLACEMENT}" > "${TMPDIR}/replacements.txt"

# Perform history rewrite
# 1) Replace leaked string everywhere
# 2) Remove the specific migration file entirely from history

echo "Running git filter-repo..."

git filter-repo \
  --replace-text "${TMPDIR}/replacements.txt" \
  --path "${LEAKED_FILE}" --invert-paths

# Show verification of removal
echo
echo "Verifying..."
if git grep -n "${LEAKED_VALUE}" >/dev/null 2>&1; then
  echo "ERROR: Leak still present in working tree. Investigate manually."; exit 1;
else
  echo "OK: Leaked value not found in working tree."
fi

# Final instructions to push
cat <<EOP

History rewritten locally.
To update remote, run:
  git push --force --tags --prune --all

All collaborators must:
  git fetch --all
  git reset --hard origin/$(git rev-parse --abbrev-ref HEAD)

Note: Database password remains unchanged; only repository history was scrubbed.
EOP
