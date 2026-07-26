import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

const MAX_CREDIT_AMOUNT = 100_000;

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

    const { amount, description } = await req.json();
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > MAX_CREDIT_AMOUNT) {
      return NextResponse.json({ error: `Valid amount (1-${MAX_CREDIT_AMOUNT}) is required` }, { status: 400 });
    }

    // add_coins() is only callable via the service-role client now --
    // authenticated/anon execute was revoked after it turned out to be
    // directly callable by any logged-in user (not just admins).
    const { data: result, error } = await getAdmin().rpc('add_coins', {
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
