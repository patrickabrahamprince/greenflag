import { NextResponse } from 'next/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    success: true,
    submission_id: id,
    status: 'approved',
    reviewed_by: 'admin',
  });
}
