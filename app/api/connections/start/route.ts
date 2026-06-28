import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { notifyWomanOfStandardBegin } from '@/lib/notifications';

const BEGIN_COST = 100;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { woman_id } = await req.json();
    if (!woman_id) {
      return NextResponse.json({ error: 'woman_id is required' }, { status: 400 });
    }

    if (user.id === woman_id) {
      return NextResponse.json({ error: 'Cannot begin your own standard' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: viewer } = await admin
      .from('profiles')
      .select('persona, name')
      .eq('id', user.id)
      .single();

    if (viewer?.persona !== 'man') {
      return NextResponse.json({ error: 'Only men can begin standards' }, { status: 403 });
    }

    const { data: blocked } = await admin
      .from('blocked_pairs')
      .select('host_id')
      .or(
        `and(host_id.eq.${user.id},guest_id.eq.${woman_id}),and(host_id.eq.${woman_id},guest_id.eq.${user.id})`
      )
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ error: 'Cannot connect with blocked user' }, { status: 403 });
    }

    const { data: wallet } = await admin
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if ((wallet?.balance ?? 0) < BEGIN_COST) {
      return NextResponse.json({ error: 'insufficient_funds' }, { status: 402 });
    }

    const { data: existing } = await admin
      .from('connections')
      .select('id')
      .eq('guest_id', user.id)
      .eq('host_id', woman_id)
      .in('status', ['pending', 'tasks_submitted', 'approved', 'chat_unlocked'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already connected' }, { status: 409 });
    }

    const { data: manProfile } = await admin
      .from('profiles')
      .select('elo_score')
      .eq('id', user.id)
      .maybeSingle();

    const { data: standard } = await admin
      .from('standards')
      .select('required_interests, values, deal_breakers')
      .eq('woman_id', user.id)
      .maybeSingle();

    let matchData = null;

    if (standard) {
      const { data: women } = await admin.rpc('get_ranked_women', {
        man_interests: standard.required_interests || [],
        man_values: standard.values || [],
        man_dealbreakers: standard.deal_breakers || [],
        man_elo: manProfile?.elo_score || 1000,
        man_id: user.id,
      });

      const woman = (women ?? []).find((w: { id: string }) => w.id === woman_id);
      if (!woman) {
        return NextResponse.json({ error: 'Woman not available' }, { status: 410 });
      }

      matchData = {
        match_percentage: woman.match_percentage,
        match_reasons: woman.match_reasons,
      };
    }

    const { data: deductData, error: deductErr } = await admin.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: BEGIN_COST,
      p_description: 'Begin standard',
    });

    const deductResult = deductData as { success?: boolean; error?: string } | null;

    if (deductErr || !deductResult?.success) {
      return NextResponse.json({
        error: deductResult?.error || 'Failed to deduct coins',
      }, { status: deductResult?.error === 'insufficient_funds' ? 402 : 500 });
    }

    const { data: standardRef } = await admin
      .from('standards')
      .select('id')
      .eq('woman_id', woman_id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    const { data: connection, error: connErr } = await admin
      .from('connections')
      .insert({
        guest_id: user.id,
        host_id: woman_id,
        standard_id: standardRef?.id ?? null,
        current_day: 1,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ...(matchData ? { match_percentage: matchData.match_percentage, match_reasons: matchData.match_reasons } : {}),
      })
      .select('id')
      .single();

    if (connErr || !connection) {
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    const { error: subErr } = await admin
      .from('submissions')
      .insert({
        connection_id: connection.id,
        day: 1,
        day_number: 1,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    if (subErr) {
      console.error('Failed to create submission record:', subErr);
    }

    await notifyWomanOfStandardBegin(admin, woman_id, viewer?.name ?? 'Someone', connection.id);

    return NextResponse.json({ connectionId: connection.id });
  } catch (e) {
    console.error('connections/start error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
