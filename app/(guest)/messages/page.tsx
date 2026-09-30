'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Loader2, MessageCircle, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/shared/empty-state';
import { getCached, setCached } from '@/lib/pageCache';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { hapticTap, hapticDecision } from '@/lib/haptics';
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
      className="w-full flex items-center gap-3.5 p-4 text-left transition-all bg-white border border-stone-200/70 rounded-[26px] shadow-xs hover:border-purple-300 hover:shadow-sm active:scale-[0.98] cursor-pointer"
    >
      <div className="relative w-12 h-12 rounded-full shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-stone-100 border-2 border-white shadow-xs">
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
            <span className="font-bold text-sm text-stone-800">
              {conv.partner?.name?.[0] ?? '?'}
            </span>
          )}
        </div>
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00E5A3] border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-[14px] text-stone-900 truncate">
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
          <p className="text-[12px] text-purple-700 font-bold truncate flex items-center gap-1">
            <span>✨</span> Connected! Tap to say hello
          </p>
        )}
      </div>
    </button>
  );
}

const NUDGE_COOLDOWN_MS = 60 * 60 * 1000;

function InProgressMatches({ userId, supabase }: { userId: string; supabase: ReturnType<typeof createClient> }) {
  const [partners, setPartners] = useState<{ matchUserId: string; name: string; photo: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hintedUntil, setHintedUntil] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq('chat_unlocked', false)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (!data) { setLoading(false); return; }

      const enriched = await Promise.all(
        data.map(async (m: any) => {
          const partnerId = m.user1_id === userId ? m.user2_id : m.user1_id;
          const { data: partner } = await supabase.from('profiles').select('id, name, photos').eq('id', partnerId).single();
          return { matchUserId: partnerId, name: partner?.name || 'Explorer', photo: partner?.photos?.[0] || null };
        })
      );
      setPartners(enriched);
      setLoading(false);
    };
    load();
  }, [userId, supabase]);

  const handleLike = async (partnerId: string) => {
    hapticDecision();
    setSendingId(partnerId);
    try {
      const res = await fetch(`/api/standard-hint/${partnerId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send hint');
        return;
      }
      setHintedUntil((prev) => ({ ...prev, [partnerId]: Date.now() + NUDGE_COOLDOWN_MS }));
      toast.success("Nudge sent!");
    } catch {
      toast.error('Failed to send hint');
    } finally {
      setSendingId(null);
    }
  };

  if (loading || partners.length === 0) return null;

  return (
    <div className="w-full px-6 mt-6">
      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">Pending Connections</p>
      <div className="space-y-2">
        {partners.map((p) => (
          <div key={p.matchUserId} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/70 shadow-xs">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100">
              {p.photo ? (
                <Image src={p.photo} alt="" width={40} height={40} className="w-full h-full object-cover" onError={() => {}} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">?</div>
              )}
            </div>
            <span className="flex-1 text-[13px] font-bold text-stone-800 truncate">{p.name}</span>
            <button
              onClick={() => handleLike(p.matchUserId)}
              disabled={sendingId === p.matchUserId || (hintedUntil[p.matchUserId] ?? 0) > now}
              className="px-3 py-1.5 rounded-full bg-[#18181B] text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50 active:scale-95 transition"
            >
              {sendingId === p.matchUserId ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Bell className="w-3 h-3" />
              )}
              {(hintedUntil[p.matchUserId] ?? 0) > now ? 'Sent' : 'Nudge'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatList({ userId, supabase, persona }: ChatListPageProps) {
  const router = useRouter();
  const cacheKey = `messages:conversations:${userId}`;
  const [conversations, setConversations] = useState<ChatConversation[]>(() => getCached(cacheKey) ?? []);
  const [loading, setLoading] = useState(() => getCached<ChatConversation[]>(cacheKey) === undefined);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

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

  useEffect(() => {
    const channel = supabase
      .channel(`messages-list:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as { match_id: string; content: string; created_at: string | null };
          if (!conversationsRef.current.some((c) => c.id === newMsg.match_id)) return;

          setConversations((prev) => {
            const next = prev
              .map((c) => c.id === newMsg.match_id
                ? { ...c, last_message: { content: newMsg.content, created_at: newMsg.created_at } }
                : c)
              .sort((a, b) => {
                if (a.id === newMsg.match_id) return -1;
                if (b.id === newMsg.match_id) return 1;
                return 0;
              });
            setCached(cacheKey, next);
            return next;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase, cacheKey]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-28 px-6 pt-10">
        <EmptyState
          icon={<MessageCircle className="w-6 h-6 text-purple-600" />}
          title="No chats yet"
          description="Join a trip or connect with an explorer to start chatting."
        />
        {persona === 'woman' && <InProgressMatches userId={userId} supabase={supabase} />}
        <button
          onClick={() => { hapticTap(); router.push('/trips'); }}
          className="mt-8 px-6 py-3 rounded-full bg-[#18181B] text-white text-[13px] font-bold active:scale-95 transition cursor-pointer shadow-md"
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
        <Loader2 className={`w-5 h-5 text-purple-600 ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E3F2FD] via-[#F0F7FF] to-[#F7F6EB] text-stone-900 font-sans max-w-md mx-auto relative overflow-hidden flex flex-col">
      
      {/* Top Ambient Glow Background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-200/50 via-indigo-100/30 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-[max(20px,env(safe-area-inset-top,20px))] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-purple-500 to-sky-400">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00E5A3] rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-[800] text-[#18181B] tracking-tight">Messages</h1>
            <p className="text-[12px] font-semibold text-stone-500">Trip buddies & conversations</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-white transition cursor-pointer active:scale-95"
          aria-label="Explore"
        >
          <Compass className="w-5 h-5 text-stone-700" />
        </button>
      </header>

      <ChatList userId={user.id} supabase={supabase} persona={user.persona} />
    </div>
  );
}
