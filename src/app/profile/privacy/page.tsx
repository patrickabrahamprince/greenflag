"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldOff } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();
  const [showAge, setShowAge] = useState(true);
  const [showCity, setShowCity] = useState(true);

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Privacy</h1>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
            <span className="text-sm">Show age on profile</span>
            <button onClick={() => setShowAge(!showAge)}
              className={`w-12 h-7 rounded-full transition-all ${showAge ? "bg-accent" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-bg transition-all ${showAge ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
            <span className="text-sm">Show city on profile</span>
            <button onClick={() => setShowCity(!showCity)}
              className={`w-12 h-7 rounded-full transition-all ${showCity ? "bg-accent" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-bg transition-all ${showCity ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        <Link href="/profile/blocked"
          className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] bg-surface border-[0.5px] border-border hover:bg-white/[0.03] transition-all">
          <ShieldOff className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm">Blocked users</p>
            <p className="text-xs text-text-muted">Manage your blocked list</p>
          </div>
        </Link>

        <div className="px-4 py-3 rounded-[16px] bg-surface border-[0.5px] border-border">
          <p className="text-xs text-text-muted leading-relaxed">
            Your data is private. We never share your information with third parties.
            Photos and submissions are only visible to connection participants.
          </p>
        </div>
      </div>
    </div>
  );
}
