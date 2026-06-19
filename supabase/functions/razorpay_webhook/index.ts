import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!;

serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature')!;
  const expected = createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');

  if (signature !== expected) return new Response('invalid', { status: 400 });

  const event = JSON.parse(body);
  if (event.event !== 'payment.captured') return new Response('ignored');

  const payment = event.payload.payment.entity;
  const user_id = payment.notes.user_id;
  const amount_inr = payment.amount / 100;
  const coin_map: Record<number, number> = { 29: 10, 99: 40, 299: 150 };
  const coins = coin_map[amount_inr] || Math.floor(amount_inr / 3);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase.rpc('add_coins', {
    p_user_id: user_id,
    p_amount: coins,
    p_description: `Purchased ${coins} coins`,
    p_metadata: { razorpay_payment_id: payment.id },
  });

  return new Response('ok');
});
