"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, FileCheck, ImageIcon } from "lucide-react";
import type { Submission, Connection, Profile } from "@/lib/types";

interface SubmissionWithDetails extends Submission {
  connection?: Connection & { guest?: Profile; host?: Profile };
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [filter, setFilter] = useState<"submitted" | "approved" | "rejected" | "all">("submitted");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    let query = supabase
      .from("submissions")
      .select("*, connection:connection_id(*, guest:guest_id(*), host:host_id(*))")
      .order("submitted_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setSubmissions((data || []) as unknown as SubmissionWithDetails[]);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, [filter]);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setActionId(id);
    const { data: sub } = await supabase
      .from("submissions")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (status === "approved" && sub) {
      await supabase.from("connections").update({ tasks_completed: sub.day_number }).eq("id", sub.connection_id);
      if (sub.day_number >= 8) {
        await supabase.from("connections").update({ status: "completed" }).eq("id", sub.connection_id);
      }
    }

    if (sub?.connection_id) {
      const { data: conn } = await supabase.from("connections").select("guest_id, host_id").eq("id", sub.connection_id).single();
      if (conn) {
        await supabase.from("notifications").insert({
          user_id: conn.guest_id,
          type: "submission_" + status,
          title: status === "approved" ? "Submission Approved" : "Submission Rejected",
          body: status === "approved"
            ? "Day " + sub.day_number + " submission was approved. Keep going!"
            : "Day " + sub.day_number + " submission was rejected. Please resubmit.",
          link: "/connections",
        });
      }
    }

    setActionId(null);
    fetchSubmissions();
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "submitted": return "bg-yellow-500/10 text-yellow-400";
      case "approved": return "bg-green-500/10 text-green-400";
      case "rejected": return "bg-red-500/10 text-red-400";
      default: return "bg-surface text-text-muted";
    }
  };

  const FILTERS = [
    { key: "submitted" as const, label: "Pending" },
    { key: "approved" as const, label: "Approved" },
    { key: "rejected" as const, label: "Rejected" },
    { key: "all" as const, label: "All" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Submissions</h1>
        <p className="text-sm text-text-muted mt-1">Review intention submissions</p>
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
      ) : submissions.length === 0 ? (
        <div className="text-center py-12">
          <FileCheck className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-[20px] bg-surface border-[0.5px] border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                    {sub.connection?.guest?.photos?.[0] ? (
                      <img src={sub.connection.guest.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-accent">{sub.connection?.guest?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{sub.connection?.guest?.name || "Unknown"} → {sub.connection?.host?.name || "Unknown"}</p>
                    <p className="text-xs text-text-muted">Day {sub.day_number} · {new Date(sub.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <span className={"text-[10px] px-2.5 py-1 rounded-full capitalize " + getStatusColor(sub.status)}>
                  {sub.status}
                </span>
              </div>

              {sub.proof_url && (
                <button onClick={() => setLightboxUrl(sub.proof_url!)}
                  className="flex items-center gap-2 text-xs text-accent hover:underline">
                  <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  View Proof
                </button>
              )}

              {sub.status === "submitted" && (
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => handleReview(sub.id, "rejected")} disabled={actionId === sub.id}
                    className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 transition-all">
                    {actionId === sub.id ? <Clock className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" strokeWidth={1.5} />}
                    Reject
                  </button>
                  <button onClick={() => handleReview(sub.id, "approved")} disabled={actionId === sub.id}
                    className="flex-1 h-11 rounded-[14px] bg-green-500/10 border-[0.5px] border-green-500/20 text-green-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 transition-all">
                    {actionId === sub.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" strokeWidth={1.5} />}
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Proof" className="max-w-full max-h-full rounded-[20px] object-contain" />
        </div>
      )}
    </div>
  );
}
