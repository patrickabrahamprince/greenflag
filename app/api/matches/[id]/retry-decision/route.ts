import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { notifyManOfRetryUnlocked } from '@/lib/notifications';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Her answer to the 24h auto-prompt (send_retry_decision_prompts sets
// retry_decision='pending' and notifies her) -- accepting mirrors what a
// nudge does (retry_unlocked_at set), denying closes the match for good.
// She never sees this prompt at all if she already nudged earlier, since
// the cron only fires while retry_decision is still NULL.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdmin();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { decision } = await req.json();
    if (decision !== 'accept' && decision !== 'deny') {
      return NextResponse.json({ error: 'decision must be accept or deny' }, { status: 400 });
    }

    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, status, retry_decision')
      .eq('id', id)
      .maybeSingle();
    if (matchErr || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.user2_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (match.status !== 'rejected' || match.retry_decision !== 'pending') {
      return NextResponse.json({ error: 'No retry decision pending for this match' }, { status: 400 });
    }

    if (decision === 'deny') {
      await admin.from('matches').update({ retry_decision: 'denied' }).eq('id', id);
      return NextResponse.json({ success: true, decision: 'denied' });
    }

    await admin.from('matches').update({
      retry_unlocked_at: new Date().toISOString(),
      retry_decision: 'accepted',
    }).eq('id', id);

    try {
      await notifyManOfRetryUnlocked(admin, match.user1_id, id);
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json({ success: true, decision: 'accepted' });
  } catch (e) {
    console.error('retry-decision error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
