import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

const REPEAT_NUDGE_COST = 50;

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// First nudge on a given profile is free. Nudging the same profile again
// costs coins -- one of the handful of paid actions on a woman's side of
// the app (alongside reveal-submission and special-send/reveal) --
// but that charge is never silent: a repeat nudge without `confirm: true`
// returns needsConfirm instead of charging, so the client can ask first.
export async function POST(
  req: Request,
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

  const body = await req.json().catch(() => ({}));
  const confirmed = body?.confirm === true;

  const admin = getAdmin();

  const { count: priorNudges } = await admin
    .from('nudges')
    .select('*', { count: 'exact', head: true })
    .eq('from_user_id', user.id)
    .eq('to_user_id', id);

  const isRepeat = (priorNudges || 0) > 0;

  if (isRepeat && !confirmed) {
    return NextResponse.json({ needsConfirm: true, cost: REPEAT_NUDGE_COST });
  }

  if (isRepeat) {
    const deductResult = await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: REPEAT_NUDGE_COST,
      p_description: 'Repeat nudge',
      p_metadata: { to_user_id: id },
    });
    const deductData = deductResult.data as { success?: boolean } | null;
    if (deductResult.error || !deductData?.success) {
      return NextResponse.json({ error: 'Not enough coins to nudge again' }, { status: 402 });
    }
  }

  const { error: insertErr } = await admin.from('nudges').insert({
    from_user_id: user.id,
    to_user_id: id,
    charged: isRepeat,
  });
  if (insertErr) {
    if (isRepeat) {
      await admin.rpc('add_coins', {
        p_user_id: user.id,
        p_amount: REPEAT_NUDGE_COST,
        p_description: 'Refund: nudge failed to save',
        p_metadata: { to_user_id: id },
      });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const { data: fromProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();

  await sendNotification({
    supabase: admin,
    user_id: id,
    title: 'Someone Nudged You',
    body: `${fromProfile?.name || 'Someone'} nudged you — take a look at their profile.`,
    data: { type: 'nudge', from_user_id: user.id },
  });

  return NextResponse.json({ success: true, charged: isRepeat, cost: isRepeat ? REPEAT_NUDGE_COST : 0 });
}
