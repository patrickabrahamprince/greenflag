'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Loader2, Pin, ArrowLeftRight } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { createClient } from '@/lib/supabase/client';
import { SwipeToDismiss } from '@/components/shared/SwipeToDismiss';
import { getCached, setCached } from '@/lib/pageCache';
import { useNotificationStore } from '@/lib/store';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { useFirstTimeHint } from '@/lib/hooks/useFirstTimeHint';
import { FirstTimeHint } from '@/components/shared/FirstTimeHint';
import { hapticTap, hapticDecision, hapticWarning } from '@/lib/haptics';
import toast from 'react-hot-toast';

const NOTIFICATIONS_CACHE_KEY = 'notifications:list';

interface Notification {
  id: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  pinned: boolean;
}

interface ConnectionParty {
  name: string;
  photo: string | null;
}

function sortNotifications(list: Notification[]): Notification[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// Where a notification should take you depends on what actually happened,
// not just whether it carries a connectionId -- a "day approved" notif
// during the 3-day flow needs the task page (chat isn't unlocked yet), a
// "chat unlocked" notif needs Messages, an account-level notif has no
// connection at all.
function getNotificationRoute(data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  const type = data.type as string | undefined;
  const connectionId = data.connectionId as string | undefined;
  const matchId = data.matchId as string | undefined;
  const fromUserId = data.from_user_id as string | undefined;

  switch (type) {
    case 'new_message':
    case 'chat_unlocked':
    case 'completed':
      return connectionId ? `/messages/${connectionId}` : null;
    case 'submission':
    case 'day_approved':
    case 'day5_approved':
    case 'media_approved':
    case 'media_rejected':
    case 'rejected':
    case 'standard_begin':
    case 'retry_unlocked':
    case 'review_reminder':
      return connectionId ? `/task/${connectionId}` : null;
    case 'standard_hint':
      return matchId ? `/task/${matchId}` : null;
    case 'retry_decision':
      return '/my-connections';
    case 'nudge':
      return fromUserId ? `/profile/${fromUserId}` : null;
    case 'account_banned':
      return '/banned';
    case 'application_rejected':
      return '/onboard/rejected';
    case 'screenshot_alert': {
      if (!connectionId) return null;
      const context = data.context as string | undefined;
      return context === 'task' ? `/task/${connectionId}` : `/messages/${connectionId}`;
    }
    case 'bonus':
      return '/coins';
    case 'dormant_winback':
      return '/discover';
    case 'idle_coins':
      return '/discover';
    case 'profile_incomplete':
      return '/profile/edit';
    default:
      return connectionId ? `/messages/${connectionId}` : null;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>(() => getCached(NOTIFICATIONS_CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => getCached<Notification[]>(NOTIFICATIONS_CACHE_KEY) === undefined);
  const [markingRead, setMarkingRead] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [partyByConnectionId, setPartyByConnectionId] = useState<Record<string, ConnectionParty>>({});
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const decrementUnread = useNotificationStore((s) => s.decrement);
  const { show: showSwipeHint, dismiss: dismissSwipeHint } = useFirstTimeHint('notifications-swipe');

  const loadNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const sorted = sortNotifications((data as Notification[]) || []);
    setNotifications(sorted);
    setCached(NOTIFICATIONS_CACHE_KEY, sorted);
    setUnreadCount(sorted.filter((n) => !n.read_at).length);
    setLoading(false);
  };

  const refresh = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await loadNotifications(user.id);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      await loadNotifications(user.id);
      if (!mounted) return;

      // Notifications only carry a connectionId, not the other party's
      // name/photo -- reusing the existing /api/matches list (which already
      // resolves otherName/otherPhoto per connection) instead of adding a
      // new endpoint or touching the notification-insert triggers.
      fetch('/api/matches')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!mounted || !data?.matches) return;
          const map: Record<string, ConnectionParty> = {};
          for (const m of data.matches) {
            map[m.id] = { name: m.otherName, photo: m.otherPhoto };
          }
          setPartyByConnectionId(map);
        })
        .catch(() => {});

      // Bottom-nav's badge already subscribes to inserts to bump its
      // count, but this list itself previously never subscribed at all --
      // a notification arriving while this page was open updated the
      // badge but never showed up here until a full remount re-fetched.
      channel = supabase
        .channel('notifications-list')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          setNotifications((prev) => {
            const next = sortNotifications([payload.new as Notification, ...prev]);
            setCached(NOTIFICATIONS_CACHE_KEY, next);
            return next;
          });
        })
        .subscribe();
    };

    init();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router, setUnreadCount]);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(refresh);

  const handleMarkAllRead = async () => {
    hapticTap();
    setMarkingRead(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMarkingRead(false); return; }

    await supabase.rpc('mark_notifications_read', { p_user_id: user.id });

    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }));
      setCached(NOTIFICATIONS_CACHE_KEY, next);
      return next;
    });
    setUnreadCount(0);
    toast.success('All marked as read');
    setMarkingRead(false);
  };

  const handleNotificationClick = async (notif: Notification) => {
    hapticTap();
    // Mark as read
    if (!notif.read_at) {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notif.id);

      setNotifications((prev) => {
        const next = prev.map((n) => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n);
        setCached(NOTIFICATIONS_CACHE_KEY, next);
        return next;
      });
      decrementUnread();
    }

    // First tap reveals the full (untruncated) title/body instead of
    // immediately yanking you to another screen before you've actually
    // read it -- only a second tap, on an already-expanded card,
    // navigates.
    if (!expandedIds.has(notif.id)) {
      setExpandedIds((prev) => new Set(prev).add(notif.id));
      return;
    }

    const route = getNotificationRoute(notif.data as Record<string, unknown> | null);
    if (route) {
      router.push(route);
    }
  };

  const handleDismiss = async (id: string) => {
    hapticWarning();
    setNotifications((prev) => {
      const dismissed = prev.find((n) => n.id === id);
      if (dismissed && !dismissed.read_at) decrementUnread();
      const next = prev.filter((n) => n.id !== id);
      setCached(NOTIFICATIONS_CACHE_KEY, next);
      return next;
    });
    await supabase.from('notifications').delete().eq('id', id);
  };

  const handlePin = async (notif: Notification) => {
    hapticDecision();
    const nextPinned = !notif.pinned;
    setNotifications((prev) => {
      const next = sortNotifications(prev.map((n) => (n.id === notif.id ? { ...n, pinned: nextPinned } : n)));
      setCached(NOTIFICATIONS_CACHE_KEY, next);
      return next;
    });
    await supabase.from('notifications').update({ pinned: nextPinned }).eq('id', notif.id);
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div className="min-h-dvh screen-gradient flex items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-5rem)] screen-gradient flex flex-col">
      <div className="max-w-app mx-auto w-full px-6 pt-safe-top">
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl text-ink">Alerts</h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingRead}
              className="text-xs text-gold hover:text-gold-light active:scale-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {markingRead && <Loader2 className="w-3 h-3 animate-spin" />}
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchStartCapture={dismissSwipeHint}
        onClick={() => setExpandedIds(new Set())}
        className="flex-1 overflow-y-auto overscroll-none max-w-app mx-auto w-full px-6 pb-24"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink mb-1">Nothing Yet</h3>
            <p className="text-sm text-muted text-center">
              You&apos;ll be notified when there&apos;s activity in your connections.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => {
              const notifType = (notif.data as Record<string, unknown> | null)?.type;
              const isLuxury = notifType === 'day_approved' || notifType === 'media_approved';
              const isExpanded = expandedIds.has(notif.id);
              const hasRoute = !!getNotificationRoute(notif.data as Record<string, unknown> | null);
              const connectionId = (notif.data as Record<string, unknown> | null)?.connectionId as string | undefined;
              const party = connectionId ? partyByConnectionId[connectionId] : undefined;
              // "Day Approved" on its own doesn't say who -- the other
              // notification types already name the person in their body
              // text, but this one's title is a static string server-side.
              const displayTitle = notifType === 'day_approved' && party
                ? `${party.name} approved Day ${(notif.data as Record<string, unknown>)?.dayNumber ?? ''}`.trim()
                : notif.title;

              return (
                <SwipeToDismiss
                  key={notif.id}
                  onDelete={() => handleDismiss(notif.id)}
                  onPin={() => handlePin(notif)}
                  pinned={notif.pinned}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                    className="w-full flex items-center gap-3 text-left px-4 py-4 border-b border-border/30 transition-all active:scale-[0.98]"
                  >
                    {party && (
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#1C1C1E]">
                        {party.photo ? (
                          <img src={party.photo} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">{party.name[0]}</div>
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {notif.pinned && (
                        <Pin className="w-3.5 h-3.5 text-gold shrink-0" fill="currentColor" />
                      )}
                      <p className={`text-base font-semibold flex-1 min-w-0 truncate ${
                        isLuxury ? 'text-gold' : notif.read_at ? 'text-muted' : 'text-ink'
                      }`}>
                        {displayTitle}
                      </p>
                      {!notif.read_at && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      )}
                    </div>
                    {isExpanded ? (
                      <>
                        <p className="text-xs text-muted">{notif.body}</p>
                        {hasRoute && (
                          <p className="text-xs text-gold mt-2 font-medium">Tap again to view →</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gold/70 italic">Tap to view</p>
                    )}
                    </div>
                  </button>
                </SwipeToDismiss>
              );
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <FirstTimeHint
          show={showSwipeHint}
          icon={<ArrowLeftRight className="w-4 h-4 text-gold" />}
          text="Swipe to pin or delete"
          onDismiss={dismissSwipeHint}
          position="bottom"
        />
      )}
    </div>
  );
}
