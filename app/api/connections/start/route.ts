import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { test_id } = body;

    if (!test_id) {
      return NextResponse.json({ error: 'test_id is required' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      id: 'mock-conn-id-' + Date.now(),
      test_id,
      status: 'active',
      expires_at: expiresAt,
      tasks_completed: 0,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
