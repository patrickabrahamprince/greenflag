import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversation_id, content } = await req.json();

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json({ error: 'conversation_id and content are required' }, { status: 400 });
    }

    const { data: conversation } = await supabase
      .from('conversations' as any)
      .select('user1_id, user2_id')
      .eq('id', conversation_id)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('messages' as any)
      .insert({
        conversation_id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      const recipientId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      await supabase.rpc('create_notification', {
        p_user_id: recipientId,
        p_type: 'message',
        p_title: senderProfile?.name || 'Someone',
        p_body: content.trim().slice(0, 100),
        p_link: `/chat/${conversation_id}`,
        p_metadata: { conversationId: conversation_id }
      });
    } catch {
      // Safe catch for notification failure
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
