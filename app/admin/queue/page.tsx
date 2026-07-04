'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { QueueItem } from '@/components/admin/types';
import { QueueHeader, QueueEmptyState } from '@/components/admin/QueueHeader';
import { QueueItemCard } from '@/components/admin/QueueItemCard';
import { QueueItemDetail } from '@/components/admin/QueueItemDetail';

export default function AdminQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id,
        media_url,
        media_type,
        moderation_status,
        submitted_at,
        day_number,
        match_id,
        matches(user1:user1_id(name), user2:user2_id(name))
      `)
      .eq('moderation_status', 'pending')
      .order('submitted_at', { ascending: false });

    if (!error && data) {
      const queueItems: QueueItem[] = data.map((s: Record<string, unknown>) => {
        const match = s.matches as { user1?: { name?: string }; user2?: { name?: string } } | null;
        return {
          id: String(s.id),
          name: match?.user1?.name || match?.user2?.name || 'Unknown',
          day: Number(s.day_number) || 0,
          task: '',
          status: '',
          img: String(s.media_url || ''),
          submitted_at: String(s.submitted_at || ''),
          media_type: s.media_type as string | null,
        };
      });
      setItems(queueItems);
      if (queueItems.length > 0 && !selected) setSelected(queueItems[0]);
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/submissions/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    if (res.ok) {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        setSelected((s) => (s?.id === id ? next[0] || null : s));
        return next;
      });
    }
  }, []);

  const handleReject = useCallback(async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    const res = await fetch(`/api/admin/submissions/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', reason }),
    });
    if (res.ok) {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        setSelected((s) => (s?.id === id ? next[0] || null : s));
        return next;
      });
    }
  }, []);

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
      <QueueHeader />
      {loading ? (
        <div className="text-center py-12 text-[#8E8E93] text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <QueueEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {items.map((item) => (
              <QueueItemCard key={item.id} item={item} isSelected={selected?.id === item.id} onSelect={setSelected} />
            ))}
          </div>
          {selected && (
            <QueueItemDetail item={selected} onApprove={handleApprove} onReject={handleReject} />
          )}
        </div>
      )}
    </div>
  );
}
