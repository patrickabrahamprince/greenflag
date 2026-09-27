'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Plus, Flag, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import { PendingReviewBanner } from '@/components/PendingReviewBanner';
import { CreateTripModal } from '@/components/trips/CreateTripModal';
import { ProSubscriptionModal } from '@/components/shared/ProSubscriptionModal';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const incrementUnread = useNotificationStore((s) => s.increment);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);

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

  const navItems = [
    {
      name: 'Explore',
      href: '/trips',
      icon: Compass,
      active: pathname === '/trips' || pathname === '/discover',
    },
    {
      name: 'Create',
      isAction: true,
      onClick: () => {
        hapticSuccess();
        setIsCreateOpen(true);
      },
    },
    {
      name: 'My Trips',
      href: '/my-trips',
      icon: Flag,
      badge: unreadCount > 0 ? unreadCount : undefined,
      active: pathname === '/my-trips' || pathname === '/my-connections' || pathname.startsWith('/messages'),
    },
    {
      name: 'Passport',
      href: '/passport',
      icon: ShieldCheck,
      active: pathname === '/passport' || pathname === '/profile',
    },
  ];

  return (
    <>
      <PendingReviewBanner />
      <nav className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[390px]">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-2xl border border-stone-200/90 rounded-full flex justify-between items-center py-2 px-3.5 shadow-[0_16px_36px_-8px_rgba(45,36,30,0.18)]">
          
          {/* Explore Tab */}
          <Link
            href="/trips"
            onClick={() => hapticTap()}
            className="flex flex-col items-center justify-center py-0.5 px-2 group transition-transform active:scale-95"
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full transition-all duration-300',
                navItems[0].active
                  ? 'w-10 h-10 bg-[#1D3B2A] text-white shadow-[0_4px_12px_rgba(29,59,42,0.35)] scale-105'
                  : 'w-10 h-10 text-[#382A21]/50 hover:text-[#382A21] hover:bg-stone-200/40'
              )}
            >
              <Compass className={cn('w-5 h-5', navItems[0].active ? 'text-white' : 'text-[#382A21]/60')} strokeWidth={navItems[0].active ? 2.5 : 1.8} />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight mt-0.5 transition-colors duration-200 font-bold',
                navItems[0].active ? 'text-[#1D3B2A]' : 'text-[#382A21]/50'
              )}
            >
              Explore
            </span>
          </Link>

          {/* Center + Create Button */}
          <button
            type="button"
            onClick={navItems[1].onClick}
            className="flex flex-col items-center justify-center -mt-4 transition-transform active:scale-90 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1D3B2A] to-[#2D5A3F] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(29,59,42,0.4)] border-2 border-white group-hover:scale-105 transition-all">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#1D3B2A] tracking-tight mt-0.5">
              + Post
            </span>
          </button>

          {/* My Trips Tab */}
          <Link
            href="/my-trips"
            onClick={() => hapticTap()}
            className="flex flex-col items-center justify-center py-0.5 px-2 group transition-transform active:scale-95"
          >
            <div className="relative">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-all duration-300',
                  navItems[2].active
                    ? 'w-10 h-10 bg-[#1D3B2A] text-white shadow-[0_4px_12px_rgba(29,59,42,0.35)] scale-105'
                    : 'w-10 h-10 text-[#382A21]/50 hover:text-[#382A21] hover:bg-stone-200/40'
                )}
              >
                <Flag className={cn('w-5 h-5', navItems[2].active ? 'text-white' : 'text-[#382A21]/60')} strokeWidth={navItems[2].active ? 2.5 : 1.8} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F07A38] text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-sm border border-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight mt-0.5 transition-colors duration-200 font-bold',
                navItems[2].active ? 'text-[#1D3B2A]' : 'text-[#382A21]/50'
              )}
            >
              My Trips
            </span>
          </Link>

          {/* Passport Tab */}
          <Link
            href="/passport"
            onClick={() => hapticTap()}
            className="flex flex-col items-center justify-center py-0.5 px-2 group transition-transform active:scale-95"
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full transition-all duration-300',
                navItems[3].active
                  ? 'w-10 h-10 bg-[#1D3B2A] text-white shadow-[0_4px_12px_rgba(29,59,42,0.35)] scale-105'
                  : 'w-10 h-10 text-[#382A21]/50 hover:text-[#382A21] hover:bg-stone-200/40'
              )}
            >
              <ShieldCheck className={cn('w-5 h-5', navItems[3].active ? 'text-white' : 'text-[#382A21]/60')} strokeWidth={navItems[3].active ? 2.5 : 1.8} />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight mt-0.5 transition-colors duration-200 font-bold',
                navItems[3].active ? 'text-[#1D3B2A]' : 'text-[#382A21]/50'
              )}
            >
              Passport
            </span>
          </Link>

        </div>
      </nav>

      {/* Global Modals */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTripCreated={(trip) => {
          setIsCreateOpen(false);
          router.push('/my-trips');
        }}
        currentUserPersona={user?.persona}
      />

      <ProSubscriptionModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
      />
    </>
  );
}
