import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const COIN_PACKS: Record<number, number> = {
  399: 500,
  799: 1200,
  1499: 2500,
};

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(req: Request) {
  try {
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').replace(/\\n/g, '').trim();
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not set');
      return new NextResponse('Server misconfigured', { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return new NextResponse('Missing signature', { status: 400 });
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Webhook signature verification failed');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    if (event !== 'payment.captured') {
      return new NextResponse('ok');
    }

    const payment = body.payload?.payment?.entity;
    if (!payment) {
      return new NextResponse('Missing payment entity', { status: 400 });
    }

    const notes = payment.notes || {};
    const userId = notes.user_id;
    const amountPaid = payment.amount;
    const razorpayPaymentId = payment.id;

    if (!userId) {
      console.error('Missing user_id in payment notes');
      return new NextResponse('Missing user_id', { status: 400 });
    }

    const coins = COIN_PACKS[amountPaid / 100];
    if (!coins) {
      console.error('Invalid amount:', amountPaid);
      return new NextResponse('Invalid amount', { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Idempotency check — prevent duplicate coin credits
    const { data: existing } = await supabase
      .from('coin_transactions')
      .select('id')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .limit(1);

    if (existing && existing.length > 0) {
      return new NextResponse('already processed');
    }

    const { error } = await supabase.rpc('add_coins', {
      p_user_id: userId,
      p_amount: coins,
      p_description: `Purchased ${coins} coins`,
      p_metadata: {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: payment.order_id,
        amount_paid: amountPaid / 100,
      },
    });

    if (error) {
      console.error('add_coins RPC error:', error);
      return new NextResponse('ok');
    }

    return new NextResponse('ok');
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('ok');
  }
}
