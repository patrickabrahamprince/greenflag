'use client';

import { Users, TrendingUp, DollarSign, BarChart3, Activity, Target } from 'lucide-react';

const METRICS = [
  { label: 'DAU', value: '245', icon: Users, change: '+12%', color: 'text-gold' },
  { label: 'MAU', value: '1,892', icon: Activity, change: '+8%', color: 'text-green-500' },
  { label: 'Conversion', value: '23%', icon: TrendingUp, change: '+3%', color: 'text-blue-500' },
  { label: 'Completion', value: '67%', icon: Target, change: '+5%', color: 'text-green-500' },
  { label: 'Revenue', value: '₹12,450', icon: DollarSign, change: '+22%', color: 'text-gold' },
  { label: 'ARPU', value: '₹48', icon: BarChart3, change: '+₹6', color: 'text-gold' },
];

const SIGNUPS = [8, 12, 5, 18, 10, 22, 15, 9, 14, 20, 11, 7, 16, 13, 19, 6, 21, 17, 4, 23, 12, 8, 15, 10, 18, 14, 20, 11, 16, 9];
const FUNNEL = [
  { label: 'Views', count: 5420, pct: 100 },
  { label: 'Started', count: 1820, pct: 34 },
  { label: '5/8 Tasks', count: 890, pct: 16 },
  { label: 'Completed', count: 420, pct: 8 },
];
const REVENUE = [1200, 1800, 900, 2100, 1500, 2400, 1900, 1300, 1700, 2200, 1400, 1100, 2000, 1600, 2300, 1000, 2500, 1800, 1200, 1900, 2100, 1500, 1700, 2400, 1300, 2000, 1600, 2200, 1400, 1800];

export default function AdminAnalytics() {
  const maxSignup = Math.max(...SIGNUPS);
  const maxRevenue = Math.max(...REVENUE);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="card">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-3.5 h-3.5 ${metric.color}`} />
              </div>
              <p className="text-xl font-display text-white">{metric.value}</p>
              <p className="text-[10px] text-muted">{metric.label}</p>
              <p className={`text-[10px] ${metric.color}`}>{metric.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-medium text-white mb-4">Signups (30 Days)</h2>
          <div className="flex items-end gap-[2px] h-32">
            {SIGNUPS.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full bg-gold/30 rounded-t"
                  style={{ height: `${(val / maxSignup) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted">Day 1</span>
            <span className="text-[10px] text-muted">Day 30</span>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-medium text-white mb-4">Funnel</h2>
          <div className="space-y-4">
            {FUNNEL.map((step) => (
              <div key={step.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{step.label}</span>
                  <span className="text-muted">{step.count.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-sm font-medium text-white mb-4">Revenue/Day (INR)</h2>
          <div className="flex items-end gap-[2px] h-40">
            {REVENUE.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full relative flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mb-0.5" />
                  <div
                    className="w-full bg-gold/20"
                    style={{ height: `${(val / maxRevenue) * 80}px` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted">Day 1</span>
            <span className="text-[10px] text-muted">Day 30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
