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

    const { data: viewer } = await supabase
      .from('profiles')
      .select('persona, name')
      .eq('id', user.id)
      .single();

    if (viewer?.persona !== 'man') {
      return NextResponse.json({ error: 'Only men can begin standards' }, { status: 403 });
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if ((wallet?.balance ?? 0) < BEGIN_COST) {
      return NextResponse.json({ error: 'insufficient_funds' }, { status: 402 });
    }

    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .eq('guest_id', user.id)
      .eq('host_id', woman_id)
      .in('status', ['pending', 'tasks_submitted', 'approved', 'chat_unlocked'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already connected' }, { status: 409 });
    }

    const admin = getAdminClient();

    const { data: manProfile } = await admin
      .from('profiles')
      .select('elo_score')
      .eq('id', user.id)
      .single();

    const { data: standard } = await admin
      .from('standards')
      .select('required_interests, values, deal_breakers')
      .eq('user_id', user.id)
      .single();

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

    const { error: deductErr } = await supabase.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: BEGIN_COST,
      p_description: 'Begin standard',
    });

    if (deductErr) {
      return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
    }

    const { data: standardRef } = await supabase
      .from('standards')
      .select('id')
      .eq('user_id', woman_id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    const { data: connection, error: connErr } = await supabase
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

    const { error: subErr } = await supabase
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

    await notifyWomanOfStandardBegin(supabase, woman_id, viewer?.name ?? 'Someone', connection.id);

    return NextResponse.json({ connectionId: connection.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
