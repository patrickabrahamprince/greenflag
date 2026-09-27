'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Plus, Calendar, User } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { id: 'explore', label: 'Explore', href: '/trips', icon: Compass },
    { id: 'create', label: 'Create', href: '/trips?tab=create', icon: Plus },
    { id: 'my-trips', label: 'My Trips', href: '/my-trips', icon: Calendar, badge: 3 },
    { id: 'passport', label: 'Passport', href: '/passport', icon: User },
  ];

  return (
    <nav className="fixed bottom-3 inset-x-3 z-50 max-w-md mx-auto pointer-events-auto pb-[env(safe-area-inset-bottom)]">
      <div className="bg-black/90 backdrop-blur-2xl rounded-[24px] p-1.5 flex justify-between shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] border border-white/10">
        {tabs.map((tab) => {
          const isActive =
            tab.id === 'explore'
              ? pathname === '/trips' || pathname === '/discover'
              : tab.id === 'create'
              ? pathname === '/trips?tab=create'
              : tab.id === 'my-trips'
              ? pathname.startsWith('/my-trips') || pathname.startsWith('/my-connections')
              : pathname.startsWith('/passport') || pathname.startsWith('/profile');

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => hapticTap()}
              className={`relative flex-1 h-12 rounded-[18px] flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              {tab.badge && !isActive && (
                <span className="absolute top-1 right-3 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-black/90">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
