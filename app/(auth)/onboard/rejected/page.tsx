'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, LogOut, RotateCcw, Loader2 } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function RejectedApplicationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_reason')
        .eq('id', user.id)
        .single();
      setReason((profile as { approval_reason?: string })?.approval_reason ?? null);
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      const res = await fetch('/api/onboarding/restart', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to restart');
        setRestarting(false);
        return;
      }
      router.push('/onboard');
    } catch {
      toast.error('Failed to restart');
      setRestarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FAF9F6]">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col justify-center items-center px-5 text-center bg-[#FAF9F6]">
      <div className="absolute top-safe-top right-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-xs font-bold text-stone-500 hover:text-red-600 flex items-center gap-1.5 transition-colors disabled:opacity-50 bg-white/80 border border-stone-200 px-3 py-1.5 rounded-full shadow-xs"
        >
          {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
          Sign Out
        </button>
      </div>

      <div className="max-w-sm mx-auto w-full bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-[36px] p-8 shadow-md">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 mx-auto shadow-xs">
          <XCircle className="w-8 h-8 text-rose-600" />
        </div>

        <h1 className="font-display text-2xl font-extrabold text-[#382A21] mb-2">
          Profile Needs Update
        </h1>

        {reason && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-5 text-left">
            <p className="text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1">Host Feedback</p>
            <p className="text-[#382A21] text-xs leading-relaxed font-medium">{reason}</p>
          </div>
        )}

        <p className="text-stone-600 text-xs leading-relaxed font-medium mb-6">
          Please update your photos or bio to meet our travel community guidelines and resubmit.
        </p>

        <button
          onClick={handleRestart}
          disabled={restarting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-lg"
        >
          {restarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Update & Resubmit
        </button>
      </div>
    </div>
  );
}
