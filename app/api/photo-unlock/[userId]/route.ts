import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PHOTO_UNLOCK_COST } from '@/lib/coin-costs';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Standalone purchase: 100 coins reveals a woman's blurred extra Discover
// photos, permanently, for this viewer. Deliberately unrelated to Meet Her
// Standard (500 coins, begins the 3-day flow) -- a man can unlock her
// photos without ever starting her Standard, and vice versa.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.id === userId) {
    return NextResponse.json({ error: 'Cannot unlock your own photos' }, { status: 400 });
  }

  const admin = getAdmin();

  const { data: existing } = await admin
    .from('photo_unlocks')
    .select('viewer_id')
    .eq('viewer_id', user.id)
    .eq('target_id', userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, alreadyUnlocked: true });
  }

  const deductResult = await admin.rpc('deduct_coins', {
    p_user_id: user.id,
    p_amount: PHOTO_UNLOCK_COST,
    p_description: 'Photo unlock',
    p_metadata: { target_id: userId },
  });
  const deductData = deductResult.data as { success?: boolean } | null;
  if (deductResult.error || !deductData?.success) {
    return NextResponse.json({ error: 'INSUFFICIENT_COINS', coins_needed: PHOTO_UNLOCK_COST }, { status: 402 });
  }

  const { error: insertErr } = await admin
    .from('photo_unlocks')
    .insert({ viewer_id: user.id, target_id: userId });

  if (insertErr) {
    await admin.rpc('add_coins', {
      p_user_id: user.id,
      p_amount: PHOTO_UNLOCK_COST,
      p_description: 'Refund: photo unlock failed to save',
      p_metadata: { target_id: userId },
    });
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, cost: PHOTO_UNLOCK_COST });
}
