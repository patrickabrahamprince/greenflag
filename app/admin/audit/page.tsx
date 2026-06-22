'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Loader2 } from 'lucide-react';
import type { AuditLogEntry } from '@/components/admin/types';

const ACTION_FILTERS = [
  { value: '', label: 'All Actions' },
  { value: 'ban_user', label: 'Ban User' },
  { value: 'unban_user', label: 'Unban User' },
  { value: 'credit_coins', label: 'Credit Coins' },
  { value: 'approve_submission', label: 'Approve Submission' },
  { value: 'reject_submission', label: 'Reject Submission' },
  { value: 'force_end_connection', label: 'Force End' },
  { value: 'actioned_report', label: 'Actioned Report' },
  { value: 'delete_report', label: 'Delete Report' },
];

const PAGE_SIZE = 50;

export default function AdminAudit() {
  const [actions, setActions] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));
      if (actionFilter) params.set('action', actionFilter);
      if (adminFilter) params.set('admin_email', adminFilter);

      const res = await fetch(`/api/admin/audit?${params}`);
      const d = await res.json();
      setActions(d.entries || []);
      setHasMore((d.entries || []).length === PAGE_SIZE);
    } catch {}
    finally { setLoading(false); }
  }, [page, actionFilter, adminFilter]);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-[#EDEADE]">Audit Log</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select className="input max-w-[180px]" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}>
          {ACTION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <input className="input max-w-[200px]" placeholder="Filter by admin email..." value={adminFilter} onChange={(e) => { setAdminFilter(e.target.value); setPage(0); }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
        </div>
      ) : actions.length === 0 ? (
        <div className="card py-16 text-center">
          <ScrollText className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
          <p className="text-[#8E8E93] text-sm">No audit entries found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#8E8E93] text-xs uppercase border-b border-white/10">
                  <th className="text-left py-3 px-2">Admin</th>
                  <th className="text-left py-3 px-2">Action</th>
                  <th className="text-left py-3 px-2">Target</th>
                  <th className="text-right py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr data-testid="audit-row" key={a.id} className="border-b border-white/5">
                    <td className="py-3 px-2 text-[#EDEADE] font-medium text-xs">
                      {a.admin_email || 'system'}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#8E8E93]">
                        {a.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#8E8E93] text-xs font-mono">
                      {a.target?.slice(0, 12) || '-'}{a.target && a.target.length > 12 ? '...' : ''}
                    </td>
                    <td className="py-3 px-2 text-[#8E8E93] text-xs text-right">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-xs py-2 disabled:opacity-30">
              Previous
            </button>
            <span className="text-xs text-[#8E8E93]">Page {page + 1}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className="btn-secondary text-xs py-2 disabled:opacity-30">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
