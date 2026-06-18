"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import type { Test, Profile } from "@/lib/types";
import { requireOnboarded } from "@/lib/auth";
import { CardSkeleton } from "@/components/Skeleton";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import { INTENTION_CONFIG } from "@/lib/task-templates";
import { cn } from "@/lib/utils";

type TestWithHost = Test & { host: Profile; intentions?: string[] };

export default function DiscoverPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) {
        router.replace("/onboard");
        return;
      }

      // Fetch user's profile info
      supabase
        .from("profiles")
        .select("language_preference, role, interests")
        .eq("id", uid)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserProfile(data);
            if (data.language_preference) {
              setLang(data.language_preference as "en" | "hi");
            }
            if (data.role === "man" && (!data.interests || data.interests.length === 0)) {
              router.replace("/onboarding/interests");
              return;
            }

            let query = supabase
              .from("tests")
              .select("*, host:host_id(*)")
              .eq("is_active", true);

            if (activeFilter) {
              query = query.contains("intentions", [activeFilter]);
            } else if (data.interests && data.interests.length > 0) {
              query = query.overlaps("intentions", data.interests);
            }

            query.then(({ data: testsData }) => {
              setTests((testsData || []) as unknown as TestWithHost[]);
              setLoading(false);
            });
          }
        });
    });
  }, [activeFilter, router]);

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("interests")
      .eq("id", user.id)
      .maybeSingle();

    let query = supabase
      .from("tests")
      .select("*, host:host_id(*)")
      .eq("is_active", true);

    if (activeFilter) {
      query = query.contains("intentions", [activeFilter]);
    } else if (profile?.interests && profile.interests.length > 0) {
      query = query.overlaps("intentions", profile.interests);
    }

    const { data } = await query;
    setTests((data || []) as unknown as TestWithHost[]);
  }

  const { pulling, refreshing, pullProgress } = usePullToRefresh(refresh);

  async function handleToggleLanguage() {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ language_preference: newLang }).eq("id", user.id);
    }
  }

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
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24 animate-fade-in font-sans">
      <div className="max-w-lg mx-auto space-y-5">
        {(pulling || refreshing) && (
          <div className="flex justify-center py-2" style={{ opacity: pullProgress }}>
            <div
              className={`w-6 h-6 rounded-full border-2 border-accent border-t-transparent ${
                refreshing ? "animate-spin" : ""
              }`}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-display font-bold tracking-[-0.02em] text-text">
              Greenflag
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {lang === "hi" ? "उनसे मिलें जो सच में आते हैं।" : "Meet people who show up."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLanguage}
              className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border text-xs font-semibold transition-all cursor-pointer text-accent"
            >
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
            <button
              onClick={() => router.push("/notifications")}
              className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Intention Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide">
          <button
            onClick={() => setActiveFilter(null)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 whitespace-nowrap",
              !activeFilter
                ? "bg-[#16A34A] text-white border-[#16A34A]"
                : "bg-surface text-text-muted border-border hover:border-text-muted/30"
            )}
          >
            {lang === "hi" ? "आपके लिए" : "For You"}
          </button>
          {INTENTION_CONFIG.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap",
                activeFilter === item.id
                  ? "bg-[#16A34A] text-white border-[#16A34A]"
                  : "bg-surface text-text-muted border-border hover:border-text-muted/30"
              )}
            >
              <span>{item.icon}</span>
              <span>{lang === "hi" ? item.label_hi : item.label}</span>
            </button>
          ))}
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">
              {lang === "hi"
                ? "अभी कोई स्टैंडर्ड नहीं है। जल्द ही दोबारा देखें।"
                : "No standards yet. Check back soon."}
            </p>
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

                    {/* Intention Badges */}
                    {test.intentions && test.intentions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {test.intentions.map((id) => {
                          const config = INTENTION_CONFIG.find((i) => i.id === id);
                          if (!config) return null;
                          return (
                            <span
                              key={id}
                              style={{ backgroundColor: config.color + "20", color: config.color }}
                              className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <span>{config.icon}</span>
                              <span>{lang === "hi" ? config.label_hi : config.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="rounded-[16px] bg-bg/40 border-[0.5px] border-border p-4 space-y-3">
                    {test.host.about_me_tags && test.host.about_me_tags.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                          {lang === "hi" ? "उनके बारे में" : "About Her"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {test.host.about_me_tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-full text-[10px] bg-white/[0.04] text-text border-[0.5px] border-border font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {test.host.looking_for_tags && test.host.looking_for_tags.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-accent uppercase tracking-wider font-semibold">
                          {lang === "hi" ? "दिलचस्पी" : "Interested In"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {test.host.looking_for_tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-full text-[10px] bg-accent/10 text-accent border-[0.5px] border-accent/20 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!test.host.about_me_tags || test.host.about_me_tags.length === 0) && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-accent uppercase tracking-wider font-semibold">
                          {lang === "hi" ? "ग्रीन फ्लैग्स" : "Green Flags"}
                        </p>
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                          {test.host.bio}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      test.host?.name && router.push(`/${test.host.name.toLowerCase()}`);
                    }}
                    className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] hover:brightness-110 transition-all"
                  >
                    {lang === "hi" ? "उनके ग्रीन फ्लैग्स देखें" : "Meet Her Green Flags"}
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
