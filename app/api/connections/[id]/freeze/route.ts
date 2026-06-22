import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: connection, error: connErr } = await supabase
      .from('connections')
      .select('id, guest_id, host_id, freezes_used, status, current_day')
      .eq('id', id)
      .single();

    if (connErr || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.guest_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (connection.status === 'ended' || connection.status === 'expired' || connection.status === 'rejected') {
      return NextResponse.json({ error: 'Connection is no longer active' }, { status: 400 });
    }

    if (connection.freezes_used >= 1) {
      return NextResponse.json({ error: 'Freeze already used' }, { status: 400 });
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.balance < 300) {
      return NextResponse.json({ error: 'Insufficient coins. Need 300.' }, { status: 400 });
    }

    const { error: deductErr } = await supabase.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: 300,
      p_description: 'Freeze for 24h extension',
      p_metadata: { connection_id: id },
    });

    if (deductErr) {
      return NextResponse.json({ error: deductErr.message }, { status: 400 });
    }

    const now = new Date();
    const frozenUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateErr } = await supabase
      .from('connections')
      .update({
        frozen_until: frozenUntil,
        freezes_used: 1,
      })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    const { data: currentSub } = await supabase
      .from('submissions')
      .select('id, deadline')
      .eq('connection_id', id)
      .eq('day_number', connection.current_day)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentSub) {
      await supabase
        .from('submissions')
        .update({ deadline: frozenUntil })
        .eq('id', currentSub.id);
    }

    await supabase.from('freeze_transactions').insert({
      connection_id: id,
      man_id: user.id,
      coins_paid: 300,
      extended_until: frozenUntil,
    });

    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const guestName = guestProfile?.name || 'Someone';

    await sendNotification({
      supabase,
      user_id: connection.host_id,
      title: 'Freeze used',
      body: `${guestName} used a Freeze. He gets 24 more hours.`,
      data: { connectionId: id, type: 'freeze' },
    });

    return NextResponse.json({
      success: true,
      frozen_until: frozenUntil,
      freezes_used: 1,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
