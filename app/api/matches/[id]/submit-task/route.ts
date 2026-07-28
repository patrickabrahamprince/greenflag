import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { notifyWomanOfMediaReady } from '@/lib/notifications';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];
const VALID_MEDIA_TYPES = ['text', 'photo', 'voice'];

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

    const rl = checkRateLimit(user.id, 'task_submit', RATE_LIMITS.taskSubmit);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfter) },
      });
    }

    const { task_number, text, media_url, media_type } = await req.json();

    if (!VALID_MEDIA_TYPES.includes(media_type)) {
      return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });
    }

    if (!text && !media_url) {
      return NextResponse.json({ error: 'text or media_url required' }, { status: 400 });
    }

    if (media_type === 'text' && (typeof text !== 'string' || text.trim().length < 10 || text.length > 500)) {
      return NextResponse.json({ error: 'Text must be 10-500 characters' }, { status: 400 });
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

    const { data: standard } = await admin
      .from('standards')
      .select('id')
      .eq('woman_id', match.user2_id)
      .eq('is_active', true)
      .maybeSingle();

    const { data: intention } = standard
      ? await admin
          .from('intentions')
          .select('type')
          .eq('standard_id', standard.id)
          .eq('day_number', day_number ?? 1)
          .eq('task_number', task_number ?? 1)
          .maybeSingle()
      : { data: null };

    if (!intention || intention.type !== media_type) {
      return NextResponse.json({ error: 'This task does not match what she asked for' }, { status: 400 });
    }

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

    // Deduct payment BEFORE creating the submission, not after: deduct_coins
    // takes a row lock (FOR UPDATE) so this is the atomic point that decides
    // who actually pays. Doing it first means a failed/duplicate deduction
    // simply never creates a submission, instead of creating one and then
    // having to notice and unwind a payment that silently didn't happen.
    const { data: deductResult } = await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: SUBMIT_COST,
      p_description: 'Task submission',
      p_metadata: { match_id: id, day_number, task_number },
    });

    if (!deductResult?.success) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_COINS', coins_needed: SUBMIT_COST },
        { status: 402 }
      );
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
      // Payment already went through above -- refund it, since no
      // submission was actually created.
      await admin.rpc('add_coins', {
        p_user_id: user.id,
        p_amount: SUBMIT_COST,
        p_description: 'Refund: task submission failed to save',
        p_metadata: { match_id: id, day_number, task_number },
      });
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    await admin.from('funnel_events').insert({ match_id: id, event_type: 'submitted' });

    const { data: gateResult } = await admin.rpc('recompute_match_gate', { p_match_id: id });

    const { data: updatedMatch } = await admin
      .from('matches')
      .select('review_deadline')
      .eq('id', id)
      .maybeSingle();

    // Only notify once all of today's intentions are actually in -- this
    // used to fire on every single task submission (recompute_match_gate's
    // 'pending_review' status means "at least one unapproved submission
    // exists for today," which is already true after the very first task,
    // not "all three are in"), so she got three separate "ready to review"
    // pings for the same day even though the first two weren't reviewable
    // yet. Count intentions vs. submissions directly instead of trusting
    // that status string for this decision.
    if (standard) {
      const [{ count: totalIntentions }, { count: totalSubmissions }] = await Promise.all([
        admin.from('intentions').select('*', { count: 'exact', head: true }).eq('standard_id', standard.id).eq('day_number', day_number ?? 1),
        admin.from('submissions').select('*', { count: 'exact', head: true }).eq('match_id', id).eq('day_number', day_number ?? 1),
      ]);
      if ((totalIntentions ?? 0) > 0 && (totalSubmissions ?? 0) >= (totalIntentions ?? 0)) {
        try {
          const { data: manProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();
          await notifyWomanOfMediaReady(admin, match.user2_id, manProfile?.name || 'Your match', day_number ?? 1, id);
        } catch {
          // Safe catch for notification failure
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: gateResult?.status ?? 'pending_review',
      review_deadline: updatedMatch?.review_deadline ?? null,
    });
  } catch (e) {
    console.error('submit-task error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
