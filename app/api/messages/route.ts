import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notifyNewMessage } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { connection_id, content } = await req.json();

    if (!connection_id || !content?.trim()) {
      return NextResponse.json({ error: 'connection_id and content are required' }, { status: 400 });
    }

    const { data: connection } = await supabase
      .from('connections')
      .select('guest_id, host_id')
      .eq('id', connection_id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.guest_id !== user.id && connection.host_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        connection_id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      const recipientId = connection.guest_id === user.id ? connection.host_id : connection.guest_id;
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      await notifyNewMessage(
        supabase,
        recipientId,
        senderProfile?.name || 'Someone',
        connection_id,
        content.trim()
      );
    } catch (notifyError) {
      console.error('Failed to send message notification:', notifyError);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
