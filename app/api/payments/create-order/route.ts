import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount_inr } = body;

    if (!amount_inr || typeof amount_inr !== 'number') {
      return NextResponse.json({ error: 'amount_inr is required' }, { status: 400 });
    }

    return NextResponse.json({
      order_id: 'order_mock' + Date.now(),
      amount: amount_inr * 100,
      currency: 'INR',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
