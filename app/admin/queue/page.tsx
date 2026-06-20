'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, X, Ban, ChevronRight, Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface QueueItem {
  id: string;
  name: string;
  day: number;
  task: string;
  status: string;
  img: string;
}

export default function AdminQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          proof_url,
          status,
          intentions:description,day,
          connections(test_id,guest:guest_id(name))
        `)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const queueItems = data.map((s: any) => ({
          id: s.id,
          name: s.connections?.guest?.name || 'Unknown',
          day: s.intentions?.day || 0,
          task: s.intentions?.description || '',
          status: s.status,
          img: s.proof_url || '',
        }));
        setItems(queueItems);
        if (queueItems.length > 0) setSelected(queueItems[0]);
      }
      setLoading(false);
    };

    fetchQueue();
  }, []);

  const handleApprove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const remaining = items.filter((i) => i.id !== id);
      return prev?.id === id ? remaining[0] || null : prev;
    });
  }, [items]);

  const handleReject = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const remaining = items.filter((i) => i.id !== id);
      return prev?.id === id ? remaining[0] || null : prev;
    });
  }, [items]);

  const handleNext = useCallback(() => {
    const idx = items.findIndex((i) => i.id === selected?.id);
    if (idx < items.length - 1) setSelected(items[idx + 1]);
  }, [items, selected]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === 'a' || e.key === 'A') handleApprove(selected.id);
      if (e.key === 'r' || e.key === 'R') handleReject(selected.id);
      if (e.key === ' ') { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, handleApprove, handleReject, handleNext]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-2">Photo Moderation Queue</h1>
      <p className="text-sm text-muted mb-6">
        Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs">A</kbd> Approve{' '}
        <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs">R</kbd> Reject{' '}
        <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs">Space</kbd> Next
      </p>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="empty-state py-16">
          <div className="empty-state-icon">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Queue is empty</h3>
          <p className="text-muted text-sm">No submissions pending review. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full card text-left flex items-center gap-3 ${
                  selected?.id === item.id ? 'border-gold/50' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.img ? (
                    <img src={item.img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                  ) : (
                    <span className="text-muted text-xs">No img</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{item.name}</p>
                  <p className="text-xs text-muted truncate">Day {item.day} &middot; {item.task}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>
            ))}
          </div>

          {selected && (
            <div className="card">
              <div className="aspect-video bg-surface-light rounded-xl flex items-center justify-center mb-4">
                {selected.img ? (
                  <img src={selected.img} alt="" className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                ) : (
                  <span className="text-muted text-sm">Photo Preview</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-xs text-muted">Guest</span>
                  <p className="text-white font-medium">{selected.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Day</span>
                  <p className="text-white font-medium">Day {selected.day}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Task</span>
                  <p className="text-white text-sm">{selected.task}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Previous Reviews</span>
                  <p className="text-white text-sm">None</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selected.id)}
                  className="flex-1 bg-green-500/10 text-green-500 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-green-500/20 transition-colors"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(selected.id)}
                  className="flex-1 bg-red-500/10 text-red-500 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button className="btn-danger text-sm py-2.5 px-3">
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
