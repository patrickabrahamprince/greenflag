import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Mirrors SUBMIT_COST in submit-task/route.ts and SPECIAL_SEND_COST in
// special-send/route.ts -- a separate local constant per route, same
// convention as those two, since no response echoes the amount charged
// and the client needs its own copy for the "X coins" messaging.
const RETRY_COST = 100;

// His action once retry_unlocked_at is set (either she nudged him, or she
// accepted the 24h auto-prompt). Pays coins, deletes the rejected
// submission so the normal submit-task flow treats that task as fresh
// again, and resets the match back to pending_submission with a new 48h
// submit window -- without a fresh submit_deadline, the very next
// sweep_expired_matches run (every 15 min) would see a stale/past deadline
// on a 'pending_submission' row and immediately expire it right back out.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdmin();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, status, retry_unlocked_at, retry_decision, rejected_submission_id')
      .eq('id', id)
      .maybeSingle();
    if (matchErr || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.user1_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (match.status !== 'rejected' || !match.retry_unlocked_at || match.retry_decision !== 'accepted') {
      return NextResponse.json({ error: 'Retry is not available for this match' }, { status: 400 });
    }

    const { data: deductResult } = await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: RETRY_COST,
      p_description: 'Retry after rejection',
      p_metadata: { match_id: id },
    });
    if (!deductResult?.success) {
      return NextResponse.json({ error: 'INSUFFICIENT_COINS', coins_needed: RETRY_COST }, { status: 402 });
    }

    if (match.rejected_submission_id) {
      await admin.from('submissions').delete().eq('id', match.rejected_submission_id);
    }

    const { error: updateErr } = await admin.from('matches').update({
      status: 'pending_submission',
      next_day_unlocks_at: null,
      submit_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      rejection_reason: null,
      rejected_at: null,
      rejected_submission_id: null,
      retry_unlocked_at: null,
      retry_decision: null,
      retry_prompt_sent_at: null,
    }).eq('id', id);

    if (updateErr) {
      // Payment already went through -- refund it, since the match was
      // never actually reset.
      await admin.rpc('add_coins', {
        p_user_id: user.id,
        p_amount: RETRY_COST,
        p_description: 'Refund: retry failed to save',
        p_metadata: { match_id: id },
      });
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    await admin.from('funnel_events').insert({ match_id: id, event_type: 'retried' });

    return NextResponse.json({ success: true, status: 'pending_submission' });
  } catch (e) {
    console.error('retry error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
