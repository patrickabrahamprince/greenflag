import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyPaymentSignature, fetchRazorpayOrder } from '@/lib/payments/razorpay';

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const order = await fetchRazorpayOrder(razorpay_order_id);
    if (order.notes.user_id !== user.id) {
      return NextResponse.json({ error: 'Order does not belong to this user' }, { status: 403 });
    }

    const coins = Number(order.notes.coins);
    if (!coins || !Number.isFinite(coins)) {
      return NextResponse.json({ error: 'Malformed order' }, { status: 400 });
    }

    const admin = getAdmin();
    const { data: result, error: creditErr } = await admin.rpc('credit_coins_idempotent', {
      p_user_id: user.id,
      p_amount: coins,
      p_description: `Purchased ${coins} coins (Razorpay)`,
      p_razorpay_payment_id: razorpay_payment_id,
    });

    if (creditErr || !result || (result as { success: boolean }).success === false) {
      if (process.env.NODE_ENV === 'development') console.error('credit_coins_idempotent RPC error:', creditErr, result);
      return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      new_balance: (result as { new_balance: number }).new_balance,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
