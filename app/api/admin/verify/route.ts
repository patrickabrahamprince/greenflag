import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminOpaqueSession, isAdminSupabaseSession } from '@/lib/admin/adminAuth';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('admin_session')?.value;

  if ((await isValidAdminOpaqueSession(sessionToken)) || (await isAdminSupabaseSession())) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json(
    { error: 'Not authenticated' },
    { status: 401 }
  );
}
