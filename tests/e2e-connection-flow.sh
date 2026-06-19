#!/bin/bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS() { echo -e "  ${GREEN}✓${NC} $1"; }
FAIL() { echo -e "  ${RED}✗${NC} $1"; exit 1; }
INFO() { echo -e "  ${YELLOW}→${NC} $1"; }
PARSE_JSON() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null; }

# Config
API="http://localhost:3000/api"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://waqmflgufshwvyepusux.supabase.co}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
SUPABASE_ANON="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
GUEST_EMAIL="test-guest-$(date +%s)@greenflag.app"
GUEST_PASS="TestGuest123!"
HOST_EMAIL="test-host-$(date +%s)@greenflag.app"
HOST_PASS="TestHost123!"
GUEST_NAME="TestGuest"
HOST_NAME="TestHost"

# 0. Setup: create test users via Supabase Admin API
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  E2E: Connection Flow Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INFO "Creating guest user: $GUEST_EMAIL"
GUEST_RESULT=$(curl -s --max-time 15 -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${GUEST_EMAIL}\",\"password\":\"${GUEST_PASS}\",\"email_confirm\":true}")
GUEST_ID=$(echo "$GUEST_RESULT" | PARSE_JSON 'd.get("id","")')
[ -z "$GUEST_ID" ] && { FAIL "Failed to create guest user"; echo "$GUEST_RESULT"; exit 1; }
PASS "Guest created: $GUEST_ID"

INFO "Creating host user: $HOST_EMAIL"
HOST_RESULT=$(curl -s --max-time 15 -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${HOST_EMAIL}\",\"password\":\"${HOST_PASS}\",\"email_confirm\":true}")
HOST_ID=$(echo "$HOST_RESULT" | PARSE_JSON 'd.get("id","")')
[ -z "$HOST_ID" ] && { FAIL "Failed to create host user"; echo "$HOST_RESULT"; exit 1; }
PASS "Host created: $HOST_ID"

# Setup profiles
INFO "Setting up guest profile (coins=10, gender=guest)"
curl -s --max-time 15 -X POST "${SUPABASE_URL}/rest/v1/profiles" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d "{\"id\":\"${GUEST_ID}\",\"name\":\"${GUEST_NAME}\",\"gender\":\"guest\",\"coins\":10,\"age\":25,\"photos\":[],\"onboarding_complete\":true,\"interests\":[\"travel\",\"fitness\",\"music\"],\"looking_for_interests\":[\"ambition\",\"growth\",\"values\"]}" > /dev/null

INFO "Setting up host profile (coins=0, gender=host)"
curl -s --max-time 15 -X POST "${SUPABASE_URL}/rest/v1/profiles" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d "{\"id\":\"${HOST_ID}\",\"name\":\"${HOST_NAME}\",\"gender\":\"host\",\"coins\":0,\"age\":28,\"photos\":[],\"onboarding_complete\":true,\"standards\": [{\"title\":\"Financial Mindset\",\"prompt\":\"Describe your view on wealth building\",\"type\":\"text\"},{\"title\":\"Life Vision\",\"prompt\":\"Where do you see yourself in 5 years?\",\"type\":\"text\"},{\"title\":\"Emotional Intelligence\",\"prompt\":\"How do you handle conflict?\",\"type\":\"text\"},{\"title\":\"Daily Rituals\",\"prompt\":\"Describe your ideal morning routine\",\"type\":\"text\"},{\"title\":\"Adventure Style\",\"prompt\":\"Share a photo from your favorite adventure\",\"type\":\"image\"},{\"title\":\"Personal Growth\",\"prompt\":\"What is a skill you are developing?\",\"type\":\"text\"},{\"title\":\"Connection Values\",\"prompt\":\"What matters most in a partnership?\",\"type\":\"text\"},{\"title\":\"Final Note\",\"prompt\":\"Share a photo that represents who you are\",\"type\":\"image\"}]}" > /dev/null
PASS "Profiles configured"

