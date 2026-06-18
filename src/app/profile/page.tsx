"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, Edit3, Trash2, Smartphone, CheckCircle, ShieldCheck, Coins } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import { requireOnboarded } from "@/lib/auth";
import SaveButton from "@/components/save/SaveButton";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connections, setConnections] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) { router.replace("/onboard"); return; }
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle().then(({ data }) => {
        if (data) {
          if (data.role === "man" && (!data.interests || data.interests.length === 0)) {
            router.replace("/onboarding/interests");
            return;
          }
          setProfile(data);
        }
        setLoading(false);
      });
      supabase.from("connections").select("id", { count: "exact", head: true }).eq("guest_id", uid).eq("status", "completed")
        .then(({ count }) => setConnections(count || 0));
    });
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function maskPhone(phone: string) {
    return phone.slice(0, 3) + "XXXXX" + phone.slice(-4);
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg px-4 pt-6 pb-24 animate-fade-in">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="w-10 h-10 rounded-full bg-surface-elevated animate-pulse" />
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Profile</h1>
        </div>

        {profile && (
          <>
            <div className="text-center space-y-4">
              <img src={profile.photos?.[0] || ""} alt="" className="w-24 h-24 rounded-full object-cover mx-auto" />
              <div className="flex items-center gap-2 justify-center">
                <h1 className="text-[22px] font-display font-semibold">{profile.name}, {profile.age}</h1>
                <Link href="/profile/edit" className="text-text-muted hover:text-accent transition-colors">
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
              <p className="text-sm text-text-muted">{profile.city}</p>
              {profile.phone && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
                  <Smartphone className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{maskPhone(profile.phone)}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                </div>
              )}
              <p className="text-sm text-text-muted max-w-xs mx-auto">{profile.bio}</p>
              {profile.looking_for_tags && profile.looking_for_tags.length > 0 && (
                <div className="max-w-xs mx-auto">
                  <p className="text-[11px] text-accent uppercase tracking-[0.08em] font-semibold mb-3">Looking for</p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {profile.looking_for_tags.map((tag) => (
                      <span key={tag} className="text-sm font-medium px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 text-accent">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.about_me_tags && profile.about_me_tags.length > 0 && (
                <div className="max-w-xs mx-auto">
                  <p className="text-[11px] text-text-muted uppercase tracking-[0.08em] font-semibold mb-3">About me</p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {profile.about_me_tags.map((tag) => (
                      <span key={tag} className="text-sm font-medium px-5 py-2.5 rounded-full bg-surface border border-border text-text">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[24px] bg-surface border-[0.5px] border-border p-6 space-y-3">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Connections</p>
              <p className="text-4xl font-display font-bold text-accent tracking-[-0.02em] tabular-nums">{connections}</p>
            </div>

            <div className="space-y-1">
                                  <SaveButton
                      onSave={() => router.push("/admin")}
                      label="Admin"
                      disabled={false}
                      loadingLabel="Loading..."
                    />
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] bg-accent/5 border-[0.5px] border-accent/20 hover:bg-accent/10 transition-all">
                <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-sm text-accent font-medium">Admin</span>
              </button>
              {[
                { icon: Coins, label: "Coins & Store", href: "/store" },
                { icon: Bell, label: "Notifications", href: "/profile/notifications" },
                { icon: Shield, label: "Privacy", href: "/profile/privacy" },
                { icon: HelpCircle, label: "Concierge", href: "/profile/concierge" },
              ].map((item) => (
                <button key={item.label} onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
                  <item.icon className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}

              <button onClick={() => router.push("/profile/delete")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
                <Trash2 className="w-5 h-5 text-danger" strokeWidth={1.5} />
                <span className="text-sm text-danger">Delete Account</span>
              </button>
              <button onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
                <LogOut className="w-5 h-5 text-danger" strokeWidth={1.5} />
                <span className="text-sm text-danger">Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
