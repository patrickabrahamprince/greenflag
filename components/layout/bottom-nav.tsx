'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Heart, User, MessageSquare, Coins, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

const manTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'My Connections', href: '/my-connections', icon: Heart },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Coins', href: '/coins', icon: Coins },
];

const womanTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Connections', href: '/my-connections', icon: Heart },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const tabs = user?.persona === 'woman' ? womanTabs : manTabs;
  const [unreadCount, setUnreadCount] = useState(0);

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => { setUnreadCount((prev) => prev + 1); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Safety net for any woman without an active Standard (e.g. seeded via
  // admin API, or a pre-existing account from before Standard-setting
  // moved into onboarding) -- reuses the same endpoint the onboarding
  // step itself uses, no new backend needed. Mounted on every page that
  // shows this nav, so it catches her regardless of where she lands.
  useEffect(() => {
    if (user?.persona !== 'woman') return;
    fetch('/api/standards/standard-builder')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.redirect !== '/my-connections' && pathname !== '/standard/builder') {
          router.replace('/standard/builder');
        }
      })
      .catch(() => {});
  }, [user?.persona, pathname, router]);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-app">
      <div className="nav-glass rounded-full flex justify-around items-center h-16 px-2 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const isNotifications = tab.name === 'Notifications';
          return (
            <Link key={tab.name} href={tab.href} className="flex items-center justify-center relative w-12 h-12">
              <div className="relative">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all duration-200',
                    active ? 'w-11 h-11 bg-[#C026D3] shadow-[0_4px_16px_rgba(192,38,211,0.5)]' : 'w-10 h-10'
                  )}
                >
                  <tab.icon className={cn('transition-all duration-200', active ? 'text-white w-5 h-5' : 'text-ink/40 w-5 h-5')} strokeWidth={active ? 2.5 : 1.5} />
                </div>
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
