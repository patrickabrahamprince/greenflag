import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { notifyManOfDayApproval, notifyBothOfCompletion, notifyManOfRejection } from '@/lib/notifications';

const REJECT_REASON_MAX_LENGTH = 300;

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];

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

    const { day_number, task_number, decision, reason } = await req.json();
    if (decision !== 'approve' && decision !== 'reject') {
      return NextResponse.json({ error: 'decision must be approve or reject' }, { status: 400 });
    }
    if (decision === 'reject' && (typeof reason !== 'string' || reason.trim().length < 3)) {
      return NextResponse.json({ error: 'A reason is required to reject.' }, { status: 400 });
    }
    const trimmedReason = typeof reason === 'string' ? reason.trim().slice(0, REJECT_REASON_MAX_LENGTH) : null;

    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, current_day, status')
      .eq('id', id)
      .maybeSingle();
    if (matchErr || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.user2_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (TERMINAL_STATUSES.includes(match.status)) {
      return NextResponse.json({ error: 'Match already resolved' }, { status: 400 });
    }

    const { data: submission, error: subErr } = await admin
      .from('submissions')
      .select('id, approved, submitted_at')
      .eq('match_id', id)
      .eq('day_number', day_number ?? match.current_day)
      .eq('task_number', task_number ?? 1)
      .maybeSingle();
    if (subErr || !submission || !submission.submitted_at) {
      return NextResponse.json({ error: 'Nothing submitted for this task yet' }, { status: 404 });
    }
    if (submission.approved === true) {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 });
    }

    if (decision === 'reject') {
      // Guarded on the status this request actually observed -- without
      // it, a reject landing in the same instant sweep_expired_matches
      // sweeps this row (review_deadline just passed -> 'refunded') could
      // silently overwrite the sweep's outcome (or vice versa) with
      // whichever write commits last, leaving contradictory bookkeeping
      // (e.g. coins already refunded, but status now says 'rejected').
      const { data: rejected } = await admin.from('matches').update({
        status: 'rejected',
        next_day_unlocks_at: null,
        rejection_reason: trimmedReason,
        rejected_at: new Date().toISOString(),
        rejected_submission_id: submission.id,
        retry_unlocked_at: null,
        retry_decision: null,
        retry_prompt_sent_at: null,
      }).eq('id', id).eq('status', match.status).select('id').maybeSingle();

      if (!rejected) {
        return NextResponse.json({ error: 'This match changed state -- refresh and try again.' }, { status: 409 });
      }

      await admin.from('funnel_events').insert({ match_id: id, event_type: 'rejected' });
      try {
        await notifyManOfRejection(admin, match.user1_id, id, trimmedReason || undefined);
      } catch {
        // Safe catch for notification failure
      }
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    const { error: approveErr } = await admin
      .from('submissions')
      .update({ approved: true, reviewed_at: new Date().toISOString() })
      .eq('id', submission.id);
    if (approveErr) return NextResponse.json({ error: approveErr.message }, { status: 400 });

    await admin.from('funnel_events').insert({ match_id: id, event_type: 'approved' });

    const { data: gateResult } = await admin.rpc('recompute_match_gate', { p_match_id: id });
    const dayAdvanced = gateResult?.day_advanced === true;
    const chatUnlocked = gateResult?.chat_unlocked === true;

    try {
      if (chatUnlocked) {
        await notifyBothOfCompletion(admin, match.user1_id, match.user2_id, id);
      } else if (dayAdvanced) {
        const { data: womanProfile } = await admin.from('profiles').select('name').eq('id', match.user2_id).single();
        // match.current_day here is still the pre-recompute value -- the day
        // that was just approved -- since we never re-fetched the row.
        await notifyManOfDayApproval(admin, match.user1_id, womanProfile?.name || 'She', match.current_day ?? 1, id);
      }
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json({
      success: true,
      status: gateResult?.status ?? 'pending_submission',
      day_advanced: dayAdvanced,
      chat_unlocked: chatUnlocked,
      next_day_unlocks_at: gateResult?.next_day_unlocks_at ?? null,
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('review-task error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