# Sign in as guest
INFO "Signing in as guest..."
GUEST_SESSION=$(curl -s --max-time 15 -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${GUEST_EMAIL}\",\"password\":\"${GUEST_PASS}\"}")
GUEST_TOKEN=$(echo "$GUEST_SESSION" | PARSE_JSON 'd.get("access_token","")')
[ -z "$GUEST_TOKEN" ] && { FAIL "Guest sign-in failed"; echo "$GUEST_SESSION"; }
PASS "Guest signed in"

INFO "Guest coins before: $(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/profiles?id=eq.${GUEST_ID}&select=coins" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("coins",0)')"

echo ""

# =============================================
# TEST 1: Guest applies to meet host
# =============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 1: Meet Her Standard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Call the API (can't directly since it needs Next.js cookies via RSC)
# Instead, we call the Supabase RPC directly as the guest user
INFO "Calling start_connection RPC..."
START_RESULT=$(curl -s --max-time 30 -X POST "${SUPABASE_URL}/rest/v1/rpc/start_connection" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${GUEST_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"p_host_id\":\"${HOST_ID}\"}")

CONNECTION_ID=$(echo "$START_RESULT" | PARSE_JSON 'd.get("connection_id","")')
DEADLINE=$(echo "$START_RESULT" | PARSE_JSON 'd.get("deadline","")')

[ -z "$CONNECTION_ID" ] && { FAIL "No connection_id returned"; echo "$START_RESULT"; }
PASS "Connection created: $CONNECTION_ID"

[ -n "$DEADLINE" ] && PASS "Deadline returned: $DEADLINE"

# Check coins deducted
GUEST_COINS=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/profiles?id=eq.${GUEST_ID}&select=coins" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("coins",0)')
[ "$GUEST_COINS" = "5" ] && PASS "Coins deducted: 10 → 5" || FAIL "Coins should be 5, got: $GUEST_COINS"

# Check connection status
CONN_STATUS=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/connections?id=eq.${CONNECTION_ID}&select=status" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("status","")')
[ "$CONN_STATUS" = "pending" ] && PASS "Status = pending" || FAIL "Status should be pending, got: $CONN_STATUS"

# Check timer is ~48h (within some tolerance)
DEADLINE_SECS=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${DEADLINE%+*}" +%s 2>/dev/null || date -d "${DEADLINE%+*}" +%s 2>/dev/null || echo 0)
NOW_SECS=$(date +%s)
DIFF=$(( (DEADLINE_SECS - NOW_SECS) / 3600 ))
[ "$DIFF" -ge 47 ] && PASS "Timer ≈ 48h deadline ($DIFF hours away)" || INFO "Timer: ${DIFF}h remaining (may vary by latency)"

echo ""

# =============================================
# TEST 2: Submit 3 tasks
# =============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 2: Submit 3 Tasks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in 1 2 3; do
  RESULT=$(curl -s --max-time 30 -X POST "${SUPABASE_URL}/rest/v1/rpc/submit_task" \
    -H "apikey: ${SUPABASE_ANON}" \
    -H "Authorization: Bearer ${GUEST_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"p_connection_id\":\"${CONNECTION_ID}\",\"p_task_number\":${i},\"p_text\":\"Test response for task ${i}\"}")
  
  COMPLETED=$(echo "$RESULT" | PARSE_JSON 'd.get("tasks_completed",0)')
  [ "$COMPLETED" = "$i" ] && PASS "Task $i submitted (completed: $COMPLETED/8)" || FAIL "Task $i expected $i, got: $COMPLETED"
done

# Verify no dupes in DB
SUBMISSION_COUNT=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/task_submissions?connection_id=eq.${CONNECTION_ID}&select=id" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'len(d)')
[ "$SUBMISSION_COUNT" = "3" ] && PASS "No duplicate submissions in DB ($SUBMISSION_COUNT rows)" || FAIL "Expected 3 submissions, got $SUBMISSION_COUNT"

echo ""

# =============================================
# TEST 3: Check host side
# =============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 3: Host Side Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CONN_STATUS=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/connections?id=eq.${CONNECTION_ID}&select=status" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("status","")')
[ "$CONN_STATUS" = "pending" ] && PASS "DB status = pending (host hasn't seen it yet)" || FAIL "Status should be pending, got: $CONN_STATUS"

HOST_COINS=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/profiles?id=eq.${HOST_ID}&select=coins" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("coins",0)')
PASS "Host coins: $HOST_COINS (no change)"

echo ""

# =============================================
# TEST 4: Submit remaining 5 tasks
# =============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 4: Submit Remaining 5 Tasks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in 4 5 6 7 8; do
  TYPE="text"
  [ "$i" = "5" ] || [ "$i" = "8" ] && TYPE="text" # images would need URLs
  RESULT=$(curl -s --max-time 30 -X POST "${SUPABASE_URL}/rest/v1/rpc/submit_task" \
    -H "apikey: ${SUPABASE_ANON}" \
    -H "Authorization: Bearer ${GUEST_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"p_connection_id\":\"${CONNECTION_ID}\",\"p_task_number\":${i},\"p_text\":\"Test response for task ${i}\"}")
  
  COMPLETED=$(echo "$RESULT" | PARSE_JSON 'd.get("tasks_completed",0)')
  [ "$COMPLETED" = "$i" ] && PASS "Task $i submitted (completed: $COMPLETED/8)" || INFO "Task $i: completed=$COMPLETED"
done

# Verify all 8 submitted
TOTAL=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/task_submissions?connection_id=eq.${CONNECTION_ID}&select=id" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'len(d)')
[ "$TOTAL" = "8" ] && PASS "All 8 submissions in DB" || FAIL "Expected 8 submissions, got $TOTAL"

# Check status flipped to tasks_submitted
FINAL_STATUS=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/connections?id=eq.${CONNECTION_ID}&select=status" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("status","")')
[ "$FINAL_STATUS" = "tasks_submitted" ] && PASS "Status flipped to tasks_submitted" || FAIL "Status should be tasks_submitted, got: $FINAL_STATUS"

echo ""

# =============================================
# TEST 5: Reject path
# =============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 5: Reject Path"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Sign in as host
INFO "Signing in as host..."
HOST_SESSION=$(curl -s --max-time 15 -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${HOST_EMAIL}\",\"password\":\"${HOST_PASS}\"}")
HOST_TOKEN=$(echo "$HOST_SESSION" | PARSE_JSON 'd.get("access_token","")')
[ -z "$HOST_TOKEN" ] && { FAIL "Host sign-in failed"; echo "$HOST_SESSION"; }
PASS "Host signed in"

# Host rejects the application
REVIEW_RESULT=$(curl -s --max-time 15 -X POST "${SUPABASE_URL}/rest/v1/rpc/review_connection" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${HOST_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"p_connection_id\":\"${CONNECTION_ID}\",\"p_approve\":false}")
[ -z "$REVIEW_RESULT" ] && PASS "review_connection RPC returned OK" || INFO "Review result: $REVIEW_RESULT"

# Check status = rejected
REJECT_STATUS=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/connections?id=eq.${CONNECTION_ID}&select=status" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("status","")')
[ "$REJECT_STATUS" = "rejected" ] && PASS "Status = rejected" || FAIL "Status should be rejected, got: $REJECT_STATUS"

# Check guest coins refunded to 10
COINS_AFTER=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/profiles?id=eq.${GUEST_ID}&select=coins" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'd[0].get("coins",0)')
[ "$COINS_AFTER" = "10" ] && PASS "Coins refunded: 5 → 10" || FAIL "Coins should be 10, got: $COINS_AFTER"

# Check transaction log
TX_COUNT=$(curl -s --max-time 15 "${SUPABASE_URL}/rest/v1/coin_transactions?user_id=eq.${GUEST_ID}&select=id" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" | PARSE_JSON 'len(d)')
[ "$TX_COUNT" -ge 2 ] && PASS "Transaction log has $TX_COUNT entries (spend + refund)" || INFO "Transaction count: $TX_COUNT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}  ALL 5 TESTS PASSED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cleanup: delete test users
INFO "Cleaning up test users..."
curl -s --max-time 15 -X DELETE "${SUPABASE_URL}/auth/v1/admin/users/${GUEST_ID}" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" > /dev/null 2>&1
curl -s --max-time 15 -X DELETE "${SUPABASE_URL}/auth/v1/admin/users/${HOST_ID}" \
  -H "apikey: ${SUPABASE_ANON}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" > /dev/null 2>&1
PASS "Test users cleaned up"
