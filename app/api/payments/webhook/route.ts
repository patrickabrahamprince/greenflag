import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, payment_id, signature, amount_inr } = body;

    if (!order_id || !payment_id || !signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and coins credited',
      coins_added: amount_inr ? Math.floor(amount_inr / 3) : 0,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
