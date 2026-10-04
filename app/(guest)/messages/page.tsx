'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/shared/empty-state';
import { getCached, setCached } from '@/lib/pageCache';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { hapticTap } from '@/lib/haptics';
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
  persona: string | null | undefined;
}

function ChatListItem({ conv }: { conv: ChatConversation }) {
  const router = useRouter();
  const partnerPhoto = conv.partner?.photos?.[0];

  return (
    <button
      onClick={() => { hapticTap(); router.push(`/messages/${conv.id}`); }}
      className="w-full flex items-center gap-3.5 p-4 text-left transition-all bg-[#F9FAFB] hover:bg-stone-100 border border-stone-200/80 rounded-3xl shadow-2xs active:scale-[0.98] cursor-pointer"
    >
      <div className="relative w-12 h-12 rounded-full shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white border border-stone-200 shadow-2xs">
          {partnerPhoto ? (
            <Image
              src={partnerPhoto}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover"
              onError={() => {}}
            />
          ) : (
            <span className="font-bold text-sm text-[#1C1C1E]">
              {conv.partner?.name?.[0] ?? '?'}
            </span>
          )}
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1C1C1E] border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-[14px] text-[#1C1C1E] truncate">
            {conv.partner?.name}
          </span>
          {conv.last_message && (
            <span className="text-[11px] font-semibold text-stone-400 shrink-0 ml-2">
              {conv.last_message.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          )}
        </div>
        {conv.last_message ? (
          <p className="text-[12px] text-stone-500 truncate font-medium">
            {conv.last_message.content}
          </p>
        ) : (
          <p className="text-[12px] text-[#1C1C1E] font-semibold truncate flex items-center gap-1">
            <span>✨</span> Connected! Tap to say hello
          </p>
        )}
      </div>
    </button>
  );
}

function ChatList({ userId, supabase }: ChatListPageProps) {
  const router = useRouter();
  const cacheKey = `chats:${userId}`;
  const [conversations, setConversations] = useState<ChatConversation[]>(() => getCached(cacheKey) ?? []);
  const [loading, setLoading] = useState(() => !getCached(cacheKey));
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const load = async () => {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (error || !matches) return;

      const enriched: ChatConversation[] = await Promise.all(
        matches.map(async (conv) => {
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
      setCached(cacheKey, enriched);
    } catch {
      // Safe catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase]);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(load);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-20">
        <Loader2 className="w-6 h-6 text-[#1C1C1E] animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-28 px-6 pt-10">
        <EmptyState
          icon={<MessageCircle className="w-6 h-6 text-[#1C1C1E]" />}
          title="No chats yet"
          description="Join a trip or connect with an explorer to start chatting."
        />
        <button
          onClick={() => { hapticTap(); router.push('/trips'); }}
          className="mt-6 px-6 py-3 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-[13px] font-bold active:scale-95 transition cursor-pointer shadow-2xs"
        >
          Explore Trips
        </button>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 overflow-y-auto overscroll-none scrollbar-hide pb-28"
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: pullDistance }}
      >
        <Loader2 className={`w-5 h-5 text-[#1C1C1E] ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
      </div>
      <div className="px-6 space-y-3 pt-2">
        {conversations.map((conv) => (
          <ChatListItem key={conv.id} conv={conv} />
        ))}
      </div>
    </div>
  );
}

export default function MessagesListPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!cancelled && !authUser) router.push('/login');
    });
    return () => { cancelled = true; };
  }, [supabase, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-white text-[#1C1C1E] font-sans max-w-md mx-auto relative overflow-hidden flex flex-col pb-safe-bottom">
      
      {/* Header */}
      <header className="relative z-10 px-6 pt-[max(20px,env(safe-area-inset-top,20px))] pb-3 flex items-center justify-between border-b border-stone-100">
        <div>
          <h1 className="text-[22px] font-[800] text-[#1C1C1E] tracking-tight">Messages</h1>
          <p className="text-[12px] font-semibold text-stone-500">Trip buddies & conversations</p>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="w-10 h-10 rounded-full bg-[#F4F4F5] border border-stone-200 shadow-2xs flex items-center justify-center text-[#1C1C1E] hover:bg-stone-200 transition cursor-pointer active:scale-95"
          aria-label="Explore"
        >
          <Compass className="w-5 h-5 text-[#1C1C1E]" />
        </button>
      </header>

      <ChatList userId={user.id} supabase={supabase} persona={user.persona} />
    </div>
  );
}
