"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, Receipt } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setProfile(data));
      supabase.from("connections").select("id", { count: "exact", head: true }).eq("guest_id", user.id).eq("status", "completed")
        .then(({ count }) => setConnections(count || 0));
    });
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
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
              <div>
                <h1 className="text-[22px] font-display font-semibold">{profile.name}, {profile.age}</h1>
                <p className="text-sm text-text-muted">{profile.city}</p>
              </div>
              <p className="text-sm text-text-muted max-w-xs mx-auto">{profile.bio}</p>
            </div>

            <div className="rounded-[24px] bg-surface border-[0.5px] border-border p-6 space-y-3">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Connections</p>
              <p className="text-4xl font-display font-bold text-accent tracking-[-0.02em] tabular-nums">{connections}</p>
            </div>

            <div className="space-y-1">
              {[
                { icon: Bell, label: "Notifications" },
                { icon: Shield, label: "Privacy" },
                { icon: HelpCircle, label: "Concierge" },
              ].map((item) => (
                <button key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] hover:bg-white/[0.03] transition-all">
                  <item.icon className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}

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
