'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, BarChart3, Activity, Target, Loader2 } from 'lucide-react';
import { KpiCard } from '@/components/admin/KpiCard';

interface AnalyticsData {
  totalUsers: number;
  hosts: number;
  guests: number;
  activeToday: number;
  signupsToday: number;
  connectionsCreated: number;
  coinsInCirculation: number;
  signups_30d: number[];
  revenue_30d: number[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics/overview')
      .then((r) => r.json())
      .then(setData)
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

  const signups = data?.signups_30d || [];
  const revenue = data?.revenue_30d || [];
  const maxSignup = Math.max(...signups, 1);
  const maxRevenue = Math.max(...revenue, 1);
  const totalRevenue = revenue.reduce((a, b) => a + b, 0);
  const totalSignups = signups.reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-[#EDEADE] mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="DAU" value={data?.activeToday ?? 0} icon={Users} accent="text-[#C9A961]" />
        <KpiCard label="Signups (30d)" value={totalSignups} icon={Activity} accent="text-green-400" />
        <KpiCard label="Total Users" value={data?.totalUsers ?? 0} icon={Users} accent="text-blue-400" />
        <KpiCard label="Connections" value={data?.connectionsCreated ?? 0} icon={Target} accent="text-green-400" />
        <KpiCard label="Revenue (INR)" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} accent="text-[#C9A961]" />
        <KpiCard label="Coins in Circ." value={data?.coinsInCirculation ?? 0} icon={BarChart3} accent="text-[#C9A961]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-testid="signups-chart" className="card">
          <h2 className="text-sm font-medium text-[#EDEADE] mb-4">Signups (30 Days)</h2>
          <div className="flex items-end gap-[2px] h-32">
            {signups.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full bg-[#C9A961]/30 rounded-t" style={{ height: `${(val / maxSignup) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-[#5A5A5D]">Day 1</span>
            <span className="text-[10px] text-[#5A5A5D]">Day 30</span>
          </div>
        </div>

        <div data-testid="funnel-chart" className="card lg:col-span-2">
          <h2 className="text-sm font-medium text-[#EDEADE] mb-4">Revenue/Day (INR)</h2>
          <div className="flex items-end gap-[2px] h-40">
            {revenue.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full relative flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A961] mb-0.5" />
                  <div className="w-full bg-[#C9A961]/20" style={{ height: `${(val / maxRevenue) * 80}px` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-[#5A5A5D]">Day 1</span>
            <span className="text-[10px] text-[#5A5A5D]">Day 30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
