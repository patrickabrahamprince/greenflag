import { NextResponse } from 'next/server';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';
import {
  notifyWomanOfMediaReady,
  notifyBothOfMediaRejection,
} from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminEmail } = auth.data;

    const { action, reason } = await req.json();
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('submissions')
      .update({
        moderation_status: newStatus,
        approved: action === 'approve',
      })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: submission } = await supabase
      .from('submissions')
      .select('connection_id, day_number')
      .eq('id', id)
      .maybeSingle();

    if (submission) {
      const { data: connection } = await supabase
        .from('connections')
        .select('guest_id, host_id')
        .eq('id', submission.connection_id)
        .maybeSingle();

      if (connection) {
        if (action === 'approve') {
          const { data: guestProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', connection.guest_id)
            .maybeSingle();

          await notifyWomanOfMediaReady(
            supabase,
            connection.host_id,
            guestProfile?.name || 'Someone',
            submission.day_number,
            submission.connection_id
          );

          await supabase.rpc('advance_day_if_complete', {
            p_connection_id: submission.connection_id,
          });
        } else {
          await notifyBothOfMediaRejection(
            supabase,
            connection.guest_id,
            connection.host_id,
            submission.connection_id
          );
        }
      }
    }

    await logAuditAction(supabase, adminEmail, `${action}_submission`, id);

    return NextResponse.json({ success: true, submission_id: id, status: newStatus });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
