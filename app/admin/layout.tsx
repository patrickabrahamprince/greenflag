'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Flag,
  BarChart3,
  ScrollText,
  LogOut,
  Shield,
  Loader2,
  UserCog,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Matches', href: '/admin/matches', icon: Heart },
  { label: 'Queue', href: '/admin/queue', icon: Shield },
  { label: 'Profile Requests', href: '/admin/profile-requests', icon: UserCog },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit', href: '/admin/audit', icon: ScrollText },
  { label: 'Master Reset', href: '/admin/reset', icon: RotateCcw },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (!profile?.is_admin) {
        router.replace('/');
        return;
      }
      setChecking(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="hidden lg:flex w-64 flex-col bg-[#0A0A0A] border-r border-white/10 p-4">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="w-8 h-8 rounded-lg bg-[#C9A961] flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <span className="text-[#EDEADE] font-display text-lg">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 mt-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <button
                key={item.href}
                data-testid={item.label === 'Users' ? 'users-tab' : undefined}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-[#C9A961]/10 text-[#C9A961]'
                    : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-[#EDEADE] font-display">Admin</span>
          <button onClick={handleLogout} className="text-red-400 text-sm">Logout</button>
        </header>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 z-50">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] min-w-[60px] transition-colors ${
                    active ? 'text-[#C9A961]' : 'text-[#8E8E93]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <main className="p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
