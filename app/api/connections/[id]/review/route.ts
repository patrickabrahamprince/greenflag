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

    const { approve, reason, note } = await req.json();

    const { error } = await supabase.rpc('review_connection', {
      p_connection_id: id,
      p_approve: approve,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Save rejection reason/note to connection
    if (!approve && (reason || note)) {
      await supabase
        .from('connections')
        .update({
          review_reason: reason || null,
          review_note: note || null,
        })
        .eq('id', id);
    }

    // Notify guest of the decision
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
        if (approve) {
          await notifyGuestOfApproval(
            supabase,
            connection.guest_id,
            hostProfile.name || 'Someone',
            id
          );
        } else {
          await notifyGuestOfRejection(
            supabase,
            connection.guest_id,
            hostProfile.name || 'Someone',
            id
          );
        }
      }
    } catch (notifyError) {
      console.error('Failed to send notification:', notifyError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
