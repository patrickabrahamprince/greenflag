'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, Flag, User, MessageSquare, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { hapticTap } from '@/lib/haptics';
import { PendingReviewBanner } from '@/components/PendingReviewBanner';

const travelTabs = [
  { name: 'Trips', href: '/trips', icon: Plane },
  { name: 'Meet', href: '/discover', icon: Compass },
  { name: 'My Trips', href: '/my-connections', icon: Flag },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const tabs = travelTabs;
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const incrementUnread = useNotificationStore((s) => s.increment);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    const fetchCount = async () => {
      const { data } = await supabase.rpc('get_unread_count', { p_user_id: user.id });
      setUnreadCount(data || 0);
    };
    fetchCount();
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => { incrementUnread(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, incrementUnread, setUnreadCount]);

  return (
    <>
      <PendingReviewBanner />
      <nav className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-app">
        <div className="nav-glass rounded-full flex justify-around items-center py-2.5 px-3">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const isMessages = tab.href === '/messages';
            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => hapticTap()}
                className="flex flex-col items-center justify-center relative py-1 px-2 group transition-transform active:scale-90"
              >
                <span className="sr-only">{tab.name}</span>
                <div className="relative">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-2xl transition-all duration-300',
                      active
                        ? 'w-10 h-10 bg-emerald/20 border border-emerald/40 text-emerald shadow-glow-emerald'
                        : 'w-9 h-9 text-white/40 hover:text-white/80 hover:bg-white/5'
                    )}
                  >
                    <tab.icon
                      className={cn('transition-all duration-200', active ? 'text-emerald w-5 h-5' : 'w-5 h-5')}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                  </div>
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-emerald text-black font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-glow-emerald border border-white/30 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] tracking-tight mt-1 transition-colors duration-200 font-medium',
                    active ? 'text-emerald font-bold' : 'text-white/40 group-hover:text-white/70'
                  )}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

