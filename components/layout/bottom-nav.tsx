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
    { id: 'plans', label: 'My Plans', href: '/my-trips', icon: Calendar, badge: 3 },
    { id: 'chat', label: 'Chat', href: '/messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', href: '/passport', icon: User },
  ];

  if (isWizardActive || currentTab === 'create' || pathname === '/standard/builder') {
    return null;
  }

  return (
    <nav className="fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="pointer-events-auto bg-white/85 backdrop-blur-2xl border border-white/80 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-[0_16px_36px_rgba(0,0,0,0.08)] max-w-xs w-full justify-between">
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
              className={`relative flex items-center justify-center p-2.5 rounded-full transition-all cursor-pointer active:scale-90 ${
                isActive
                  ? 'bg-gradient-to-tr from-[#9D54FF] to-[#7B2CBF] text-white shadow-lg shadow-[#9D54FF]/30 scale-105'
                  : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100/50'
              }`}
              aria-label={tab.label}
            >
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00E5A3] rounded-full ring-2 ring-white" />
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


