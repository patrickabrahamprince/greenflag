import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

serve(async (req) => {
  const { user_id, amount_inr } = await req.json();
  const order = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${KEY_ID}:${KEY_SECRET}`),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount_inr * 100,
      currency: 'INR',
      receipt: `gf_${user_id}_${Date.now()}`,
      notes: { user_id },
    }),
  }).then((r) => r.json());

  return new Response(JSON.stringify({ order_id: order.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
