"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageSquare, ChevronRight, Lock } from "lucide-react";
import type { Connection, Profile, Message } from "@/lib/types";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface ConnectionWithDetails extends Connection {
  guest?: Profile;
  host?: Profile;
  messages?: Message[];
}

export default function MessagesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      setUserId(user.id);
      supabase
        .from("connections")
        .select("*, guest:guest_id(*), host:host_id(*), messages:messages(*)")
        .or("guest_id.eq." + user.id + ",host_id.eq." + user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setConnections((data || []) as unknown as ConnectionWithDetails[]);
          setLoading(false);
        });
    });
  }, [router]);

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Messages</h1>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[16px] bg-surface border-[0.5px] border-border animate-pulse" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-text-muted/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">No conversations yet</p>
          <p className="text-xs text-text-muted/60 mt-1">Start a connection to begin messaging</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {connections.map((conn) => {
            const msgs = conn.messages || [];
            const lastMsg = msgs[msgs.length - 1];
            const isGuest = userId === conn.guest_id;
            const partner = isGuest ? conn.host : conn.guest;
            const messagesUnlocked = conn.messages_unlocked === true;
            const hasUnread = msgs.some(m => m.sender_id !== userId);

            return (
              <div key={conn.id} onClick={() => {
                if (messagesUnlocked) router.push("/messages/" + conn.id);
              }}
                className={"flex items-center gap-4 p-4 rounded-[16px] bg-surface border-[0.5px] border-border transition-all " + (messagesUnlocked ? "cursor-pointer hover:border-accent/20" : "opacity-60")}>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {partner?.photos?.[0] ? (
                    <img src={partner.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-accent">{partner?.name?.[0] || "?"}</span>
                  )}
                  {hasUnread && messagesUnlocked && (
                    <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-accent border-[2px] border-surface" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text truncate">{partner?.name || "Unknown"}</p>
                    {!messagesUnlocked && (
                      <span className="flex items-center gap-1 text-[10px] text-text-muted bg-bg/40 px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {conn.tasks_completed}/5
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {lastMsg ? ((lastMsg as any).message_type === "image" ? "📷 Photo" : lastMsg.content) : (messagesUnlocked ? "Start a conversation" : "Complete 5 intentions to unlock")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {lastMsg && (
                    <p className="text-[10px] text-text-muted">{timeAgo(lastMsg.created_at)}</p>
                  )}
                  <ChevronRight className="w-4 h-4 text-text-muted mt-1 ml-auto" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
