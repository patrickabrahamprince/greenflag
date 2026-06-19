'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flag, CheckCircle, XCircle, Ban, Eye, Loader2, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  reporter: { id: string; name: string; email: string };
  reported: { id: string; name: string; email: string };
}

type Tab = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export default function AdminReports() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${tab}`);
      const d = await res.json();
      if (d.reports) setReports(d.reports);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Report ${status}`);
        fetchReports();
      } else {
        toast.error(d.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleBanFromReport = async (userId: string) => {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('User banned');
      } else {
        toast.error(d.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'actioned', label: 'Actioned' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-[#EDEADE] mb-6">Reports</h1>

      <div className="flex gap-1 bg-[#0A0A0A] rounded-xl p-1 border border-white/10 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-sm font-medium rounded-lg px-3 py-2 transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-[#D4AF37] text-black'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card py-16 text-center">
          <Flag className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
          <p className="text-[#8E8E93] text-sm">No {tab} reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#EDEADE]">Report #{r.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#8E8E93] capitalize">
                      {r.reason}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8E93]">
                    <button onClick={() => router.push(`/profile/${r.reporter_id}`)} className="hover:text-white">
                      {r.reporter.name || r.reporter.email}
                    </button>
                    {' reported '}
                    <button onClick={() => router.push(`/profile/${r.reported_id}`)} className="hover:text-white">
                      {r.reported.name || r.reported.email}
                    </button>
                  </p>
                  {r.details && <p className="text-xs text-[#8E8E93] mt-1">{r.details}</p>}
                  <p className="text-[10px] text-[#8E8E93] mt-1">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {tab === 'pending' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push(`/profile/${r.reported_id}`)}
                    className="btn-ghost text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View Profile
                  </button>
                  <button
                    onClick={() => handleStatus(r.id, 'dismissed')}
                    className="btn-ghost text-xs flex items-center gap-1 text-green-400"
                  >
                    <CheckCircle className="w-3 h-3" /> Dismiss
                  </button>
                  <button
                    onClick={() => handleBanFromReport(r.reported_id)}
                    className="btn-ghost text-xs flex items-center gap-1 text-red-400"
                  >
                    <Ban className="w-3 h-3" /> Ban User
                  </button>
                  <button
                    onClick={() => handleStatus(r.id, 'actioned')}
                    className="btn-ghost text-xs flex items-center gap-1 text-[#D4AF37]"
                  >
                    <Flag className="w-3 h-3" /> Mark Actioned
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
