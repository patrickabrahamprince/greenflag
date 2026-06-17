"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClipboardList, Search, ChevronRight, Flag, Play, Pause, Trash2, AlertTriangle } from "lucide-react";
import type { Test, Profile, Task } from "@/lib/types";

interface TestWithDetails extends Test {
  host?: Profile;
  tasks?: Task[];
  is_flagged?: boolean;
  task_count?: number;
}

type FilterType = "all" | "flagged" | "active" | "paused";

export default function AdminTests() {
  const [tests, setTests] = useState<TestWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchTests = async () => {
    setLoading(true);
    let query = supabase
      .from("tests")
      .select("*, host:host_id(*), tasks:tasks(*, task_count:tasks.count)")
      .order("created_at", { ascending: false });
    if (filter === "flagged") query = query.eq("is_flagged", true);
    else if (filter === "active") query = query.eq("is_active", true).eq("is_paused", false);
    else if (filter === "paused") query = query.eq("is_paused", true);
    const { data } = await query;
    const mapped = (data || []).map((t: any) => ({
      ...t,
      task_count: t.tasks?.length || 0,
    })) as unknown as TestWithDetails[];
    setTests(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchTests(); }, [filter]);

  const handleUnflag = async (test: TestWithDetails) => {
    setActionId(test.id);
    await supabase.from("tests").update({ is_flagged: false }).eq("id", test.id);
    setActionId(null);
    fetchTests();
  };

  const handleTogglePause = async (test: TestWithDetails) => {
    setActionId(`pause-${test.id}`);
    await fetch(`/api/admin/tests/${test.id}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_paused: !test.is_paused }),
    });
    setActionId(null);
    fetchTests();
  };

  const handleDelete = async (test: TestWithDetails) => {
    setActionId(`del-${test.id}`);
    await supabase.from("tests").update({ is_active: false }).eq("id", test.id);
    setActionId(null);
    fetchTests();
  };

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.host?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "flagged", label: "Flagged" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Tests & Standards</h1>
        <p className="text-sm text-text-muted mt-1">Manage flagged and active standards</p>
      </div>

      <div className="rounded-[20px] bg-surface border-[0.5px] border-border p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-text-muted leading-relaxed">
          Standards are automatically flagged after receiving <span className="text-text font-medium">3+ reports</span> or when associated with <span className="text-text font-medium">banned content</span>. Flagged standards are hidden from discoverability until reviewed by admin.
        </p>
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
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by test name or host..."
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
          <ClipboardList className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No tests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((test) => {
            const isExpanded = expandedId === test.id;
            const diffColor =
              test.difficulty === "easy" ? "bg-green-500/10 text-green-400" :
              test.difficulty === "medium" ? "bg-accent/10 text-accent" :
              "bg-red-500/10 text-red-400";
            return (
              <div key={test.id} className="rounded-[16px] bg-surface border-[0.5px] border-border overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : test.id)}>
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {test.host?.photos?.[0] ? (
                      <img src={test.host.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-accent">{test.host?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text truncate">{test.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${diffColor}`}>{test.difficulty}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        test.is_active && !test.is_paused ? "bg-green-500/10 text-green-400" :
                        test.is_paused ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-surface text-text-muted"
                      }`}>
                        {test.is_paused ? "Paused" : test.is_active ? "Active" : "Inactive"}
                      </span>
                      {test.is_flagged && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center gap-1">
                          <Flag className="w-2.5 h-2.5" strokeWidth={2} />
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{test.host?.name} &middot; {test.tasks?.length || 0} tasks</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} strokeWidth={1.5} />
                </div>

                {isExpanded && (
                  <div className="border-t-[0.5px] border-border px-4 py-3 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {test.is_flagged && (
                        <button onClick={() => handleUnflag(test)} disabled={actionId === test.id}
                          className="flex items-center gap-1.5 text-xs text-green-400 px-3 py-1.5 rounded-full bg-green-500/10 border-[0.5px] border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-30">
                          <Flag className="w-3 h-3" strokeWidth={1.5} />
                          Unflag
                        </button>
                      )}
                      <button onClick={() => handleTogglePause(test)} disabled={actionId === `pause-${test.id}`}
                        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent px-3 py-1.5 rounded-full bg-bg/40 border-[0.5px] border-border disabled:opacity-30">
                        {test.is_paused ? <Play className="w-3 h-3" strokeWidth={1.5} /> : <Pause className="w-3 h-3" strokeWidth={1.5} />}
                        {test.is_paused ? "Unpause" : "Pause"}
                      </button>
                      <button onClick={() => handleDelete(test)} disabled={actionId === `del-${test.id}`}
                        className="flex items-center gap-1.5 text-xs text-red-400 px-3 py-1.5 rounded-full bg-red-500/10 border-[0.5px] border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-30">
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                        Delete
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Tasks ({test.tasks?.length || 0})</p>
                      {test.tasks?.sort((a, b) => a.day_number - b.day_number).map((task) => (
                        <div key={task.id} className="flex items-center gap-3 py-2 px-3 rounded-[12px] bg-bg/40">
                          <span className="text-[10px] text-text-muted w-6 text-right font-mono">#{task.day_number}</span>
                          <p className="text-xs text-text">{task.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
