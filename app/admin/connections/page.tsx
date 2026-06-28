'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { ConnectionRow } from '@/components/admin/types';
import { ConnectionsTable } from '@/components/admin/ConnectionsTable';
import { ForceEndModal } from '@/components/admin/ForceEndModal';

export default function AdminConnections() {
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [forceEndId, setForceEndId] = useState<string | null>(null);
  const [forceEndReason, setForceEndReason] = useState('');

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('connections')
      .select(`
        id, status, current_day, expires_at, created_at,
        guest:profiles!connections_guest_id_fkey(name),
        host:profiles!connections_host_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error } = await query;
    if (!error && data) {
      setConnections(data.map((c: Record<string, unknown>) => {
        const guest = c.guest as { name?: string } | null;
        const host = c.host as { name?: string } | null;
        return {
          id: String(c.id),
          guest: guest?.name || 'Unknown',
          host: host?.name || 'Unknown',
          currentDay: Number(c.current_day) || 1,
          tasks: `${Number(c.current_day) || 1}/3`,
          startedAt: c.created_at ? new Date(String(c.created_at)).toLocaleDateString() : '-',
          expires: c.expires_at ? (new Date(String(c.expires_at)) < new Date() ? 'Expired' : new Date(String(c.expires_at)).toLocaleDateString()) : '-',
          status: String(c.status),
        };
      }));
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const handleForceEnd = async () => {
    if (!forceEndId || !forceEndReason.trim()) return;
    const res = await fetch(`/api/admin/connections/${forceEndId}/force-end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: forceEndReason.trim() }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Connection ended');
      setForceEndId(null);
      setForceEndReason('');
      fetchConnections();
    } else {
      toast.error(d.error || 'Failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-[#EDEADE]">Connections</h1>
        <select className="input max-w-[150px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
          <option value="ended">Ended</option>
          <option value="chat_unlocked">Chat Unlocked</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00C853]" />
        </div>
      ) : connections.length === 0 ? (
        <div className="card py-16 text-center">
          <Link2 className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
          <p className="text-[#8E8E93] text-sm">No connections found</p>
        </div>
      ) : (
        <ConnectionsTable connections={connections} onForceEnd={setForceEndId} />
      )}

      {forceEndId && (
        <ForceEndModal
          reason={forceEndReason}
          onReasonChange={setForceEndReason}
          onConfirm={handleForceEnd}
          onClose={() => { setForceEndId(null); setForceEndReason(''); }}
        />
      )}
    </div>
  );
}
