"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Compass, Users } from "lucide-react";
import type { Test, Profile } from "@/lib/types";

type TestWithHost = Test & { host: Profile };

export default function DiscoverPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestWithHost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tests")
      .select("*, host:host_id(*)")
      .eq("is_active", true)
      .then(({ data }) => {
        setTests((data || []) as unknown as TestWithHost[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[0.5px] border-accent/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-display font-bold tracking-[-0.02em] text-text">Greenflag</h1>
            <p className="text-sm text-text-muted mt-1">Meet people who show up.</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <Compass className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Users className="w-10 h-10 text-text-muted mx-auto" strokeWidth={1.5} />
            <p className="text-text-muted text-sm">No one new right now.</p>
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
                    src={test.host.photos?.[0] || "https://i.pravatar.cc/400?img=5"}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
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
                <div className="p-5">
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{test.host.bio}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); test.host?.name && router.push(`/${test.host.name.toLowerCase()}`); }}
                    className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] mt-4 hover:brightness-110 transition-all"
                  >
                    Meet Her Standard
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
