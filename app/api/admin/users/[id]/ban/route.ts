import { NextResponse } from 'next/server';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';
import { notifyUserOfBan } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminId, adminEmail } = auth.data;

    if (adminId === id) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
    }

    const { reason } = await req.json();
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const { error } = await supabase.rpc('admin_ban_user', {
      p_user_id: id,
      p_reason: reason.trim(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await notifyUserOfBan(supabase, id);
    await logAuditAction(supabase, adminEmail, 'ban_user', id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
