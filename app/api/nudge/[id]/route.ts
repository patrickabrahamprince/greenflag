import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendNotification } from '@/lib/notifications';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.id === id) {
    return NextResponse.json({ error: 'Cannot nudge yourself' }, { status: 400 });
  }

  const rate = checkRateLimit(`${user.id}:${id}`, 'nudge', RATE_LIMITS.nudge);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'You already nudged this profile recently' }, { status: 429 });
  }

  const admin = getAdmin();
  const { data: fromProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();

  await sendNotification({
    supabase: admin,
    user_id: id,
    title: 'Someone nudged you',
    body: `${fromProfile?.name || 'Someone'} is interested in you — check out their profile!`,
    data: { type: 'nudge', from_user_id: user.id },
  });

  return NextResponse.json({ success: true });
}
