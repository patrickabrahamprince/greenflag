'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
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
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh admin session every 25 minutes to keep it alive
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        await fetch('/api/admin/refresh', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        console.error('Session refresh error:', err);
      }
    }, 25 * 60 * 1000); // 25 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }

    const checkAuth = async () => {
      try {
        console.log('Admin layout verifying session for:', pathname);
        const res = await fetch('/api/admin/verify', { credentials: 'include' });
        console.log('Admin verify response:', { status: res.status, ok: res.ok });
        if (!res.ok) {
          console.log('Admin session invalid, redirecting to login');
          router.replace('/admin/login');
          return;
        }
        setChecking(false);
      } catch (err) {
        console.error('Admin auth check error:', err);
        router.replace('/admin/login');
      }
    };
    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/admin/login');
  };

  if (checking || !mounted) {
    return (
      <div className="min-h-dvh bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-dvh bg-white text-black">
        <div className="flex h-dvh">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-gray-200/50 lg:bg-white">
            {/* Logo Section */}
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
              <p className="text-xs text-gray-500 mt-1">GreenFlag Control</p>
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
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200/50 px-4 py-4">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-gray-200/50 bg-white">
              <h1 className="text-xl font-semibold">Admin</h1>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              </button>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-auto bg-white">
              <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-10">
                {children}
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200/50 bg-white flex justify-between px-2">
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                      active
                        ? 'text-blue-600'
                        : 'text-gray-600'
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
