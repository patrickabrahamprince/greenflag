"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Flag, CheckCircle, XCircle, Clock, Search, AlertTriangle } from "lucide-react";
import type { Profile } from "@/lib/types";

interface ReportWithDetails {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  reporter?: Pick<Profile, "id" | "name" | "photos">;
  reported?: Pick<Profile, "id" | "name" | "photos">;
}

export default function AdminReports() {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [filter, setFilter] = useState<"pending" | "resolved" | "dismissed" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase
      .from("reports")
      .select("*, reporter:reporter_id(id, name, photos), reported:reported_id(id, name, photos)")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setReports((data || []) as unknown as ReportWithDetails[]);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [filter]);

  const handleResolve = async (id: string, status: "resolved" | "dismissed") => {
    setActionId(id);
    await supabase.from("reports").update({
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: (await supabase.auth.getUser()).data.user?.id,
    }).eq("id", id);
    setActionId(null);
    fetchReports();
  };

  const handleBlockUser = async (reportedId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: reportedId });
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-500/10 text-yellow-400";
      case "resolved": return "bg-green-500/10 text-green-400";
      case "dismissed": return "bg-surface text-text-muted";
      default: return "bg-surface text-text-muted";
    }
  };

  const FILTERS = [
    { key: "pending" as const, label: "Pending" },
    { key: "resolved" as const, label: "Resolved" },
    { key: "dismissed" as const, label: "Dismissed" },
    { key: "all" as const, label: "All" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Reports</h1>
          <p className="text-sm text-text-muted mt-1">Manage user reports</p>
        </div>
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
            <div key={i} className="h-28 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <Flag className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-[20px] bg-surface border-[0.5px] border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" strokeWidth={1.5} />
                  <span className={"text-[10px] px-2.5 py-1 rounded-full capitalize " + getStatusColor(report.status)}>
                    {report.status}
                  </span>
                  <span className="text-[10px] text-text-muted">{new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                    {report.reporter?.photos?.[0] ? (
                      <img src={report.reporter.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-accent">{report.reporter?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Reporter</p>
                    <p className="text-xs font-medium text-text">{report.reporter?.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center overflow-hidden shrink-0">
                    {report.reported?.photos?.[0] ? (
                      <img src={report.reported.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-red-400">{report.reported?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Reported</p>
                    <p className="text-xs font-medium text-text">{report.reported?.name || "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-xs font-medium text-text mb-1">{report.reason}</p>
                {report.details && <p className="text-xs text-text-muted">{report.details}</p>}
              </div>

              {report.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleResolve(report.id, "dismissed")} disabled={actionId === report.id}
                    className="flex-1 h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 transition-all hover:text-text">
                    {actionId === report.id ? <Clock className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
                    Dismiss
                  </button>
                  <button onClick={() => { handleResolve(report.id, "resolved"); handleBlockUser(report.reported_id); }} disabled={actionId === report.id}
                    className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 transition-all">
                    {actionId === report.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" strokeWidth={1.5} />}
                    Resolve & Block
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
