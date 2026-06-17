"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart3, Users, MessageSquare, CheckCircle, DollarSign, Target, Snowflake, Award } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalHosts: number;
  totalGuests: number;
  activeConnections: number;
  completedConnections: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  monthlyRevenue: number;
  signupsLast30Days: { date: string; count: number }[];
  streakFreezeCount: number;
  avgTasksPerCompleted: number;
  topHosts: { host_name: string; test_name: string; total_connections: number; completed_count: number }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { count: totalUsers } = await supabase.from("profiles").select("id", { count: "exact", head: true });
        const { count: totalHosts } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "host");
        const { count: totalGuests } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "guest");
        const { count: activeConnections } = await supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "active");
        const { count: completedConnections } = await supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "completed");
        const { count: totalSubmissions } = await supabase.from("submissions").select("id", { count: "exact", head: true });
        const { count: approvedSubmissions } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "approved");
        const { count: rejectedSubmissions } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "rejected");
        const { count: streakFreezeCount } = await supabase.from("connections").select("id", { count: "exact", head: true }).eq("streak_frozen", true);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyAgo = thirtyDaysAgo.toISOString();

        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "paid");
        const monthlyRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        const { data: signups } = await supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", thirtyAgo)
          .order("created_at", { ascending: true });

        const signupMap = new Map<string, number>();
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          signupMap.set(d.toISOString().slice(0, 10), 0);
        }
        (signups || []).forEach(s => {
          const day = s.created_at.slice(0, 10);
          if (signupMap.has(day)) signupMap.set(day, signupMap.get(day)! + 1);
        });
        const signupsLast30Days = Array.from(signupMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const { data: completedList } = await supabase
          .from("connections")
          .select("tasks_completed")
          .eq("status", "completed");
        const avgTasksPerCompleted = completedList && completedList.length > 0
          ? Math.round((completedList.reduce((s, c) => s + (c.tasks_completed || 0), 0) / completedList.length) * 10) / 10
          : 0;

        const { data: topHostsData } = await supabase.rpc("get_top_hosts").limit(10);
        const topHosts = (topHostsData || []) as { host_name: string; test_name: string; total_connections: number; completed_count: number }[];

        setData({
          totalUsers: totalUsers || 0,
          totalHosts: totalHosts || 0,
          totalGuests: totalGuests || 0,
          activeConnections: activeConnections || 0,
          completedConnections: completedConnections || 0,
          totalSubmissions: totalSubmissions || 0,
          approvedSubmissions: approvedSubmissions || 0,
          rejectedSubmissions: rejectedSubmissions || 0,
          monthlyRevenue,
          signupsLast30Days,
          streakFreezeCount: streakFreezeCount || 0,
          avgTasksPerCompleted,
          topHosts,
        });
      } catch (_e) {
        // fallback: try direct queries for top hosts
        const { data: fallback } = await supabase
          .from("connections")
          .select("host:host_id(name), test:test_id(name), id, status")
          .limit(500);
        if (fallback) {
          const grouped = new Map<string, { host_name: string; test_name: string; total_connections: number; completed_count: number }>();
          for (const c of fallback as any[]) {
            const key = `${c.host?.name || "?"}-${c.test?.name || "?"}`;
            if (!grouped.has(key)) {
              grouped.set(key, { host_name: c.host?.name || "?", test_name: c.test?.name || "?", total_connections: 0, completed_count: 0 });
            }
            const g = grouped.get(key)!;
            g.total_connections++;
            if (c.status === "completed") g.completed_count++;
          }
          const topHosts = Array.from(grouped.values())
            .sort((a, b) => b.total_connections - a.total_connections)
            .slice(0, 10);
          setData(prev => prev ? { ...prev, topHosts } : null!);
        }
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (data) setLoading(false);
  }, [data]);

  const completionRate = data && data.activeConnections > 0
    ? Math.round((data.completedConnections / (data.activeConnections + data.completedConnections)) * 100)
    : 0;
  const approvalRate = data && data.totalSubmissions > 0
    ? Math.round((data.approvedSubmissions / data.totalSubmissions) * 100)
    : 0;

  const maxSignup = data ? Math.max(...data.signupsLast30Days.map(d => d.count), 1) : 1;

  const cards = data ? [
    { label: "Total Users", value: data.totalUsers, icon: Users, sub: `${data.totalHosts} women / ${data.totalGuests} men`, color: "text-blue-400" },
    { label: "Active Connections", value: data.activeConnections, icon: MessageSquare, sub: "currently active", color: "text-green-400" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle, sub: `${data.completedConnections} completed`, color: "text-green-400" },
    { label: "Approval Rate", value: `${approvalRate}%`, icon: Award, sub: `${data.approvedSubmissions}/${data.totalSubmissions} approved`, color: "text-accent" },
    { label: "Monthly Revenue", value: `₹${data.monthlyRevenue.toLocaleString("en-IN")}`, icon: DollarSign, sub: "paid connections", color: "text-accent" },
    { label: "Avg Tasks/Completed", value: data.avgTasksPerCompleted, icon: Target, sub: "per connection", color: "text-blue-400" },
    { label: "Streak Freezes", value: data.streakFreezeCount, icon: Snowflake, sub: "active frozen streaks", color: "text-cyan-400" },
  ] : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Analytics</h1>
        <p className="text-sm text-text-muted mt-1">Platform metrics and trends</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[20px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-3">
                <div className={`w-10 h-10 rounded-[12px] bg-bg/40 border-[0.5px] border-border flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[28px] font-display font-bold tracking-[-0.02em] leading-tight">{card.value}</p>
                  <p className="text-xs text-text-muted mt-1">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-4">
              <div>
                <h3 className="text-[16px] font-display font-bold tracking-[-0.02em]">User Growth (Last 30 Days)</h3>
                <p className="text-xs text-text-muted mt-0.5">Daily signups</p>
              </div>
              <div className="flex items-end gap-[3px] h-40">
                {data.signupsLast30Days.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative">
                    <div
                      className="w-full rounded-[3px] bg-accent/60 hover:bg-accent transition-all min-h-[4px]"
                      style={{ height: `${(day.count / maxSignup) * 100}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface border-[0.5px] border-border rounded-[8px] px-2 py-1 text-[9px] text-text font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {day.date.slice(5)}: {day.count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>{data.signupsLast30Days[0]?.date?.slice(5) || ""}</span>
                <span>{data.signupsLast30Days[data.signupsLast30Days.length - 1]?.date?.slice(5) || ""}</span>
              </div>
            </div>

            <div className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-4">
              <div>
                <h3 className="text-[16px] font-display font-bold tracking-[-0.02em]">Status Distribution</h3>
                <p className="text-xs text-text-muted mt-0.5">Connection status breakdown</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Active Connections", value: data.activeConnections, color: "bg-green-500", max: data.activeConnections + data.completedConnections || 1 },
                  { label: "Completed", value: data.completedConnections, color: "bg-blue-500", max: data.activeConnections + data.completedConnections || 1 },
                  { label: "Failed", value: 0, color: "bg-red-500", max: data.activeConnections + data.completedConnections || 1 },
                  { label: "Streak Frozen", value: data.streakFreezeCount, color: "bg-accent", max: data.activeConnections || 1 },
                ].map((bar) => {
                  const pct = Math.min(100, Math.round((bar.value / bar.max) * 100));
                  return (
                    <div key={bar.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">{bar.label}</span>
                        <span className="text-xs text-text font-mono">{bar.value}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-bg/40 overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-4">
            <div>
              <h3 className="text-[16px] font-display font-bold tracking-[-0.02em]">Top Hosts</h3>
              <p className="text-xs text-text-muted mt-0.5">Most connections started, ordered by volume</p>
            </div>
            {data.topHosts.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-10 h-10 text-text-muted/30 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-text-muted">No host data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[500px] space-y-1">
                  <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] text-text-muted uppercase tracking-wider font-medium">
                    <span className="flex-1">Host</span>
                    <span className="w-44 shrink-0">Test</span>
                    <span className="w-24 shrink-0 text-right">Connections</span>
                    <span className="w-24 shrink-0 text-right">Completed</span>
                  </div>
                  {data.topHosts.map((host, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-bg/40 border-[0.5px] border-border">
                      <span className="text-[10px] text-text-muted w-5 shrink-0">#{i + 1}</span>
                      <span className="flex-1 text-xs text-text font-medium truncate">{host.host_name}</span>
                      <span className="w-44 shrink-0 text-xs text-text-muted truncate">{host.test_name}</span>
                      <span className="w-24 shrink-0 text-xs text-text font-mono text-right">{host.total_connections}</span>
                      <span className="w-24 shrink-0 text-xs text-text font-mono text-right">{host.completed_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">Unable to load analytics</p>
        </div>
      )}
    </div>
  );
}
