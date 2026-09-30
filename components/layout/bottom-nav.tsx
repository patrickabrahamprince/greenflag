'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Compass, Plus, Calendar, User } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams ? searchParams.get('tab') : null;

  const tabs = [
    { id: 'explore', label: 'Explore', href: '/trips', icon: Compass },
    { id: 'create', label: 'Create', href: '/trips?tab=create', icon: Plus },
    { id: 'my-trips', label: 'My Trips', href: '/my-trips', icon: Calendar, badge: 3 },
    { id: 'passport', label: 'Passport', href: '/passport', icon: User },
  ];

  if (currentTab === 'create' || pathname === '/standard/builder') {
    return null;
  }

  return (
    <nav className="fixed bottom-3 inset-x-4 z-50 max-w-md mx-auto pointer-events-auto pb-[env(safe-area-inset-bottom,0px)]">
      <div className="bg-black/95 backdrop-blur-2xl rounded-[26px] p-1.5 flex justify-between shadow-[0_16px_40px_-10px_rgba(0,0,0,0.45)] border border-white/10">
        {tabs.map((tab) => {
          const isActive =
            tab.id === 'explore'
              ? (pathname === '/trips' || pathname === '/discover') && currentTab !== 'create'
              : tab.id === 'create'
              ? pathname === '/trips' && currentTab === 'create'
              : tab.id === 'my-trips'
              ? pathname.startsWith('/my-trips') || pathname.startsWith('/my-connections')
              : pathname.startsWith('/passport') || pathname.startsWith('/profile');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                hapticTap();
                router.push(tab.href);
              }}
              className={`relative flex-1 h-12 rounded-[20px] flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isActive ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              {tab.badge && !isActive && (
                <span className="absolute top-1 right-3 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}

