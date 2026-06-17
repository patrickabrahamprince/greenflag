"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScrollText, ChevronDown, ChevronUp, Download, Search } from "lucide-react";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  admin: { name: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  approve_submission: "Approved Submission",
  reject_submission: "Rejected Submission",
  ban_user: "Banned User",
  unban_user: "Unbanned User",
  force_complete_connection: "Force Completed Connection",
  extend_connection: "Extended Connection",
  pause_test: "Paused Test",
  unpause_test: "Unpaused Test",
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminFilter, setAdminFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 25;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      let query = supabase
        .from("admin_logs")
        .select("*, admin:admin_id(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      const { data } = await query;
      setLogs((data || []) as unknown as AdminLog[]);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const adminNames = [...new Set(logs.map(l => l.admin?.name).filter(Boolean))].sort() as string[];

  const filtered = logs.filter(l => {
    if (adminFilter && l.admin?.name !== adminFilter) return false;
    if (actionFilter && l.action !== actionFilter) return false;
    if (startDate && new Date(l.created_at) < new Date(startDate + "T00:00:00")) return false;
    if (endDate && new Date(l.created_at) > new Date(endDate + "T23:59:59")) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageLogs = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const start = currentPage * PAGE_SIZE + 1;
  const end = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);

  const downloadCSV = () => {
    const rows = filtered.map(l => [
      l.created_at,
      l.admin?.name || "",
      l.action,
      l.target_type,
      l.target_id,
      JSON.stringify(l.metadata),
    ]);
    const csv = [
      ["created_at", "admin_name", "action", "target_type", "target_id", "metadata"],
      ...rows,
    ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Audit Logs</h1>
          <p className="text-sm text-text-muted mt-1">All admin actions recorded</p>
        </div>
        {filtered.length > 0 && (
          <button onClick={downloadCSV}
            className="flex items-center gap-2 h-10 px-4 rounded-[14px] bg-surface border-[0.5px] border-border text-xs text-text-muted hover:text-accent hover:border-accent/30 transition-all">
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            Download CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={adminFilter} onChange={(e) => { setAdminFilter(e.target.value); setCurrentPage(0); }}
          className="h-12 px-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text text-sm outline-none focus:border-accent transition-all appearance-none cursor-pointer">
          <option value="">All Admins</option>
          {adminNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(0); }}
          className="h-12 px-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text text-sm outline-none focus:border-accent transition-all appearance-none cursor-pointer">
          <option value="">All Actions</option>
          {ALL_ACTIONS.map(action => (
            <option key={action} value={action}>{ACTION_LABELS[action]}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
            className="flex-1 h-12 px-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text text-sm outline-none focus:border-accent transition-all" />
          <span className="text-text-muted text-xs">to</span>
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
            className="flex-1 h-12 px-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text text-sm outline-none focus:border-accent transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : pageLogs.length === 0 ? (
        <div className="text-center py-12">
          <ScrollText className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No logs found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-1">
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] text-text-muted uppercase tracking-wider font-medium">
                <span className="w-36 shrink-0">Timestamp</span>
                <span className="w-28 shrink-0">Admin</span>
                <span className="w-44 shrink-0">Action</span>
                <span className="w-24 shrink-0">Target</span>
                <span className="flex-1 min-w-0">Metadata</span>
                <span className="w-10 shrink-0" />
              </div>
              {pageLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                const metaPreview = JSON.stringify(log.metadata).slice(0, 80);
                return (
                  <div key={log.id} className="rounded-[16px] bg-surface border-[0.5px] border-border overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                      <span className="w-36 shrink-0 text-xs text-text-muted font-mono">
                        {new Date(log.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="w-28 shrink-0 text-xs text-text font-medium truncate">{log.admin?.name || "Unknown"}</span>
                      <span className="w-44 shrink-0 text-xs text-text truncate">{ACTION_LABELS[log.action] || log.action}</span>
                      <span className="w-24 shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-bg/40 text-text-muted capitalize">{log.target_type}</span>
                      <span className="flex-1 min-w-0 text-[10px] text-text-muted font-mono truncate">{metaPreview}{metaPreview.length >= 80 ? "..." : ""}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} />}
                    </div>
                    {isExpanded && (
                      <div className="border-t-[0.5px] border-border px-4 py-3">
                        <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap bg-bg/40 rounded-[12px] p-3 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">
                Showing {start}&ndash;{end} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                  className="h-9 px-3 rounded-[12px] bg-surface border-[0.5px] border-border text-xs text-text-muted disabled:opacity-30 hover:text-text transition-all">
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const page = i + Math.max(0, currentPage - 2);
                    if (page >= totalPages) return null;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-[10px] text-xs font-medium transition-all ${
                          currentPage === page ? "bg-accent/10 text-accent border-[0.5px] border-accent/30" : "bg-surface border-[0.5px] border-border text-text-muted hover:text-text"
                        }`}>
                        {page + 1}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                  className="h-9 px-3 rounded-[12px] bg-surface border-[0.5px] border-border text-xs text-text-muted disabled:opacity-30 hover:text-text transition-all">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
