import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Refresh the session cookie (extend expiry by 30 more days)
  const response = NextResponse.json({ success: true });
  const thirtyDaysInSeconds = 60 * 60 * 24 * 30;

  response.cookies.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: thirtyDaysInSeconds,
    path: '/',
  });

  return response;
}
