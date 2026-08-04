import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { notifyManOfRetryUnlocked } from '@/lib/notifications';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Her explicit "give him another chance" from my-connections, before the
// 24h auto-prompt (send_retry_decision_prompts) would have asked her
// anyway -- functionally the same outcome (retry_unlocked_at set,
// retry_decision='accepted'), just earlier and on her initiative instead
// of the system's.
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
      .select('id, user1_id, user2_id, status, retry_decision, retry_unlocked_at')
      .eq('id', id)
      .maybeSingle();
    if (matchErr || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.user2_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (match.status !== 'rejected') {
      return NextResponse.json({ error: 'This match is not in a rejected state' }, { status: 400 });
    }
    if (match.retry_unlocked_at || match.retry_decision === 'denied') {
      return NextResponse.json({ error: 'Retry already decided for this match' }, { status: 400 });
    }

    // Guarded on the retry_decision this request actually observed --
    // the 24h cron (send_retry_decision_prompts) can flip it from NULL to
    // 'pending' concurrently; without this guard, a nudge landing in that
    // same window could get silently clobbered back to 'pending' by the
    // cron's own unconditional per-row UPDATE (see the migration fix for
    // the cron's half of this race).
    let nudgeQuery = admin.from('matches').update({
      retry_unlocked_at: new Date().toISOString(),
      retry_decision: 'accepted',
    }).eq('id', id);
    nudgeQuery = match.retry_decision === null
      ? nudgeQuery.is('retry_decision', null)
      : nudgeQuery.eq('retry_decision', match.retry_decision);
    const { data: nudged } = await nudgeQuery.select('id').maybeSingle();

    if (!nudged) {
      return NextResponse.json({ error: 'This match changed state -- refresh and try again.' }, { status: 409 });
    }

    try {
      await notifyManOfRetryUnlocked(admin, match.user1_id, id);
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('nudge-retry error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
