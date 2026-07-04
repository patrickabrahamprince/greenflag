'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ChatConversation {
  id: string;
  user1_id: string;
  user2_id: string;
  partner: Pick<ProfileRow, 'id' | 'name' | 'photos'> | null;
  last_message: { content: string; created_at: string | null } | null;
}

interface ChatListPageProps {
  userId: string;
  supabase: ReturnType<typeof createClient>;
}

function ChatListItem({ conv }: { conv: ChatConversation }) {
  const router = useRouter();
  const partnerPhoto = conv.partner?.photos?.[0];

  return (
    <button
      onClick={() => router.push(`/messages/${conv.id}`)}
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
            {conv.partner?.name?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-['Playfair_Display'] text-sm italic text-ink truncate">
            {conv.partner?.name}
          </span>
          {conv.last_message && (
            <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#8E8E93' }}>
              {conv.last_message.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          )}
        </div>
        {conv.last_message && (
          <p className="text-xs truncate font-thin" style={{ color: '#8E8E93' }}>
            {conv.last_message.content}
          </p>
        )}
      </div>
    </button>
  );
}

function ChatList({ userId, supabase }: ChatListPageProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('matches')
          .select('*')
          .eq('chat_unlocked', true)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!data) { setLoading(false); return; }

        const enriched = await Promise.all(
          data.map(async (conv: any) => {
            const partnerId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
            const { data: partner } = await supabase
              .from('profiles')
              .select('id, name, photos')
              .eq('id', partnerId)
              .single();
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('match_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return { ...conv, partner, last_message: lastMsg };
          })
        );

        setConversations(enriched);
      } catch (err) {
        // Safe catch
      } finally {
        setLoading(false);
      }
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

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-sm font-thin" style={{ color: '#8E8E93' }}>
          No chats yet. Swipe in Discover to find matches!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <ChatListItem key={conv.id} conv={conv} />
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
