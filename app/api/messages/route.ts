import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { connection_id, content } = body;

    if (!connection_id || !content) {
      return NextResponse.json({ error: 'connection_id and content are required' }, { status: 400 });
    }

    return NextResponse.json({
      id: 'mock-msg-id-' + Date.now(),
      connection_id,
      content,
      sender_id: 'mock-user-id',
      created_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
