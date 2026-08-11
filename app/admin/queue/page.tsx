'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QueueItem } from '@/components/admin/types';
import { QueueHeader, QueueEmptyState } from '@/components/admin/QueueHeader';
import { QueueItemCard } from '@/components/admin/QueueItemCard';
import { QueueItemDetail } from '@/components/admin/QueueItemDetail';

export default function AdminQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    const res = await fetch('/api/admin/queue');
    if (res.ok) {
      const { items: queueItems } = await res.json();
      setItems(queueItems);
      setSelected((prev) => prev ?? queueItems[0] ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = useCallback(async (id: string) => {
    setModeratingId(id);
    try {
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
    } finally {
      setModeratingId(null);
    }
  }, []);

  const handleReject = useCallback(async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    setModeratingId(id);
    try {
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
    } finally {
      setModeratingId(null);
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
        <div className="text-center py-12 text-gray-500 text-sm">Loading...</div>
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
            <QueueItemDetail item={selected} onApprove={handleApprove} onReject={handleReject} moderating={moderatingId === selected.id} />
          )}
        </div>
      )}
    </div>
  );
}
