'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Loader2 } from 'lucide-react';

interface AdminAction {
  id: number;
  admin_id: string;
  action: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  admin?: { name: string; email: string };
}

export default function AdminAudit() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      let query = supabase
        .from('admin_actions')
        .select('*, admin:admin_id(name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter) {
        query = query.eq('action', filter);
      }

      const { data } = await query;
      setActions(data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-[#EDEADE]">Audit Log</h1>
      </div>

      <div className="mb-4">
        <select
          className="input max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="ban_user">Ban User</option>
          <option value="unban_user">Unban User</option>
          <option value="set_admin">Set Admin</option>
          <option value="actioned_report">Actioned Report</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
        </div>
      ) : actions.length === 0 ? (
        <div className="card py-16 text-center">
          <ScrollText className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
          <p className="text-[#8E8E93] text-sm">No audit entries yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#8E8E93] text-xs uppercase border-b border-white/10">
                <th className="text-left py-3 px-2">Admin</th>
                <th className="text-left py-3 px-2">Action</th>
                <th className="text-left py-3 px-2">Target</th>
                <th className="text-left py-3 px-2">Details</th>
                <th className="text-right py-3 px-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-3 px-2 text-[#EDEADE] font-medium text-xs">
                    {(a.admin as any)?.name || (a.admin as any)?.email || a.admin_id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#8E8E93]">
                      {a.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[#8E8E93] text-xs font-mono">
                    {a.target_id?.slice(0, 12)}...
                  </td>
                  <td className="py-3 px-2 text-[#8E8E93] text-xs">
                    {a.metadata?.reason ? String(a.metadata.reason) : '-'}
                  </td>
                  <td className="py-3 px-2 text-[#8E8E93] text-xs text-right">
                    {new Date(a.created_at).toLocaleString()}
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
