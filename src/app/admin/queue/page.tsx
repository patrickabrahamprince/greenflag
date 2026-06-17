"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, AlertTriangle, Ban, ZoomIn } from "lucide-react";

interface QueueItem {
  id: string;
  day_number: number;
  proof_url: string | null;
  submitted_at: string;
  status: string;
  connection_id: string;
  guest_name: string;
  guest_age: number;
  guest_photos: string[];
  host_name: string;
  task_description: string;
  tasks_completed: number;
  connection_status: string;
  guest_id: string;
}

export default function AdminQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [banModal, setBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [zoomed, setZoomed] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("submissions")
      .select("*, task:task_id(*), connection:connection_id(*, guest:guest_id(*), host:host_id(*))")
      .eq("status", "submitted")
      .not("proof_url", "is", null)
      .order("submitted_at", { ascending: true });

    if (data) {
      const mapped: QueueItem[] = data.map((s: Record<string, unknown>) => {
        const conn = s.connection as Record<string, unknown> | undefined;
        const guest = conn?.guest as Record<string, unknown> | undefined;
        const host = conn?.host as Record<string, unknown> | undefined;
        const task = s.task as Record<string, unknown> | undefined;
        const gPhotos = guest?.photos;
        return {
          id: s.id as string,
          day_number: s.day_number as number,
          proof_url: s.proof_url as string | null,
          submitted_at: s.submitted_at as string,
          status: s.status as string,
          connection_id: s.connection_id as string,
          guest_name: (guest?.name as string) || "Unknown",
          guest_age: (guest?.age as number) || 0,
          guest_photos: Array.isArray(gPhotos) ? (gPhotos as string[]) : [],
          host_name: (host?.name as string) || "Unknown",
          task_description: (task?.description as string) || "",
          tasks_completed: (conn?.tasks_completed as number) || 0,
          connection_status: (conn?.status as string) || "",
          guest_id: (conn?.guest_id as string) || "",
        };
      });
      setItems(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);

  const current = items[index];

  const removeCurrent = () => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index >= next.length && next.length > 0) setIndex(next.length - 1);
      return next;
    });
  };

  const handleApprove = useCallback(async () => {
    if (!current) return;
    setActionId(current.id);
    try {
      await fetch(`/api/admin/submissions/${current.id}/approve`, { method: "POST" });
      removeCurrent();
    } catch {
      console.error("approve failed");
    }
    setActionId(null);
  }, [current, index]);

  const handleReject = useCallback(async () => {
    if (!current) return;
    setActionId(current.id);
    try {
      const moderation_note = rejectNote ? `${rejectReason}: ${rejectNote}` : rejectReason;
      await fetch(`/api/admin/submissions/${current.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderation_note }),
      });
      removeCurrent();
      setRejectModal(false);
      setRejectReason("");
      setRejectNote("");
    } catch {
      console.error("reject failed");
    }
    setActionId(null);
  }, [current, index, rejectReason, rejectNote]);

  const handleBan = useCallback(async () => {
    if (!current) return;
    setActionId("ban");
    try {
      await fetch(`/api/admin/users/${current.guest_id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: banReason }),
      });
      removeCurrent();
      setBanModal(false);
      setBanReason("");
    } catch {
      console.error("ban failed");
    }
    setActionId(null);
  }, [current, index, banReason]);

  const goNext = useCallback(() => {
    if (index < items.length - 1) setIndex((i) => i + 1);
  }, [index, items.length]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (rejectModal || banModal) return;
      if (e.key === "a" || e.key === "A") { e.preventDefault(); handleApprove(); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); setRejectModal(true); }
      if (e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleApprove, goNext, goPrev, rejectModal, banModal]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
        <div className="h-[60vh] rounded-[20px] bg-surface border-[0.5px] border-border animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500/30 mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-display font-bold text-text mb-1">Queue Empty</h2>
        <p className="text-sm text-text-muted">All submissions have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Review Queue</h1>
          <p className="text-sm text-text-muted mt-1">{items.length} pending {items.length === 1 ? "submission" : "submissions"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={index === 0}
            className="w-9 h-9 rounded-full bg-surface border-[0.5px] border-border flex items-center justify-center disabled:opacity-30 hover:border-accent/30 transition-all">
            <ChevronLeft className="w-4 h-4 text-text" strokeWidth={1.5} />
          </button>
          <span className="text-xs text-text-muted font-mono">{index + 1}/{items.length}</span>
          <button onClick={goNext} disabled={index === items.length - 1}
            className="w-9 h-9 rounded-full bg-surface border-[0.5px] border-border flex items-center justify-center disabled:opacity-30 hover:border-accent/30 transition-all">
            <ChevronRight className="w-4 h-4 text-text" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <button key={item.id} onClick={() => setIndex(i)}
              className={`w-full rounded-[16px] bg-surface border-[0.5px] p-3 flex items-center gap-3 text-left transition-all ${
                i === index ? "border-accent/50 bg-accent/5" : "border-border hover:border-border/60"
              }`}>
              <div className="w-12 h-12 rounded-[12px] bg-bg/40 overflow-hidden shrink-0 border-[0.5px] border-border">
                {item.proof_url ? (
                  <img src={item.proof_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{item.guest_name} &bull; Day {item.day_number}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">{item.host_name}</p>
                <p className="text-[10px] text-text-muted/60 mt-0.5">{timeAgo(item.submitted_at)}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            </button>
          ))}
        </div>

        {current && (
          <div className="rounded-[20px] bg-surface border-[0.5px] border-border overflow-hidden h-fit sticky top-0">
            <div className="relative aspect-video bg-bg/60 cursor-pointer group" onClick={() => setZoomed(true)}>
              {current.proof_url ? (
                <img src={current.proof_url} alt="Proof" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Clock className="w-12 h-12 text-text-muted/30" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 bg-bg/0 group-hover:bg-bg/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="w-6 h-6 text-text" strokeWidth={1.5} />
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {current.guest_photos[0] && (
                    <img src={current.guest_photos[0]} alt="" className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span className="text-sm font-medium text-text">{current.guest_name}, {current.guest_age}</span>
                </div>
                <p className="text-xs text-text-muted">{current.host_name} &bull; Day {current.day_number}/8</p>
              </div>

              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Task</p>
                <p className="text-sm text-text">{current.task_description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Submitted {timeAgo(current.submitted_at)}</span>
                <span>{current.tasks_completed} approved &middot; {current.day_number - current.tasks_completed} other</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleApprove} disabled={actionId === current.id}
                  className="flex-1 h-11 rounded-[14px] bg-green-500/10 border-[0.5px] border-green-500/20 text-green-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-green-500/20 transition-all">
                  {actionId === current.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" strokeWidth={1.5} />}
                  Approve
                </button>
                <button onClick={() => setRejectModal(true)} disabled={actionId === current.id}
                  className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-500/20 transition-all">
                  <XCircle className="w-4 h-4" strokeWidth={1.5} />
                  Reject
                </button>
                <button onClick={() => setBanModal(true)} disabled={actionId === current.id}
                  className="h-11 px-3 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium flex items-center justify-center gap-1 hover:text-red-400 hover:border-red-500/20 transition-all">
                  <Ban className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t-[0.5px] border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-bg/40 border-[0.5px] border-border font-mono text-text-muted">A</span>
                  <span className="text-[10px] text-text-muted">Approve</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-bg/40 border-[0.5px] border-border font-mono text-text-muted">R</span>
                  <span className="text-[10px] text-text-muted">Reject</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-bg/40 border-[0.5px] border-border font-mono text-text-muted">Space</span>
                  <span className="text-[10px] text-text-muted">Next</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRejectModal(false)}>
          <div className="w-full max-w-md rounded-[20px] bg-surface border-[0.5px] border-border p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-display font-bold">Reject Submission</h3>
                <p className="text-xs text-text-muted">Day {current?.day_number} &mdash; {current?.guest_name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Reason</label>
                <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-11 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm px-3 outline-none focus:border-accent/50 transition-all appearance-none">
                  <option value="">Select a reason...</option>
                  <option value="Blurry / Low quality">Blurry / Low quality</option>
                  <option value="Incomplete proof">Incomplete proof</option>
                  <option value="Doesn&#39;t match task">Doesn&apos;t match task</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Notes (optional)</label>
                <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Additional context for the guest..."
                  className="w-full h-24 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm p-3 outline-none focus:border-accent/50 transition-all resize-none placeholder:text-text-muted/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => { setRejectModal(false); setRejectReason(""); setRejectNote(""); }}
                className="flex-1 h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium hover:text-text transition-all">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason || actionId === current?.id}
                className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-500/20 transition-all">
                {actionId === current?.id ? <Clock className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {banModal && (
        <div className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBanModal(false)}>
          <div className="w-full max-w-md rounded-[20px] bg-surface border-[0.5px] border-border p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-display font-bold">Ban User</h3>
                <p className="text-xs text-text-muted">{current?.guest_name}</p>
              </div>
            </div>

            <p className="text-xs text-text-muted">This will reject all pending submissions and block the user from the platform.</p>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Reason</label>
              <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                className="w-full h-24 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm p-3 outline-none focus:border-accent/50 transition-all resize-none placeholder:text-text-muted/40"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => { setBanModal(false); setBanReason(""); }}
                className="flex-1 h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium hover:text-text transition-all">
                Cancel
              </button>
              <button onClick={handleBan} disabled={!banReason || actionId === "ban"}
                className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-500/20 transition-all">
                {actionId === "ban" ? <Clock className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" strokeWidth={1.5} />}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomed && current?.proof_url && (
        <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomed(false)}>
          <img src={current.proof_url} alt="Proof" className="max-w-full max-h-full rounded-[20px] object-contain" />
        </div>
      )}
    </div>
  );
}
