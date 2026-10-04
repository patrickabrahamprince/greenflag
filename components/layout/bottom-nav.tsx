'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
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

  const tabs = [
    { id: 'explore', label: 'Explore', href: '/trips', icon: Compass },
    { id: 'plans', label: 'My Plans', href: '/my-trips', icon: Calendar },
    { id: 'chat', label: 'Chat', href: '/messages', icon: MessageCircle },
    { id: 'profile', label: 'Passport', href: '/passport', icon: User },
  ];

  if (isWizardActive || currentTab === 'create' || pathname === '/standard/builder') {
    return null;
  }

  return (
    <nav className="fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-full px-2 py-1.5 flex items-center shadow-[0_12px_36px_rgba(0,0,0,0.12)] max-w-[340px] w-full justify-between">
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
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                hapticTap();
                router.push(tab.href);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#1C1C1E] text-white shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-[#1C1C1E] hover:bg-stone-100/70 font-medium'
              }`}
              aria-label={tab.label}
            >
              <tab.icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.4 : 1.9} />
              <span className="text-[10px] tracking-tight leading-none mt-1">
                {tab.label}
              </span>
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
