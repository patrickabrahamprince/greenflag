'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
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
  persona: string | null | undefined;
}

function ChatListItem({ conv }: { conv: ChatConversation }) {
  const router = useRouter();
  const partnerPhoto = conv.partner?.photos?.[0];

  return (
    <button
      onClick={() => router.push(`/messages/${conv.id}`)}
      className="w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-[#2A2A2A]"
    >
      <div
        className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-[#1C1C1E]"
      >
        {partnerPhoto ? (
          <img
            src={partnerPhoto}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }}
          />
        ) : (
          <span className="font-display text-sm italic text-ink/50">
            {conv.partner?.name?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-display text-sm italic text-ink truncate">
            {conv.partner?.name}
          </span>
          {conv.last_message && (
            <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#9DA0A6' }}>
              {conv.last_message.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          )}
        </div>
        {conv.last_message && (
          <p className="text-xs truncate font-thin" style={{ color: '#9DA0A6' }}>
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

function InProgressMatches({ userId, supabase }: { userId: string; supabase: ReturnType<typeof createClient> }) {
  const [partners, setPartners] = useState<InProgressPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [hintedIds, setHintedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);

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
    setSendingId(partnerId);
    try {
      const res = await fetch(`/api/standard-hint/${partnerId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send hint');
        return;
      }
      setHintedIds((prev) => new Set(prev).add(partnerId));
      toast.success('Hint sent - nudged him to start your Standard');
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
          <div key={p.matchUserId} className="flex items-center gap-3 p-3 bg-[#111111] rounded-2xl">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#1C1C1E]">
              {p.photo ? (
                <img src={p.photo} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">?</div>
              )}
            </div>
            <span className="flex-1 text-sm text-ink truncate">{p.name}</span>
            <button
              onClick={() => handleLike(p.matchUserId)}
              disabled={sendingId === p.matchUserId || hintedIds.has(p.matchUserId)}
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {sendingId === p.matchUserId ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Heart className="w-3.5 h-3.5" />
              )}
              {hintedIds.has(p.matchUserId) ? 'Sent' : 'Like'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatList({ userId, supabase, persona }: ChatListPageProps) {
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
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C026D3', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center pt-20 px-6">
        <p className="text-sm font-thin text-center" style={{ color: '#9DA0A6' }}>
          {persona === 'woman'
            ? 'No chats yet — matches unlock once he completes your Standard.'
            : 'No chats yet. Swipe in Discover to find matches!'}
        </p>
        {persona === 'woman' && <InProgressMatches userId={userId} supabase={supabase} />}
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
    <div className="min-h-screen flex flex-col screen-gradient">
      <div className="max-w-app mx-auto w-full flex-1 flex flex-col">
        <div className="px-6 pt-6 pb-0">
          <div className="page-header">
            <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg text-ink italic">Messages</h1>
            <div className="w-9" />
          </div>
          <div className="hairline" />
        </div>
        <ChatList userId={user.id} supabase={supabase} persona={user.persona} />
      </div>
    </div>
  );
}
