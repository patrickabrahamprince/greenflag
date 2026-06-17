"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Timer, CheckCircle, XCircle } from "lucide-react";
import type { Connection, Profile, Test } from "@/lib/types";

type ConnectionFull = Connection & { host: Profile; test: Test };

export default function ConnectionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Active");
  const [connections, setConnections] = useState<ConnectionFull[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("connections")
        .select("*, host:host_id(*), test:test_id(*)")
        .eq("guest_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setConnections((data || []) as unknown as ConnectionFull[]));
    });
  }, []);

  const active = connections.filter((c) => c.status === "active");
  const completed = connections.filter((c) => c.status === "completed");
  const failed = connections.filter((c) => ["failed", "withdrawn"].includes(c.status));

  const TABS = ["Active", "Connected", "Expired"];

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/discover")} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Your Connections</h1>
        </div>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-[0.5px] transition-all ${
                tab === t ? "bg-accent text-bg border-accent" : "bg-surface text-text-muted border-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Active" && (
          <div className="space-y-3">
            {active.length === 0 ? (
              <div className="text-center py-20">
                <Timer className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-text-muted text-sm">No connections yet. Browse Discover.</p>
              </div>
            ) : active.map((c) => (
              <div key={c.id} onClick={() => router.push(`/${c.host.name.toLowerCase()}`)}
                className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-3 cursor-pointer hover:border-accent/40 transition-all">
                <div className="flex items-center gap-3">
                  <img src={c.host.photos?.[0] || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.host.name}</h3>
                    <p className="text-xs text-text-muted">Day {c.current_day}/8</p>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(c.tasks_completed / 8) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{c.tasks_completed}/8 complete</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Connected" && (
          <div className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-20">No connections yet</p>
            ) : completed.map((c) => (
              <div key={c.id} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5">
                <div className="flex items-center gap-3">
                  <img src={c.host.photos?.[0] || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.host.name}</h3>
                    <p className="text-xs text-text-muted">Connected</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Expired" && (
          <div className="space-y-3">
            {failed.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-20">No expired connections</p>
            ) : failed.map((c) => (
              <div key={c.id} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5">
                <div className="flex items-center gap-3">
                  <img src={c.host.photos?.[0] || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.host.name}</h3>
                    <p className="text-xs text-text-muted">Not connected</p>
                  </div>
                  <XCircle className="w-6 h-6 text-danger" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
