// /app/api/webpush/subscribe/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await req.json().catch(() => null);
    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription body' }, { status: 400 });
    }

    // Upsert subscription for current user
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: session.user.id,
        subscription,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in /api/webpush/subscribe:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
