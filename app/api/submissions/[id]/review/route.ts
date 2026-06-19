import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      submission_id: id,
      status: action === 'approve' ? 'approved' : 'rejected',
      reason: reason || '',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
