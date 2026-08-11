'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReportTabs } from '@/components/admin/ReportTabs';
import { ReportCard } from '@/components/admin/ReportCard';
import { EmptyReportsState } from '@/components/admin/EmptyReportsState';
import type { Report, Tab } from '@/components/admin/types';

export default function AdminReports() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

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
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Report ${status}`);
        await fetchReports();
      } else {
        toast.error(d.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActingId(null);
    }
  };

  const handleBanFromReport = async (reportId: number, userId: string) => {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    setActingId(reportId);
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
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-gray-900 mb-6">Reports</h1>
      <ReportTabs activeTab={tab} onTabChange={setTab} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyReportsState tab={tab} />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              showActions={tab === 'pending'}
              onStatusChange={handleStatus}
              onBanUser={(userId) => handleBanFromReport(r.id, userId)}
              acting={actingId === r.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
