"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Zap, Flag, DollarSign, ArrowRight } from "lucide-react";

interface Stats {
  pendingPhotos: number;
  activeConnections: number;
  flaggedUsers: number;
  revenue: number;
  dailyConnections: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = stats ? Math.max(...stats.dailyConnections.map((d) => d.count), 1) : 1;

  const statCards = stats
    ? [
        { label: "Pending Photos", value: stats.pendingPhotos, icon: ImageIcon, sub: "submissions to review", color: "text-yellow-400", bg: "bg-yellow-500/10" },
        { label: "Active Connections", value: stats.activeConnections, icon: Zap, sub: "active trials", color: "text-green-400", bg: "bg-green-500/10" },
        { label: "Flagged Users", value: stats.flaggedUsers, icon: Flag, sub: "banned accounts", color: "text-red-400", bg: "bg-red-500/10" },
        { label: "Revenue MTD", value: `\u20B9${stats.revenue.toLocaleString("en-IN")}`, icon: DollarSign, sub: "month to date", color: "text-accent", bg: "bg-accent/10" },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Greenflag moderation panel</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[20px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-3">
              <div className={`w-10 h-10 rounded-[12px] ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[28px] font-display font-bold tracking-[-0.02em]">{card.value}</p>
                <p className="text-xs text-text-muted">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-[18px] font-display font-bold tracking-[-0.02em] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => router.push("/admin/queue")}
            className="rounded-[20px] bg-accent border-[0.5px] border-accent/30 p-4 flex items-center justify-between group hover:bg-[#E4C55A] transition-colors">
            <span className="text-sm font-medium text-bg">Review Queue</span>
            <ArrowRight className="w-4 h-4 text-bg group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
          </button>
          <button onClick={() => router.push("/admin/users")}
            className="rounded-[20px] bg-surface border-[0.5px] border-border p-4 flex items-center justify-between group hover:border-accent/30 transition-all">
            <span className="text-sm font-medium text-text">Manage Users</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
          </button>
          <button onClick={() => router.push("/admin/analytics")}
            className="rounded-[20px] bg-surface border-[0.5px] border-border p-4 flex items-center justify-between group hover:border-accent/30 transition-all">
            <span className="text-sm font-medium text-text">View Analytics</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {stats && (
        <div>
          <h2 className="text-[18px] font-display font-bold tracking-[-0.02em] mb-3">Connections This Week</h2>
          <div className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-3">
            {stats.dailyConnections.map((day) => {
              const d = new Date(day.date + "T00:00:00");
              const label = d.toLocaleDateString("en-IN", { weekday: "short" });
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-8 shrink-0">{label}</span>
                  <div className="flex-1 h-6 rounded-full bg-bg/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${(day.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text font-mono w-6 text-right">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
