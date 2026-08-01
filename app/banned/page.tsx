'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function BannedPage() {
  const router = useRouter();
  const supabase = createClient();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('banned_reason')
        .eq('id', user.id)
        .single();
      const p = profile as { banned_reason: string } | null;
      if (p) {
        setReason(p.banned_reason || '');
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-dvh screen-gradient flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh screen-gradient flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <Ban className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-display text-2xl text-ink mb-3">Account Suspended</h1>
        <p className="text-[#9DA0A6] mb-6">
          {reason || 'Your account has been suspended. If you believe this was a mistake, please contact support.'}
        </p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full max-w-xs mx-auto h-12 rounded-xl border border-[#2A2A2A] text-ink font-medium active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loggingOut && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign Out
        </button>
      </div>
    </div>
  );
}
