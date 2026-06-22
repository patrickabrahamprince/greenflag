import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const COIN_PACKS: Record<number, { coins: number; priceINR: number }> = {
  399: { coins: 500, priceINR: 399 },
  799: { coins: 1200, priceINR: 799 },
  1499: { coins: 2500, priceINR: 1499 },
};

export async function POST(req: Request) {
  const keyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY || '').replace(/\\n/g, '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').replace(/\\n/g, '').trim();

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = checkRateLimit(user.id, 'coin_purchase', RATE_LIMITS.coinPurchase);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfter) },
      });
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
      key_id: keyId,
      user_name: user.user_metadata?.name || user.email,
      user_email: user.email,
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
