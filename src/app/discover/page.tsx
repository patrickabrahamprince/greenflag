"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import type { Test, Profile } from "@/lib/types";
import { requireOnboarded } from "@/lib/auth";
import { CardSkeleton } from "@/components/Skeleton";
import { usePullToRefresh } from "@/lib/usePullToRefresh";

type TestWithHost = Test & { host: Profile };

export default function DiscoverPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestWithHost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) { router.replace("/onboard"); return; }
      supabase
        .from("tests")
        .select("*, host:host_id(*)")
        .eq("is_active", true)
        .then(({ data }) => {
          setTests((data || []) as unknown as TestWithHost[]);
          setLoading(false);
        });
    });
  }, [router]);

  async function refresh() {
    const { data } = await supabase
      .from("tests")
      .select("*, host:host_id(*)")
      .eq("is_active", true);
    setTests((data || []) as unknown as TestWithHost[]);
  }

  const { pulling, refreshing, pullProgress } = usePullToRefresh(refresh);

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="h-8 w-1/3 rounded-full bg-surface-elevated animate-pulse" />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24 animate-fade-in">
      <div className="max-w-lg mx-auto space-y-5">
        {(pulling || refreshing) && (
          <div className="flex justify-center py-2" style={{ opacity: pullProgress }}>
            <div className={`w-6 h-6 rounded-full border-2 border-accent border-t-transparent ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-display font-bold tracking-[-0.02em] text-text">Greenflag</h1>
            <p className="text-sm text-text-muted mt-1">Meet people who show up.</p>
          </div>
          <button onClick={() => router.push("/notifications")} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <Bell className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">No standards yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                onClick={() => test.host?.name && router.push(`/${test.host.name.toLowerCase()}`)}
                className="rounded-[24px] bg-surface border-[0.5px] border-border overflow-hidden cursor-pointer hover:border-accent/40 transition-all duration-400"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={test.host.photos?.[0] || ""}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {!test.host.photos?.[0] && (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-bg flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
                        <span className="text-[32px] font-display font-bold text-accent/60">
                          {test.host.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[22px] font-display font-semibold tracking-[-0.02em] text-text">
                        {test.host.name}, {test.host.age}
                      </h2>
                      <span className="text-[11px] text-text-muted bg-bg/60 backdrop-blur-xl px-3 py-1.5 rounded-full border-[0.5px] border-border capitalize">
                        {test.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-1 line-clamp-1">{test.name}</p>
                    <p className="text-xs text-text-muted/60 mt-1">{test.host.city}</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="rounded-[16px] bg-bg/40 border-[0.5px] border-border p-4 space-y-2">
                    <p className="text-xs text-accent font-semibold uppercase tracking-wider">Green Flags</p>
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{test.host.bio}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); test.host?.name && router.push(`/${test.host.name.toLowerCase()}`); }}
                    className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] hover:brightness-110 transition-all"
                  >
                    Meet Her Green Flags
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
