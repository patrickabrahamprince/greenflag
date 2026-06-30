import { NextResponse } from 'next/server';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

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

    const { error } = await supabase.rpc('admin_reject_user', {
      p_user_id: id,
      p_reason: reason.trim(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuditAction(supabase, adminEmail, 'reject_user', id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
