"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, Flag } from "lucide-react";

const REASONS = [
  "Inappropriate content",
  "Harassment",
  "Fake profile",
  "Spam",
  "Other",
];

export default function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profile_id");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("reports").insert({
      reporter_id: user?.id,
      reported_id: profileId,
      reason,
      details,
    });
    if (!error) setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <Flag className="w-12 h-12 text-accent mx-auto" strokeWidth={1.5} />
          <h1 className="text-[22px] font-display font-semibold">Report sent</h1>
          <p className="text-sm text-text-muted">We'll review this within 24 hours.</p>
          <button onClick={() => router.push("/discover")}
            className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px]">
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Report</h1>
        </div>

        <p className="text-sm text-text-muted">Why are you reporting this profile?</p>

        <div className="space-y-2">
          {REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)}
              className={`w-full px-4 py-3.5 rounded-[16px] text-sm text-left transition-all ${
                reason === r ? "bg-accent/10 border-[0.5px] border-accent/30 text-accent" : "bg-surface border-[0.5px] border-border text-text"
              }`}>
              {r}
            </button>
          ))}
        </div>

        {reason && (
          <>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Additional details (optional)"
              className="w-full h-24 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
            <button onClick={handleSubmit} disabled={!reason}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" strokeWidth={1.5} /> Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
