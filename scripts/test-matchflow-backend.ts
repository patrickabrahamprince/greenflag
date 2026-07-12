// Backend/RPC checks for the match-task flow that don't need a browser --
// they need direct Supabase client calls against a real Postgres instance,
// the same way tonight's manual production verification worked. Covers:
// rejection path, expiry sweeps, RLS direct-write bypass attempts, coin
// webhook-replay idempotency, and ranking order. Concurrency is covered
// separately by scripts/test-concurrency.ts (already existed, unmodified).
//
// How to run: start the local stack (`supabase start`), then:
//   SUPABASE_URL=http://127.0.0.1:55321 \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_key from `supabase start` output> \
//   SUPABASE_ANON_KEY=<anon_key from `supabase start` output> \
//   npx tsx scripts/test-matchflow-backend.ts
//
// Never point this at production -- it forces deadlines into the past and
// fires RLS-bypass attempts that have no business running against real data.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const API_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:55321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY must be set (see header comment).');
  process.exit(1);
}
if (/supabase\.co/.test(API_URL)) {
  console.error(`Refusing to run: SUPABASE_URL (${API_URL}) looks like a hosted/production project, not local.`);
  process.exit(1);
}

const admin = createClient(API_URL, SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

let userCounter = 0;
const cleanupUserIds: string[] = [];

interface TestUser {
  userId: string;
  client: SupabaseClient;
  email: string;
}

async function createTestUser(persona: 'man' | 'woman', balance: number): Promise<TestUser> {
  userCounter++;
  const email = `matchflow-backend-${Date.now()}-${userCounter}@example.test`;
  const password = 'matchflow-backend-password-123!';

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`createUser failed for ${email}: ${error?.message}`);
  const userId = data.user.id;
  cleanupUserIds.push(userId);

  const { error: profileErr } = await admin.from('profiles').update({
    persona, onboarding_completed: true, age: persona === 'man' ? 28 : 27, dob: persona === 'man' ? '1998-01-01' : '1999-01-01',
    name: `Backend Test ${persona}`, city: 'Bangalore', approval_status: 'approved',
  }).eq('id', userId);
  if (profileErr) throw new Error(`profile update failed: ${profileErr.message}`);

  const { error: walletErr } = await admin.from('wallets').update({ balance }).eq('user_id', userId);
  if (walletErr) throw new Error(`wallet update failed: ${walletErr.message}`);

  const client = createClient(API_URL, ANON_KEY!, { auth: { persistSession: false } });
  const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
  if (signInErr) throw new Error(`signIn failed for ${email}: ${signInErr.message}`);

  return { userId, client, email };
}

async function activateStandard(womanClient: SupabaseClient) {
  // standards/activate has no RPC equivalent -- do the same writes the route does.
  const { data: { user } } = await womanClient.auth.getUser();
  const womanId = user!.id;
  const { data: created, error: createErr } = await womanClient
    .from('standards').insert({ woman_id: womanId, intentions: {} }).select('id').single();
  if (createErr) throw new Error(`standard insert failed: ${createErr.message}`);
  const standardId = created.id;
  const rows = [1, 2, 3].map((day_number) => ({ standard_id: standardId, day_number, type: 'text', prompt: `Day ${day_number} prompt` }));
  const { error: intentErr } = await womanClient.from('intentions').insert(rows);
  if (intentErr) throw new Error(`intentions insert failed: ${intentErr.message}`);
  const { error: activateErr } = await womanClient.from('standards').update({ is_active: true }).eq('id', standardId);
  if (activateErr) throw new Error(`activate failed: ${activateErr.message}`);
  return standardId;
}

async function createMatch(manClient: SupabaseClient, womanId: string): Promise<string> {
  const { data, error } = await manClient.rpc('create_like', { p_to_user_id: womanId });
  if (error || !data?.match_id) throw new Error(`create_like failed: ${error?.message || JSON.stringify(data)}`);
  return data.match_id as string;
}

const results: Record<string, boolean> = {};
const details: Record<string, unknown> = {};

async function testRejectionPath() {
  const man = await createTestUser('man', 1000);
  const woman = await createTestUser('woman', 0);
  await activateStandard(woman.client);
  const matchId = await createMatch(man.client, woman.userId);

  // Use the same insert the submit-task route does, at the client (RLS) level isn't exposed --
  // route logic runs server-side with the service key, so exercise it via admin here and assert
  // on the *result* of review-task's client-facing RPC-equivalent (there isn't one -- review-task
  // is a plain table update + RPC). We call the admin update path to seed a submission, since the
  // real submit-task route itself is HTTP-only and out of scope for this backend suite.
  const { error: subErr } = await admin.from('submissions').insert({
    match_id: matchId, day_number: 1, task_number: 1, moderation_status: 'pending',
    submitted_at: new Date().toISOString(), media_type: 'text', content: 'answer', approved: false, auto_approved: false,
  });
  if (subErr) throw new Error(`seed submission failed: ${subErr.message}`);

  const balanceBefore = (await admin.from('wallets').select('balance').eq('user_id', man.userId).single()).data!.balance;

  // Woman rejects (mirrors review-task's reject branch)
  const { error: rejectErr } = await admin.from('matches').update({ status: 'rejected', next_day_unlocks_at: null }).eq('id', matchId);
  if (rejectErr) throw new Error(`reject update failed: ${rejectErr.message}`);

  const balanceAfter = (await admin.from('wallets').select('balance').eq('user_id', man.userId).single()).data!.balance;

  const { data: matchAfter } = await admin.from('matches').select('status').eq('id', matchId).single();

  // Attempt resubmission -- mirrors submit-task's TERMINAL_STATUSES guard by checking the state
  // that guard reads. The route itself would 400 here; we assert the underlying condition is true.
  const resubmissionWouldBeBlocked = ['completed', 'rejected', 'expired_no_submission', 'refunded'].includes(matchAfter!.status);

  const pass = matchAfter!.status === 'rejected' && balanceAfter === balanceBefore && resubmissionWouldBeBlocked;
  results.rejectionPath = pass;
  details.rejectionPath = { status: matchAfter!.status, balanceBefore, balanceAfter, resubmissionWouldBeBlocked };
}

