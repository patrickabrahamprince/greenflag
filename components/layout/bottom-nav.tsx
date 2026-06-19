'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, Heart, User, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';

const guestTabs = [
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Connections', href: '/connections', icon: Heart },
  { name: 'Profile', href: '/profile', icon: User },
];

const hostTabs = [
  { name: 'Discover', href: '/discover-men', icon: Compass },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const tabs = user?.role === 'host' ? hostTabs : guestTabs;

  return (
    <nav className="fixed bottom-0 w-full bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="flex justify-around items-center h-16 max-w-app mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center gap-1"
            >
              <tab.icon
                className={cn(
                  'w-6 h-6 transition-all duration-200',
                  active ? 'text-[#D4AF37] scale-110' : 'text-[#EDEADE]/40'
                )}
              />
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
