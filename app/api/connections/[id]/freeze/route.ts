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

    const { data: rpcData, error: freezeErr } = await supabase.rpc(
      'freeze_connection' as never,
      { p_connection_id: id } as never
    );
    const result = rpcData as {
      success?: boolean;
      error?: string;
      coins_needed?: number;
      frozen_until?: string;
    } | null;

    if (freezeErr) {
      return NextResponse.json({ error: freezeErr.message }, { status: 400 });
    }

    if (!result?.success) {
      const status = result?.error === 'insufficient_funds' ? 402 : 400;
      return NextResponse.json(
        { error: result?.error || 'freeze_failed', coins_needed: result?.coins_needed },
        { status }
      );
    }

    const frozenUntil = result.frozen_until;

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
