// Concurrency test for create_like()'s pg_advisory_xact_lock dedup fix
// (20261213000006_create_like_dedup_lock.sql).
//
// Why this exists as a standalone script rather than a vitest unit test:
// proving an advisory-lock fix actually serializes concurrent callers
// requires firing genuinely overlapping requests against a real running
// Postgres instance — a mocked/sequential test can't observe a race at all,
// it would pass identically whether the lock works or not.
//
// How to run: start the local stack (`supabase start`), then:
//   SUPABASE_URL=http://127.0.0.1:55321 \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_key from `supabase start` output> \
//   SUPABASE_ANON_KEY=<anon_key from `supabase start` output> \
//   npx tsx scripts/test-concurrency.ts
//
// What it proves: Test 1 fires truly concurrent create_like() calls for the
// same man+woman pair, looped many times, and checks that exactly one match
// row and one 100-coin charge ever results — this is the actual regression
// the pg_advisory_xact_lock fix targets. Test 2 confirms the lock is scoped
// to the specific pair (doesn't wrongly serialize unrelated pairs). Test 3
// confirms a man with exactly enough coins for one match can't double-spend
// by hitting two different women's queues at once.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const API_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:55321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY must be set (see header comment for how to get them from `supabase start`).');
  process.exit(1);
}

const admin = createClient(API_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let userCounter = 0;

interface TestUser {
  userId: string;
  client: SupabaseClient;
}

async function createTestUser(persona: 'man' | 'woman', balance: number): Promise<TestUser> {
  userCounter++;
  const email = `concurrency-test-${Date.now()}-${userCounter}@example.test`;
  const password = 'concurrency-test-password-123!';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`createUser failed for ${email}: ${error?.message}`);
  }
  const userId = data.user.id;

  const { error: profileErr } = await admin.from('profiles').update({ persona }).eq('id', userId);
  if (profileErr) throw new Error(`profile update failed: ${profileErr.message}`);

  const { error: walletErr } = await admin.from('wallets').update({ balance }).eq('user_id', userId);
  if (walletErr) throw new Error(`wallet update failed: ${walletErr.message}`);

  const client = createClient(API_URL, ANON_KEY, { auth: { persistSession: false } });
  const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
  if (signInErr) throw new Error(`signIn failed for ${email}: ${signInErr.message}`);

  return { userId, client };
}

async function getBalance(userId: string): Promise<number> {
  const { data, error } = await admin.from('wallets').select('balance').eq('user_id', userId).single();
  if (error) throw new Error(`getBalance failed: ${error.message}`);
  return data!.balance as number;
}

async function getMatchCount(manId: string, womanId: string): Promise<number> {
  const { data, error } = await admin
    .from('matches')
    .select('id')
    .or(`and(user1_id.eq.${manId},user2_id.eq.${womanId}),and(user1_id.eq.${womanId},user2_id.eq.${manId})`);
  if (error) throw new Error(`getMatchCount failed: ${error.message}`);
  return data?.length ?? 0;
}

type CreateLikeResult = { success?: boolean; error?: string; like_id?: string; match_id?: string };

async function callCreateLike(client: SupabaseClient, toUserId: string): Promise<CreateLikeResult> {
  const { data, error } = await client.rpc('create_like', { p_to_user_id: toUserId });
  if (error) return { success: false, error: error.message };
  return data as CreateLikeResult;
}

// ---------------------------------------------------------------------------
// Test 1: same-pair concurrency — the actual regression case
// ---------------------------------------------------------------------------
async function runTest1(iterations: number) {
  const failures: string[] = [];

  for (let i = 0; i < iterations; i++) {
    const man = await createTestUser('man', 1000);
    const woman = await createTestUser('woman', 0);

    const balanceBefore = await getBalance(man.userId);

    const [r1, r2] = await Promise.all([
      callCreateLike(man.client, woman.userId),
      callCreateLike(man.client, woman.userId),
    ]);

    const balanceAfter = await getBalance(man.userId);
    const spent = balanceBefore - balanceAfter;
    const matchCount = await getMatchCount(man.userId, woman.userId);

    const matchIds = [r1.match_id, r2.match_id].filter(Boolean);
    const uniqueMatchIds = new Set(matchIds);
    const bothSucceeded = r1.success === true && r2.success === true;

    if (matchCount !== 1 || spent !== 100 || uniqueMatchIds.size !== 1 || !bothSucceeded) {
      failures.push(
        `iteration ${i}: matchCount=${matchCount} (want 1), spent=${spent} (want 100), ` +
        `uniqueMatchIds=${uniqueMatchIds.size} (want 1), r1=${JSON.stringify(r1)}, r2=${JSON.stringify(r2)}`
      );
    }
  }

  return { iterations, failures };
}

