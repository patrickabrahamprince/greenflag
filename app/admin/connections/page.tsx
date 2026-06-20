'use client';

import { useState, useEffect } from 'react';
import { Eye, Link } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ConnectionRow {
  id: string;
  guest: string;
  host: string;
  day: number;
  tasks: string;
  expires: string;
  status: string;
}

export default function AdminConnections() {
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchConnections = async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          tasks_completed,
          expires_at,
          guest:guest_id(name),
          host:host_id(name),
          standards:test_id(day)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setConnections(data.map((c: any) => ({
          id: c.id,
          guest: c.guest?.name || 'Unknown',
          host: c.host?.name || 'Unknown',
          day: c.tasks_completed + 1,
          tasks: `${c.tasks_completed}/8`,
          expires: new Date(c.expires_at) < new Date() ? 'Expired' : new Date(c.expires_at).toLocaleDateString(),
          status: c.status,
        })));
      }
      setLoading(false);
    };

    fetchConnections();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'chat_unlocked': return 'text-gold bg-gold/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      case 'expired': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted bg-surface-light';
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Connections</h1>

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : connections.length === 0 ? (
        <div className="empty-state py-16">
          <div className="empty-state-icon">
            <Link className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No connections yet</h3>
          <p className="text-muted text-sm">Connections between hosts and guests will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase border-b border-border">
                <th className="text-left py-3 px-2">Guest</th>
                <th className="text-left py-3 px-2">Host</th>
                <th className="text-left py-3 px-2">Day</th>
                <th className="text-left py-3 px-2">Tasks</th>
                <th className="text-left py-3 px-2">Expires</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-right py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn) => (
                <tr key={conn.id} className="border-b border-border/50">
                  <td className="py-3 px-2 text-white font-medium">{conn.guest}</td>
                  <td className="py-3 px-2 text-muted">{conn.host}</td>
                  <td className="py-3 px-2 text-muted">{conn.day}</td>
                  <td className="py-3 px-2 text-muted">{conn.tasks}</td>
                  <td className="py-3 px-2 text-muted">{conn.expires}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(conn.status)}`}>
                      {conn.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="btn-ghost text-xs p-1.5">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="btn-ghost text-[10px] text-green-500">Complete</button>
                      <button className="btn-ghost text-[10px] text-red-500">Fail</button>
                      <button className="btn-ghost text-[10px] text-gold">Extend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
