"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus, CheckCircle, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Connection, Profile } from "@/lib/types";

type ConnectionFull = Connection & { guest: Profile };

export default function YourStandardsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Interested");
  const [userId, setUserId] = useState("");
  const [connections, setConnections] = useState<ConnectionFull[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      setUserId(user.id);
      supabase
        .from("connections")
        .select("*, guest:guest_id(*)")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setConnections((data || []) as unknown as ConnectionFull[]));
    });
  }, [router]);

  const interested = connections.filter((c) => c.status === "pending");
  const active = connections.filter((c) => c.status === "active");
  const completed = connections.filter((c) => c.status === "completed");

  async function handleConnect(c: ConnectionFull) {
    await supabase.from("connections").update({ status: "active" }).eq("id", c.id);
    setConnections((prev) => prev.map((p) => p.id === c.id ? { ...p, status: "active" } : p));
  }

  async function handlePass(c: ConnectionFull) {
    await supabase.from("connections").update({ status: "withdrawn" }).eq("id", c.id);
    setConnections((prev) => prev.filter((p) => p.id !== c.id));
  }

  const TABS = ["Interested", "In Progress", "Connected"];

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-display font-bold tracking-[-0.02em]">Your Standards</h1>
          <Link href="/your-standards/create"
            className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center hover:border-accent/40 transition-all">
            <Plus className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-[0.5px] transition-all ${
                tab === t ? "bg-accent text-bg border-accent" : "bg-surface text-text-muted border-border"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Interested" && (
          <div className="space-y-3">
            {interested.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-10">No pending interest</p>
            ) : interested.map((c) => (
              <div key={c.id} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <img src={c.guest.photos?.[0] || ""} alt="" className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.guest.name}, {c.guest.age}</h3>
                    <p className="text-xs text-text-muted">{c.guest.city}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handlePass(c)}
                    className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-text-muted text-sm font-medium flex items-center justify-center gap-2">
                    <X className="w-4 h-4" strokeWidth={1.5} /> Pass
                  </button>
                  <button onClick={() => handleConnect(c)}
                    className="flex-1 h-12 rounded-[16px] bg-accent text-bg text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "In Progress" && (
          <div className="space-y-3">
            {active.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-10">No active connections</p>
            ) : active.map((c) => (
              <div key={c.id} onClick={() => router.push(`/review/${c.id}`)}
                className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-3 cursor-pointer hover:border-accent/40 transition-all">
                <div className="flex items-center gap-3">
                  <img src={c.guest.photos?.[0] || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.guest.name}</h3>
                    <p className="text-xs text-text-muted">Day {c.current_day}/8</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                </div>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(c.tasks_completed / 8) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Connected" && (
          <div className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-10">Awaiting connection.</p>
            ) : completed.map((c) => (
              <div key={c.id} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5">
                <div className="flex items-center gap-3">
                  <img src={c.guest.photos?.[0] || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.guest.name}</h3>
                    <p className="text-xs text-text-muted">All 8 intentions complete</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
