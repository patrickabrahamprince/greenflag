"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import type { Submission } from "@/lib/types";
import { requireOnboarded } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import ImageLightbox from "@/components/ImageLightbox";
import { ArrowLeft, CheckCircle, X } from "lucide-react";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [guestName, setGuestName] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) { router.replace("/onboard"); return; }
    });
    const connectionId = params.id as string;
    supabase.from("submissions").select("*").eq("connection_id", connectionId).order("day_number")
      .then(({ data }) => setSubmissions(data || []));

    supabase.from("connections").select("guest:guest_id(name)").eq("id", connectionId).maybeSingle()
      .then(({ data }) => {
        if (data) setGuestName((data as any).guest?.name || "");
      });
  }, [params.id]);

  async function review(sub: Submission, status: "approved" | "rejected") {
    try {
      const res = await fetch("/api/connections/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: sub.id, action: status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("error", data.error || "Failed to review submission");
        return;
      }
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status } : s))
      );
      if (status === "approved") {
        toast("success", `Day ${sub.day_number} approved!`);
      } else {
        toast("info", `Day ${sub.day_number} passed.`);
      }
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to review submission");
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 glass-strong">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-display font-semibold">Reviewing {guestName}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {submissions.length === 0 && (
            <p className="text-center text-text-muted text-sm py-20">No submissions yet.</p>
          )}
          {submissions.map((sub) => {
            const isVoice = sub.proof_type === "voice" || (sub.proof_url && (sub.proof_url.endsWith(".webm") || sub.proof_url.includes("/voice-")));
            const isText = sub.proof_type === "text" || (!sub.proof_url && sub.proof_text);
            const isPending = sub.status === "submitted" || sub.status === "pending";

            return (
              <div key={sub.id} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Day {sub.day_number}</p>
                  {isPending && (
                    <span className="text-xs text-accent">Pending review</span>
                  )}
                  {sub.status === "approved" && (
                    <span className="text-xs text-accent flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  )}
                  {sub.status === "rejected" && (
                    <span className="text-xs text-danger">Rejected</span>
                  )}
                </div>

                {isText ? (
                  <div className="p-4 rounded-[16px] bg-bg/40 border-[0.5px] border-border text-sm text-text leading-relaxed font-sans">
                    {sub.proof_text}
                  </div>
                ) : isVoice && sub.proof_url ? (
                  <div className="py-2">
                    <audio controls src={sub.proof_url} className="w-full h-10 rounded-lg" />
                  </div>
                ) : sub.proof_url ? (
                  <button onClick={() => setLightboxIndex(submissions.indexOf(sub))} className="w-full">
                    <img src={sub.proof_url} alt="" className="w-full rounded-[16px] object-cover h-48 hover:opacity-90 transition-opacity" />
                  </button>
                ) : null}

                {isPending && (
                  <div className="flex gap-3">
                    <button onClick={() => review(sub, "rejected")}
                      className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-text-muted font-medium text-sm flex items-center justify-center gap-2 cursor-pointer">
                      <X className="w-4 h-4" /> Pass
                    </button>
                    <button onClick={() => review(sub, "approved")}
                      className="flex-1 h-12 rounded-[16px] bg-accent text-bg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer">
                      <CheckCircle className="w-4 h-4" /> Connect
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lightboxIndex >= 0 && (() => {
        const filteredUrls = submissions.filter(
          (s) => s.proof_url &&
            s.proof_type !== "voice" &&
            s.proof_type !== "text" &&
            !s.proof_url.endsWith(".webm") &&
            !s.proof_url.includes("/voice-")
        );
        const currentIndex = filteredUrls.findIndex((s) => s.id === submissions[lightboxIndex]?.id);
        if (currentIndex === -1 || filteredUrls.length === 0) return null;
        return (
          <ImageLightbox
            images={filteredUrls.map((s) => s.proof_url!)}
            index={Math.max(0, currentIndex)}
            onClose={() => setLightboxIndex(-1)}
            onPrev={() => {
              const prevIdx = (currentIndex - 1 + filteredUrls.length) % filteredUrls.length;
              setLightboxIndex(submissions.findIndex((s) => s.id === filteredUrls[prevIdx].id));
            }}
            onNext={() => {
              const nextIdx = (currentIndex + 1) % filteredUrls.length;
              setLightboxIndex(submissions.findIndex((s) => s.id === filteredUrls[nextIdx].id));
            }}
          />
        );
      })()}
    </div>
  );
}
