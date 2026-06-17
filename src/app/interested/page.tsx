"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import type { Connection, Profile } from "@/lib/types";

type ConnectionFull = Connection & { guest: Profile };

export default function InterestedPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionFull[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("connections")
        .select("*, guest:guest_id(*)")
        .eq("host_id", user.id)
        .eq("status", "pending")
        .then(({ data }) => setConnections((data || []) as unknown as ConnectionFull[]));
    });
  }, []);

  async function connect(c: ConnectionFull) {
    await supabase.from("connections").update({ status: "active" }).eq("id", c.id);
    setConnections((prev) => prev.filter((p) => p.id !== c.id));
  }

  async function pass(c: ConnectionFull) {
    await supabase.from("connections").update({ status: "withdrawn" }).eq("id", c.id);
    setConnections((prev) => prev.filter((p) => p.id !== c.id));
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Interested</h1>
        </div>

        {connections.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-20">No one interested yet.</p>
        ) : (
          <div className="space-y-3">
            {connections.map((c) => (
              <div key={c.id} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <img src={c.guest.photos?.[0] || ""} alt="" className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.guest.name}, {c.guest.age}</h3>
                    <p className="text-xs text-text-muted">{c.guest.city}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => pass(c)}
                    className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-text-muted text-sm font-medium flex items-center justify-center gap-2">
                    <X className="w-4 h-4" strokeWidth={1.5} /> Pass
                  </button>
                  <button onClick={() => connect(c)}
                    className="flex-1 h-12 rounded-[16px] bg-accent text-bg text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
