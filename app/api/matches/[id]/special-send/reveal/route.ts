import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const REVEAL_COST = 20;

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Same ephemeral "look again" charge as /api/matches/[id]/reveal-submission,
// for the one special send per day. The first view (right after he sends
// it) is free -- GET /api/matches/[id] marks that automatically -- this is
// only for looking again after that.
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

  const admin = getAdmin();

  const { data: match } = await admin
    .from('matches')
    .select('id, user1_id, user2_id')
    .eq('id', id)
    .maybeSingle();
  if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deductResult = await admin.rpc('deduct_coins', {
    p_user_id: user.id,
    p_amount: REVEAL_COST,
    p_description: 'Reveal special send',
    p_metadata: { match_id: id },
  });
  const deductData = deductResult.data as { success?: boolean } | null;
  if (deductResult.error || !deductData?.success) {
    return NextResponse.json({ error: 'Not enough coins to reveal' }, { status: 402 });
  }

  return NextResponse.json({ success: true, cost: REVEAL_COST });
}
