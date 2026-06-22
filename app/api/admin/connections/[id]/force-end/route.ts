import { NextResponse } from 'next/server';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminEmail } = auth.data;

    const { reason } = await req.json();
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('connections')
      .update({
        status: 'ended',
        completed_at: new Date().toISOString(),
        ended_reason: reason.trim(),
      })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: conn } = await supabase
      .from('connections')
      .select('guest_id, host_id')
      .eq('id', id)
      .maybeSingle();

    if (conn) {
      const endPayload = {
        title: 'Connection ended',
        body: 'Connection ended by administrator.',
        data: { connectionId: id, type: 'force_end' },
      };
      await sendNotification({ supabase, user_id: conn.guest_id, ...endPayload });
      await sendNotification({ supabase, user_id: conn.host_id, ...endPayload });
    }

    await logAuditAction(supabase, adminEmail, 'force_end_connection', id);

    return NextResponse.json({ success: true, connection_id: id, status: 'ended' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
