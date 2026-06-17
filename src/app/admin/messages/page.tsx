"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Search, ChevronRight } from "lucide-react";
import type { Connection, Profile, Message } from "@/lib/types";

interface ConnectionWithMessages extends Connection {
  guest?: Profile;
  host?: Profile;
  messages?: Message[];
}

export default function AdminMessages() {
  const [connections, setConnections] = useState<ConnectionWithMessages[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("connections")
      .select("*, guest:guest_id(*), host:host_id(*), messages:messages(*)")
      .order("created_at", { ascending: false });
    setConnections((data || []) as unknown as ConnectionWithMessages[]);
    setLoading(false);
  };

  useEffect(() => { fetchConnections(); }, []);

  const filtered = connections.filter(c =>
    c.guest?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.host?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Messages</h1>
        <p className="text-sm text-text-muted mt-1">View all conversation threads</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..."
          className="w-full h-12 pl-11 pr-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all text-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No conversations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((conn) => {
            const msgs = conn.messages || [];
            const lastMsg = msgs[msgs.length - 1];
            return (
              <div key={conn.id} className="rounded-[20px] bg-surface border-[0.5px] border-border p-4 space-y-3 hover:border-accent/20 transition-all cursor-pointer" onClick={() => setSelectedId(selectedId === conn.id ? null : conn.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text">{conn.guest?.name || "?"} → {conn.host?.name || "?"}</p>
                    <span className={"text-[10px] px-2 py-0.5 rounded-full capitalize " + (conn.status === "active" ? "bg-green-500/10 text-green-400" : "bg-surface text-text-muted")}>
                      {conn.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">{conn.tasks_completed}/8</span>
                </div>

                {lastMsg && (
                  <div className="rounded-[12px] bg-bg/40 border-[0.5px] border-border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-text-muted">{lastMsg.sender_id === conn.guest_id ? conn.guest?.name : conn.host?.name}</span>
                      <span className="text-[10px] text-text-muted">· {new Date(lastMsg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-xs text-text line-clamp-2">{lastMsg.content}</p>
                  </div>
                )}

                {selectedId === conn.id && msgs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t-[0.5px] border-border max-h-60 overflow-y-auto">
                    {msgs.map((msg) => (
                      <div key={msg.id} className={"flex " + (msg.sender_id === conn.guest_id ? "justify-start" : "justify-end")}>
                        <div className={"rounded-[16px] px-3 py-2 max-w-[80%] " + (msg.sender_id === conn.guest_id ? "bg-bg/40 border-[0.5px] border-border" : "bg-accent/10 border-[0.5px] border-accent/20")}>
                          <p className="text-xs text-text">{msg.content}</p>
                          <p className="text-[9px] text-text-muted mt-1">{new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msgs.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{msgs.length} messages</span>
                    <ChevronRight className={"w-3.5 h-3.5 text-text-muted transition-transform " + (selectedId === conn.id ? "rotate-90" : "")} strokeWidth={1.5} />
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
