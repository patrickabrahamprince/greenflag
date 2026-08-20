import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminOpaqueSession, isAdminSupabaseSession } from '@/lib/admin/adminAuth';

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get('admin_session')?.value;

  if (await isValidAdminOpaqueSession(sessionToken)) {
    // Refresh the session cookie (extend expiry by 30 more days)
    const response = NextResponse.json({ success: true });
    const thirtyDaysInSeconds = 60 * 60 * 24 * 30;

    response.cookies.set('admin_session', sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: thirtyDaysInSeconds,
      path: '/',
    });

    return response;
  }

  // A Supabase-session-based admin has nothing opaque to refresh here --
  // Supabase's own session refresh is handled by the SSR client/middleware.
  if (await isAdminSupabaseSession()) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: 'Not authenticated' },
    { status: 401 }
  );
}
