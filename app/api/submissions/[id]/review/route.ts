import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  notifyManOfDayApproval,
  notifyManOfDay5,
  notifyBothOfCompletion,
  notifyManOfRejection,
} from '@/lib/notifications';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

async function isAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!await isAdmin(supabase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { action, reason } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    const { data: submission, error: subErr } = await supabase
      .from('submissions')
      .select('connection_id, status')
      .eq('id', id)
      .maybeSingle();

    if (subErr || !submission) {
      return NextResponse.json({ success: true });
    }

    const { data: connection, error: connErr } = await supabase
      .from('connections')
      .select('host_id, guest_id, tasks_completed, status')
      .eq('id', submission.connection_id)
      .maybeSingle();

    if (connErr || !connection) {
      return NextResponse.json({ success: true });
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      const { error: updateSubErr } = await supabase
        .from('submissions')
        .update({ status: 'approved', reviewed_at: now })
        .eq('id', id);

      if (updateSubErr) return NextResponse.json({ success: true });

      const newCount = (connection.tasks_completed ?? 0) + 1;

      const { error: updateConnErr } = await supabase
        .from('connections')
        .update({ tasks_completed: newCount })
        .eq('id', submission.connection_id);

      if (updateConnErr) return NextResponse.json({ success: true });

      if (newCount >= 8) {
        await supabase
          .from('connections')
          .update({ status: 'completed', completed_at: now })
          .eq('id', submission.connection_id);

        await notifyBothOfCompletion(
          supabase,
          connection.guest_id,
          connection.host_id,
          submission.connection_id
        );
      } else if (newCount === 5) {
        await supabase.from('messages').insert({
          connection_id: submission.connection_id,
          sender_id: null,
          content: 'Chat unlocked!',
          type: 'system',
        });

        await notifyManOfDay5(
          supabase,
          connection.guest_id,
          submission.connection_id
        );
      } else {
        await notifyManOfDayApproval(
          supabase,
          connection.guest_id,
          newCount,
          submission.connection_id
        );
      }
    } else {
      await supabase
        .from('submissions')
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          reviewed_at: now,
        })
        .eq('id', id);

      await notifyManOfRejection(supabase, connection.guest_id, submission.connection_id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
