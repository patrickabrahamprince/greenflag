"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, Clock, CheckCircle, XCircle, Send, Eye, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Connection, Profile, Message } from "@/lib/types";

type FilterType = "active" | "completed" | "failed" | "expired" | "streak_frozen" | "all";

interface ConnectionWithDetails extends Connection {
  guest?: Profile;
  host?: Profile;
  messages?: Message[];
}

interface Stats {
  active: number;
  completed: number;
  failed: number;
  avgDays: number;
}

export default function AdminConnections() {
  const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
  const [filter, setFilter] = useState<FilterType>("active");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ active: 0, completed: 0, failed: 0, avgDays: 0 });
  const [viewConnection, setViewConnection] = useState<ConnectionWithDetails | null>(null);
  const [extendCount, setExtendCount] = useState(0);
  const [extendLoading, setExtendLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [failModal, setFailModal] = useState(false);
  const [failReason, setFailReason] = useState("");

  const fetchConnections = async () => {
    setLoading(true);
    let query = supabase
      .from("connections")
      .select("*, guest:guest_id(*), host:host_id(*), messages:messages(*)")
      .order("started_at", { ascending: false });

    if (filter === "active") query = query.eq("status", "active");
    else if (filter === "completed") query = query.eq("status", "completed");
    else if (filter === "failed") query = query.eq("status", "failed");
    else if (filter === "expired") {
      query = query.eq("status", "active").lt("expires_at", new Date().toISOString());
    } else if (filter === "streak_frozen") query = query.eq("streak_frozen", true);

    const { data } = await query;
    setConnections((data || []) as unknown as ConnectionWithDetails[]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { count: active } = await supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "active");
    const { count: completed } = await supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "completed");
    const { count: failed } = await supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "failed");
    const { data: completedConnections } = await supabase.from("connections").select("started_at, expires_at").eq("status", "completed");
    let avgDays = 0;
    if (completedConnections && completedConnections.length > 0) {
      const totalDays = completedConnections.reduce((sum, c) => {
        const start = new Date(c.started_at).getTime();
        const end = new Date(c.expires_at).getTime();
        return sum + Math.round((end - start) / 86400000);
      }, 0);
      avgDays = Math.round((totalDays / completedConnections.length) * 10) / 10;
    }
    setStats({ active: active || 0, completed: completed || 0, failed: failed || 0, avgDays });
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchConnections(); }, [filter]);

  const handleViewConnection = async (conn: ConnectionWithDetails) => {
    setViewConnection(conn);
    const { data: logs } = await supabase
      .from("admin_logs")
      .select("id", { count: "exact", head: true })
      .eq("action", "extend_connection")
      .eq("target_id", conn.id);
    setExtendCount((logs as unknown as { id: string }[])?.length || 0);
  };

  const handleForceComplete = async (conn: ConnectionWithDetails) => {
    setActionId(conn.id);
    await fetch(`/api/admin/connections/${conn.id}/force-complete`, { method: "POST" });
    setActionId(null);
    setViewConnection(null);
    fetchConnections();
    fetchStats();
  };

  const handleForceFail = async () => {
    if (!viewConnection || !failReason) return;
    setActionId("fail");
    const { error } = await supabase
      .from("connections")
      .update({ status: "failed" })
      .eq("id", viewConnection.id);
    if (!error) {
      await supabase.from("admin_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: "force_fail_connection",
        target_type: "connection",
        target_id: viewConnection.id,
        metadata: { reason: failReason },
      });
    }
    setActionId(null);
    setFailModal(false);
    setFailReason("");
    setViewConnection(null);
    fetchConnections();
    fetchStats();
  };

  const handleExtend = async (conn: ConnectionWithDetails) => {
    setActionId("extend");
    setExtendLoading(true);
    await fetch(`/api/admin/connections/${conn.id}/extend`, { method: "POST" });
    setExtendCount(prev => prev + 1);
    setActionId(null);
    setExtendLoading(false);
    fetchConnections();
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-green-500/10 text-green-400";
      case "completed": return "bg-green-500/10 text-green-400";
      case "failed": return "bg-red-500/10 text-red-400";
      case "pending": return "bg-yellow-500/10 text-yellow-400";
      case "withdrawn": return "bg-surface text-text-muted";
      default: return "bg-surface text-text-muted";
    }
  };

  const dayProgress = (current: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 8 }).map((_, i) => {
          const dayNum = i + 1;
          const filled = dayNum <= current;
          const isCurrent = dayNum === current + 1;
          return (
            <div key={i}
              className={"w-3.5 h-3.5 rounded-full border-[0.5px] transition-all flex items-center justify-center " + (
                filled ? "bg-accent border-accent" :
                isCurrent ? "border-accent/50 bg-accent/10" :
                "border-border bg-bg/40"
              )}>
              {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </div>
          );
        })}
      </div>
    );
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "failed", label: "Failed" },
    { key: "expired", label: "Expired" },
    { key: "streak_frozen", label: "Streak Frozen" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Connections</h1>
        <p className="text-sm text-text-muted mt-1">Monitor and manage connections</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active", value: stats.active, icon: Zap, color: "text-green-400" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-400" },
          { label: "Failed", value: stats.failed, icon: XCircle, color: "text-red-400" },
          { label: "Avg Days", value: stats.avgDays, icon: Clock, color: "text-accent" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-3">
            <div className={`w-10 h-10 rounded-[12px] bg-bg/40 border-[0.5px] border-border flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[28px] font-display font-bold tracking-[-0.02em]">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={"px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap " + (filter === f.key ? "bg-accent/10 text-accent border-[0.5px] border-accent/30" : "bg-surface border-[0.5px] border-border text-text-muted hover:text-text")}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No connections found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] text-text-muted uppercase tracking-wider font-medium">
            <div className="flex-1 grid grid-cols-7 gap-2">
              <span className="col-span-1">Guest</span>
              <span className="col-span-1">Host</span>
              <span className="col-span-1">Progress</span>
              <span className="col-span-1">Started</span>
              <span className="col-span-1">Expires</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1">Frozen</span>
            </div>
            <div className="w-28 shrink-0" />
          </div>

          {connections.map((conn) => (
            <div key={conn.id} className="flex items-center gap-3 p-4 rounded-[16px] bg-surface border-[0.5px] border-border hover:border-accent/20 transition-all">
              <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-7 gap-3 items-center">
                <div className="flex items-center gap-2 col-span-1">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                    {conn.guest?.photos?.[0] ? (
                      <img src={conn.guest.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-accent">{conn.guest?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text truncate">{conn.guest?.name || "?"}</span>
                </div>

                <div className="flex items-center gap-2 col-span-1">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center overflow-hidden shrink-0">
                    {conn.host?.photos?.[0] ? (
                      <img src={conn.host.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-pink-400">{conn.host?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text truncate">{conn.host?.name || "?"}</span>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">Day {conn.current_day}/8</span>
                    {dayProgress(conn.current_day)}
                  </div>
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-text-muted">{new Date(conn.started_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-text-muted">{new Date(conn.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>

                <div className="col-span-1">
                  <span className={"text-[10px] px-2.5 py-1 rounded-full capitalize " + getStatusColor(conn.status)}>
                    {conn.status}
                  </span>
                </div>

                <div className="col-span-1">
                  {conn.streak_frozen ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Frozen</span>
                  ) : (
                    <span className="text-[10px] text-text-muted/40">&mdash;</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleViewConnection(conn)}
                  className="w-8 h-8 rounded-full bg-bg/40 border-[0.5px] border-border flex items-center justify-center hover:border-accent/30 transition-all">
                  <Eye className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewConnection && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewConnection(null)}>
          <div className="w-full max-w-lg rounded-[20px] bg-surface border-[0.5px] border-border p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-display font-bold">Connection Details</h3>
                <p className="text-xs text-text-muted mt-0.5">{viewConnection.guest?.name} &rarr; {viewConnection.host?.name}</p>
              </div>
              <span className={"text-[10px] px-2.5 py-1 rounded-full capitalize " + getStatusColor(viewConnection.status)}>
                {viewConnection.status}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-bg/40 border-[0.5px] border-border">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-accent/10 overflow-hidden">
                  {viewConnection.guest?.photos?.[0] ? (
                    <img src={viewConnection.guest.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent">{viewConnection.guest?.name?.[0]}</div>
                  )}
                </div>
                <span className="text-xs text-text">{viewConnection.guest?.name}</span>
              </div>
              <span className="text-text-muted text-xs">&rarr;</span>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 overflow-hidden">
                  {viewConnection.host?.photos?.[0] ? (
                    <img src={viewConnection.host.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-pink-400">{viewConnection.host?.name?.[0]}</div>
                  )}
                </div>
                <span className="text-xs text-text">{viewConnection.host?.name}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">Day Progress</p>
              <div className="flex items-center gap-3">
                {dayProgress(viewConnection.current_day)}
                <span className="text-xs text-text-muted font-mono">{viewConnection.current_day}/8</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Started</p>
                <p className="text-sm text-text">{new Date(viewConnection.started_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Expires</p>
                <p className="text-sm text-text">{new Date(viewConnection.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Tasks Completed</p>
                <p className="text-sm text-text font-medium">{viewConnection.tasks_completed}</p>
              </div>
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Extended</p>
                <p className="text-sm text-text font-medium">{extendCount} time{extendCount !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {viewConnection.messages && viewConnection.messages.length > 0 && (
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">Recent Messages (last 5)</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {viewConnection.messages.slice(-5).map((msg) => (
                    <div key={msg.id} className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium text-text">{msg.sender_id === viewConnection.guest_id ? viewConnection.guest?.name : viewConnection.host?.name}</span>
                        <span className="text-[9px] text-text-muted">{new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-text-muted">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewConnection.status === "active" && (
              <div className="space-y-2 pt-2 border-t-[0.5px] border-border">
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleForceComplete(viewConnection)} disabled={actionId === viewConnection.id}
                    className="h-10 rounded-[12px] bg-green-500/10 border-[0.5px] border-green-500/20 text-green-400 text-[10px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-30 hover:bg-green-500/20 transition-all">
                    {actionId === viewConnection.id ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    Complete
                  </button>
                  <button onClick={() => setFailModal(true)} disabled={actionId === "fail"}
                    className="h-10 rounded-[12px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-[10px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-30 hover:bg-red-500/20 transition-all">
                    <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Fail
                  </button>
                  <button onClick={() => handleExtend(viewConnection)} disabled={actionId === "extend"}
                    className="h-10 rounded-[12px] bg-accent/10 border-[0.5px] border-accent/20 text-accent text-[10px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-30 hover:bg-accent/20 transition-all">
                    {actionId === "extend" ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    Extend
                  </button>
                </div>
              </div>
            )}

            <button onClick={() => setViewConnection(null)}
              className="w-full h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium hover:text-text transition-all">
              Close
            </button>
          </div>
        </div>
      )}

      {failModal && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setFailModal(false); setFailReason(""); }}>
          <div className="w-full max-w-md rounded-[20px] bg-surface border-[0.5px] border-border p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-display font-bold">Fail Connection</h3>
                <p className="text-xs text-text-muted">{viewConnection?.guest?.name} &rarr; {viewConnection?.host?.name}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Reason</label>
              <textarea value={failReason} onChange={(e) => setFailReason(e.target.value)}
                placeholder="Enter reason for failing..."
                className="w-full h-24 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm p-3 outline-none focus:border-accent/50 transition-all resize-none placeholder:text-text-muted/40"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => { setFailModal(false); setFailReason(""); }}
                className="flex-1 h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium hover:text-text transition-all">
                Cancel
              </button>
              <button onClick={handleForceFail} disabled={!failReason || actionId === "fail"}
                className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-500/20 transition-all">
                {actionId === "fail" ? <XCircle className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
                Fail Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
