import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { COIN_PACKAGE_PRICES } from '@/lib/iap-products';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { coins } = await req.json();
    const priceInr = COIN_PACKAGE_PRICES[coins];
    if (!priceInr) {
      return NextResponse.json({ error: `Unknown coin package: ${coins}` }, { status: 400 });
    }

    const order = await createRazorpayOrder(priceInr * 100, {
      user_id: user.id,
      coins: String(coins),
    });

    return NextResponse.json({
      orderId: order.id,
      amountPaise: order.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not start purchase' }, { status: 500 });
  }
}
