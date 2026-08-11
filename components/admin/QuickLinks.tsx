'use client';

import { useRouter } from 'next/navigation';
import { Users, Flag, BarChart3, ScrollText, Shield } from 'lucide-react';

const LINKS = [
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Queue', href: '/admin/queue', icon: Shield },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
];

export function QuickLinks() {
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quick Links</h2>
      <div className="space-y-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <Icon className="w-4 h-4 text-gray-400" />
              {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
