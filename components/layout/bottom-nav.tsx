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
      <nav className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[390px]">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-xl border border-stone-200/80 rounded-full flex justify-around items-center py-2 px-3 shadow-[0_12px_32px_-8px_rgba(45,36,30,0.15)]">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const isMessages = tab.href === '/messages';
            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => hapticTap()}
                className="flex flex-col items-center justify-center relative py-0.5 px-1.5 group transition-transform active:scale-95"
              >
                <span className="sr-only">{tab.name}</span>
                <div className="relative">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full transition-all duration-300',
                      active
                        ? 'w-9 h-9 bg-[#1D3B2A] text-white shadow-[0_4px_12px_rgba(29,59,42,0.35)] scale-105'
                        : 'w-9 h-9 text-[#382A21]/45 hover:text-[#382A21] hover:bg-[#382A21]/5'
                    )}
                  >
                    <tab.icon
                      className={cn('transition-all duration-200', active ? 'text-white w-4 h-4' : 'w-4 h-4 text-[#382A21]/60')}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                  </div>
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-1 bg-[#F07A38] text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-sm border border-white animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[9px] tracking-tight mt-0.5 transition-colors duration-200',
                    active ? 'text-[#1D3B2A] font-bold' : 'text-[#382A21]/50 group-hover:text-[#382A21] font-medium'
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

