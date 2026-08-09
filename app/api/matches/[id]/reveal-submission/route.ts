import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { REVEAL_COST } from '@/lib/coin-costs';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// A submission's content/media is only ever sent to the client in full via
// GET /api/matches/[id] -- once she approves it, the task page blurs it
// client-side by default. This just charges the ephemeral "look again"
// for this one pageview; nothing is persisted, so it re-blurs on the next
// fresh visit (the whole point is the surprise, not a permanent unlock --
// contrast with /api/photo-unlock, which is a permanent purchase).
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

  const { submissionId } = await req.json().catch(() => ({}));
  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
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

  const { data: submission } = await admin
    .from('submissions')
    .select('id')
    .eq('id', submissionId)
    .eq('match_id', id)
    .maybeSingle();
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const deductResult = await admin.rpc('deduct_coins', {
    p_user_id: user.id,
    p_amount: REVEAL_COST,
    p_description: 'Reveal submission',
    p_metadata: { match_id: id, submission_id: submissionId },
  });
  const deductData = deductResult.data as { success?: boolean } | null;
  if (deductResult.error || !deductData?.success) {
    return NextResponse.json({ error: 'INSUFFICIENT_COINS', coins_needed: REVEAL_COST }, { status: 402 });
  }

  return NextResponse.json({ success: true, cost: REVEAL_COST });
}
