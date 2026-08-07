'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSkeleton } from '@/components/chat/ChatSkeleton';
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
import { useScreenshotTarget } from '@/lib/hooks/useScreenshotGuard';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { hapticTap } from '@/lib/haptics';
import { Loader2 } from 'lucide-react';

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

  const partnerName = connection?.partner?.name;
  const partnerPhoto = connection?.partner?.photos?.[0];
  // Both branches were dead (/interested and /connections never existed as
  // real routes -- leftover host/guest-era naming). This page lives under
  // /messages/, so back should just go to the chat list, same for both
  // personas -- no reason for it to differ here.
  const backRoute = '/messages';
  const isLocked = connection ? !connection.chat_unlocked : true;

  useScreenshotTarget(connection?.partner?.id, 'messages');

  const load = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }
    const res = await fetch(`/api/matches/${connectionId}`);
    const data = await res.json();
    if (data.match) {
      setConnection({
        id: data.match.id,
        status: data.match.status,
        chat_unlocked: data.match.chat_unlocked,
        connected: data.match.status === 'completed' || data.match.chat_unlocked,
        current_day: data.match.current_day,
        partner: data.otherProfile
          ? { id: data.otherProfile.id, name: data.otherProfile.name, photos: data.otherProfile.photos || [] }
          : null,
      });
    }
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', connectionId)
      .order('created_at', { ascending: true });
    setMessages((msgs as Message[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId, supabase, router]);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(load, { edge: 'bottom' });

  useEffect(() => {
    if (!connectionId || isLocked) return;
    const channel = supabase
      .channel(`messages:${connectionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${connectionId}` },
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
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `match_id=eq.${connectionId}` },
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
    hapticTap();
    setSending(true);
    setInput('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: connectionId, content: text }),
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
    return <ChatSkeleton />;
  }

  return (
    <div className="min-h-dvh flex flex-col screen-gradient">
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col">
        <ChatHeader
          partnerName={partnerName}
          partnerPhoto={partnerPhoto}
          backRoute={backRoute}
          isChatUnlocked={!!connection?.chat_unlocked}
        />
        {connection?.connected && <ConnectedBanner />}
        <div
          ref={scrollRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="flex-1 min-h-0 relative overflow-y-auto overscroll-none"
        >
          {isLocked && <LockedOverlay backRoute={backRoute} currentDay={connection?.current_day ?? 0} />}
          {messages.length === 0 && !isLocked ? (
            <EmptyChat partnerName={partnerName || ''} onSend={handleSend} />
          ) : (
            <MessageList messages={messages} userId={user?.id} bottomRef={bottomRef} />
          )}
          {/* Bottom-anchored, not top -- this thread starts scrolled to the
              newest message, so that's where the pull gesture arms and
              where the indicator needs to be visible. */}
          <div
            className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
            style={{ height: pullDistance }}
          >
            <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
          </div>
        </div>
        {!isLocked && (
          <MessageInput input={input} onInputChange={setInput} onSend={handleSend} sending={sending} />
        )}
      </div>
    </div>
  );
}
