// /lib/supabase/chat.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Message } from '@/types/chat';

export const getSupabaseClient = () => {
  return createClientComponentClient();
};

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as Message[]) || [];
}

export async function sendMessage(
  conversationId: string,
  content: string | null,
  type: 'text' | 'audio',
  audioUrl: string | null = null
): Promise<Message> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      type,
      audio_url: audioUrl,
    })
    .select()
    .single();

  if (error) throw error;

  // Retrieve recipient detail and sender profile to create message notification
  try {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (conversation) {
      const otherUserId =
        conversation.user1_id === user.id
          ? conversation.user2_id
          : conversation.user1_id;

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const senderName = senderProfile?.name || 'Someone';
      const notificationBody = type === 'text' ? (content || '').slice(0, 50) : 'Sent a voice note';

      // Call the RPC function directly on client side to insert notification
      await supabase.rpc('create_notification', {
        p_user_id: otherUserId,
        p_type: 'message',
        p_title: `New message from ${senderName}`,
        p_body: notificationBody,
        p_link: `/chat/${conversationId}`,
        p_metadata: { conversationId, messageId: data.id },
      });
    }
  } catch (notifyErr) {
    console.error('Failed to trigger message notification:', notifyErr);
  }

  return data as Message;
}

export async function markAsRead(conversationId: string, currentUserId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', currentUserId)
    .is('read_at', null);

  if (error) console.error('Error marking messages as read:', error);
}

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
): () => void {
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