// ---------------------------------------------------------------------------
// Test 2: different pairs must NOT serialize against each other
// ---------------------------------------------------------------------------
async function runTest2() {
  const manA = await createTestUser('man', 1000);
  const womanX = await createTestUser('woman', 0);
  const manB = await createTestUser('man', 1000);
  const womanY = await createTestUser('woman', 0);

  const start = Date.now();
  const [ra, rb] = await Promise.all([
    callCreateLike(manA.client, womanX.userId),
    callCreateLike(manB.client, womanY.userId),
  ]);
  const elapsedMs = Date.now() - start;

  const bothSucceeded = ra.success === true && rb.success === true;
  const fastEnough = elapsedMs < 2000;

  return { elapsedMs, bothSucceeded, fastEnough, ra, rb };
}

// ---------------------------------------------------------------------------
// Test 3: insufficient balance under concurrency
// ---------------------------------------------------------------------------
async function runTest3() {
  const man = await createTestUser('man', 100); // exactly one match's worth
  const womanX = await createTestUser('woman', 0);
  const womanY = await createTestUser('woman', 0);

  const [rx, ry] = await Promise.all([
    callCreateLike(man.client, womanX.userId),
    callCreateLike(man.client, womanY.userId),
  ]);

  const balanceAfter = await getBalance(man.userId);
  const successes = [rx, ry].filter((r) => r.success === true);
  const insufficientFunds = [rx, ry].filter((r) => r.success === false && r.error === 'insufficient_funds');

  const exactlyOneSucceeded = successes.length === 1;
  const exactlyOneInsufficientFunds = insufficientFunds.length === 1;
  const balanceNeverNegative = balanceAfter >= 0;
  const balanceCorrect = balanceAfter === 0;

  return {
    exactlyOneSucceeded,
    exactlyOneInsufficientFunds,
    balanceNeverNegative,
    balanceCorrect,
    balanceAfter,
    rx,
    ry,
  };
}

async function main() {
  const iterations = Number(process.env.CONCURRENCY_ITERATIONS || 30);

  console.log(`\n=== Test 1: same-pair concurrency dedup (${iterations} iterations) ===`);
  const test1Result = await runTest1(iterations);
  const test1Pass = test1Result.failures.length === 0;
  console.log(`Iterations run: ${test1Result.iterations}`);
  console.log(`Failures: ${test1Result.failures.length}`);
  if (!test1Pass) {
    for (const f of test1Result.failures) console.log(`  FAIL: ${f}`);
  }
  console.log(test1Pass ? 'PASS' : 'FAIL');

  console.log(`\n=== Test 2: different pairs do not serialize ===`);
  const test2Result = await runTest2();
  console.log(JSON.stringify(test2Result, null, 2));
  const test2Pass = test2Result.bothSucceeded && test2Result.fastEnough;
  console.log(test2Pass ? 'PASS' : 'FAIL');

  console.log(`\n=== Test 3: insufficient balance under concurrency ===`);
  const test3Result = await runTest3();
  console.log(JSON.stringify(test3Result, null, 2));
  const test3Pass =
    test3Result.exactlyOneSucceeded &&
    test3Result.exactlyOneInsufficientFunds &&
    test3Result.balanceNeverNegative &&
    test3Result.balanceCorrect;
  console.log(test3Pass ? 'PASS' : 'FAIL');

  console.log(`\n=== Summary ===`);
  console.log(`Test 1 (same-pair dedup, ${iterations} iterations): ${test1Pass ? 'PASS' : 'FAIL'}`);
  console.log(`Test 2 (different pairs don't serialize): ${test2Pass ? 'PASS' : 'FAIL'}`);
  console.log(`Test 3 (insufficient balance race): ${test3Pass ? 'PASS' : 'FAIL'}`);

  if (!test1Pass || !test2Pass || !test3Pass) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Test script crashed:', e);
  process.exit(1);
});
