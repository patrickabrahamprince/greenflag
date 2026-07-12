#!/bin/bash
# Runs the backend/RPC match-flow checks (concurrency, rejection, expiry,
# security bypass attempts, coin idempotency, ranking) against the local
# Supabase stack. Never point this at production -- see the header comments
# in scripts/test-matchflow-backend.ts and scripts/test-concurrency.ts.
set -euo pipefail
cd "$(dirname "$0")/.."

npx supabase start > /dev/null 2>&1 || true

STATUS=$(npx supabase status -o env 2>/dev/null)
export SUPABASE_URL=$(echo "$STATUS" | grep '^API_URL=' | cut -d'"' -f2)
export SUPABASE_ANON_KEY=$(echo "$STATUS" | grep '^ANON_KEY=' | cut -d'"' -f2)
export SUPABASE_SERVICE_ROLE_KEY=$(echo "$STATUS" | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Could not read local Supabase credentials -- is 'supabase start' working?" >&2
  exit 1
fi

echo "=== scripts/test-concurrency.ts ==="
npx tsx scripts/test-concurrency.ts

echo ""
echo "=== scripts/test-matchflow-backend.ts ==="
npx tsx scripts/test-matchflow-backend.ts
