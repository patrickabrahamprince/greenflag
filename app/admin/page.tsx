'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserPlus, Activity, Link2, Loader2, Coins } from 'lucide-react';

interface Overview {
  totalUsers: number;
  hosts: number;
  guests: number;
  activeToday: number;
  signupsToday: number;
  connectionsCreated: number;
  coinsInCirculation: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics/overview')
      .then((r) => r.json())
      .then((d) => {
        if (d.totalUsers !== undefined) setData(d);
      })
      .catch(() => {});
  }, []);

  const STATS = data ? [
    { label: 'Total Users', value: data.totalUsers.toLocaleString(), icon: Users, href: '/admin/users', color: 'text-[#D4AF37]' },
    { label: 'Hosts', value: data.hosts.toLocaleString(), icon: UserCheck, href: '/admin/users?gender=host', color: 'text-[#D4AF37]' },
    { label: 'Guests', value: data.guests.toLocaleString(), icon: UserPlus, href: '/admin/users?gender=guest', color: 'text-green-500' },
    { label: 'Active Today', value: data.activeToday.toLocaleString(), icon: Activity, href: '#', color: 'text-blue-500' },
    { label: 'Connections Today', value: data.connectionsCreated.toLocaleString(), icon: Link2, href: '/admin/connections', color: 'text-purple-500' },
    { label: 'Coins in Circulation', value: data.coinsInCirculation.toLocaleString(), icon: Coins, href: '#', color: 'text-[#D4AF37]' },
  ] : null;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-[#EDEADE] mb-6">Dashboard</h1>

      {!STATS ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.label}
                  onClick={() => stat.href !== '#' && router.push(stat.href)}
                  className="card text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-[#8E8E93]">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-display text-[#EDEADE]">{stat.value}</p>
                </button>
              );
            })}
          </div>

          <div className="card">
            <h2 className="text-sm font-medium text-[#EDEADE] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button onClick={() => router.push('/admin/users')} className="btn-secondary text-sm py-3">Manage Users</button>
              <button onClick={() => router.push('/admin/reports')} className="btn-secondary text-sm py-3">View Reports</button>
              <button onClick={() => router.push('/admin/analytics')} className="btn-secondary text-sm py-3">Analytics</button>
              <button onClick={() => router.push('/admin/audit')} className="btn-secondary text-sm py-3">Audit Log</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
