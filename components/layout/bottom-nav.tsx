'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, Heart, User, MessageSquare, Star, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

const manTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'My Connections', href: '/my-connections', icon: Heart },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Coins', href: '/coins', icon: Coins },
];

const womanTabs = [
  { name: 'Standard', href: '/standard/builder', icon: Star },
  { name: 'Connections', href: '/connections', icon: Heart },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
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

  return (
    <nav className="fixed bottom-0 w-full nav-glass z-50">
      <div className="flex justify-around items-center h-16 max-w-app mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const isNotifications = tab.name === 'Notifications';
          return (
            <Link key={tab.name} href={tab.href} className="flex items-center justify-center relative w-12 h-12">
              <div className="relative">
                <tab.icon className={cn('transition-all duration-200', active ? 'text-gold w-6 h-6' : 'text-[#444] w-5 h-5')} strokeWidth={active ? 2.5 : 1.5} />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
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
