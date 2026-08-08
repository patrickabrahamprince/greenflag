import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    const supabaseAdmin = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim(),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\\n/g, '').trim(),
      { auth: { persistSession: false } }
    );

    // Idempotency is enforced at the DB level: credit_coins_idempotent()
    // (see 20261214000000_fix_coin_double_credit.sql) inserts into
    // coin_transactions with razorpay_payment_id set on its own real
    // column, which already has a unique index -- a duplicate throws there
    // before any balance change, and the function catches it and returns
    // already_processed:true instead of erroring. Deliberately not calling
    // add_coins() here: verified directly against production that add_coins
    // writes to coin_transactions but never actually threads
    // razorpay_payment_id into that column, so its existing unique index
    // never caught anything. add_coins() is left untouched since its exact
    // full behavior isn't something we could read back to safely redefine;
    // this is a new, narrow function used only by this webhook path.
    const { data, error } = await supabaseAdmin.rpc('credit_coins_idempotent', {
      p_user_id: userId,
      p_amount: coins,
      p_description: `Purchased ${coins} coins`,
      p_razorpay_payment_id: razorpayPaymentId,
    });

    if (error) {
      console.error('credit_coins_idempotent RPC error:', error);
      return new NextResponse('ok');
    }

    if (data?.already_processed) {
      return new NextResponse('already processed');
    }

    return new NextResponse('ok');
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('ok');
  }
}
