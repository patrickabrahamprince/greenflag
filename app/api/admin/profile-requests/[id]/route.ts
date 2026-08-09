import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

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
  const { id } = await params;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { supabase, adminId, adminEmail } = auth.data;

  const { action } = await req.json().catch(() => ({}));
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
  }

  const admin = getAdmin();
  const { data: reqRow, error: fetchErr } = await admin
    .from('profile_edit_requests')
    .select('id, user_id, requested_changes, status')
    .eq('id', id)
    .single();

  if (fetchErr || !reqRow) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  if (reqRow.status !== 'pending') {
    return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 });
  }

  if (action === 'approve') {
    const { error: applyErr } = await admin
      .from('profiles')
      .update(reqRow.requested_changes as Record<string, unknown>)
      .eq('id', reqRow.user_id);
    if (applyErr) return NextResponse.json({ error: applyErr.message }, { status: 500 });
  }

  const { error: updateErr } = await admin
    .from('profile_edit_requests')
    .update({ status: action === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq('id', id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  await logAuditAction(supabase, adminEmail, `${action}_profile_edit`, reqRow.user_id);

  return NextResponse.json({ success: true });
}
