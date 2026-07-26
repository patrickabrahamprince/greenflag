import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

const SPECIAL_SEND_COST = 150;
const VALID_TYPES = ['text', 'photo', 'voice'];
const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// One optional bonus send per match per day, on top of the 3 required
// tasks -- no prompt attached, his choice of text/photo/voice. Enforced as
// one-time-per-day by the UNIQUE(match_id, day_number) constraint on
// special_sends, not just by checking here first.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, content, media_url } = await req.json();
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!content && !media_url) {
      return NextResponse.json({ error: 'content or media_url required' }, { status: 400 });
    }

    const admin = getAdmin();

    const { data: match } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, current_day, status')
      .eq('id', id)
      .maybeSingle();
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.user1_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (TERMINAL_STATUSES.includes(match.status)) {
      return NextResponse.json({ error: 'Match is no longer active' }, { status: 400 });
    }

    const deductResult = await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: SPECIAL_SEND_COST,
      p_description: 'Special send',
      p_metadata: { match_id: id, day_number: match.current_day },
    });
    const deductData = deductResult.data as { success?: boolean } | null;
    if (deductResult.error || !deductData?.success) {
      return NextResponse.json({ error: 'INSUFFICIENT_COINS', coins_needed: SPECIAL_SEND_COST }, { status: 402 });
    }

    const { error: insertErr } = await admin.from('special_sends').insert({
      match_id: id,
      day_number: match.current_day,
      type,
      content: type === 'text' ? content : null,
      media_url: media_url || null,
      media_type: type === 'text' ? null : type,
    });

    if (insertErr) {
      await admin.rpc('add_coins', {
        p_user_id: user.id,
        p_amount: SPECIAL_SEND_COST,
        p_description: 'Refund: special send failed to save',
        p_metadata: { match_id: id, day_number: match.current_day },
      });
      const isDuplicate = insertErr.code === '23505';
      return NextResponse.json(
        { error: isDuplicate ? 'Already used your special send for today' : insertErr.message },
        { status: isDuplicate ? 400 : 500 }
      );
    }

    try {
      const { data: manProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();
      await sendNotification({
        supabase: admin,
        user_id: match.user2_id,
        title: 'A Special Note Awaits',
        body: `${manProfile?.name || 'He'} sent you something special — a one-time surprise.`,
        data: { connectionId: id, type: 'special_send' },
      });
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
