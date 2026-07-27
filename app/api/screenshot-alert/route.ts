import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

const VALID_CONTEXTS = ['task', 'messages', 'profile'];

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Fired by lib/hooks/useScreenshotGuard.ts when the native iOS app detects
// a screenshot (see ios/App/App/ScreenshotDetectorPlugin.swift) while the
// current screen is showing someone else's content. Only reachable from
// the native build in practice -- there's no way to detect a screenshot
// from the web at all.
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { notifyUserId, context } = await req.json();
    if (!notifyUserId || !VALID_CONTEXTS.includes(context)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (notifyUserId === user.id) {
      return NextResponse.json({ success: true });
    }

    const admin = getAdmin();

    // task/messages both imply an existing match between the two people --
    // verify it rather than letting any authenticated user page someone.
    if (context === 'task' || context === 'messages') {
      const { data: match } = await admin
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${notifyUserId}),and(user1_id.eq.${notifyUserId},user2_id.eq.${user.id})`)
        .maybeSingle();
      if (!match) return NextResponse.json({ error: 'No connection with this user' }, { status: 403 });
    }

    const { data: fromProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();

    const bodyByContext: Record<string, string> = {
      task: `${fromProfile?.name || 'Someone'} took a screenshot of your Standard.`,
      messages: `${fromProfile?.name || 'Someone'} took a screenshot of your conversation.`,
      profile: `${fromProfile?.name || 'Someone'} took a screenshot of your profile.`,
    };

    await sendNotification({
      supabase: admin,
      user_id: notifyUserId,
      title: 'Screenshot Detected',
      body: bodyByContext[context],
      data: { type: 'screenshot_alert', context },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
