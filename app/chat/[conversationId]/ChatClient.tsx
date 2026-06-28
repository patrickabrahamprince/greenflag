// /app/chat/[conversationId]/ChatClient.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import type { Message, ChatUser } from '@/types/chat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { markAsRead, subscribeToMessages, getMessages } from '@/lib/supabase/chat';

interface ChatClientProps {
  conversationId: string;
  initialMessages: Message[];
  otherUser: ChatUser;
  currentUserId: string;
}

export function ChatClient({
  conversationId,
  initialMessages,
  otherUser,
  currentUserId,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark all unread messages in this conversation as read on mount
  useEffect(() => {
    markAsRead(conversationId, currentUserId);
  }, [conversationId, currentUserId]);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Mark incoming messages from the partner as read immediately
      if (newMsg.sender_id !== currentUserId) {
        markAsRead(conversationId, currentUserId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, currentUserId]);

  // Automatically scroll to bottom on message list updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#FAF9F7] text-[#1A1A1A]">
      <ChatHeader otherUser={otherUser} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-[#1A1A1A]/40 font-mono">
            No messages yet. Send a message to start chatting!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <ChatInput conversationId={conversationId} />
    </div>
  );
}
