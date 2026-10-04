'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { Compass, Calendar, MessageCircle, User } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams ? searchParams.get('tab') : null;
  const [isWizardActive, setIsWizardActive] = useState(false);

  useEffect(() => {
    const handleWizard = (e: any) => {
      setIsWizardActive(Boolean(e.detail));
    };
    window.addEventListener('gf-wizard-active', handleWizard);
    return () => window.removeEventListener('gf-wizard-active', handleWizard);
  }, []);

  // Aggressively prefetch all main tab routes on mount for 0ms instant transitions
  useEffect(() => {
    router.prefetch('/trips');
    router.prefetch('/my-trips');
    router.prefetch('/messages');
    router.prefetch('/passport');
  }, [router]);

  const tabs = [
    { id: 'explore', label: 'Explore', href: '/trips', icon: Compass },
    { id: 'plans', label: 'Plans', href: '/my-trips', icon: Calendar },
    { id: 'chat', label: 'Messages', href: '/messages', icon: MessageCircle },
    { id: 'passport', label: 'Passport', href: '/passport', icon: User },
  ];

  if (isWizardActive || currentTab === 'create' || pathname === '/standard/builder') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-md bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-2xl backdrop-saturate-180 border-t border-black/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.id === 'explore'
              ? (pathname === '/trips' || pathname === '/discover') && currentTab !== 'create'
              : tab.id === 'plans'
              ? pathname.startsWith('/my-trips') || pathname.startsWith('/my-connections') || pathname.startsWith('/schedule')
              : tab.id === 'chat'
              ? pathname.startsWith('/messages')
              : pathname.startsWith('/passport') || pathname.startsWith('/profile');

          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch={true}
              onClick={() => {
                hapticTap();
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-150 active:scale-90 cursor-pointer select-none ${
                isActive
                  ? 'text-[#000000] font-semibold'
                  : 'text-[#8E8E93] hover:text-[#000000] font-medium'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <tab.icon 
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-105 text-[#000000] stroke-[2.4]' : 'text-[#8E8E93] stroke-[1.8]'
                  }`} 
                />
              </div>
              <span className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${
                isActive ? 'text-[#000000] font-bold' : 'text-[#8E8E93]'
              }`}>
                {tab.label}
              </span>
            </Link>
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
