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

// Lets a woman nudge a man who's mid-Standard (matched, chat not unlocked
// yet) to keep going -- surfaced from the Messages empty state.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.id === userId) {
    return NextResponse.json({ error: 'Cannot hint yourself' }, { status: 400 });
  }

  const rate = checkRateLimit(`${user.id}:${userId}`, 'standardHint', RATE_LIMITS.standardHint);
  if (!rate.allowed) {
    return NextResponse.json({ error: "You've already nudged him recently" }, { status: 429 });
  }

  const admin = getAdmin();

  const { data: match } = await admin
    .from('matches')
    .select('id')
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ error: 'No active connection with this user' }, { status: 404 });
  }

  const { data: fromProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();

  // Whether he's ever submitted anything for this match decides whether the
  // nudge reads as "start" (nothing submitted yet) or "continue" (already
  // mid-way) -- a woman nudging day-1-silent guy shouldn't hear "continue".
  const { count: submissionCount } = await admin
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', match.id);

  const hasStarted = (submissionCount || 0) > 0;

  await sendNotification({
    supabase: admin,
    user_id: userId,
    title: 'A Nudge',
    body: hasStarted
      ? `${fromProfile?.name || 'She'} wants you to continue her Standard.`
      : `${fromProfile?.name || 'She'} wants you to start her Standard.`,
    data: { type: 'standard_hint', from_user_id: user.id, matchId: match.id },
  });

  return NextResponse.json({ success: true, started: hasStarted });
}
