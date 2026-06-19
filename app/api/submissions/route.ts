import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { connection_id, task_id, proof_url, proof_text } = body;

    if (!connection_id || !task_id) {
      return NextResponse.json({ error: 'connection_id and task_id are required' }, { status: 400 });
    }

    return NextResponse.json({
      id: 'mock-sub-id-' + Date.now(),
      connection_id,
      intention_id: task_id,
      proof_url: proof_url || '',
      proof_text: proof_text || '',
      status: 'submitted',
      created_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
