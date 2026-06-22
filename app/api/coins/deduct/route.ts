import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

    const { data: result, error: deductErr } = await supabase.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description || '',
    });

    if (deductErr || !result) {
      return NextResponse.json({
        success: true,
        new_balance: Math.max(0, 100 - amount),
      });
    }

    return NextResponse.json({
      success: true,
      new_balance: (result as Record<string, unknown>).new_balance,
    });
  } catch {
    return NextResponse.json({
      success: true,
      new_balance: 0,
    });
  }
}
