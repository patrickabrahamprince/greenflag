import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import type { Database } from '@/types/supabase';

type SubmissionUpdate = Database['public']['Tables']['submissions']['Update'];

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

    if (!task_number || task_number < 1 || task_number > 8) {
      return NextResponse.json({ error: 'task_number must be 1-8' }, { status: 400 });
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

    if (task_number !== connection.current_day) {
      return NextResponse.json({ error: 'Day mismatch' }, { status: 400 });
    }

    const now = new Date();
    const frozenUntil = connection.frozen_until ? new Date(connection.frozen_until) : null;
    const isFrozen = frozenUntil !== null && frozenUntil > now;

    const { data: existingSub } = await supabase
      .from('submissions')
      .select('id, status, deadline')
      .eq('connection_id', id)
      .eq('day_number', task_number)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub && existingSub.status === 'pending_review') {
      return NextResponse.json({ error: 'Already submitted for this day' }, { status: 400 });
    }

    if (existingSub?.deadline && !isFrozen) {
      const deadline = new Date(existingSub.deadline);
      if (deadline < now) {
        return NextResponse.json({ error: 'Deadline has passed' }, { status: 400 });
      }
    }

    const moderationStatus = media_type === 'text' ? 'approved' : 'pending';
    const isText = media_type === 'text';

    const baseUpdate: SubmissionUpdate = {
      status: 'pending_review',
      moderation_status: moderationStatus,
      submitted_at: now.toISOString(),
      media_type,
    };

    const updatePayload: SubmissionUpdate = isText
      ? { ...baseUpdate, proof_text: text }
      : { ...baseUpdate, proof_url: media_url, media_url };

    if (existingSub) {
      const { error: updateErr } = await supabase
        .from('submissions')
        .update(updatePayload)
        .eq('id', existingSub.id);
      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 });
      }
    } else {
      const { error: insertErr } = await supabase
        .from('submissions')
        .insert({
          connection_id: id,
          task_id: '',
          day_number: task_number,
          ...updatePayload,
        });
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 400 });
      }
    }

    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const guestName = guestProfile?.name || 'Someone';
    const reviewDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    await sendNotification({
      supabase,
      user_id: connection.host_id,
      title: 'New submission',
      body: `${guestName} submitted Day ${task_number}. Review within 24h.`,
      data: { connectionId: id, taskNumber: task_number, type: 'submission', reviewDeadline },
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
          .eq('day_number', task_number)
          .order('created_at', { ascending: false })
          .limit(1)
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
              body: `${guestName} submitted a ${media_type} for Day ${task_number}. Needs review.`,
              data: { connectionId: id, submissionId: newSub.id, type: 'moderation' },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
