import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, description } = body;

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      balance: Math.max(0, 100 - amount),
      deducted: amount,
      description: description || '',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
