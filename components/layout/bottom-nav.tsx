'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Heart, User, MessageSquare, Bell, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { hapticTap } from '@/lib/haptics';
import { PendingReviewBanner } from '@/components/PendingReviewBanner';

const manTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Connections', href: '/my-connections', icon: Heart },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Alerts', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

const womanTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Connections', href: '/my-connections', icon: Heart },
  { name: 'Chat', href: '/messages', icon: MessageSquare },
  { name: 'Alerts', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const tabs = user?.persona === 'woman' ? womanTabs : manTabs;
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const incrementUnread = useNotificationStore((s) => s.increment);
  // Tapping away from an unfinished Standard used to silently bounce her
  // straight back (see the removed effect below) -- no explanation, just
  // a forced redirect. Now it asks instead: her draft is saved either way
  // (standard/builder's own save-draft calls handle that), this is purely
  // about confirming she meant to leave mid-flow.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isSettingStandard = pathname === '/standard/builder';

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

  const handleTabClick = (e: React.MouseEvent, href: string) => {
    if (!isSettingStandard) return;
    e.preventDefault();
    hapticTap();
    setPendingHref(href);
  };

  const confirmLeave = () => {
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  };

  return (
    <>
    <PendingReviewBanner />
    <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-app">
      <div className="nav-glass rounded-[1.75rem] flex justify-around items-center py-2 px-1 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const isNotifications = tab.href === '/notifications';
          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab.href)}
              className="flex flex-col items-center justify-center gap-0.5 relative w-14 py-1"
            >
              <div className="relative">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all duration-200',
                    active ? 'w-9 h-9 bg-gold shadow-[0_4px_16px_rgba(192,38,211,0.5)]' : 'w-8 h-8'
                  )}
                >
                  <tab.icon className={cn('transition-all duration-200', active ? 'text-white w-4 h-4' : 'text-ink/40 w-4 h-4')} strokeWidth={active ? 2.5 : 1.5} />
                </div>
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  </span>
                )}
              </div>
              <span className={cn('text-[8px] leading-none font-display font-medium tracking-normal text-center whitespace-nowrap transition-colors duration-200', active ? 'text-gold' : 'text-ink/40')}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>

    {pendingHref && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-6">
        <div className="dialog-card max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-gold" />
          </div>
          <h3 className="text-xl font-display text-ink mb-2">Leave without finishing?</h3>
          <p className="text-sm text-ink/60 leading-relaxed mb-6">
            You haven&apos;t set your Standard yet. What you&apos;ve filled in is saved — come back anytime to finish.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setPendingHref(null)} className="btn-secondary flex-1 py-3">
              Stay
            </button>
            <button onClick={confirmLeave} className="btn-primary flex-1 py-3">
              Leave
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