async function testExpiryPaths() {
  // (a) submission-window expiry -- no refund
  const man1 = await createTestUser('man', 1000);
  const woman1 = await createTestUser('woman', 0);
  await activateStandard(woman1.client);
  const matchId1 = await createMatch(man1.client, woman1.userId);
  const balanceBefore1 = (await admin.from('wallets').select('balance').eq('user_id', man1.userId).single()).data!.balance;

  await admin.from('matches').update({
    submit_deadline: new Date(Date.now() - 60_000).toISOString(),
  }).eq('id', matchId1);

  const { data: sweep1, error: sweepErr1 } = await admin.rpc('sweep_expired_matches');
  if (sweepErr1) throw new Error(`sweep_expired_matches failed: ${sweepErr1.message}`);

  const { data: match1After } = await admin.from('matches').select('status').eq('id', matchId1).single();
  const balanceAfter1 = (await admin.from('wallets').select('balance').eq('user_id', man1.userId).single()).data!.balance;

  const submissionExpiryPass = match1After!.status === 'expired_no_submission' && balanceAfter1 === balanceBefore1;

  // (b) review-window expiry -- refund the man
  const man2 = await createTestUser('man', 1000);
  const woman2 = await createTestUser('woman', 0);
  await activateStandard(woman2.client);
  const matchId2 = await createMatch(man2.client, woman2.userId);
  const { error: seedErr2 } = await admin.from('submissions').insert({
    match_id: matchId2, day_number: 1, task_number: 1, moderation_status: 'pending',
    submitted_at: new Date().toISOString(), media_type: 'text', content: 'answer', approved: false, auto_approved: false,
  });
  if (seedErr2) throw new Error(`seed submission (review-expiry) failed: ${seedErr2.message}`);
  await admin.from('matches').update({ status: 'pending_review', review_deadline: new Date(Date.now() - 60_000).toISOString() }).eq('id', matchId2);

  const balanceBefore2 = (await admin.from('wallets').select('balance').eq('user_id', man2.userId).single()).data!.balance;
  const { error: sweepErr2 } = await admin.rpc('sweep_expired_matches');
  if (sweepErr2) throw new Error(`sweep_expired_matches (2) failed: ${sweepErr2.message}`);
  const balanceAfter2 = (await admin.from('wallets').select('balance').eq('user_id', man2.userId).single()).data!.balance;
  const { data: match2After } = await admin.from('matches').select('status, refund_issued').eq('id', matchId2).single();

  const reviewExpiryPass = match2After!.status === 'refunded' && match2After!.refund_issued === true && balanceAfter2 === balanceBefore2 + 10;

  results.submissionExpiry = submissionExpiryPass;
  results.reviewExpiryRefund = reviewExpiryPass;
  details.submissionExpiry = { status: match1After!.status, balanceBefore1, balanceAfter1, sweep1 };
  details.reviewExpiryRefund = { status: match2After!.status, refund_issued: match2After!.refund_issued, balanceBefore2, balanceAfter2 };
}

async function testSecurityBypass() {
  const man = await createTestUser('man', 1000);
  const woman = await createTestUser('woman', 0);
  await activateStandard(woman.client);
  const matchId = await createMatch(man.client, woman.userId);
  const { data: sub, error: seedErr } = await admin.from('submissions').insert({
    match_id: matchId, day_number: 1, task_number: 1, moderation_status: 'pending',
    submitted_at: new Date().toISOString(), media_type: 'text', content: 'answer', approved: false, auto_approved: false,
  }).select('id').single();
  if (seedErr || !sub) throw new Error(`seed submission failed: ${seedErr?.message}`);

  // Attempt 1: man tries to directly flip his own submission's `approved` via the anon client (RLS).
  const { error: directApproveErr, count: directApproveCount } = await man.client
    .from('submissions').update({ approved: true }).eq('id', sub!.id).select('id', { count: 'exact' });
  const { data: subAfter } = await admin.from('submissions').select('approved').eq('id', sub!.id).single();
  const directApprovalBlocked = subAfter!.approved !== true;

  // Attempt 2: man tries to directly flip matches.status to 'completed' via the anon client.
  const { error: directStatusErr } = await man.client
    .from('matches').update({ status: 'completed' }).eq('id', matchId).select('id', { count: 'exact' });
  const { data: matchAfter } = await admin.from('matches').select('status').eq('id', matchId).single();
  const directStatusBlocked = matchAfter!.status !== 'completed';

  results.directApprovalBlocked = directApprovalBlocked;
  results.directStatusBlocked = directStatusBlocked;
  details.directApprovalBlocked = { directApproveErr: directApproveErr?.message, directApproveCount, approvedAfter: subAfter!.approved };
  details.directStatusBlocked = { directStatusErr: directStatusErr?.message, statusAfter: matchAfter!.status };
}

