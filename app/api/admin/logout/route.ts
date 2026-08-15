import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('admin_session')?.value;

    if (sessionToken) {
      const supabase = await createServerSupabaseClient();
      await (supabase as any).from('admin_sessions').delete().eq('session_token', sessionToken);
    }
  } catch {
    // Ignore cleanup errors, still clear cookie
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
