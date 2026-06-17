"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TOGGLES = [
  { key: "messages", label: "New messages" },
  { key: "submissions", label: "Submission reviews" },
  { key: "interest", label: "New interest" },
  { key: "expiry", label: "Expiring connections" },
  { key: "marketing", label: "Product updates" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    messages: true, submissions: true, interest: true, expiry: true, marketing: false,
  });

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Notifications</h1>
        </div>

        <div className="space-y-1">
          {TOGGLES.map((item) => (
            <div key={item.key} className="flex items-center justify-between px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
              <span className="text-sm">{item.label}</span>
              <button onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))}
                className={`w-12 h-7 rounded-full transition-all ${settings[item.key] ? "bg-accent" : "bg-border"}`}>
                <div className={`w-5 h-5 rounded-full bg-bg transition-all ${settings[item.key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
