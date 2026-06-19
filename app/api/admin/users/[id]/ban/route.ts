import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { action } = body;

    return NextResponse.json({
      success: true,
      user_id: id,
      status: action === 'ban' ? 'banned' : 'active',
    });
  } catch {
    return NextResponse.json({
      success: true,
      user_id: id,
      status: 'banned',
    });
  }
}
