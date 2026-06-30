import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

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
      .select('id, user1_id, user2_id, current_day, status')
      .eq('id', id)
      .maybeSingle();

    if (matchErr || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.user1_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (match.status === 'completed') {
      return NextResponse.json({ error: 'Match is already complete' }, { status: 400 });
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

    const isText = media_type === 'text';
    const moderationStatus = isText ? 'approved' : 'pending';

    const basePayload: Record<string, unknown> = {
      match_id: id,
      day_number,
      task_number: task_number ?? 1,
      moderation_status: moderationStatus,
      submitted_at: new Date().toISOString(),
      media_type,
      media_url: media_url || null,
      content: isText ? text : null,
    };

    if (existingSub) {
      const { error: updateErr } = await admin
        .from('submissions')
        .update(basePayload)
        .eq('id', existingSub.id);
      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 });
      }
    } else {
      const { error: insertErr } = await admin
        .from('submissions')
        .insert(basePayload);
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 400 });
      }
    }

    let dayAdvanced = false;
    let chatUnlocked = false;

    if (isText) {
      const { error: approveErr } = await admin
        .from('submissions')
        .update({ approved: true, auto_approved: true })
        .eq('match_id', id)
        .eq('day_number', day_number ?? 1)
        .eq('task_number', task_number ?? 1);

      if (!approveErr) {
        const { data: advanceResult } = await admin.rpc('advance_match_day_if_complete', {
          p_match_id: id,
        });
        dayAdvanced = advanceResult?.day_advanced === true;
        chatUnlocked = advanceResult?.chat_unlocked === true;
      }
    }

    await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: SUBMIT_COST,
      p_description: 'Task submission',
      p_metadata: { match_id: id, day_number, task_number },
    });

    return NextResponse.json({ success: true, day_advanced: dayAdvanced, chat_unlocked: chatUnlocked });
  } catch (e) {
    console.error('submit-task error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
