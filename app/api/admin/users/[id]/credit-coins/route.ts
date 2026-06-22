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

    const { amount, description } = await req.json();
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const { data: result, error } = await supabase.rpc('add_coins', {
      p_user_id: id,
      p_amount: amount,
      p_description: description || 'Admin credit',
      p_metadata: JSON.stringify({ admin_email: adminEmail }),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuditAction(supabase, adminEmail, 'credit_coins', id);

    return NextResponse.json({ success: true, result });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
