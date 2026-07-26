import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';
import { sendNotification } from '@/lib/notifications';

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
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminEmail } = auth.data;

    const { reason } = await req.json().catch(() => ({ reason: null }));

    const admin = getAdmin();
    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, status')
      .eq('id', id)
      .maybeSingle();

    if (matchErr || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (TERMINAL_STATUSES.includes(match.status)) {
      return NextResponse.json({ error: 'Match is already resolved' }, { status: 400 });
    }

    const { error } = await admin
      .from('matches')
      .update({ status: 'rejected', next_day_unlocks_at: null, review_deadline: null, submit_deadline: null })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuditAction(supabase, adminEmail, 'end_match', id, { reason: reason ?? null });

    const body = reason
      ? `This connection was ended by moderation: ${reason}`
      : 'This connection was ended by moderation.';

    try {
      await sendNotification({ supabase: admin, user_id: match.user1_id, title: 'Connection Ended', body, data: { connectionId: id, type: 'rejected' } });
      await sendNotification({ supabase: admin, user_id: match.user2_id, title: 'Connection Ended', body, data: { connectionId: id, type: 'rejected' } });
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
