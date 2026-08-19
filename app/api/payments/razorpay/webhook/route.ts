import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Backstop for the case where the client's own call to /verify never
// happens (app killed, network dropped, right after Checkout.js
// resolves) -- Razorpay calls this server-to-server independent of the
// client, so a purchase that already reached "captured" on Razorpay's
// side still gets credited even if the device never checks back in.
// credit_coins_idempotent's own unique index on razorpay_payment_id
// means this can safely double-fire against /verify for the same
// payment without double-crediting.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.event !== 'payment.captured') {
    return NextResponse.json({ ok: true, skipped: payload.event });
  }

  const payment = payload.payload?.payment?.entity;
  const coins = Number(payment?.notes?.coins);
  const userId = payment?.notes?.user_id;
  const paymentId = payment?.id;

  if (!coins || !userId || !paymentId) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay webhook: malformed payment.captured payload', payload);
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  const admin = getAdmin();
  const { data: result, error: creditErr } = await admin.rpc('credit_coins_idempotent', {
    p_user_id: userId,
    p_amount: coins,
    p_description: `Purchased ${coins} coins (Razorpay)`,
    p_razorpay_payment_id: paymentId,
  });

  // credit_coins_idempotent can resolve without an RPC-level error but
  // still report failure in its JSON payload (success: false, e.g. no
  // wallets row for this user) -- checking creditErr alone would treat
  // that as success and tell Razorpay not to retry, silently dropping
  // the credit. Same shape of bug already fixed for the /verify route
  // and for credit_coins_idempotent_apple (see
  // supabase/migrations/20270107000000_backlog_audit_fixes.sql).
  if (creditErr || !result || (result as { success: boolean }).success === false) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay webhook credit error:', creditErr, result);
    return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
