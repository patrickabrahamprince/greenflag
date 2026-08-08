import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';
import { getGiftType } from '@/lib/gift-types';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// No match required -- a gift is a lighter, no-commitment way to express
// interest than the 500-coin "Meet Her Standard" like, sendable to any
// profile from Discover. Coins are deducted before the ledger row is
// inserted (deduct_coins is the atomic balance-check+deduct), so a failed
// insert refunds via add_coins rather than leaving her uncharged-for coins
// gone -- same pattern as special-send's refund path.
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { toUserId, giftType: giftTypeId } = await req.json().catch(() => ({}));
  if (!toUserId || typeof toUserId !== 'string') {
    return NextResponse.json({ error: 'toUserId is required' }, { status: 400 });
  }
  if (toUserId === user.id) {
    return NextResponse.json({ error: 'Cannot gift yourself' }, { status: 400 });
  }

  const giftType = getGiftType(giftTypeId);
  if (!giftType) {
    return NextResponse.json({ error: 'Unknown gift type' }, { status: 400 });
  }

  const admin = getAdmin();

  const deductResult = await admin.rpc('deduct_coins', {
    p_user_id: user.id,
    p_amount: giftType.cost,
    p_description: `Gift: ${giftType.label}`,
    p_metadata: { to_user_id: toUserId, gift_type: giftType.id },
  });
  const deductData = deductResult.data as { success?: boolean } | null;
  if (deductResult.error || !deductData?.success) {
    return NextResponse.json({ error: 'INSUFFICIENT_COINS', coins_needed: giftType.cost }, { status: 402 });
  }

  const { error: insertErr } = await admin.from('gifts').insert({
    from_user_id: user.id,
    to_user_id: toUserId,
    gift_type: giftType.id,
    cost: giftType.cost,
  });

  if (insertErr) {
    await admin.rpc('add_coins', {
      p_user_id: user.id,
      p_amount: giftType.cost,
      p_description: 'Refund: gift failed to save',
      p_metadata: { to_user_id: toUserId, gift_type: giftType.id },
    });
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  try {
    const { data: fromProfile } = await admin.from('profiles').select('name').eq('id', user.id).single();
    await sendNotification({
      supabase: admin,
      user_id: toUserId,
      title: 'You Received a Gift',
      body: `${fromProfile?.name || 'Someone'} sent you a ${giftType.emoji} ${giftType.label}.`,
      data: { type: 'gift', from_user_id: user.id, gift_type: giftType.id },
    });
  } catch {
    // Safe catch for notification failure -- the gift itself already
    // succeeded and shouldn't be rolled back over a notification hiccup.
  }

  return NextResponse.json({ success: true, cost: giftType.cost });
}
