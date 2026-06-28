// /app/chat/[conversationId]/page.tsx

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Message, ChatUser } from '@/types/chat';
import { ChatClient } from './ChatClient';

export const dynamic = 'force-dynamic';

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: conversation, error: connError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (connError || !conversation) {
    redirect('/connections');
  }

  // Ensure current user is a participant of the conversation
  const isParticipant =
    conversation.user1_id === session.user.id || conversation.user2_id === session.user.id;

  if (!isParticipant) {
    redirect('/connections');
  }

  const otherUserId =
    conversation.user1_id === session.user.id
      ? conversation.user2_id
      : conversation.user1_id;

  const { data: blocked } = await supabase
    .from('blocked_pairs')
    .select('host_id')
    .or(
      `and(host_id.eq.${session.user.id},guest_id.eq.${otherUserId}),and(host_id.eq.${otherUserId},guest_id.eq.${session.user.id})`
    )
    .maybeSingle();

  if (blocked) {
    redirect('/discover?error=blocked');
  }

  const { data: otherUserProfile } = await supabase
    .from('profiles')
    .select('id, name, persona, photos')
    .eq('id', otherUserId)
    .single();

  const otherUser: ChatUser = {
    id: otherUserId,
    name: otherUserProfile?.name || 'Chat Partner',
    gender: otherUserProfile?.persona || null,
    photos: otherUserProfile?.photos || [],
  };

  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const initialMessages: Message[] = (messagesData as Message[]) || [];

  return (
    <ChatClient
      conversationId={conversationId}
      initialMessages={initialMessages}
      otherUser={otherUser}
      currentUserId={session.user.id}
    />
  );
}
