"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Ban, CheckCircle, XCircle, Eye, AlertTriangle, Users as UsersIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { Profile } from "@/lib/types";

type FilterType = "all" | "active" | "banned" | "women" | "men";

interface ProfileWithMeta extends Profile {
  is_banned?: boolean;
  ban_reason?: string;
  banned_at?: string;
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<ProfileWithMeta[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewProfile, setViewProfile] = useState<ProfileWithMeta | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [banModal, setBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banTarget, setBanTarget] = useState<ProfileWithMeta | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [bulkBanning, setBulkBanning] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<"man" | "woman">("man");
  const [adding, setAdding] = useState(false);

  const PAGE_SIZE = 15;

  const fetchProfiles = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });

    if (filter === "banned") query = query.eq("is_banned", true);
    else if (filter === "active") query = query.eq("is_banned", false);
    else if (filter === "women") query = query.eq("role", "woman");
    else if (filter === "men") query = query.eq("role", "man");

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, count } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setProfiles((data || []) as ProfileWithMeta[]);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { setPage(0); }, [filter, search]);

  useEffect(() => { fetchProfiles(); }, [filter, page, search]);

  const handleViewProfile = async (profile: ProfileWithMeta) => {
    setViewProfile(profile);
    const { count: subCount } = await supabase.from("submissions").select("id", { count: "exact", head: true })
      .in("connection_id", (await supabase.from("connections").select("id").or(`guest_id.eq.${profile.id},host_id.eq.${profile.id}`)).data?.map(c => c.id) || []);
    setSubmissionCount(subCount || 0);

    const { count: connCount } = await supabase.from("connections").select("id", { count: "exact", head: true })
      .or(`guest_id.eq.${profile.id},host_id.eq.${profile.id}`);
    setConnectionCount(connCount || 0);
  };

  const handleBan = async () => {
    if (!banTarget || !banReason) return;
    setActionId(banTarget.id);
    await fetch(`/api/admin/users/${banTarget.id}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: banReason }),
    });
    setActionId(null);
    setBanModal(false);
    setBanReason("");
    setBanTarget(null);
    fetchProfiles();
  };

  const handleUnban = async (profile: ProfileWithMeta) => {
    setActionId(profile.id);
    await fetch(`/api/admin/users/${profile.id}/unban`, { method: "POST" });
    setActionId(null);
    fetchProfiles();
  };

  const handleBulkBan = async () => {
    setBulkBanning(true);
    for (const id of selected) {
      await fetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Bulk ban" }),
      });
    }
    setBulkBanning(false);
    setSelected(new Set());
    fetchProfiles();
  };

  const toggleSelected = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === profiles.length) setSelected(new Set());
    else setSelected(new Set(profiles.map(p => p.id)));
  };

  const filtered = profiles;

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "banned", label: "Banned" },
    { key: "women", label: "Women" },
    { key: "men", label: "Men" },
  ];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startItem = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalCount);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Users</h1>
        <p className="text-sm text-text-muted mt-1">Manage platform users</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..."
            className="w-full h-12 pl-11 pr-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all text-sm" />
        </div>
        <button onClick={() => setAddModal(true)}
          className="h-12 px-5 rounded-[16px] bg-accent text-bg text-sm font-semibold flex items-center gap-2 shrink-0 transition-all hover:brightness-110">
          + Add User
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={"px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap " + (filter === f.key ? "bg-accent/10 text-accent border-[0.5px] border-accent/30" : "bg-surface border-[0.5px] border-border text-text-muted hover:text-text")}>
            {f.label}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-[16px] bg-accent/5 border-[0.5px] border-accent/20">
          <span className="text-sm text-text">{selected.size} selected</span>
          <button onClick={handleBulkBan} disabled={bulkBanning}
            className="h-9 px-4 rounded-full bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 disabled:opacity-30 hover:bg-red-500/20 transition-all">
            {bulkBanning ? <Ban className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" strokeWidth={1.5} />}
            Ban Selected
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-[10px] text-text-muted uppercase tracking-wider font-medium">
            <div className="w-5 shrink-0">
              <input type="checkbox" checked={selected.size === profiles.length && profiles.length > 0} onChange={toggleAll}
                className="accent-accent" />
            </div>
            <div className="w-10 shrink-0" />
            <div className="flex-1 grid grid-cols-6 gap-2">
              <span>Name</span>
              <span>Age</span>
              <span>City</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Status</span>
            </div>
            <div className="w-24 shrink-0" />
          </div>

          {filtered.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 p-4 rounded-[16px] bg-surface border-[0.5px] border-border hover:border-accent/20 transition-all">
              <div className="w-5 shrink-0">
                <input type="checkbox" checked={selected.has(profile.id)} onChange={() => toggleSelected(profile.id)}
                  className="accent-accent" />
              </div>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                {profile.photos?.[0] ? (
                  <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-accent">{profile.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                <p className="text-sm font-medium text-text truncate">{profile.name}</p>
                <p className="text-xs text-text-muted">{profile.age}</p>
                <p className="text-xs text-text-muted truncate">{profile.city}</p>
                <span className={"text-[10px] px-2 py-0.5 rounded-full w-fit capitalize " + (profile.role === "woman" ? "bg-pink-500/10 text-pink-400" : "bg-blue-500/10 text-blue-400")}>
                  {profile.role}
                </span>
                <p className="text-xs text-text-muted">{new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                {profile.is_banned ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full w-fit bg-red-500/10 text-red-400">Banned</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full w-fit bg-green-500/10 text-green-400">Active</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleViewProfile(profile)}
                  className="w-8 h-8 rounded-full bg-bg/40 border-[0.5px] border-border flex items-center justify-center hover:border-accent/30 transition-all">
                  <Eye className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />
                </button>
                {profile.is_banned ? (
                  <button onClick={() => handleUnban(profile)} disabled={actionId === profile.id}
                    className="w-8 h-8 rounded-full bg-green-500/10 border-[0.5px] border-green-500/20 flex items-center justify-center disabled:opacity-30 hover:bg-green-500/20 transition-all">
                    {actionId === profile.id ? <Ban className="w-3.5 h-3.5 text-green-400 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-green-400" strokeWidth={1.5} />}
                  </button>
                ) : (
                  <button onClick={() => { setBanTarget(profile); setBanModal(true); }}
                    className="w-8 h-8 rounded-full bg-red-500/10 border-[0.5px] border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all">
                    <Ban className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">Showing {startItem}-{endItem} of {totalCount}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-9 h-9 rounded-full bg-surface border-[0.5px] border-border flex items-center justify-center disabled:opacity-30 hover:border-accent/30 transition-all">
              <ChevronLeft className="w-4 h-4 text-text" strokeWidth={1.5} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-9 h-9 rounded-full bg-surface border-[0.5px] border-border flex items-center justify-center disabled:opacity-30 hover:border-accent/30 transition-all">
              <ChevronRight className="w-4 h-4 text-text" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {viewProfile && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewProfile(null)}>
          <div className="w-full max-w-lg rounded-[20px] bg-surface border-[0.5px] border-border p-6 space-y-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                {viewProfile.photos?.[0] ? (
                  <img src={viewProfile.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-accent">{viewProfile.name[0]}</span>
                )}
              </div>
              <div>
                <h3 className="text-[18px] font-display font-bold flex items-center gap-2">
                  {viewProfile.name}, {viewProfile.age}
                  <span className={"text-[10px] px-2 py-0.5 rounded-full capitalize " + (viewProfile.role === "woman" ? "bg-pink-500/10 text-pink-400" : "bg-blue-500/10 text-blue-400")}>
                    {viewProfile.role}
                  </span>
                </h3>
                <p className="text-sm text-text-muted">{viewProfile.city}</p>
                {viewProfile.instagram_url && (
                  <p className="text-xs text-accent mt-0.5">@{viewProfile.instagram_url}</p>
                )}
              </div>
            </div>

            {viewProfile.photos && viewProfile.photos.length > 0 && (
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">Photos</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewProfile.photos.map((url, i) => (
                    <div key={i} className="w-20 h-20 rounded-[12px] bg-bg/40 border-[0.5px] border-border overflow-hidden shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewProfile.bio && (
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Bio</p>
                <p className="text-sm text-text">{viewProfile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {viewProfile.phone && (
                <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm text-text">{viewProfile.phone}</p>
                </div>
              )}
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Submissions</p>
                <p className="text-sm text-text font-medium">{submissionCount}</p>
              </div>
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Connections</p>
                <p className="text-sm text-text font-medium">{connectionCount}</p>
              </div>
              <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Joined</p>
                <p className="text-sm text-text">{new Date(viewProfile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>

            <button onClick={() => setViewProfile(null)}
              className="w-full h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium hover:text-text transition-all">
              Close
            </button>
          </div>
        </div>
      )}

      {banModal && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setBanModal(false); setBanReason(""); setBanTarget(null); }}>
          <div className="w-full max-w-md rounded-[20px] bg-surface border-[0.5px] border-border p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-display font-bold">Ban User</h3>
                <p className="text-xs text-text-muted">{banTarget?.name}</p>
              </div>
            </div>

            <p className="text-xs text-text-muted">This will reject all pending submissions and block the user from the platform.</p>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Reason</label>
              <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                className="w-full h-24 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm p-3 outline-none focus:border-accent/50 transition-all resize-none placeholder:text-text-muted/40"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => { setBanModal(false); setBanReason(""); setBanTarget(null); }}
                className="flex-1 h-11 rounded-[14px] bg-surface border-[0.5px] border-border text-text-muted text-xs font-medium hover:text-text transition-all">
                Cancel
              </button>
              <button onClick={handleBan} disabled={!banReason || actionId === banTarget?.id}
                className="flex-1 h-11 rounded-[14px] bg-red-500/10 border-[0.5px] border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-red-500/20 transition-all">
                {actionId === banTarget?.id ? <Ban className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" strokeWidth={1.5} />}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {addModal && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAddModal(false)}>
          <div className="w-full max-w-sm rounded-[24px] bg-surface border-[0.5px] border-border p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-display font-semibold tracking-[-0.02em]">Add User</h2>
            <input type="email" placeholder="Email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm outline-none focus:border-accent/50 transition-all placeholder:text-text-muted/40" />
            <input type="password" placeholder="Password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-[14px] bg-bg border-[0.5px] border-border text-text text-sm outline-none focus:border-accent/50 transition-all placeholder:text-text-muted/40" />
            <div className="flex gap-2">
              {(["man", "woman"] as const).map((r) => (
                <button key={r} onClick={() => setAddRole(r)}
                  className={"flex-1 py-2.5 rounded-[12px] text-xs font-medium border-[0.5px] transition-all capitalize " + (addRole === r ? "bg-accent/10 text-accent border-accent/30" : "bg-bg text-text-muted border-border")}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={async () => {
              if (!addEmail || addPassword.length < 6) return;
              setAdding(true);
              const res = await fetch("/api/signup", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: addEmail, password: addPassword }),
              });
              const json = await res.json();
              if (json.user) {
                await supabase.from("profiles").upsert({ id: json.user.id, role: addRole, name: addEmail.split("@")[0] });
                setAddModal(false); setAddEmail(""); setAddPassword(""); setAddRole("man");
                fetchProfiles();
              }
              setAdding(false);
            }} disabled={!addEmail || addPassword.length < 6 || adding}
              className="w-full h-12 rounded-[14px] bg-accent text-bg text-sm font-semibold disabled:opacity-30 transition-all">
              {adding ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
