import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description } = await req.json();

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    // deduct_coins() is only callable via the service-role client now --
    // authenticated/anon execute was revoked after it turned out any
    // logged-in user could call it against an arbitrary p_user_id, not
    // just their own.
    const { data: result, error: deductErr } = await getAdmin().rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description || '',
    });

    if (deductErr || !result) {
      console.error('deduct_coins RPC error:', deductErr);
      return NextResponse.json({ error: 'Failed to deduct coins', details: deductErr?.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      new_balance: (result as Record<string, unknown>).new_balance,
    });
  } catch (error) {
    console.error('deduct_coins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
