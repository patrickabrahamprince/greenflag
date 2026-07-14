'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setNotifications((data as Notification[]) || []);
      setLoading(false);
    };

    load();
  }, [supabase, router]);

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('mark_notifications_read', { p_user_id: user.id });

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    toast.success('All marked as read');
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.read_at) {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notif.id);

      setNotifications((prev) =>
        prev.map((n) => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    }

    // Navigate based on notification type
    const data = notif.data as Record<string, unknown> | null;
    if (data?.connectionId) {
      router.push(`/messages/${data.connectionId}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <div className="max-w-app mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl text-ink">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-gold hover:text-gold-light transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink mb-1">No notifications</h3>
            <p className="text-sm text-muted text-center">
              You&apos;ll be notified when there&apos;s activity on your connections.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  notif.read_at
                    ? 'bg-transparent hover:bg-surface/50'
                    : 'bg-surface/80 hover:bg-surface'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    notif.read_at ? 'bg-transparent' : 'bg-gold'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${
                        notif.read_at ? 'text-muted' : 'text-ink'
                      }`}>
                        {notif.title}
                      </p>
                      {!notif.read_at && (
                        <Check className="w-3.5 h-3.5 text-muted shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm ${notif.read_at ? 'text-muted/60' : 'text-muted'}`}>
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-muted/40 mt-1">
                      {new Date(notif.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
