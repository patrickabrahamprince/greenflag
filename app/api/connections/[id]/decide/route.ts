import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notifyGuestOfApproval, notifyGuestOfRejection } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { green_flag } = await req.json();
    if (typeof green_flag !== 'boolean') {
      return NextResponse.json({ error: 'green_flag boolean is required' }, { status: 400 });
    }

    const { data: rpcData, error } = await supabase.rpc(
      'decide_connection' as never,
      { p_connection_id: id, p_green_flag: green_flag } as never
    );
    const result = rpcData as { success?: boolean; error?: string; host_decision?: string } | null;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!result?.success) {
      return NextResponse.json({ error: result?.error || 'decision_failed' }, { status: 400 });
    }

    try {
      const { data: connection } = await supabase
        .from('connections')
        .select('guest_id')
        .eq('id', id)
        .single();
      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (connection && hostProfile) {
        if (green_flag) {
          await notifyGuestOfApproval(supabase, connection.guest_id, hostProfile.name || 'Someone', id);
        } else {
          await notifyGuestOfRejection(supabase, connection.guest_id, hostProfile.name || 'Someone', id);
        }
      }
    } catch (notifyError) {
      console.error('Failed to send decision notification:', notifyError);
    }

    return NextResponse.json({ success: true, host_decision: result.host_decision });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
