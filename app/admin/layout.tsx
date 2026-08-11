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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
    setTheme(saved || 'light');
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
      <div className="min-h-dvh bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-dvh bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
        <div className="flex h-dvh">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-gray-200/50 dark:lg:border-gray-800/50 lg:bg-white dark:lg:bg-black">
            {/* Logo Section */}
            <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-800/50">
              <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">GreenFlag Control</p>
            </div>

            {/* Theme Toggle */}
            <div className="px-8 py-4 flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors ml-auto"
                title="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <button
                    key={item.href}
                    data-testid={item.label === 'Users' ? 'users-tab' : undefined}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/10'
                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 px-4 py-4">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors disabled:opacity-50"
              >
                {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-black">
              <h1 className="text-xl font-semibold">Admin</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                </button>
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-auto bg-white dark:bg-black">
              <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-10">
                {children}
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-black flex justify-between px-2">
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
