'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verify admin session via API (middleware already checked this)
    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/verify', { credentials: 'include' });
        if (res.ok) {
          setIsAuthorized(true);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 data-testid="admin-dashboard-title" className="text-2xl font-display text-gray-900">Dashboard</h1>
      </div>
      <AdminDashboard />
    </div>
  );
}
