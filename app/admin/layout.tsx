'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  Link2,
  FlaskConical,
  ScrollText,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Queue', href: '/admin/queue', icon: ImageIcon },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Connections', href: '/admin/connections', icon: Link2 },
  { label: 'Tests', href: '/admin/tests', icon: FlaskConical },
  { label: 'Logs', href: '/admin/logs', icon: ScrollText },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="hidden lg:flex w-64 flex-col bg-surface border-r border-border p-4">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <span className="text-white font-display text-lg">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 mt-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-display">Admin</span>
        </header>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] min-w-[60px] transition-colors ${
                    active ? 'text-gold' : 'text-muted'
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
