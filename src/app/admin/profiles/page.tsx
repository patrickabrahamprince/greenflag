"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, CheckCircle, XCircle, ChevronRight, Shield, Clock } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<(Profile & { is_verified?: boolean; verification_status?: string })[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (filter === "pending") query = query.eq("verification_status", "pending");
    else if (filter === "approved") query = query.eq("verification_status", "approved");
    else if (filter === "rejected") query = query.eq("verification_status", "rejected");
    const { data } = await query;
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, [filter]);

  const handleApprove = async (profile: Profile) => {
    setActionId(profile.id);
    await supabase.from("profiles").update({ verification_status: "approved", is_verified: true }).eq("id", profile.id);
    await supabase.from("notifications").insert({
      user_id: profile.id, type: "profile_approved", title: "Profile Approved",
      body: "Your profile has been verified and is now live on the platform!",
      link: "/profile",
    });
    setActionId(null);
    fetchProfiles();
  };

  const handleReject = async (profile: Profile) => {
    setActionId(profile.id);
    await supabase.from("profiles").update({ verification_status: "rejected", is_verified: false }).eq("id", profile.id);
    await supabase.from("notifications").insert({
      user_id: profile.id, type: "profile_rejected", title: "Profile Needs Changes",
      body: "Your profile did not pass verification. Please update and resubmit.",
      link: "/profile/edit",
    });
    setActionId(null);
    fetchProfiles();
  };

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())
  );

  const FILTERS = [
    { key: "pending" as const, label: "Pending", color: "text-yellow-400" },
    { key: "approved" as const, label: "Approved", color: "text-green-400" },
    { key: "rejected" as const, label: "Rejected", color: "text-red-400" },
    { key: "all" as const, label: "All", color: "text-text-muted" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Profiles</h1>
          <p className="text-sm text-text-muted mt-1">Review and verify user profiles</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              filter === f.key ? "bg-accent/10 text-accent border-[0.5px] border-accent/30" : "bg-surface border-[0.5px] border-border text-text-muted hover:text-text"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or city..."
          className="w-full h-12 pl-11 pr-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all text-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No profiles found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((profile) => (
            <div key={profile.id} className="flex items-center gap-4 p-4 rounded-[16px] bg-surface border-[0.5px] border-border hover:border-accent/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                {profile.photos?.[0] ? (
                  <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-accent">{profile.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text truncate">{profile.name}, {profile.age}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    profile.role === "woman" ? "bg-pink-500/10 text-pink-400" : "bg-blue-500/10 text-blue-400"
                  }`}>{profile.role}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    profile.verification_status === "approved" ? "bg-green-500/10 text-green-400" :
                    profile.verification_status === "rejected" ? "bg-red-500/10 text-red-400" :
                    "bg-yellow-500/10 text-yellow-400"
                  }`}>{profile.verification_status || "pending"}</span>
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">{profile.city} &middot; {profile.bio?.slice(0, 60)}</p>
              </div>
              {profile.verification_status === "pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleReject(profile)} disabled={actionId === profile.id}
                    className="w-9 h-9 rounded-full bg-red-500/10 border-[0.5px] border-red-500/20 flex items-center justify-center disabled:opacity-30">
                    {actionId === profile.id ? <Clock className="w-4 h-4 text-red-400 animate-spin" /> : <XCircle className="w-4 h-4 text-red-400" strokeWidth={1.5} />}
                  </button>
                  <button onClick={() => handleApprove(profile)} disabled={actionId === profile.id}
                    className="w-9 h-9 rounded-full bg-green-500/10 border-[0.5px] border-green-500/20 flex items-center justify-center disabled:opacity-30">
                    {actionId === profile.id ? <Clock className="w-4 h-4 text-green-400 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-400" strokeWidth={1.5} />}
                  </button>
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.5} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
