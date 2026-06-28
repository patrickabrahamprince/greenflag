'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface GuestCard { id: string; connectionId: string; name: string; age: number; photo: string; tasksCompleted: number; status: string; unreadCount?: number; }
const TABS = ['Applicants', 'In Progress', 'Connected'] as const;
const TOTAL_TASKS = 8;

function GuestCardComponent({ guest, onNavigate }: { guest: GuestCard; onNavigate: (id: string, status: string) => void }) {
  const pct = Math.round((guest.tasksCompleted / TOTAL_TASKS) * 100);
  const hasSubmitted = guest.status === 'tasks_submitted';
  return (
    <div className="card animate-fade-in hover:gold-border-left transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-muted shrink-0 overflow-hidden" style={{ background: '#161616' }}>
          {guest.photo ? (<img src={guest.photo} alt={guest.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />) : (<span className="text-lg font-display italic text-white">{guest.name.charAt(0)}</span>)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display italic text-white truncate">{guest.name}, {guest.age}</p>
            {hasSubmitted && <span className="text-xs text-blush px-2 py-0.5 rounded-full" style={{ background: 'rgba(196,149,106,0.1)' }}>Pending review</span>}
            {(guest.unreadCount || 0) > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-white">{guest.unreadCount}</span></span>}
          </div>
          <p className="text-sm text-muted font-thin mt-0.5">{guest.tasksCompleted}/{TOTAL_TASKS} tasks</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: '#1E1E1E' }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #009624, #00C853)' }} />
            </div>
            <span className="text-xs text-muted font-thin">{pct}%</span>
          </div>
        </div>
        <button onClick={() => onNavigate(guest.connectionId, guest.status)} className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out', hasSubmitted ? 'btn-primary !py-2' : 'btn-secondary !py-2')}>
          {hasSubmitted ? 'Review' : 'View'}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; text: string }> = { Applicants: { title: 'No applicants yet', text: 'No one has started your standard yet.' }, 'In Progress': { title: 'No active connections', text: 'No guests are currently working on your standards.' }, Connected: { title: 'No completed connections', text: 'No one has completed all tasks yet.' } };
  const info = messages[tab] || messages.Applicants;
  return (<div className="empty-state py-16"><div className="empty-state-icon"><Users className="w-8 h-8" /></div><h3 className="text-lg font-display italic text-white mb-1">{info.title}</h3><p className="text-muted text-sm font-thin">{info.text}</p></div>);
}

export default function InterestedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Applicants');
  const [connections, setConnections] = useState<GuestCard[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data, error } = await supabase.from('connections').select(`id, status, tasks_completed, guest:guest_id(id, name, age, photos)`).eq('host_id', user.id).order('created_at', { ascending: false });
      if (error) { setLoading(false); return; }
      const cards: GuestCard[] = await Promise.all((data || []).map(async (c: any) => {
        const guest = c.guest;
        let unreadCount = 0;
        if (c.status === 'chat_unlocked' || c.status === 'completed') {
          const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('connection_id', c.id).neq('sender_id', user.id).is('read_at', null);
          unreadCount = count || 0;
        }
        return { id: guest?.id || '', connectionId: c.id, name: guest?.name || 'Unknown', age: guest?.age || 0, photo: guest?.photos?.[0] || '', tasksCompleted: c.tasks_completed || 0, status: c.status, unreadCount };
      }));
      setConnections(cards);
      setLoading(false);
    };
    load();
  }, [supabase, router]);

  const applicants = connections.filter((c) => c.status === 'pending' || c.status === 'tasks_submitted');
  const inProgress = connections.filter((c) => c.status === 'active' || c.status === 'awaiting_decision');
  const connected = connections.filter((c) => c.status === 'chat_unlocked' || c.status === 'completed');
  const tabData: Record<typeof TABS[number], GuestCard[]> = { Applicants: applicants, 'In Progress': inProgress, Connected: connected };
  const currentList = tabData[activeTab];

  function handleNavigate(connectionId: string, status: string) {
    if (status === 'awaiting_decision') router.push(`/decide/${connectionId}`);
    else if (status === 'chat_unlocked' || status === 'completed') router.push(`/messages/${connectionId}`);
    else router.push(`/review/${connectionId}`);
  }

  if (loading) return (<div className="animate-fade-in py-6"><button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-muted hover:text-white -ml-2 mb-4"><ArrowLeft className="w-5 h-5" />Back</button><h1 className="font-display italic text-3xl text-white mb-6">Interested In You</h1><div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div></div>);

  return (
    <div className="animate-fade-in py-6">
      <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-muted hover:text-white -ml-2 mb-4"><ArrowLeft className="w-5 h-5" />Back</button>
      <h1 className="font-display italic text-3xl text-white mb-6">Interested In You</h1>
      <div className="flex gap-1 rounded-full p-1 mb-6" style={{ background: '#111111' }}>
        {TABS.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={cn('flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out', activeTab === tab ? 'btn-primary !py-2.5' : 'text-muted hover:text-white')}>{tab}</button>))}
      </div>
      <div className="space-y-3">
        {currentList.length > 0 ? currentList.map((guest) => (<GuestCardComponent key={guest.id} guest={guest} onNavigate={handleNavigate} />)) : <EmptyState tab={activeTab} />}
      </div>
    </div>
  );
}
