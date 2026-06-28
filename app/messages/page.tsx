'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type ConnectionRow = Database['public']['Tables']['connections']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ChatConnection extends ConnectionRow {
  partner: Pick<ProfileRow, 'id' | 'name' | 'photos'> | null;
  last_message: { content: string; created_at: string | null } | null;
}

interface ChatListPageProps {
  userId: string;
  supabase: ReturnType<typeof createClient>;
}

function ChatListItem({ conn, userId }: { conn: ChatConnection; userId: string }) {
  const router = useRouter();
  const partnerPhoto = conn.partner?.photos?.[0];

  return (
    <button
      onClick={() => router.push(`/messages/${conn.id}`)}
      className="w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-[#E8E6E1]"
    >
      <div
        className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-[#F0EDE9]"
      >
        {partnerPhoto ? (
          <img
            src={partnerPhoto}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }}
          />
        ) : (
          <span className="font-['Playfair_Display'] text-sm italic text-ink/50">
            {conn.partner?.name?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-['Playfair_Display'] text-sm italic text-ink truncate">
            {conn.partner?.name}
          </span>
          {conn.last_message && (
            <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#8E8E93' }}>
              {conn.last_message.created_at ? new Date(conn.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          )}
        </div>
        {conn.last_message && (
          <p className="text-xs truncate font-thin" style={{ color: '#8E8E93' }}>
            {conn.last_message.content}
          </p>
        )}
      </div>
    </button>
  );
}

function ChatList({ userId, supabase }: ChatListPageProps) {
  const [connections, setConnections] = useState<ChatConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('connections')
        .select('*')
        .or('chat_unlocked.eq.true,connected.eq.true')
        .order('created_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      const enriched = await Promise.all(
        data.map(async (conn) => {
          const partnerId = conn.host_id === userId ? conn.guest_id : conn.host_id;
          const { data: partner } = await supabase
            .from('profiles')
            .select('id, name, photos')
            .eq('id', partnerId)
            .single();
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('connection_id', conn.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          return { ...conn, partner, last_message: lastMsg };
        })
      );

      setConnections(enriched);
      setLoading(false);
    };
    load();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C9A961', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-sm font-thin" style={{ color: '#8E8E93' }}>
          No chats yet. Complete Day 5 to unlock messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {connections.map((conn) => (
        <ChatListItem key={conn.id} conn={conn} userId={userId} />
      ))}
    </div>
  );
}

export default function MessagesListPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const supabase = createClient();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F7]">
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col">
        <div className="px-4 pt-4 pb-0">
          <div className="page-header">
            <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-['Playfair_Display'] text-lg text-ink italic">Messages</h1>
            <div className="w-9" />
          </div>
          <div className="hairline" />
        </div>
        <ChatList userId={user.id} supabase={supabase} />
      </div>
    </div>
  );
}
