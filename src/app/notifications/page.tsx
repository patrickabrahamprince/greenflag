"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bell, CheckCircle, MessageCircle, Snowflake, AlertTriangle } from "lucide-react";
import type { Notification } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
  message: MessageCircle,
  approved: CheckCircle,
  freeze: Snowflake,
  expired: AlertTriangle,
};

export default function NotificationsCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => setNotifications(data || []));
    });
  }, [router]);

  async function markRead(id: string, link?: string | null) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    if (link) router.push(link);
  }

  async function markAllRead() {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
            </button>
            <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Notifications</h1>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-accent hover:underline">
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Bell className="w-10 h-10 text-text-muted mx-auto" strokeWidth={1.5} />
            <p className="text-text-muted text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = ICON_MAP[n.type] || Bell;
              return (
                <button key={n.id} onClick={() => markRead(n.id, n.link)}
                  className={`w-full flex items-start gap-3 p-4 rounded-[16px] text-left transition-all ${
                    n.read ? "bg-surface/50" : "bg-surface border-[0.5px] border-accent/20"
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    n.read ? "bg-surface-elevated" : "bg-accent/10"
                  }`}>
                    <Icon className={`w-4 h-4 ${n.read ? "text-text-muted" : "text-accent"}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? "text-text-muted" : "text-text"}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-text-muted/50 mt-1">
                      {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
