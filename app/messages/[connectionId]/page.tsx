'use client';

import { use, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Lock, Check, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface ConnectionData {
  id: string;
  status: string;
  tasks_completed: number;
  host: { id: string; name: string; photos: string[] };
  guest: { id: string; name: string; photos: string[] };
}

const SUGGESTED_OPENERS = [
  'Hey! Loved your standards',
  'That was such a fun challenge!',
  "Can't believe we matched, hi!",
];

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 animate-fade-in',
          isOwn
            ? 'rounded-br-md'
            : 'rounded-bl-md'
        )}
        style={{
          background: isOwn ? 'rgba(212,175,55,0.08)' : '#161616',
          border: isOwn ? '1px solid rgba(212,175,55,0.2)' : '1px solid #1E1E1E',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: isOwn ? '#EDEADE' : '#FFFFFF' }}>{message.content}</p>
        <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
          <p className="text-[10px] text-muted font-thin">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {isOwn && (
            message.read_at ? (
              <CheckCheck className="w-3.5 h-3.5 text-gold/60" />
            ) : (
              <Check className="w-3.5 h-3.5 text-muted/40" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5" style={{ background: '#161616', border: '1px solid #1E1E1E' }}>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}

function EmptyChat({ partnerName, onSend }: { partnerName: string; onSend: (msg: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
        <span className="text-3xl font-display italic text-gold">GF</span>
      </div>
      <h3 className="text-lg font-display italic text-white mb-1">You&apos;re connected!</h3>
      <p className="text-sm text-muted text-center mb-6 font-thin">
        Say hello to {partnerName}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED_OPENERS.map((opener) => (
          <button
            key={opener}
            onClick={() => onSend(opener)}
            className="btn-secondary text-xs px-4 py-2"
          >
            {opener}
          </button>
        ))}
      </div>
    </div>
  );
}

function LockedOverlay({ backRoute }: { backRoute: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm px-8" style={{ background: 'rgba(8,8,8,0.85)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#111111' }}>
        <Lock className="w-7 h-7 text-gold" />
      </div>
      <h3 className="text-lg font-display italic text-white mb-2">Messages Locked</h3>
      <p className="text-sm text-muted text-center mb-6 font-thin">
        Complete 5 of 8 intentions to unlock messaging.
      </p>
      <button onClick={() => router.push(backRoute)} className="btn-primary">
        Back to Standard
      </button>
    </div>
  );
}

export default function MessagesPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId } = use(params);
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const supabase = createClient();

  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<any>(null);

  const isHost = user?.role === 'host';
  const partnerName = isHost ? connection?.guest?.name : connection?.host?.name;
  const partnerId = isHost ? connection?.guest?.id : connection?.host?.id;
  const backRoute = isHost ? '/interested' : '/connections';

  const isLocked = connection ? !['chat_unlocked', 'completed'].includes(connection.status) && connection.tasks_completed < 5 : true;
  const isChatUnlocked = connection?.status === 'chat_unlocked' || connection?.status === 'completed';

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
    const markRead = async () => {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId }),
      });
    };
    markRead();
  }, [connectionId, isLocked]);

  useEffect(() => {
    if (!connectionId) return;
    const channel = supabase
      .channel(`messages:${connectionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${connectionId}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => { if (prev.some((m) => m.id === newMsg.id)) return prev; return [...prev, newMsg]; });
        if (newMsg.sender_id !== user?.id) {
          fetch('/api/messages/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connection_id: connectionId }) });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `connection_id=eq.${connectionId}` }, (payload) => {
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [connectionId, supabase, user?.id]);

  useEffect(() => {
    if (!connectionId || !user?.id || isLocked) return;
    const channel = supabase.channel(`typing:${connectionId}`);
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const typingUsers = Object.values(state).flat().filter((p: any) => p.typing && p.user_id !== user.id);
      setPartnerTyping(typingUsers.length > 0);
    }).subscribe(async (status) => { if (status === 'SUBSCRIBED') { await channel.track({ typing: false, user_id: user.id }); } });
    return () => { supabase.removeChannel(channel); };
  }, [connectionId, supabase, user?.id, isLocked]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, partnerTyping]);

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || isLocked) return;
    channelRef.current.track({ typing: isTyping, user_id: user?.id });
  }, [isLocked, user?.id]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      broadcastTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 2000);
    } else { broadcastTyping(false); }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || sending) return;
    setSending(true); setInput(''); broadcastTyping(false);
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connection_id: connectionId, content: text }) });
      const data = await res.json();
      if (data.error) console.error('Send failed:', data.error);
    } catch { console.error('Send failed'); } finally { setSending(false); }
  };

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const msgDate = formatDateSeparator(msg.created_at);
    if (msgDate !== currentDate) { currentDate = msgDate; groupedMessages.push({ date: msgDate, messages: [] }); }
    groupedMessages[groupedMessages.length - 1].messages.push(msg);
  }

  const partnerPhoto = isHost ? connection?.guest?.photos?.[0] : connection?.host?.photos?.[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-0">
          <div className="page-header">
            <button onClick={() => router.push(backRoute)} className="btn-ghost p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: '#161616' }}>
                {partnerPhoto ? (
                  <img src={partnerPhoto} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                ) : (
                  <span className="text-sm font-display italic text-muted">{partnerName?.[0]}</span>
                )}
              </div>
              <div>
                <h1 className="text-base font-display italic text-white">{partnerName}</h1>
                {isChatUnlocked && <span className="text-xs text-gold font-thin">Connected</span>}
              </div>
            </div>
          </div>
          <div className="hairline" />
        </div>

        {/* Connected banner */}
        {isChatUnlocked && (
          <div className="mx-4 mb-2 rounded-xl px-4 py-3 flex items-center gap-2 animate-slide-down" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <span className="text-sm text-gold font-medium font-display italic">You&apos;re Connected</span>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 relative">
          {isLocked && <LockedOverlay backRoute={backRoute} />}
          {messages.length === 0 && !isLocked ? (
            <EmptyChat partnerName={partnerName || ''} onSend={handleSend} />
          ) : (
            <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-3 py-3">
                    <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
                    <span className="text-[10px] text-muted/60 uppercase tracking-widest-xl font-thin">{group.date}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
                  </div>
                  {group.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} isOwn={message.sender_id === user?.id} />
                  ))}
                </div>
              ))}
              {partnerTyping && <TypingIndicator name={partnerName || ''} />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        {!isLocked && (
          <div className="p-4" style={{ borderTop: '1px solid #1E1E1E' }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #B8962F, #D4AF37)' }}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4 text-black" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
