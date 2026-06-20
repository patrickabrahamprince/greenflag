'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, Heart, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

const guestTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Connections', href: '/connections', icon: Heart },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

const hostTabs = [
  { name: 'Discover', href: '/discover-men', icon: Compass },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const tabs = user?.role === 'host' ? hostTabs : guestTabs;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();

    const fetchCount = async () => {
      const { data } = await (supabase as any).rpc('get_unread_count', {
        p_user_id: user.id,
      });
      setUnreadCount(data || 0);
    };

    fetchCount();

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <nav className="fixed bottom-0 w-full bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="flex justify-around items-center h-16 max-w-app mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const isNotifications = tab.name === 'Notifications';
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center gap-1 relative"
            >
              <div className="relative">
                <tab.icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    active ? 'text-[#D4AF37] scale-110' : 'text-[#EDEADE]/40'
                  )}
                />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] transition-all duration-200',
                  active ? 'text-[#D4AF37]' : 'text-[#EDEADE]/40'
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
