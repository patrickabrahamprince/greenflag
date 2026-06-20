'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, ChevronRight, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn, formatTimeLeft } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type TabKey = 'in-progress' | 'connected' | 'ended';

interface Connection {
  id: string;
  status: string;
  tasks_completed: number;
  expires_at: string;
  host: { id: string; name: string; photos: string[] };
  unread_count?: number;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'in-progress', label: 'In Progress' },
  { key: 'connected', label: 'Connected' },
  { key: 'ended', label: 'Ended' },
];

function ConnectionCard({
  connection,
  onContinue,
  onMessage,
}: {
  connection: Connection;
  onContinue: (id: string, hostName: string) => void;
  onMessage: (id: string) => void;
}) {
  const isChatUnlocked = connection.status === 'chat_unlocked' || connection.status === 'completed';
  const isEnded = connection.status === 'expired' || connection.status === 'rejected';
  const hostName = connection.host?.name || 'Unknown';
  const hostPhoto = connection.host?.photos?.[0];
  const unread = connection.unread_count || 0;

  return (
    <div className="card flex items-center gap-3 p-3 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0 overflow-hidden">
        {hostPhoto ? (
          <img src={hostPhoto} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        ) : (
          <span className="text-sm font-display text-muted">{hostName.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-white truncate">{hostName}</h3>
          {unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{unread > 99 ? '99+' : unread}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
          <span>{connection.tasks_completed}/8 tasks</span>
          {!isEnded && (
            <>
              <span className="w-1 h-1 rounded-full bg-surface-light" />
              <span>{formatTimeLeft(connection.expires_at)} left</span>
            </>
          )}
        </div>
      </div>

      {isEnded ? (
        <div className="text-xs text-muted flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Ended
        </div>
      ) : isChatUnlocked ? (
        <button
          onClick={() => onMessage(connection.id)}
          className="flex items-center gap-1.5 text-xs bg-gold text-black font-medium rounded-lg px-3 py-1.5 transition-all duration-300 ease-out hover:bg-gold-light active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </button>
      ) : (
        <button
          onClick={() => onContinue(connection.id, hostName)}
          className="flex items-center gap-1.5 text-xs bg-surface text-white border border-border font-medium rounded-lg px-3 py-1.5 transition-all duration-300 ease-out hover:bg-surface-light active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabKey>('in-progress');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          tasks_completed,
          expires_at,
          host:host_id(id, name, photos)
        `)
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      // Fetch unread counts for chat_unlocked connections
      const connsWithUnread = await Promise.all(
        data.map(async (c: any) => {
          let unread_count = 0;
          if (c.status === 'chat_unlocked' || c.status === 'completed') {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('connection_id', c.id)
              .neq('sender_id', user.id)
              .is('read_at', null);
            unread_count = count || 0;
          }
          return { ...c, unread_count };
        })
      );

      setConnections(connsWithUnread as Connection[]);
      setLoading(false);
    };

    load();
  }, [supabase, router]);

  // Real-time unread count updates
  useEffect(() => {
    if (!connections.length) return;

    const channel = supabase
      .channel('unread-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any;
          setConnections((prev) =>
            prev.map((c) =>
              c.id === newMsg.connection_id
                ? { ...c, unread_count: (c.unread_count || 0) + 1 }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [connections.length, supabase]);

  const filteredConnections = connections.filter((c) => {
    switch (activeTab) {
      case 'in-progress':
        return c.status === 'pending' || c.status === 'active' || c.status === 'tasks_submitted';
      case 'connected':
        return c.status === 'chat_unlocked' || c.status === 'completed';
      case 'ended':
        return c.status === 'expired' || c.status === 'rejected';
      default:
        return false;
    }
  });

  const handleContinue = (id: string, hostName: string) => {
    router.push(`/${hostName.toLowerCase()}`);
  };

  const handleMessage = (id: string) => {
    router.push(`/messages/${id}`);
  };

  const renderEmptyState = () => {
    switch (activeTab) {
      case 'in-progress':
        return (
          <div className="empty-state">
            <div className="empty-state-icon"><Users className="w-6 h-6" /></div>
            <h3 className="empty-state-title">No connections yet.</h3>
            <p className="empty-state-text">Browse Discover to find someone with standards you&apos;d like to meet.</p>
            <button onClick={() => router.push('/discover')} className="btn-primary mt-6">Browse Discover</button>
          </div>
        );
      case 'connected':
        return (
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircle className="w-6 h-6" /></div>
            <h3 className="empty-state-title">No connections yet.</h3>
            <p className="empty-state-text">Complete 8 tasks to connect with someone.</p>
          </div>
        );
      case 'ended':
        return (
          <div className="empty-state">
            <div className="empty-state-icon"><Clock className="w-6 h-6" /></div>
            <h3 className="empty-state-title">Nothing here yet.</h3>
            <p className="empty-state-text">Connections that ended will appear here.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => router.push('/discover')} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display text-white">Connections</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => router.push('/discover')} className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display text-white">Connections</h1>
      </div>

      <div className="flex gap-1 bg-surface rounded-xl p-1 mt-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 text-sm font-medium rounded-lg px-3 py-2 transition-all duration-300 ease-out',
              activeTab === tab.key
                ? 'bg-gold text-black'
                : 'text-muted hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 pb-24">
        {filteredConnections.length > 0 ? (
          filteredConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onContinue={handleContinue}
              onMessage={handleMessage}
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
}
