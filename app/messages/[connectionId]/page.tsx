'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Lock, Shield, User, CheckCircle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import type { Message } from '@/types';

interface MockMessage extends Message {
  isOwn: boolean;
}

const MOCK_GUEST_VIEW = {
  hostName: 'Priya',
  messages: [
    { id: 'm1', sender_id: 'host1', content: 'Hey! I loved your photo from the morning routine.', created_at: new Date(Date.now() - 86400 * 1000).toISOString(), isOwn: false },
    { id: 'm2', sender_id: 'guest1', content: 'Thank you so much! I wanted to share something authentic.', created_at: new Date(Date.now() - 86000 * 1000).toISOString(), isOwn: true },
    { id: 'm3', sender_id: 'host1', content: 'That really came through. What inspired you to join?', created_at: new Date(Date.now() - 85000 * 1000).toISOString(), isOwn: false },
    { id: 'm4', sender_id: 'guest1', content: 'I wanted to meet someone who values intentional connection.', created_at: new Date(Date.now() - 84000 * 1000).toISOString(), isOwn: true },
  ] as MockMessage[],
};

const MOCK_HOST_VIEW = {
  guestName: 'Rahul',
  guestAge: 28,
  messages: [
    { id: 'm1', sender_id: 'g1', content: "Hey! I loved reading your standard. The book challenge on day 1 was really fun!", created_at: '2026-06-18T11:00:00Z', isOwn: false },
    { id: 'm2', sender_id: 'host1', content: "I'm so glad you enjoyed it! Your response was really thoughtful.", created_at: '2026-06-18T11:05:00Z', isOwn: true },
    { id: 'm3', sender_id: 'g1', content: "I can't wait to see what the other days bring. This is such a unique way to connect!", created_at: '2026-06-18T11:10:00Z', isOwn: false },
    { id: 'm4', sender_id: 'host1', content: "That's exactly the idea. Quality over speed, right?", created_at: '2026-06-18T11:15:00Z', isOwn: true },
  ] as MockMessage[],
};

function MessageBubble({ message }: { message: MockMessage }) {
  return (
    <div className={cn('flex', message.isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 animate-fade-in',
          message.isOwn
            ? 'bg-gold text-black rounded-br-md'
            : 'bg-surface text-white rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            message.isOwn ? 'text-black/60' : 'text-muted'
          )}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function LockedOverlay({ backRoute }: { backRoute: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-8">
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-gold" />
      </div>
      <h3 className="text-lg font-display text-white mb-2">Messages Locked</h3>
      <p className="text-sm text-muted text-center mb-6">
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
  const isHost = user?.role === 'host';

  const mockData = isHost ? MOCK_HOST_VIEW : MOCK_GUEST_VIEW;
  const partnerName = isHost ? MOCK_HOST_VIEW.guestName : MOCK_GUEST_VIEW.hostName;
  const backRoute = isHost ? '/interested' : '/connections';

  const [messages] = useState<MockMessage[]>(mockData.messages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const tasksCompleted = 6;
  const totalTasks = 8;
  const isLocked = tasksCompleted < 5;
  const isConnected = tasksCompleted >= totalTasks;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setInput('');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col">
        <div className="page-header px-4">
          <button onClick={() => router.push(backRoute)} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
              <User className="w-4 h-4 text-muted" />
            </div>
            <div>
              <h1 className="text-base font-medium text-white">{partnerName}</h1>
              {isConnected && (
                <span className="text-xs text-gold">Connected</span>
              )}
            </div>
          </div>
        </div>

        {isConnected && (
          <div className="mx-4 mb-2 bg-gold/10 border border-gold/20 rounded-xl px-4 py-3 flex items-center gap-2 animate-slide-down">
            <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="text-sm text-gold font-medium">You&apos;re Connected</span>
          </div>
        )}

        <div className="flex-1 relative">
          {isLocked && <LockedOverlay backRoute={backRoute} />}
          <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
            <div className="text-center py-4">
              <p className="text-xs text-muted">
                {formatDate(messages[0]?.created_at || new Date().toISOString())}
              </p>
            </div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isLocked ? 'Complete intentions to chat...' : 'Type a message...'}
              disabled={isLocked}
              className="input flex-1"
            />
            <button
              onClick={handleSend}
              disabled={isLocked || !input.trim()}
              className="w-10 h-10 rounded-full bg-gold flex items-center justify-center transition-all duration-300 ease-out hover:bg-gold-light active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
