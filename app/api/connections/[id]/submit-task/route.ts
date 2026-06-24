import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    if (!task_number || task_number < 1) {
      return NextResponse.json({ error: 'task_number must be >= 1' }, { status: 400 });
    }

    if (!text && !media_url) {
      return NextResponse.json({ error: 'text or media_url required' }, { status: 400 });
    }

    const { data: connection, error: connErr } = await supabase
      .from('connections')
      .select('id, guest_id, host_id, current_day, status, frozen_until')
      .eq('id', id)
      .single();

    if (connErr || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.guest_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (connection.status === 'ended' || connection.status === 'expired' || connection.status === 'rejected') {
      return NextResponse.json({ error: 'Connection is no longer active' }, { status: 400 });
    }

    const now = new Date();
    const frozenUntil = connection.frozen_until ? new Date(connection.frozen_until) : null;
    const isFrozen = frozenUntil !== null && frozenUntil > now;

    const day_number = connection.current_day;

    const { data: existingSub } = await supabase
      .from('submissions')
      .select('id, approved, deadline')
      .eq('connection_id', id)
      .eq('day_number', day_number ?? 1)
      .eq('task_number' as any, task_number)
      .maybeSingle();

    if (existingSub && (existingSub as any).status === 'pending_review') {
      return NextResponse.json({ error: 'Already submitted for this task' }, { status: 400 });
    }

    if (existingSub?.deadline && !isFrozen) {
      const deadline = new Date(existingSub.deadline);
      if (deadline < now) {
        return NextResponse.json({ error: 'Deadline has passed' }, { status: 400 });
      }
    }

    const isText = media_type === 'text';
    const moderationStatus = isText ? 'approved' : 'pending';

    const basePayload = {
      connection_id: id,
      day_number,
      task_number,
      status: 'pending_review',
      moderation_status: moderationStatus,
      submitted_at: now.toISOString(),
      media_type,
      deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      ...(isText ? { proof_text: text } : { media_url, proof_url: media_url }),
    };

    if (existingSub) {
      const { error: updateErr } = await supabase
        .from('submissions')
        .update(basePayload as any)
        .eq('id', existingSub.id);
      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 });
      }
    } else {
      const { error: insertErr } = await supabase
        .from('submissions')
        .insert(basePayload as any);
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 400 });
      }
    }

    let dayAdvanced = false;

    // Auto-approve text submissions immediately
    if (isText) {
      const { error: approveErr } = await supabase
        .from('submissions')
        .update({ approved: true } as any)
        .eq('connection_id', id)
        .eq('day_number', day_number ?? 1)
        .eq('task_number' as any, task_number);
      if (!approveErr) {
        const { data: advResult } = await (supabase.rpc as any)('advance_day_if_complete', {
          p_connection_id: id,
        });
        dayAdvanced = advResult === true;
      }
    }

    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const guestName = guestProfile?.name || 'Someone';

    await sendNotification({
      supabase,
      user_id: connection.host_id,
      title: 'New submission',
      body: `${guestName} submitted Day ${day_number} Task ${task_number}.`,
      data: { connectionId: id, taskNumber: task_number, type: 'submission' },
    });

    if (!isText) {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true);

      if (admins && admins.length > 0) {
        const { data: newSub } = await supabase
          .from('submissions')
          .select('id')
          .eq('connection_id', id)
      .eq('day_number', day_number ?? 1)
      .eq('task_number' as any, task_number)
          .maybeSingle();

        if (newSub) {
          await supabase.from('mod_queue').insert({
            submission_id: newSub.id,
            status: 'pending',
          });

          for (const admin of admins) {
            await sendNotification({
              supabase,
              user_id: admin.id,
              title: 'Moderation queue',
              body: `${guestName} submitted a ${media_type} for Day ${day_number}. Needs review.`,
              data: { connectionId: id, submissionId: newSub.id, type: 'moderation' },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, day_advanced: dayAdvanced });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
