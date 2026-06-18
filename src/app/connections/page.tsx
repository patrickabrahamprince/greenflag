"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Timer, CheckCircle, XCircle, Snowflake, Users } from "lucide-react";
import type { Connection, Profile, Test } from "@/lib/types";
import { requireOnboarded } from "@/lib/auth";
import { expireOverdueConnections, daysLeft } from "@/lib/utils";
import { ListSkeleton } from "@/components/Skeleton";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import EmptyState from "@/components/EmptyState";

type ConnectionFull = Connection & { host: Profile; test: Test };

export default function ConnectionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Active");
  const [connections, setConnections] = useState<ConnectionFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) { router.replace("/onboard"); return; }

      // Check if user is a man with empty interests
      supabase
        .from("profiles")
        .select("role, interests")
        .eq("id", uid)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.role === "man" && (!data.interests || data.interests.length === 0)) {
            router.replace("/onboarding/interests");
            return;
          }
        });

      expireOverdueConnections().then(() => {
        supabase
          .from("connections")
          .select("*, host:host_id(*), test:test_id(*)")
          .eq("guest_id", uid)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            setConnections((data || []) as unknown as ConnectionFull[]);
            setLoading(false);
          });
      });
    });
  }, [router]);

  async function refresh() {
    await expireOverdueConnections();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("connections")
      .select("*, host:host_id(*), test:test_id(*)")
      .eq("guest_id", user.id)
      .order("created_at", { ascending: false });
    setConnections((data || []) as unknown as ConnectionFull[]);
  }

  const { pulling, refreshing, pullProgress } = usePullToRefresh(refresh);

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated animate-pulse" />
            <div className="h-7 w-48 rounded-full bg-surface-elevated animate-pulse" />
          </div>
          <ListSkeleton count={2} />
        </div>
      </div>
    );
  }

  const active = connections.filter((c) => c.status === "active");
  const completed = connections.filter((c) => c.status === "completed");
  const failed = connections.filter((c) => ["failed", "withdrawn"].includes(c.status));

  const TABS = ["Active", "Connected", "Expired"];

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24 animate-fade-in">
      <div className="max-w-lg mx-auto space-y-6">
        {(pulling || refreshing) && (
          <div className="flex justify-center py-2" style={{ opacity: pullProgress }}>
            <div className={`w-6 h-6 rounded-full border-2 border-accent border-t-transparent ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }} />
          </div>
        )}
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
              <EmptyState icon={Timer} title="No active connections" description="Browse Discover to start a connection." action={{ label: "Discover", onClick: () => router.push("/discover") }} />
            ) : active.map((c) => (
              <div key={c.id} onClick={() => router.push(`/${c.host.name.toLowerCase()}`)}
                className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-3 cursor-pointer hover:border-accent/40 transition-all">
                <div className="flex items-center gap-3">
                  <img src={c.host.photos?.[0] || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[17px]">{c.host.name}</h3>
                    <p className="text-xs text-text-muted">Day {c.current_day}/8</p>
                  </div>
                  {c.streak_frozen && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border-[0.5px] border-accent/20">
                      <Snowflake className="w-3 h-3 text-accent" strokeWidth={1.5} />
                      <span className="text-[10px] text-accent font-medium">Frozen</span>
                    </div>
                  )}
                </div>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(c.tasks_completed / 8) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{c.tasks_completed}/8 complete</span>
                  <span>{daysLeft(c.expires_at)}d left</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Connected" && (
          <div className="space-y-3">
            {completed.length === 0 ? (
              <EmptyState icon={CheckCircle} title="No connections yet" description="Complete a standard to build a connection." />
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
              <EmptyState icon={XCircle} title="No expired connections" description="Expired connections will appear here." />
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
