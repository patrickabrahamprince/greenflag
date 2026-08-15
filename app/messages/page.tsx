'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, MessageCircle } from 'lucide-react';
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
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors bg-card rounded-card"
    >
      <div
        className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-well"
      >
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
          <span className="font-display text-sm text-ink/50">
            {conv.partner?.name?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-display text-sm text-ink truncate">
            {conv.partner?.name}
          </span>
          {conv.last_message && (
            <span className="text-caption text-ink/50 flex-shrink-0 ml-2">
              {conv.last_message.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          )}
        </div>
        {conv.last_message && (
          <p className="text-label text-ink/50 truncate">
            {conv.last_message.content}
          </p>
        )}
      </div>
    </button>
  );
}

interface InProgressPartner {
  matchUserId: string;
  name: string;
  photo: string | null;
}

// Matches the standardHint rate limit window (lib/rate-limit.ts) -- once
// this passes, the server allows another nudge, so the button needs to
// re-enable itself instead of staying "Nudged" forever.
const NUDGE_COOLDOWN_MS = 60 * 60 * 1000;

function InProgressMatches({ userId, supabase }: { userId: string; supabase: ReturnType<typeof createClient> }) {
  const [partners, setPartners] = useState<InProgressPartner[]>([]);
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
          return { matchUserId: partnerId, name: partner?.name || 'Him', photo: partner?.photos?.[0] || null };
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
      toast.success(data.started ? "Nudge sent — he's been notified to continue your Standard" : "Nudge sent — he's been notified to begin your Standard");
    } catch {
      toast.error('Failed to send hint');
    } finally {
      setSendingId(null);
    }
  };

  if (loading || partners.length === 0) return null;

  return (
    <div className="w-full px-6 mt-8">
      <p className="text-xs uppercase tracking-wide text-ink/40 mb-3">Waiting on your Standard</p>
      <div className="space-y-2">
        {partners.map((p) => (
          <div key={p.matchUserId} className="flex items-center gap-3 p-3 bg-card rounded-card">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-well">
              {p.photo ? (
                <Image src={p.photo} alt="" width={40} height={40} className="w-full h-full object-cover" onError={() => {}} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">?</div>
              )}
            </div>
            <span className="flex-1 text-sm text-ink truncate">{p.name}</span>
            <button
              onClick={() => handleLike(p.matchUserId)}
              disabled={sendingId === p.matchUserId || (hintedUntil[p.matchUserId] ?? 0) > now}
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {sendingId === p.matchUserId ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Heart className="w-3.5 h-3.5" />
              )}
              {(hintedUntil[p.matchUserId] ?? 0) > now ? 'Nudged' : 'Nudge'}
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
    } catch (err) {
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

  // Without this, a new message only ever showed up in the preview list
  // after navigating away from it and back (the initial load's own
  // useEffect re-running on remount) -- messages/[connectionId]/page.tsx
  // already does the equivalent for the conversation itself, this is the
  // same pattern for the list. No single-match filter is possible here
  // (this needs to hear about every match this user is in, not one), so
  // it subscribes broadly and checks client-side against the ids already
  // loaded, via a ref so the handler always sees the current list instead
  // of whatever it closed over at subscribe time.
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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-28 px-6">
        <EmptyState
          icon={<MessageCircle className="w-6 h-6" />}
          title="No messages yet"
          description={
            persona === 'woman'
              ? 'Your conversations begin once he completes your Standard.'
              : 'No conversations yet. Discover a profile to begin.'
          }
        />
        {persona === 'woman' && <InProgressMatches userId={userId} supabase={supabase} />}
        {/* Pinned to the bottom of the available space instead of sitting
            right under the description -- keeps it reachable with a
            thumb regardless of how tall the empty-state copy is. */}
        {persona !== 'woman' && (
          <button onClick={() => { hapticTap(); router.push('/discover'); }} className="btn-primary w-full max-w-xs py-3 text-sm mt-auto">
            Go to Discover
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 overflow-y-auto overscroll-none scrollbar-hide"
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: pullDistance }}
      >
        <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
      </div>
      {/* Separated card rows with a real gap between them, per the design
          system -- was a flush list divided by hairline borders. */}
      <div className="px-6 space-y-3">
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
    // Checking the client-side user store directly here raced against
    // Providers' own async hydration on a fresh page load -- an already
    // logged-in user could get bounced to /login before the store caught
    // up. A real auth check (same pattern used elsewhere, e.g.
    // messages/[connectionId]) isn't racy: it's authoritative regardless
    // of whether the store has populated yet.
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!cancelled && !authUser) router.push('/login');
    });
    return () => { cancelled = true; };
  }, [supabase, router]);

  if (!user) return null;

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col screen-gradient">
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col pt-safe-top">
        {/* This screen had no visible title at all before -- the deck's
            "Chat" header is a real, additive fix, not just decoration.
            The deck also shows a round search button here; skipped since
            there's no chat-search feature in this app to wire it to. */}
        <h1 className="font-display text-title text-ink px-6 pb-2">Chat</h1>
        <ChatList userId={user.id} supabase={supabase} persona={user.persona} />
      </div>
    </div>
  );
}
