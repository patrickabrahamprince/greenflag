'use client';

import { useEffect, useState } from 'react';
import { Users, Link2, Shield, IndianRupee, Heart, Loader2, UserRound, UsersRound } from 'lucide-react';
import type { OverviewStats } from './types';
import { KpiCard } from './KpiCard';
import { ActivityFeed } from './ActivityFeed';
import { QuickLinks } from './QuickLinks';

interface UserGenderStats {
  men: number;
  women: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [genderStats, setGenderStats] = useState<UserGenderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/users/stats').then((r) => r.json()),
    ])
      .then(([overview, gender]) => {
        setStats(overview);
        setGenderStats(gender);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
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
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard dataTestId="total-users" label="Total Users" value={stats.totalUsers} icon={Users} accent="text-[#C9A961]" subtitle={`${stats.guests} men / ${stats.hosts} women`} />
        <KpiCard dataTestId="men-count" label="Men" value={genderStats?.men ?? 0} icon={UserRound} accent="text-blue-400" />
        <KpiCard dataTestId="women-count" label="Women" value={genderStats?.women ?? 0} icon={UsersRound} accent="text-pink-400" />
        <KpiCard label="Active Connections" value={stats.activeConnections} icon={Link2} accent="text-green-400" />
        <KpiCard label="Pending Moderation" value={stats.pendingModeration} icon={Shield} accent="text-orange-400" />
        <KpiCard label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={IndianRupee} accent="text-[#C9A961]" />
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
