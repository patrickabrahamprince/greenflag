'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Message, ConnectionData } from '@/components/chat/types';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ConnectedBanner } from '@/components/chat/ConnectedBanner';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { LockedOverlay } from '@/components/chat/LockedOverlay';
import { EmptyChat } from '@/components/chat/EmptyChat';

export default function ChatPage({ params }: { params: { connectionId: string } }) {
  const { connectionId } = params;
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const supabase = createClient();
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const isWoman = user?.persona === 'woman';
  const partnerName = isWoman ? connection?.woman?.name : connection?.man?.name;
  const partnerPhoto = isWoman ? connection?.woman?.photos?.[0] : connection?.man?.photos?.[0];
  const backRoute = isWoman ? '/interested' : '/connections';
  const isLocked = connection ? !connection.chat_unlocked : true;

  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/login'); return; }
      const res = await fetch(`/api/connections/${connectionId}`);
      const data = await res.json();
      if (data.id) setConnection(data);
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });
      setMessages((msgs as Message[]) || []);
      setLoading(false);
    };
    load();
  }, [connectionId, supabase, router]);

  useEffect(() => {
    if (!connectionId || isLocked) return;
    const channel = supabase
      .channel(`messages:${connectionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${connectionId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `connection_id=eq.${connectionId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [connectionId, supabase, isLocked]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId, content: text }),
      });
      const data = await res.json();
      if (data.error) console.error('Send failed:', data.error);
    } catch {
      console.error('Send failed');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F7]">
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col">
        <ChatHeader
          partnerName={partnerName}
          partnerPhoto={partnerPhoto}
          backRoute={backRoute}
          isChatUnlocked={!!connection?.chat_unlocked}
        />
        {connection?.connected && <ConnectedBanner />}
        <div className="flex-1 relative">
          {isLocked && <LockedOverlay backRoute={backRoute} currentDay={connection?.current_day ?? 0} />}
          {messages.length === 0 && !isLocked ? (
            <EmptyChat partnerName={partnerName || ''} onSend={handleSend} />
          ) : (
            <MessageList messages={messages} userId={user?.id} bottomRef={bottomRef} />
          )}
        </div>
        {!isLocked && (
          <MessageInput input={input} onInputChange={setInput} onSend={handleSend} sending={sending} />
        )}
      </div>
    </div>
  );
}
