import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';
import { notifyBothOfMediaRejection } from '@/lib/notifications';

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

    const { action, reason } = await req.json();
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    const admin = getAdmin();
    // No rejection_reason column exists on submissions -- the reason an
    // admin types is preserved in the audit log's metadata instead (see
    // logAuditAction below), not on the row itself.
    const { data: submission, error } = await admin
      .from('submissions')
      .update({
        moderation_status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('match_id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuditAction(
      supabase,
      adminEmail,
      `${action}_submission`,
      id,
      action === 'reject' ? { reason: reason ?? null } : undefined
    );

    if (action === 'reject' && submission?.match_id) {
      try {
        const { data: match } = await admin
          .from('matches')
          .select('user1_id, user2_id')
          .eq('id', submission.match_id)
          .single();
        if (match) {
          await notifyBothOfMediaRejection(admin, match.user1_id, match.user2_id, submission.match_id);
        }
      } catch {
        // Safe catch for notification failure
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
