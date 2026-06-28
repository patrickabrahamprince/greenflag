'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (!profile?.is_admin) { router.push('/'); return; }
      setIsAuthorized(true);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#00C853]" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 data-testid="admin-dashboard-title" className="text-2xl font-display text-[#EDEADE]">Dashboard</h1>
      </div>
      <AdminDashboard />
    </div>
  );
}
