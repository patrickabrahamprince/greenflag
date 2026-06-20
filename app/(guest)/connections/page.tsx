'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, ChevronRight, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn, formatTimeLeft } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type TabKey = 'in-progress' | 'connected' | 'ended';
interface Connection { id: string; status: string; tasks_completed: number; expires_at: string; host: { id: string; name: string; photos: string[] }; unread_count?: number; }
const TABS: { key: TabKey; label: string }[] = [{ key: 'in-progress', label: 'In Progress' }, { key: 'connected', label: 'Connected' }, { key: 'ended', label: 'Ended' }];

function ConnectionCard({ connection, onContinue, onMessage }: { connection: Connection; onContinue: (id: string, hostName: string) => void; onMessage: (id: string) => void; }) {
  const isChatUnlocked = connection.status === 'chat_unlocked' || connection.status === 'completed';
  const isEnded = connection.status === 'expired' || connection.status === 'rejected';
  const hostName = connection.host?.name || 'Unknown';
  const hostPhoto = connection.host?.photos?.[0];
  const unread = connection.unread_count || 0;
  const pct = Math.round((connection.tasks_completed / 8) * 100);

  return (
    <div className="card flex items-center gap-4 p-4 animate-fade-in hover:gold-border-left transition-all duration-300">
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: '#161616' }}>
        {hostPhoto ? (<img src={hostPhoto} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />) : (<span className="text-sm font-display italic text-muted">{hostName.charAt(0)}</span>)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-display italic text-white truncate">{hostName}</h3>
          {unread > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-white">{unread > 99 ? '99+' : unread}</span></span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted mt-1 font-thin">
          <span>{connection.tasks_completed}/8 tasks</span>
          {!isEnded && (<><span className="w-1 h-1 rounded-full bg-white/20" /><span>{formatTimeLeft(connection.expires_at)} left</span></>)}
        </div>
        {!isEnded && (
          <div className="mt-2">
            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: '#1E1E1E' }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #B8962F, #D4AF37)' }} />
            </div>
          </div>
        )}
      </div>
      {isEnded ? (<div className="text-xs text-muted flex items-center gap-1 font-thin"><XCircle className="w-3 h-3" />Ended</div>)
        : isChatUnlocked ? (<button onClick={() => onMessage(connection.id)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />Message</button>)
        : (<button onClick={() => onContinue(connection.id, hostName)} className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5">Continue<ChevronRight className="w-3.5 h-3.5" /></button>)}
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
      const { data } = await supabase.from('connections').select(`id, status, tasks_completed, expires_at, host:host_id(id, name, photos)`).eq('guest_id', user.id).order('created_at', { ascending: false });
      if (!data) { setLoading(false); return; }
      const connsWithUnread = await Promise.all(data.map(async (c: any) => {
        let unread_count = 0;
        if (c.status === 'chat_unlocked' || c.status === 'completed') {
          const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('connection_id', c.id).neq('sender_id', user.id).is('read_at', null);
          unread_count = count || 0;
        }
        return { ...c, unread_count };
      }));
      setConnections(connsWithUnread as Connection[]);
      setLoading(false);
    };
    load();
  }, [supabase, router]);

  useEffect(() => {
    if (!connections.length) return;
    const channel = supabase.channel('unread-updates').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const newMsg = payload.new as any;
      setConnections((prev) => prev.map((c) => c.id === newMsg.connection_id ? { ...c, unread_count: (c.unread_count || 0) + 1 } : c));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [connections.length, supabase]);

  const filteredConnections = connections.filter((c) => {
    switch (activeTab) {
      case 'in-progress': return c.status === 'pending' || c.status === 'active' || c.status === 'tasks_submitted';
      case 'connected': return c.status === 'chat_unlocked' || c.status === 'completed';
      case 'ended': return c.status === 'expired' || c.status === 'rejected';
      default: return false;
    }
  });

  const handleContinue = (id: string, hostName: string) => { router.push(`/${hostName.toLowerCase()}`); };
  const handleMessage = (id: string) => { router.push(`/messages/${id}`); };

  const renderEmptyState = () => {
    switch (activeTab) {
      case 'in-progress': return (<div className="empty-state"><div className="empty-state-icon"><Users className="w-6 h-6" /></div><h3 className="empty-state-title font-display italic">No connections yet.</h3><p className="empty-state-text font-thin">Browse Discover to find someone with standards you&apos;d like to meet.</p><button onClick={() => router.push('/discover')} className="btn-primary mt-6">Browse Discover</button></div>);
      case 'connected': return (<div className="empty-state"><div className="empty-state-icon"><CheckCircle className="w-6 h-6" /></div><h3 className="empty-state-title font-display italic">No connections yet.</h3><p className="empty-state-text font-thin">Complete 8 tasks to connect with someone.</p></div>);
      case 'ended': return (<div className="empty-state"><div className="empty-state-icon"><Clock className="w-6 h-6" /></div><h3 className="empty-state-title font-display italic">Nothing here yet.</h3><p className="empty-state-text font-thin">Connections that ended will appear here.</p></div>);
    }
  };

  if (loading) return (<div className="page-container"><div className="page-header"><button onClick={() => router.push('/discover')} className="btn-ghost p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button><h1 className="text-xl font-display italic text-white">Connections</h1></div><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div></div>);

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => router.push('/discover')} className="btn-ghost p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-display italic text-white">Connections</h1>
      </div>
      <div className="flex gap-1 rounded-full p-1 mt-2" style={{ background: '#111111' }}>
        {TABS.map((tab) => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('flex-1 text-sm font-medium rounded-full px-3 py-2 transition-all duration-300 ease-out', activeTab === tab.key ? 'btn-primary !py-2' : 'text-muted hover:text-white')}>{tab.label}</button>))}
      </div>
      <div className="mt-4 space-y-2 pb-24">
        {filteredConnections.length > 0 ? filteredConnections.map((connection) => (<ConnectionCard key={connection.id} connection={connection} onContinue={handleContinue} onMessage={handleMessage} />)) : renderEmptyState()}
      </div>
    </div>
  );
}
