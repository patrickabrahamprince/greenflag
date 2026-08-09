import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notifyNewMessage } from '@/lib/notifications';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { match_id, content } = await req.json();

    if (!match_id || !content?.trim()) {
      return NextResponse.json({ error: 'match_id and content are required' }, { status: 400 });
    }

    const { data: match } = await supabase
      .from('matches')
      .select('user1_id, user2_id, chat_unlocked')
      .eq('id', match_id)
      .single() as { data: { user1_id: string; user2_id: string; chat_unlocked: boolean } | null };

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.user1_id !== user.id && match.user2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!match.chat_unlocked) {
      return NextResponse.json({ error: 'Chat is not unlocked yet' }, { status: 403 });
    }

    const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    const { data: blocked } = await supabase
      .from('blocked_pairs')
      .select('host_id')
      .or(`and(host_id.eq.${user.id},guest_id.eq.${otherUserId}),and(host_id.eq.${otherUserId},guest_id.eq.${user.id})`)
      .limit(1)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ error: 'Cannot message this user' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      // Sending someone else's notification row requires the admin client
      // -- notifications RLS only lets a user insert their own (see
      // migration tightening notifications INSERT), and this is
      // inherently notifying the OTHER match participant, not the caller.
      const admin = getAdmin();
      const recipientId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      await notifyNewMessage(admin, recipientId, senderProfile?.name || 'Someone', match_id, content.trim());
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