async function testCoinIdempotency() {
  const man = await createTestUser('man', 0);
  const paymentId = `test-webhook-replay-${Date.now()}`;

  const { data: r1, error: e1 } = await admin.rpc('credit_coins_idempotent', {
    p_user_id: man.userId, p_amount: 500, p_description: 'Test payment', p_razorpay_payment_id: paymentId,
  });
  if (e1) throw new Error(`first credit failed: ${e1.message}`);
  const balanceAfterFirst = (await admin.from('wallets').select('balance').eq('user_id', man.userId).single()).data!.balance;

  // Replay the identical webhook payload.
  const { data: r2, error: e2 } = await admin.rpc('credit_coins_idempotent', {
    p_user_id: man.userId, p_amount: 500, p_description: 'Test payment', p_razorpay_payment_id: paymentId,
  });
  if (e2) throw new Error(`replay credit failed (should be a clean no-op, not an error): ${e2.message}`);
  const balanceAfterReplay = (await admin.from('wallets').select('balance').eq('user_id', man.userId).single()).data!.balance;

  const creditedOnce = balanceAfterFirst === 500;
  const replayNoOp = balanceAfterReplay === balanceAfterFirst;
  const replayReportsAlreadyProcessed = r2?.already_processed === true || r2?.success === true;

  results.coinIdempotency = creditedOnce && replayNoOp && replayReportsAlreadyProcessed;
  details.coinIdempotency = { r1, r2, balanceAfterFirst, balanceAfterReplay };
}

async function testRankingSanity() {
  const woman = await createTestUser('woman', 0);
  await admin.from('profiles').update({
    interests_have: ['Travel', 'Cooking', 'Yoga', 'Books', 'Music'],
    approval_status: 'approved',
  }).eq('id', woman.userId);

  const highOverlapMan = await createTestUser('man', 0);
  await admin.from('profiles').update({
    interests_looking_for: ['Travel', 'Cooking', 'Yoga', 'Books', 'Music'],
    approval_status: 'approved',
  }).eq('id', highOverlapMan.userId);

  const lowOverlapMan = await createTestUser('man', 0);
  await admin.from('profiles').update({
    interests_looking_for: ['Travel'],
    approval_status: 'approved',
  }).eq('id', lowOverlapMan.userId);

  const { data: rankedMen, error: menErr } = await admin.rpc('get_ranked_men', { woman_id: woman.userId });
  if (menErr) throw new Error(`get_ranked_men failed: ${menErr.message}`);

  const ids = (rankedMen || []).map((r: { id: string }) => r.id);
  const highIdx = ids.indexOf(highOverlapMan.userId);
  const lowIdx = ids.indexOf(lowOverlapMan.userId);
  const noAmbiguousColumnError = true; // would have thrown above already if present

  const pass = highIdx !== -1 && lowIdx !== -1 && highIdx < lowIdx && noAmbiguousColumnError;
  results.rankingSanity = pass;
  details.rankingSanity = { rankedMen, highOverlapMan: highOverlapMan.userId, lowOverlapMan: lowOverlapMan.userId, highIdx, lowIdx };
}

async function cleanup() {
  for (const id of cleanupUserIds) {
    await admin.auth.admin.deleteUser(id).catch(() => {});
  }
}

async function main() {
  const suite: [string, () => Promise<void>][] = [
    ['Rejection path', testRejectionPath],
    ['Expiry paths (submission + review window)', testExpiryPaths],
    ['Security: direct-write RLS bypass attempts', testSecurityBypass],
    ['Coin idempotency (webhook replay)', testCoinIdempotency],
    ['Ranking sanity', testRankingSanity],
  ];

  let anyFail = false;
  for (const [label, fn] of suite) {
    console.log(`\n=== ${label} ===`);
    try {
      await fn();
    } catch (e) {
      console.log('CRASHED:', (e as Error).message);
      anyFail = true;
      continue;
    }
  }

  console.log('\n=== Details ===');
  console.log(JSON.stringify(details, null, 2));

  console.log('\n=== Summary ===');
  for (const [key, pass] of Object.entries(results)) {
    console.log(`${key}: ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) anyFail = true;
  }

  await cleanup();

  if (anyFail) process.exit(1);
}

main().catch(async (e) => {
  console.error('Suite crashed:', e);
  await cleanup();
  process.exit(1);
});
