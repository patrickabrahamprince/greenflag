'use client';

import { Users, Image as ImageIcon, Ban, DollarSign, Activity } from 'lucide-react';

const STATS = [
  { label: 'Pending Photos', value: '12', icon: ImageIcon, change: '+3 today', color: 'text-gold' },
  { label: 'Active Connections', value: '47', icon: Activity, change: '+8 this week', color: 'text-green-500' },
  { label: 'Banned Users', value: '6', icon: Ban, change: '2 this month', color: 'text-red-500' },
  { label: 'Revenue MTD', value: '₹12,450', icon: DollarSign, change: '+22% vs last month', color: 'text-gold' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CHART_DATA = [12, 18, 8, 22, 15, 25, 20];

export default function AdminDashboard() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted">{stat.label}</span>
              </div>
              <p className="text-2xl font-display text-white">{stat.value}</p>
              <p className="text-[10px] text-muted mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-sm font-medium text-white mb-4">Connections Created (7 Days)</h2>
        <div className="flex items-end gap-2 h-40">
          {CHART_DATA.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted">{val}</span>
              <div
                className="w-full bg-gold/20 rounded-t-md relative overflow-hidden"
                style={{ height: `${(val / Math.max(...CHART_DATA)) * 100}%` }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-full bg-gold/40 rounded-t-md" />
              </div>
              <span className="text-[10px] text-muted">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card">
          <h3 className="text-sm font-medium text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'New connection created', time: '2 min ago' },
              { action: 'Photo approved', time: '15 min ago' },
              { action: 'New user registered', time: '1 hour ago' },
              { action: 'Payment received ₹299', time: '2 hours ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-white">{item.action}</span>
                <span className="text-xs text-muted">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-white mb-3">User Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Hosts', count: 28, pct: 35 },
              { label: 'Guests', count: 52, pct: 65 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{item.label}</span>
                  <span className="text-muted">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
