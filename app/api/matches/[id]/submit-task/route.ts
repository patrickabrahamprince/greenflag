import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { notifyWomanOfMediaReady } from '@/lib/notifications';

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

    const { task_number, text, media_url, media_type } = await req.json();

    if (!text && !media_url) {
      return NextResponse.json({ error: 'text or media_url required' }, { status: 400 });
    }

    const SUBMIT_COST = 10;
    const { data: wallet } = await admin
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if ((wallet?.balance ?? 0) < SUBMIT_COST) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_COINS', coins_needed: SUBMIT_COST },
        { status: 402 }
      );
    }

    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, current_day, status, next_day_unlocks_at')
      .eq('id', id)
      .maybeSingle();

    if (matchErr || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.user1_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (TERMINAL_STATUSES.includes(match.status)) {
      return NextResponse.json({ error: 'Match is no longer active' }, { status: 400 });
    }

    if (match.next_day_unlocks_at && new Date(match.next_day_unlocks_at) > new Date()) {
      return NextResponse.json({ error: 'Tomorrow\'s tasks aren\'t unlocked yet' }, { status: 400 });
    }

    const day_number = match.current_day;

    const { data: existingSub } = await admin
      .from('submissions')
      .select('id, approved')
      .eq('match_id', id)
      .eq('day_number', day_number ?? 1)
      .eq('task_number', task_number ?? 1)
      .maybeSingle();

    if (existingSub && existingSub.approved === true) {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
    }
    if (existingSub && existingSub.approved !== true) {
      return NextResponse.json({ error: 'Already submitted — awaiting her review' }, { status: 400 });
    }

    const basePayload: Record<string, unknown> = {
      match_id: id,
      day_number,
      task_number: task_number ?? 1,
      moderation_status: 'pending',
      submitted_at: new Date().toISOString(),
      media_type,
      media_url: media_url || null,
      content: media_type === 'text' ? text : null,
      approved: false,
      auto_approved: false,
    };

    const { error: insertErr } = await admin.from('submissions').insert(basePayload);
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    await admin.from('funnel_events').insert({ match_id: id, event_type: 'submitted' });

    const { data: gateResult } = await admin.rpc('recompute_match_gate', { p_match_id: id });

    await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: SUBMIT_COST,
      p_description: 'Task submission',
      p_metadata: { match_id: id, day_number, task_number },
    });

    try {
      const { data: manProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();
      await notifyWomanOfMediaReady(admin, match.user2_id, manProfile?.name || 'Your match', day_number ?? 1, id);
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json({ success: true, status: gateResult?.status ?? 'pending_review' });
  } catch (e) {
    console.error('submit-task error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
