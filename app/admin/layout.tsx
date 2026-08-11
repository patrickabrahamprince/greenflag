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
  Sun,
  Moon,
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
    setTheme(saved || 'dark');
  }, []);

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
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  if (checking || !mounted) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#000000' : '#FFFFFF';
  const bgSecondary = isDark ? '#0A0A0A' : '#F9F9F9';
  const textPrimary = isDark ? '#EDEADE' : '#000000';
  const textSecondary = isDark ? '#8E8E93' : '#666666';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5';

  return (
    <div
      className="min-h-dvh flex"
      style={{
        backgroundColor: bgPrimary,
        color: textPrimary,
      }}
    >
      <aside
        className="hidden lg:flex w-64 flex-col border-r p-4"
        style={{
          backgroundColor: bgSecondary,
          borderColor: borderColor,
        }}
      >
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A961] flex items-center justify-center">
              <span className="text-black font-bold text-sm">G</span>
            </div>
            <span className="font-display text-lg" style={{ color: textPrimary }}>Admin</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#C9A961]" /> : <Moon className="w-4 h-4" style={{ color: textSecondary }} />}
          </button>
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: active ? 'rgba(201, 169, 97, 0.1)' : (isDark ? 'transparent' : 'transparent'),
                  color: active ? '#C9A961' : textSecondary,
                }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto disabled:opacity-50`}
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Logout
        </button>
      </aside>

      <div className="flex-1 min-h-dvh flex flex-col">
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: borderColor }}
        >
          <span className="font-display" style={{ color: textPrimary }}>Admin</span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#C9A961]" /> : <Moon className="w-4 h-4" style={{ color: textSecondary }} />}
            </button>
            <button onClick={handleLogout} disabled={loggingOut} className="text-red-400 text-sm flex items-center gap-1.5 disabled:opacity-50">
              {loggingOut && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Logout
            </button>
          </div>
        </header>

        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 border-t z-50"
          style={{
            backgroundColor: bgSecondary,
            borderColor: borderColor,
          }}
        >
          <nav className="flex overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] min-w-[60px] transition-colors"
                  style={{
                    color: active ? '#C9A961' : textSecondary,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <main className="p-4 lg:p-8 pb-24 lg:pb-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
