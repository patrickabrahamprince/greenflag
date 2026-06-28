'use client';

import { useEffect, useState } from 'react';
import { Users, Link2, Shield, IndianRupee, Heart, Loader2 } from 'lucide-react';
import type { OverviewStats } from './types';
import { KpiCard } from './KpiCard';
import { ActivityFeed } from './ActivityFeed';
import { QuickLinks } from './QuickLinks';

export function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#00C853]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-[#8E8E93] text-sm">Failed to load stats</div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard dataTestId="total-users" label="Total Users" value={stats.totalUsers} icon={Users} accent="text-[#00C853]" subtitle={`${stats.guests} men / ${stats.hosts} women`} />
        <KpiCard label="Active Connections" value={stats.activeConnections} icon={Link2} accent="text-green-400" />
        <KpiCard label="Pending Moderation" value={stats.pendingModeration} icon={Shield} accent="text-orange-400" />
        <KpiCard label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={IndianRupee} accent="text-[#00C853]" />
        <KpiCard dataTestId="connected-today" label="Connected Today" value={stats.connectedPairsToday} icon={Heart} accent="text-pink-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed entries={stats.recentActivity} />
        </div>
        <div>
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
