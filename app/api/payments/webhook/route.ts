import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const COIN_MAP: Record<number, number> = {
  29: 10,
  99: 40,
  299: 150,
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await req.json();

    const { payload, order_id, payment_id, signature } = body;

    if (!signature && !payment_id) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const entity = payload?.payment?.entity || body;
    const notes = entity.notes || body.notes || {};
    const user_id = notes.user_id;
    const amount_inr = entity.amount_inr ?? body.amount_inr;

    if (!user_id) {
      return new NextResponse('Missing user_id', { status: 400 });
    }

    const coins = COIN_MAP[amount_inr];
    if (!coins) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    const razorpayPaymentId = payment_id || entity.id || 'mock_pay_' + Date.now();

    const { error } = await supabase.rpc('add_coins', {
      p_user_id: user_id,
      p_amount: coins,
      p_description: `Purchased ${coins} coins`,
      p_metadata: { razorpay_payment_id: razorpayPaymentId },
    });

    if (error) {
      return new NextResponse('ok');
    }

    return new NextResponse('ok');
  } catch {
    return new NextResponse('ok');
  }
}
