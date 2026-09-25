'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Flag, User, MessageSquare, Bell, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { hapticTap } from '@/lib/haptics';
import { PendingReviewBanner } from '@/components/PendingReviewBanner';

const travelTabs = [
  { name: 'Trips', href: '/trips', icon: Plane },
  { name: 'Meet People', href: '/discover', icon: Compass },
  { name: 'My Trips', href: '/my-connections', icon: Flag },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
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
  }, [user?.id, incrementUnread]);

  return (
    <>
    <PendingReviewBanner />
    <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-app">
      <div className="nav-glass rounded-pill flex justify-around items-center py-3 px-2 shadow-[0_8px_32px_-4px_rgba(15,10,10,0.5)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const isNotifications = tab.href === '/notifications';
          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => hapticTap()}
              className="flex flex-col items-center justify-center gap-0.5 relative w-14 py-2"
            >
              <span className="sr-only">{tab.name}</span>
              <div className="relative">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all duration-200',
                    active ? 'w-9 h-9 bg-indigo nav-active-ring' : 'w-8 h-8'
                  )}
                >
                  <tab.icon className={cn('transition-all duration-200', active ? 'text-gold w-4 h-4' : 'text-ink/40 w-4 h-4')} strokeWidth={active ? 2.5 : 1.5} />
                </div>
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#D2042D] rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-ink">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
