import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminId } = auth.data;

    const body = await req.json().catch(() => ({}));
    const grant = body?.grant !== false;

    if (!grant && id === adminId) {
      return NextResponse.json({ error: 'Cannot revoke your own admin access' }, { status: 400 });
    }

    const { error } = await supabase.rpc('admin_set_admin', {
      p_user_id: id,
      p_grant: grant,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
