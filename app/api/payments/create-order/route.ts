import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const COIN_PACKS: Record<number, { coins: number; priceINR: number }> = {
  99: { coins: 10, priceINR: 99 },
  299: { coins: 40, priceINR: 299 },
  799: { coins: 150, priceINR: 799 },
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pack_price } = await req.json();

    if (!pack_price || typeof pack_price !== 'number' || !COIN_PACKS[pack_price]) {
      return NextResponse.json({ error: 'Invalid pack price' }, { status: 400 });
    }

    const pack = COIN_PACKS[pack_price];

    const order = await razorpay.orders.create({
      amount: pack.priceINR * 100,
      currency: 'INR',
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        coins: pack.coins,
        pack_price: pack.priceINR,
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      user_name: user.user_metadata?.name || user.email,
      user_email: user.email,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
